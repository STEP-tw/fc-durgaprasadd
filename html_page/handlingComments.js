const refresh = function() {
  fetch('/comments')
    .then(function(res) {
      return res.text();
    })
    .then(data => updateComments(data));
};

const updateComments = function(data) {
  document.getElementById('_table').innerHTML = data;
};

const getComment = function() {
  let comment = document.getElementById('_comment').value;
  return { comment };
};

const clearData = function() {
  document.getElementById('_comment').value = '';
};

const fetchData = function() {
  fetch('/comments', {
    method: 'POST',
    body: JSON.stringify(getComment()),
    headers: {
      'Content-Type': 'text/html'
    }
  })
    .then(res => res.text())
    .then(data => {
      updateComments(data);
    });
};
const logout = function() {
  fetch('/logout')
    .then(res => res.text())
    .then(data => (document.getElementById('log').innerHTML = data));
};
const submitComment = function(event) {
  event.preventDefault();
  fetchData();
  clearData();
};
