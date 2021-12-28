const { getUserFunc } = require('../functions/users');

const users = [];

module.exports.addUserSocket = async ({ uid, socket } = {}) => {
  const current = users.find((a) => uid === a.uid);
  if (users.find((a) => uid === a.uid)) current.sockets.push(socket);
  else {
    users.push({ uid, sockets: [socket] });
  }
};

module.exports.removeUserSocket = (socketId) => {
  const user = users.find((a) => a?.sockets?.includes(socketId));
  if (!user) return;

  if (user.sockets.length === 1)
    users.splice(
      users.findIndex((a) => a.uid === user.uid),
      1,
    );
  else
    user.sockets.splice(
      user.sockets.findIndex((a) => a === socketId),
      1,
    );
};

module.exports.getUserBySocketId = (socketId) => users.find((a) => a.sockets.includes(socketId));
