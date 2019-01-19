const { readFile, writeFile } = require('fs');
const Sheegra = require('./sheegra');
const Comment = require('./comment');
const app = new Sheegra();
const comment = new Comment();

readFile('./src/commentors_data.json', (err, data) => {
  if (!err) {
    comment.addComments(JSON.parse(data));
  }
});

const reader = function(req, res) {
  let path = req.url.slice(1) || 'index.html';
  let root = 'html_page/' + path;
  readFile(root, (err, data) => {
    res.write(data);
    res.end();
  });
};

const readBody = function(req, res, next) {
  let text = '';
  req.on('data', data => {
    text += data;
  });
  req.on('end', () => {
    req.body = unescape(text);
    next();
  });
};
const sendNotFound = function(req, res) {
  res.statusCode = 404;
  res.end();
};

const getArgs = function(text) {
  let args = {};
  args['dateAndTime'] = new Date().toLocaleString();
  let pairs = text.split('&').map(x => x.split('='));
  pairs.forEach(([key, value]) => (args[key] = value));
  return args;
};

const convertToHtmlTable = function(comments) {
  let reverseOrder = comments.slice().reverse();
  let rows = reverseOrder.map(comment =>
    Object.values(comment)
      .map(value => `<td>${value}</td>`)
      .join('')
  );
  return (
    '<tbody' + rows.map(row => `<tr>${row}</tr>`) + '</tbody>' + '</table>'
  );
};

const getGuestBookDetails = function(req, res) {
  readFile('./html_page/guestBook.html', (err, data) => {
    if (!err) {
      data = data + convertToHtmlTable(comment.getComments());
      res.write(data);
      res.end();
    }
  });
};

const updateGuestBookDetails = function(req, res) {
  comment.addComments(getArgs(req.body));
  req.body = '';
  console.log(req.body);
  writeFile('./src/commentors_data.json', comment.inString(), () => {});
  getGuestBookDetails(req, res);
};

// Export a function that can act as a handler

app.use(readBody);
app.get('/', reader);
app.get('/style.css', reader);
app.get('/resources/water-can.gif', reader);
app.get('/resources/flowers.jpg', reader);
app.get('/resources/Abeliophyllum.pdf', reader);
app.get('/resources/Ageratum.pdf', reader);
app.get('/favicon.ico', reader);
app.get('/abeliophyllum.html', reader);
app.get('/ageratum.html', reader);
app.get('/resources/abeliophyllum.jpg', reader);
app.get('/resources/agerantum.jpg', reader);
app.get('/guestBook.html', getGuestBookDetails);
app.post('/guestBook.html', updateGuestBookDetails);
app.use(sendNotFound);
module.exports = app.handleRequest.bind(app);
