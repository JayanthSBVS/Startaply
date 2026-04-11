require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/job-mela', require('./routes/jobmela'));
app.use('/api/qna', require('./routes/qna'));

app.get('/', (req, res) => {
  res.send('API running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});