const { SELECT_ONE } = require('../common tools/mysql');
const { comparePassword } = require('../common tools/password');
const { getUserFunc } = require('../functions/users');

module.exports.isUser = (req, res, next) => {
  if (req.user) next();
  else res.json({ error: 'Please sign in before adding item in the cart' });
};

module.exports.isModerator = (req, res, next) => {
  if (req.user?.STATUS >= 1) next();
  else res.json({ error: 'Access denied' });
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user?.STATUS == 2) next();
  else res.json({ error: 'Access denied' });
};

module.exports.ownPost = async (req, res, next) => {
  const post = await SELECT_ONE({ TABLE: 'posts', UID: req.params.uid });
  if (post) {
    if ((post.userUid = req.user.uid || req.user.status > 0)) next();
  } else res.json({ error: 'Access denied' });
};

module.exports.ownComment = async (req, res, next) => {
  const comment = await SELECT_ONE({
    TABLE: 'post_comments',
    UID: req.params.uid,
  });

  if (comment) {
    if (comment.userUid == req.user.uid || req.user.status > 0) return next();
  }
  res.json({ error: 'Access denied' });
};

module.exports.isOwnUserOrAdmin = async (req, res, next) => {
  const { uid } = req.params;
  console.log(uid, req.user);
  if (req.user)
    if (uid == req.user.uid || req.user.status == 2)
      if (
        Object.keys(req.body).find(
          (a) => a == 'password' || a == 'fName' || a == 'lName' || a == 'email' || a == 'gender' || a == 'date',
        )
      ) {
        const { password } = req.user;
        console.log(req.body.oldPassword, password);
        if (await comparePassword(req.body.oldPassword, password)) {
          console.log(12);
          delete req.body.oldPassword;
          return next();
        }
      } else return next();
  res.json({ error: 'Access denied' });
};
