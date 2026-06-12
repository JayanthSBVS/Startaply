const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const collabsFile = path.join(__dirname, '../data/collabs.json');

// Helper to read data
const readCollabs = () => {
  try {
    if (!fs.existsSync(collabsFile)) {
      return [];
    }
    const data = fs.readFileSync(collabsFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading collabs.json:', err);
    return [];
  }
};

// Helper to write data
const writeCollabs = (data) => {
  try {
    fs.writeFileSync(collabsFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing collabs.json:', err);
  }
};

// GET /api/collabs (admin only ideally, but we'll keep it simple for now)
router.get('/', (req, res) => {
  const collabs = readCollabs();
  res.json(collabs);
});

// POST /api/collabs
router.post('/', (req, res) => {
  const { collegeName, email, phone, message } = req.body;
  if (!collegeName || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const collabs = readCollabs();
  const newCollab = {
    id: uuidv4(),
    collegeName,
    email,
    phone,
    message: message || '',
    createdAt: new Date().toISOString()
  };

  collabs.unshift(newCollab); // Add to beginning
  writeCollabs(collabs);

  res.status(201).json(newCollab);
});

// DELETE /api/collabs/:id (optional, for admin to clear handled requests)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  let collabs = readCollabs();
  const initialLength = collabs.length;
  collabs = collabs.filter(c => c.id !== id);
  
  if (collabs.length === initialLength) {
    return res.status(404).json({ error: 'Collab request not found' });
  }

  writeCollabs(collabs);
  res.json({ success: true });
});

module.exports = router;
