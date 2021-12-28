const { INSERT, UPDATE } = require('../common tools/mysql');
const { _QUERY } = require('../DB/default');
const { getPostsFunc, getCommentsFunc } = require('./post');

module.exports.createFriendRequestNotification = (DATA) => INSERT({ TABLE: 'friend_requests_notifications', DATA });

module.exports.getMyNotificationsFunc = (uid) =>
  _QUERY(
    `select * from (select frn.uid, frn.date, u.fName COLLATE utf8_general_ci as value, CASE when fr.from = ${uid} then "requestFrom" else "requestTo" END as type, concat(u.uid,"/",u.profileImage) as image, fr.uid as valueUid, concat(u.fName, " ", u.lName) COLLATE utf8_general_ci as username, frn.seen from friend_requests_notifications frn inner join friend_requests fr on fr.uid = frn.friendRequestUid inner join users u on (case when u.uid != ${uid} and (u.uid = fr.from or u.uid = fr.to) then 1 END) = 1 where fr.from = ${uid} or fr.to = ${uid} union SELECT pcn.uid, pcn.date, pc.title as value, "postComment" as type, "" as image, p.uid as valueUid, concat(u.fName, " ", u.lName) COLLATE utf8_general_ci as username, pcn.seen FROM post_comments_notifications pcn inner join post_comments pc on pc.uid = pcn.postCommentUid inner join users u on u.uid = pc.userUid inner join posts p on p.uid = pc.postUid where p.userUid = ${uid} and pc.userUid != ${uid}) a order by a.date desc`,
  );

module.exports.createPostCommentNotification = (DATA) => INSERT({ TABLE: 'post_comments_notifications', DATA });

module.exports.seenMyNotificationsFunc = async (userUid) => {
  const { posts } = await getPostsFunc({ userUid, asAdmin: 1, limit: 999999 });

  for (let k of posts) {
    const comments = await getCommentsFunc(k.uid);
    for (let m of comments) {
      await UPDATE({ TABLE: 'post_comments_notifications', WHERE: `postCommentUid = ${m.uid}`, DATA: { seen: 1 } });
    }
  }
  // await _QUERY(`update set seen = 1 from post_comments_notifications`);
};
// update post_comments_notifications as pcn set pcn.seen = 1 inner join post_comments pc on pc.uid = pcn.postCommentUid
// uid, date, value, type, image, valueUid, username, seen
