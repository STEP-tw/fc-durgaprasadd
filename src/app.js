const { readFile } = require('fs');
const Sheegra = require('./sheegra');
const app = new Sheegra();

const reader = function(req, res) {
  let path = req.url.slice(1) || 'index.html';
  let root = 'html_page/' + path;
  readFile(root, (err, data) => {
    res.write(data);
    res.end();
  });
};

const sendNotFound = function(req, res) {
  res.statusCode = 404;
  res.end();
};
// Export a function that can act as a handler

app.get('/', reader);
app.get('/resources/water-can.gif', reader);
app.get('/resources/flowers.jpg', reader);
app.get('/style.css', reader);
app.get('/favicon.ico', reader);
app.use(sendNotFound);
module.exports = app.handleRequest.bind(app);
