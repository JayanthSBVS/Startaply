const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// IMPORT ROUTES
const jobRoutes = require('./routes/jobs');
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const feedbackRoutes = require('./routes/feedback');

// USE ROUTES
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/feedback', feedbackRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});