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

let head;
readFile('./html_page/guestBook.html', (err, data) => {
  if (!err) {
    head = data;
  }
});
let form1 = `<form  id="form" method="POST" action="/guestBook.html">
<h1>Leave a comment</h1>
<div id="login">
<h1>Name: <input id="_name" name="name" type="text" required />
<input type="submit" value="login"></h1>
</div>
</form></div>`;

let form2 = userName => `<form id="form" onsubmit="submitComment(event)">
<h1>Leave a comment</h1>
<div id="login">
<h1>Name: ${userName} <input onclick="logout(event)" type="button" value="logout"></h1>
</div>
<h1>
Comment:
  <textarea id="_comment" name="comment" cols="50" rows="5" required></textarea>
</h1>
<input type="submit" value="Submit" />
</form></div>`;

let body = `<h1>Comments <button name="refresh"  class="button" onclick="refresh()">&#x21bb</button></h1>
<table class="table" id="_table">`;

let end = `</body></html>`;

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

const initialGuestBook = function(req, res) {
  let data =
    head + form1 + body + convertToHtmlTable(comment.getComments()) + end;
  send(res, data);
};

const getUserName = function(text) {
  let index = text.indexOf('=');
  return text.slice(index + 1);
};

const setCookie = function(req, res, userName) {
  res.setHeader('set-cookie', `userName=${userName}`);
};

const updateGuestBookDetails = function(req, res) {
  let userName = getUserName(req.body);
  setCookie(req, res, userName);
  let data =
    head +
    form2(userName) +
    body +
    convertToHtmlTable(comment.getComments()) +
    end;
  send(res, data);
};

const refreshComments = function(req, res) {
  const data = convertToHtmlTable(comment.getComments());
  send(res, data);
};

const getGuestBookDetails = function(req, res) {
  let userName = getUserName(req.cookie);
  if (!userName) {
    initialGuestBook(req, res);
    return;
  }
  let data =
    head +
    form2(userName) +
    body +
    convertToHtmlTable(comment.getComments()) +
    end;
  send(res, data);
};

const readCookies = function(req, res, next) {
  const cookie = req.headers['cookie'];
  req.cookie = cookie || `userName=`;
  console.log(req.cookie);
  next();
};
const getCommentDetails = function(req, data) {
  let comment = {};
  comment['date&Time'] = new Date().toLocaleString();
  comment['name'] = getUserName(req.cookie);
  comment['comment'] = data;
  return comment;
};

const submitComment = function(req, res) {
  comment.addComments(getCommentDetails(req, JSON.parse(req.body)['comment']));
  writeFile('./src/commentors_data.json', comment.inString(), () => {});
  refreshComments(req, res);
};

const logout = function(req, res) {
  res.setHeader('set-cookie', 'userName=');
  send(res, form1);
};

app.use(readCookies);
app.use(readBody);
app.get('/logout', logout);
app.get('/comments', refreshComments);
app.post('/comments', submitComment);
app.get('/guestBook.html', getGuestBookDetails);
app.post('/guestBook.html', updateGuestBookDetails);
app.use(reader);
app.use(sendNotFound);
module.exports = app.handleRequest.bind(app);
