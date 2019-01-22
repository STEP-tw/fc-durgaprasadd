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

const send = function(res, content, statusCode = 200) {
  res.write(content);
  res.statusCode = statusCode;
  res.end();
};

const reader = function(req, res, next) {
  let path = req.url.slice(1) || 'index.html';
  let root = 'html_page/';
  readFile(root + path, (err, data) => {
    if (err) {
      next();
      return;
    }
    send(res, data);
  });
};

const readBody = function(req, res, next) {
  let text = '';
  req.on('data', data => {
    text += data;
  });
  req.on('end', () => {
    req.body = text;
    next();
  });
};

const sendNotFound = function(req, res) {
  res.statusCode = 404;
  res.end();
};

const getHtmlTable = function(body) {
  return `<thead> <tr>
      <td>Date&Time</td>
      <td>Name</td>
      <td>Comments-List</td>
    </tr> </thead> <tbody> ${body}
    </tbody> </table>`;
};

const convertToHtmlTable = function(comments) {
  let reverseOrder = comments.slice().reverse();
  let rows = reverseOrder.map(comment =>
    Object.values(comment)
      .map(value => `<td>${value}</td>`)
      .join('')
  );
  let tableBody = rows.map(row => `<tr>${row}</tr>`).join('');
  return getHtmlTable(tableBody);
};

const getGuestBookDetails = function(req, res) {
  readFile('./html_page/guestBook.html', (err, data) => {
    if (!err) {
      data = data + convertToHtmlTable(comment.getComments());
      send(res, data);
    }
  });
};

const updateGuestBookDetails = function(req, res) {
  comment.addComments(JSON.parse(req.body));
  writeFile('./src/commentors_data.json', comment.inString(), () => {});
  refreshComments(req, res);
};

const refreshComments = function(req, res) {
  const data = convertToHtmlTable(comment.getComments());
  send(res, data);
};

// Export a function that can act as a handler

app.use(readBody);
app.get('/comments', refreshComments);
app.get('/guestBook.html', getGuestBookDetails);
app.post('/guestBook.html', updateGuestBookDetails);
app.use(reader);
app.use(sendNotFound);
module.exports = app.handleRequest.bind(app);
