export default class PostList {
  constructor(posts) {
    this.posts = [];

    if (posts) {
      posts.forEach((item) => {
        this.posts.push(item);
      });
    }
  }

  add(post) {
    this.posts.unshift(post);
  }
}
