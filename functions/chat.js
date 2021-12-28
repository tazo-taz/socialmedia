const { INSERT, SELECT, UPDATE, SELECT_ONE, DELETE_BY, DELETE } = require('../common tools/mysql');
const { _QUERY_ONE, _QUERY } = require('../DB/default');
const { getUserFunc } = require('./users');

module.exports.havePrivateConnectionFunc = async (uid1, uid2, onlyconnectionUid = true) => {
  const connection = await _QUERY_ONE(
    `SELECT * FROM chatusers cu GROUP BY cu.connectionUid HAVING COUNT(cu.userUid) = 2 AND COUNT(CASE WHEN cu.userUid IN (${uid1}, ${uid2}) THEN cu.userUid END) = 2`,
  );

  if (!connection) return null;
  if (onlyconnectionUid) return connection;
  const { connectionUid } = connection;
  return _QUERY(`select * from chatusers where connectionUid = ${connectionUid}`);
};

module.exports.sendMessage = (DATA) => INSERT({ TABLE: 'chatmessages', DATA });

module.exports.getChatDataFunc = async (connectionUid, { chat = 1, messages = 1 } = {}) => {
  const returnValue = {};
  if (messages) returnValue.messages = await this.getChatMessagesFunc(connectionUid);
  if (chat) {
    returnValue.users = await this.getChatUsersFunc(connectionUid);
    returnValue.chat = await this.getChatInfoFunc(connectionUid);
  }

  return returnValue;
};

module.exports.getChatInfoFunc = (UID) => SELECT_ONE({ TABLE: 'chat', UID });

module.exports.getChatMessagesFunc = (connectionUid) =>
  _QUERY(
    `select cm.*, cu.userUid as userUid from chatmessages cm inner join chatusers cu on cm.chatuserUid = cu.uid INNER join chat c ON c.uid = cu.connectionUid inner join users u on u.uid = cu.userUid where c.uid = ${connectionUid} order by cm.date`,
  );

module.exports.getChatUsersFunc = (connectionUid, onlyAvaibleUsers = false) =>
  _QUERY(
    `select cu.*, concat(u.fName, " ", u.lName) as username, u.profileImage from chatusers cu INNER JOIN chat c on c.uid = cu.connectionUid inner join users u on u.uid = cu.userUid where c.uid = ${connectionUid} and ${
      onlyAvaibleUsers ? 'cu.inChat = 1' : 1
    }`,
  );

module.exports.createChatMessageFunc = (DATA) => INSERT({ TABLE: 'chatmessages', DATA });

module.exports.createConnectionFunc = async (DATA, ...chatusers) => {
  const { insertId: connectionUid } = await INSERT({ TABLE: 'chat', DATA });
  for (let k of chatusers) {
    await INSERT({ TABLE: 'chatusers', DATA: { connectionUid, userUid: k } });
  }
  return connectionUid;
};

module.exports.getChatsAndNoticationsFunc = async (uid) => {
  const chats = await _QUERY(
    `SELECT c.uid, c.name FROM chat c INNER JOIN chatusers cu on c.uid = cu.connectionUid where cu.userUid = ${uid} and cu.inChat = 1`,
  );
  for (let k of chats) {
    const lastMessage = await _QUERY_ONE(
      `SELECT cm.message, cm.date, CONCAT(u.fName, " ", u.lName) as name FROM chatmessages cm INNER JOIN chatusers cu on cm.chatuserUid = cu.uid INNER join chat c on c.uid = cu.connectionUid inner join users u on u.uid = cu.userUid WHERE c.uid = ${k.uid} ORDER by cm.uid DESC limit 1`,
    );
    if (!k.name) {
      const users = await this.getChatUsersFunc(k.uid);
      const userObj = users.find((a) => a.userUid !== uid)?.userUid;
      if (userObj) {
        const user = await getUserFunc(userObj);
        if (user) {
          const { fName, lName } = user;
          k.name = fName + ' ' + lName;
        }
      }
    }

    const { seen } = await _QUERY_ONE(`select seen from chatusers where connectionUid = ${k.uid} and userUid = ${uid}`);

    k.message = lastMessage;
    k.seen = seen;
  }
  return chats.sort((a, b) => b?.message?.date - a?.message?.date);
};

module.exports.seenChatFunc = (userUid, connectionUid) =>
  UPDATE({ TABLE: 'chatusers', WHERE: `connectionUid = ${connectionUid} and userUid = ${userUid}`, DATA: { seen: 1 } });

module.exports.setNotseenFunc = (userUid, connectionUid) =>
  UPDATE({
    TABLE: 'chatusers',
    WHERE: `connectionUid = ${connectionUid} and userUid != ${userUid}`,
    DATA: { seen: 0 },
  });

module.exports.updateRoomFunc = async (roomUid, data, sender) => {
  const { name, users } = data;
  if (name) await UPDATE({ TABLE: 'chat', DATA: { name }, WHERE: `uid = ${roomUid}` });
  const chatUsers = await this.getChatUsersFunc(roomUid);
  console.log(chatUsers, users);
  const addNotif = (username, type = 'added') =>
    INSERT({
      TABLE: 'chatmessages',
      DATA: {
        notification: 1,
        chatuserUid: chatUsers.find((a) => a.userUid === sender).uid,
        message: `${type} user ${username}`,
        date: new Date(),
      },
    });
  if (users) {
    for (let k of chatUsers.filter((a) => a.inChat == 1 && !users.find((b) => a.userUid === b))) {
      addNotif(k.username, 'deleted');
    }
    await UPDATE({
      TABLE: 'chatusers',
      WHERE: `connectionUid = ${roomUid} and userUid not in (${users.join(',')})`,
      DATA: { inChat: 0 },
    });

    const oldUsers = users.filter((a) => chatUsers.find((b) => b.userUid === a)?.inChat === 0);
    const newUsers = users.filter((a) => !chatUsers.find((b) => b.userUid === a));

    for (let k of newUsers) {
      const { fName, lName } = await getUserFunc(k);
      addNotif(fName + ' ' + lName);
      await INSERT({
        TABLE: 'chatusers',
        DATA: {
          connectionUid: roomUid,
          userUid: k,
        },
      });
    }
    for (let k of oldUsers) {
      const { fName, lName } = await getUserFunc(k);
      addNotif(fName + ' ' + lName);

      await UPDATE({
        TABLE: 'chatusers',
        WHERE: `connectionUid = ${roomUid} and userUid = ${k}`,
        DATA: {
          inChat: 1,
        },
      });
    }
  }
};

module.exports.deleteRoomFunc = (UID) => DELETE({ TABLE: 'chat', UID });
