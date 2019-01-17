const { readFile } = require('fs');

const reader = function(path, res, req) {
  let root = 'html_page/' + path;
  readFile(root, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end();
    } else {
      res.write(data);
      res.end();
    }
  });
};
const app = (req, res) => {
  reader(req.url.slice(1) || 'index.html', res);
};

// Export a function that can act as a handler

module.exports = app;
