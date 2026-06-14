const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing for dev client
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Graph & Navigation API routes
const graphRouter = require('./routes/graph');
app.use('/api', graphRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Serve frontend static files in production
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

// Fallback to React Router for client-side routing
app.get('*', (req, res) => {
  // Only serve index.html if it exists (i.e. frontend was built)
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('City Traffic Navigation Server is running! Frontend is not compiled yet. Please run "npm run build" in root to build the React application.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`City Navigation Server is running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});
