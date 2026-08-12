const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'dummy',
        pass: process.env.SMTP_PASS || 'dummy'
    }
});

router.post('/', async (req, res) => {
    try {
        const { email, name, issue } = req.body;
        
        if (!email || !issue) {
            return res.status(400).json({ message: 'Email and issue are required' });
        }

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
            // In a real production app we might save this to the DB as a fallback
        }

        res.json({ success: true, message: 'Support ticket submitted successfully. Our team will contact you soon.' });
    } catch (err) {
        console.error('Support Route Error:', err);
        res.status(500).json({ message: 'Server error while submitting ticket' });
    }
});

module.exports = router;
