const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'dummy',
        pass: process.env.SMTP_PASS || 'dummy'
    }
});

// Initialize DB for Support Tickets
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        issue TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        createdAt BIGINT
      );
    `);
  } catch (err) {
    console.error('Error init support_tickets db:', err);
  }
}
initDb();

// Get all support tickets (Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM support_tickets ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a new support ticket
router.post('/', async (req, res) => {
    try {
        await initDb();
        const { email, name, issue } = req.body;
        
        if (!email || !issue) {
            return res.status(400).json({ message: 'Email and issue are required' });
        }

        const id = String(Date.now());
        const createdAt = Date.now();

        await pool.query(
          `INSERT INTO support_tickets (id, name, email, issue, createdAt) VALUES ($1, $2, $3, $4, $5)`,
          [id, name, email, issue, createdAt]
        );

        if (req.io) req.io.emit('DATA_UPDATED', { module: 'Support Tickets' });

        const mailOptions = {
            from: process.env.SMTP_USER || '"Startaply Support" <support@startaply.com>',
            to: process.env.SUPPORT_EMAIL || 'support@startaply.com',
            subject: `New Support Ticket from ${name || 'User'}`,
            text: `You have a new support ticket.\n\nName: ${name || 'N/A'}\nEmail: ${email}\n\nIssue Details:\n${issue}\n\n---\nPlease reply directly to ${email} to assist the user.`
        };

        // Attempt to send email, but we won't crash if SMTP is not configured
        try {
            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.error('Failed to send support email:', mailErr.message);
        }

        res.json({ success: true, message: 'Support ticket submitted successfully. Our team will contact you soon.' });
    } catch (err) {
        console.error('Support Route Error:', err);
        res.status(500).json({ message: 'Server error while submitting ticket' });
    }
});

// Delete/Resolve a support ticket (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM support_tickets WHERE id=$1', [req.params.id]);
    if (req.io) req.io.emit('DATA_UPDATED', { module: 'Support Tickets' });
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
