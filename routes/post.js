const post = require('../controllers/post');
const use = require('../middleware/errorHandler');
const { isUser, ownPost, ownComment } = require('../middleware/statusCheck');

const router = require('express').Router();

router.get('/post', isUser, use(post.getPosts));

router.post('/post', isUser, use(post.createPost));

router.put('/post/:uid', isUser, use(ownPost), use(post.updatePost));

router.delete('/post/:uid', isUser, use(ownPost), use(post.deletePost));

router.get('/comments/:postUid', isUser, use(post.getComments));

router.post('/comment', isUser, use(post.createComment));

router.delete('/comment/:uid', isUser, use(ownComment), use(post.deleteComment));

router.get('/friendsposts', isUser, use(post.getFriendsPosts));

router.get('/post/:uid', isUser, use(post.getPost));

router.get('/postliked/:uid', isUser, use(post.hasUserLikedPost));

router.post('/postlike/:uid', isUser, use(post.likePost));

module.exports = router;
