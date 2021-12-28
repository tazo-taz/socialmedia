const { SELECT_ONE_BY, INSERT, DELETE_BY, DELETE, SELECT_ONE, UPDATE, SELECT } = require('../common tools/mysql');
const { encryptPassword } = require('../common tools/password');
const { _QUERY, _QUERY_ONE } = require('../DB/default');

module.exports.showUserDataByStatus = (status) =>
  status ? '*' : 'uid, fName, lName, gender, date, profileImage, backgroundImage';

module.exports.isFriend = (user1, user2) =>
  SELECT_ONE_BY({
    TABLE: 'friends',
    WHERE: `(user1 = ${user1} and user2 = ${user2}) or (user2 = ${user1} and user1 = ${user2})`,
  });

module.exports.hasSendedRequest = (user1, user2) =>
  SELECT_ONE_BY({
    TABLE: 'friend_requests fr',
    WHERE: `(fr.from = ${user1} and fr.to = ${user2}) or (fr.to = ${user1} and fr.from = ${user2})`,
  });

module.exports.getUsersFunc = async ({ search, limit = 999, page = 1, noEmailSearch } = {}, user = {}) => {
  isAdmin = user.status;
  const whereConditions = [1];
  if (search)
    whereConditions.push(
      `(CONCAT(fName, " ", lName) LIKE "%${search}%"` +
        (isAdmin && !noEmailSearch ? ` or email LIKE "%${search}%"` : '') +
        ')',
    );
  const where = whereConditions.join(' and ');

  const select = this.showUserDataByStatus(isAdmin);

  const users = await _QUERY(`select ${select} from users where ${where} LIMIT ${limit} OFFSET ${(page - 1) * limit}`);
  const { count } = await _QUERY_ONE(`select count(*) count from users where ${where}`);

  if (user.uid) {
    for (let k of users) {
      const isMe = k.uid == user.uid;
      if (isMe) k.me = true;
      else if (await this.isFriend(k.uid, user.uid)) k.friend = true;
      else {
        const request = await this.hasSendedRequest(k.uid, user.uid);
        if (request) {
          if (request.from == user.uid) k.sendedRequest = true;
          else k.toRequest = true;
        }
      }
    }
  }

  const pages = Math.ceil(count / limit);
  return { users, pages };
};

module.exports.getUserFunc = async (uid, isAdmin) =>
  _QUERY_ONE(`select ${this.showUserDataByStatus(isAdmin)} from users where uid = ${uid}`);

module.exports.sendRequestFunc = async (from, to) => {
  const isFriend = await this.isFriend(from, to);
  if (isFriend) return { error: 'this users are already friends' };

  const hasSendedRequest = await this.hasSendedRequest(from, to);
  if (hasSendedRequest)
    return {
      error: 'One of user has already sended friend request, please refresh page to update data',
    };

  data = await INSERT({
    TABLE: 'friend_requests',
    DATA: { from, to },
  });
  return { data };
};

module.exports.deleteRequestFunc = async (from, to) =>
  DELETE_BY({
    TABLE: 'friend_requests',
    WHERE: `friend_requests.from = ${from} and friend_requests.to = ${to}`,
  });

module.exports.isOwnFriendRequest = (userUid, friendReqUid) =>
  SELECT_ONE_BY({
    TABLE: 'friend_requests',
    where: `uid = ${friendReqUid} and (from = ${userUid} or to = ${userUid})`,
  });

module.exports.deleteRequestByUidFunc = (UID) => DELETE({ TABLE: 'friend_requests', UID });

module.exports.addFriendFunc = async (user1, user2) => {
  const hasSendedRequest = await this.hasSendedRequest(user1, user2);
  if (!hasSendedRequest) return { error: "User hasn't sended friend request, please reload page" };

  await DELETE({ TABLE: 'friend_requests', UID: hasSendedRequest.uid });
  const inserted = await INSERT({
    TABLE: 'friends',
    DATA: {
      user1: from,
      user2: to,
      date: new Date(),
    },
  });
  return { data: inserted };
};

module.exports.deleteFriendFunc = (from, to) =>
  DELETE_BY({
    TABLE: 'friends',
    WHERE: `(user1 = ${from} and user2 = ${to}) or (user2 = ${from} and user1 = ${to})`,
  });

module.exports.friendAmountFunc = async (uid) =>
  (await _QUERY_ONE(`select count(*) count from friends where user1 = ${uid} or user2 = ${uid}`)).count;

module.exports.getConnectionToUserFunc = async (uid1, uid2) => {
  if (uid1 == uid2) return 'Me';
  if (await this.isFriend(uid1, uid2)) return 'Friends';
  const request = await this.hasSendedRequest(uid1, uid2);

  if (request) {
    if (request.from == uid1) return 'Reciever';
    else if ((request.to = uid1)) return 'Sender';
  }
  return 'No one';
};

module.exports.updateUserFunc = async (uid, data) => {
  if (data.password) data.password = await encryptPassword(data.password);
  else delete data.password;
  await UPDATE({ TABLE: 'users', WHERE: `uid = ${uid}`, DATA: data });
};

module.exports.updateReqUser = (req, data) => {
  for (let k of Object.keys(data)) {
    if (data[k]) req.user[k] = data[k];
  }
};

module.exports.getFriendRequest = (UID) => SELECT_ONE({ TABLE: 'friend_requests', UID });

module.exports.getMyFriendsFunc = (uid) =>
  _QUERY(
    `SELECT f.*, concat(u.fName, " ",u.lName) as name FROM friends f inner join users u on (case WHEN f.user1 = ${uid} then u.uid = f.user2 else u.uid = f.user1 end) where f.user1 = ${uid} or f.user2 = ${uid}
    `,
  );
