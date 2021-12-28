const {
  createPostFunc,
  getPostsFunc,
  updatePostFunc,
  deletePostFunc,
  getCommentsFunc,
  createCommentFunc,
  deleteCommentFunc,
  getFriendsPostsFunc,
  getPostFunc,
  hasUserLikedPostFunc,
  removeLikedToPost,
  likeAPost,
} = require('../functions/post');

const { createPostCommentNotification } = require('../functions/notifications');

module.exports.getPosts = async (req, res) => {
  const data = await getPostsFunc(req.query, req.user.status);
  res.json({ data });
};

module.exports.createPost = async (req, res) => {
  await createPostFunc({ ...req.body, userUid: req.user.uid });
  const data = await getPostsFunc({ ...req.query, userUid: req.user.uid }, req.user.status);
  res.json({ data });
};

module.exports.updatePost = async (req, res) => {
  const { returnPosts, returnPost, userUid = req.user.uid } = req.query;
  const postUid = req.params.uid;
  await updatePostFunc(postUid, req.body);
  var data;
  if (returnPosts) data = await getPostsFunc({ userUid }, req.user.status);
  if (returnPost) data = await getPostFunc(postUid);
  res.json({ data });
};

module.exports.deletePost = async (req, res) => {
  await deletePostFunc(req.params.uid);
  const data = await getPostsFunc({ userUid: req.user.uid }, req.user.status);
  res.json({ data });
};

module.exports.getComments = async (req, res) => {
  const comments = await getCommentsFunc(req.params.postUid);
  res.json({ data: comments });
};

module.exports.createComment = async (req, res) => {
  const { insertId: postCommentUid } = await createCommentFunc({ ...req.body, userUid: req.user.uid });
  const comments = await getCommentsFunc(req.body.postUid);
  createPostCommentNotification({ postCommentUid, date: new Date() });
  res.json({ data: comments });
};

module.exports.deleteComment = async (req, res) => {
  const { postUid } = await deleteCommentFunc(req.params.uid);
  const comments = await getCommentsFunc(postUid);
  res.json({ data: comments });
};

module.exports.getFriendsPosts = async (req, res) => {
  const posts = await getFriendsPostsFunc(req.user.uid);
  res.json({ data: posts });
};

module.exports.getPost = async (req, res) => {
  const post = await getPostFunc(req.params.uid);
  res.json({ data: post });
};

module.exports.hasUserLikedPost = async (req, res) => {
  const uid = +req.params.uid;
  const liked = await hasUserLikedPostFunc(req.user.uid, uid);

  res.json({ data: liked });
};

module.exports.likePost = async (req, res) => {
  const userUid = req.user.uid;
  const postUid = +req.params.uid;

  const liked = await hasUserLikedPostFunc(req.user.uid, postUid);
  if (liked) removeLikedToPost(userUid, postUid);
  else likeAPost({ postUid, userUid });

  res.json({});
};
