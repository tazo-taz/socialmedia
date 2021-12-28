const { addImagesToPostAddFunc } = require('../addFunc/posts');
const { INSERT, SELECT, UPDATE, DELETE_BY, DELETE, deleteAndReturn, SELECT_ONE_BY } = require('../common tools/mysql');
const { _QUERY, _QUERY_ONE } = require('../DB/default');

module.exports.getPostsFunc = async (
  { page = 1, userUid = '', asAdmin = '', limit = 10, search = '' } = {},
  isAdmin = 0,
) => {
  const whereConditions = [];

  if (userUid) whereConditions.push(`posts.userUid = ${userUid}`);
  if (search) whereConditions.push(`CONCAT(users.fName, " ", users.lName) like "%${search}%"`);

  const where = whereConditions.join(' and ');

  const posts = await _QUERY(
    `select posts.*, count(pl.uid) as likes from posts inner join users on users.uid = posts.userUid left join post_likes pl on pl.postUid = posts.uid where ${where} group by posts.uid order by posts.date desc, posts.uid desc limit ${limit} offset ${
      (page - 1) * limit
    }`,
  );

  await addImagesToPostAddFunc(posts);

  const count = (
    await _QUERY_ONE(`select COUNT(*) count from posts inner join users on users.uid = posts.userUid where ${where}`)
  ).count;

  const pages = Math.ceil(count / limit);

  return { posts, pages };
};

module.exports.createImagesForPost = async (postUid, images) => {
  for (let k of images) {
    const DATA = {
      postUid: postUid,
      url: k,
    };
    await INSERT({
      TABLE: 'post_images',
      DATA,
    });
  }
};

module.exports.createPostFunc = async (DATA) => {
  DATA.date = new Date();
  const images = [...DATA.images];
  delete DATA.images;
  const { insertId } = await INSERT({ TABLE: 'posts', DATA });
  await this.createImagesForPost(insertId, images);
};

module.exports.updatePostFunc = async (uid, DATA) => {
  const images = [...DATA.images];
  delete DATA.images;
  await UPDATE({ TABLE: 'posts', WHERE: `uid = ${uid}`, DATA });
  await DELETE_BY({ TABLE: 'post_images', WHERE: `postUid = ${uid}` });
  await this.createImagesForPost(uid, images);
};

module.exports.deletePostFunc = (UID) => DELETE({ TABLE: 'posts', UID });

module.exports.getCommentsFunc = (postUid) =>
  _QUERY(
    `select pc.*, CONCAT(users.fName, " ", users.lName) as name, users.profileImage from post_comments pc inner join users on users.uid = pc.userUid where postUid = ${postUid} order by uid desc`,
  );

module.exports.createCommentFunc = (DATA) => INSERT({ TABLE: 'post_comments', DATA: { ...DATA, date: new Date() } });

module.exports.deleteCommentFunc = (uid) => deleteAndReturn({ table: 'post_comments', uid });

module.exports.getFriendsPostsFunc = async (uid) => {
  const posts = await _QUERY(
    `SELECT posts.*, CONCAT(users.fName, " ", users.lName) name, count(pl.uid) as likes, users.profileImage FROM posts left join post_likes pl on pl.postUid = posts.uid INNER JOIN users on posts.userUid = users.uid WHERE users.uid IN (SELECT user1 as uid FROM friends WHERE (friends.user1 = ${uid} and friends.user2 = users.uid) or (friends.user2 = ${uid} and friends.user1 = users.uid) UNION SELECT user2 as uid FROM friends WHERE (friends.user2 = ${uid} and friends.user1 = users.uid) or (friends.user1 = ${uid} and friends.user2 = users.uid)) and users.uid != ${uid} group by posts.uid order by posts.date desc, posts.uid desc`,
  );

  await addImagesToPostAddFunc(posts);
  return posts;
};

module.exports.getPostFunc = async (uid) => {
  const post = await _QUERY_ONE(
    `select posts.*, CONCAT(users.fName, " ", users.lName) as name, COUNT(pl.uid) as likes, users.profileImage from posts INNER JOIN users on posts.userUid = users.uid left join post_likes pl on pl.postUid = posts.uid where posts.uid = ${uid} GROUP BY pl.postUid`,
  );
  if (!post) return null;
  await addImagesToPostAddFunc(post);
  return post;
};

module.exports.hasUserLikedPostFunc = (userUid, postUid) =>
  SELECT_ONE_BY({ TABLE: 'post_likes', WHERE: `postUid = ${postUid} and userUid = ${userUid}` });

module.exports.removeLikedToPost = (userUid, postUid) =>
  DELETE_BY({ TABLE: 'post_likes', WHERE: `postUid = ${postUid} and userUid = ${userUid}` });

module.exports.likeAPost = (DATA) => INSERT({ TABLE: 'post_likes', DATA });
