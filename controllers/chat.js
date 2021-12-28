const {
  getChatDataFunc,
  havePrivateConnectionFunc,
  createConnectionFunc,
  createChatMessageFunc,
  getChatUsersFunc,
  getChatsAndNoticationsFunc,
  seenChatFunc,
  updateRoomFunc,
  deleteRoomFunc,
} = require('../functions/chat');

module.exports.getChatMessages = async (req, res) => {
  const messages = await getChatDataFunc(req.params.uid, req.query);
  res.json({ data: messages });
};

module.exports.createChatMessage = async (req, res) => {
  const { message, notification = 0 } = req.body;
  const { uid: connectionUid } = req.params;
  const { uid: userUid } = req.user;

  const users = await getChatUsersFunc(connectionUid);
  await createChatMessageFunc({
    chatuserUid: users.find((a) => a.userUid === userUid).uid,
    notification,
    message,
    date: new Date(),
  });

  res.json({});
};

module.exports.getPrivateConnection = async (req, res) => {
  const connection = await havePrivateConnectionFunc(req.user.uid, req.params.uid);
  let connectionUid;
  if (!connection) {
    connectionUid = await createConnectionFunc({ name: '' }, req.user.uid, req.params.uid);
  } else connectionUid = connection.connectionUid;

  res.json({ data: connectionUid });
};

module.exports.getChatsAndNotifications = async (req, res) => {
  const chats = await getChatsAndNoticationsFunc(req.user.uid);
  res.json({ data: chats });
};

module.exports.seenChat = async (req, res) => {
  seenChatFunc(req.user.uid, req.params.uid);
  res.json({});
};

module.exports.createRoom = async (req, res) => {
  const { name, users } = req.body;
  const connectionUid = await createConnectionFunc({ name }, req.user.uid, ...users);
  const chatUsers = await getChatUsersFunc(connectionUid);

  const chatuserUid = chatUsers.find((a) => a.userUid === req.user.uid).uid;
  await createChatMessageFunc({
    date: new Date(),
    notification: 1,
    message: `created chat`,
    chatuserUid,
  });
  setTimeout(async () => {
    for (let k of users) {
      await createChatMessageFunc({
        date: new Date(),
        notification: 1,
        message: `added user ` + chatUsers.find((a) => a.userUid === k).username,
        chatuserUid,
      });
    }
    res.json({});
  }, 1000);
};

module.exports.updateRoom = async (req, res) => {
  const { users } = req.body;
  if (users) users.push(req.user.uid);
  await updateRoomFunc(req.params.uid, req.body, req.user.uid);
  res.json({});
};

module.exports.deleteRoom = async (req, res) => {
  const { uid } = req.params;
  await deleteRoomFunc(uid);
  res.json({});
};
