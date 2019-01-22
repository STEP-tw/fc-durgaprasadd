const refresh = function() {
  fetch('/comments')
    .then(function(res) {
      return res.text();
    })
    .then(data => {
      document.getElementById('_table').innerHTML = data;
    });
};

const getBody = function() {
  let dateAndTime = new Date().toLocaleString();
  let name = document.getElementById('_name').value;
  let comment = document.getElementById('_comment').value;
  return { dateAndTime, name, comment };
};

const clearData = function() {
  document.getElementById('_name').value = '';
  document.getElementById('_comment').value = '';
};
const fetchData = function() {
  fetch('/guestBook.html', {
    method: 'POST',
    body: JSON.stringify(getBody()),
    headers: {
      'Content-Type': 'text/html'
    }
  })
    .then(res => res.text())
    .then(data => {
      document.getElementById('_table').innerHTML = data;
    });
};

const submitComment = function(event) {
  event.preventDefault();
  fetchData();
  clearData();
};
