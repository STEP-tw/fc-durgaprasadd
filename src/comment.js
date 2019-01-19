class Comment {
  constructor() {
    this.comments = [];
  }
  getComments() {
    return this.comments;
  }
  addComments(comment) {
    this.comments = this.comments.concat(comment);
  }
  inString() {
    return JSON.stringify(this.comments);
  }
}

module.exports = Comment;
