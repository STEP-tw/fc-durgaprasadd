const { readFile } = require('fs');
const app = (req, res) => {
  res.statusCode = 200;
  if (req.url == '/') {
    readFile('./index.html', 'utf8', (err, data) => {
      res.write(data);
      res.end();
    });
  }
  if (req.url != '/') {
    res.end();
  }
};

// Export a function that can act as a handler

module.exports = app;
