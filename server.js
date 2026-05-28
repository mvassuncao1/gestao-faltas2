const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve public static files from the build directory (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for any SPA router pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Production server running on port ${port}`);
});
