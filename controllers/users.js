const { encryptPassword, comparePassword } = require('../common tools/password');
const { createFriendRequestNotification } = require('../functions/notifications');
const {
  getUsersFunc,
  sendRequestFunc,
  deleteRequestFunc,
  addFriendFunc,
  deleteFriendFunc,
  getUserFunc,
  friendAmountFunc,
  getConnectionToUserFunc,
  updateUserFunc,
  updateReqUser,
  isOwnFriendRequest,
  deleteRequestByUidFunc,
  getFriendRequest,
  getMyFriendsFunc,
} = require('../functions/users');

module.exports.getUsers = async (req, res) => {
  const data = await getUsersFunc(req.query, req.user);
  res.json({ data });
};

module.exports.getUser = async (req, res) => {
  const user = await getUserFunc(req.params.uid, req.user?.status);
  user.friends = await friendAmountFunc(req.params.uid);
  res.json({ data: user });
};

module.exports.sendRequest = async (req, res) => {
  from = req.user.uid;
  to = +req.params.uid;

  const request = await sendRequestFunc(from, to);
  const { data } = request;
  if (data) createFriendRequestNotification({ date: new Date(), friendRequestUid: data.insertId });

  res.json(request);
};

module.exports.deleteRequest = async (req, res) => {
  from = req.user.uid;
  to = +req.params.uid;

  await deleteRequestFunc(from, to);
  res.json({});
};

module.exports.deleteRequestByUid = async (req, res) => {
  const request = await isOwnFriendRequest(req.user.uid, req.params.uid);
  if (request) deleteRequestByUidFunc(req.params.uid);
  res.json({});
};

module.exports.deleteRecieveRequest = async (req, res) => {
  to = req.user.uid;
  from = +req.params.uid;
  await deleteRequestFunc(from, to);
  res.json({});
};

module.exports.deleteRecieveRequestByUid = async (req, res) => {
  const request = await getFriendRequest(req.params.uid);
  if (request?.to === req.user.uid) await deleteRequestFunc(request.from, request.to);
  res.json({});
};

module.exports.addFriend = async (req, res) => {
  from = req.user.uid;
  to = +req.params.uid;

  res.json(await addFriendFunc(from, to));
};

module.exports.addFriendByUid = async (req, res) => {
  const { from, to } = await getFriendRequest(req.params.uid);

  if ([from, to].includes(req.user.uid)) res.json(await addFriendFunc(from, to));
  else res.json({ error: '' });
};

module.exports.deleteFriend = async (req, res) => {
  from = req.user.uid;
  to = +req.params.uid;

  await deleteFriendFunc(from, to);
  res.json({});
};

module.exports.main = async (req, res) => {
  // const { users } = await getUsersFunc({}, req.user);
  // users.forEach((a) => {
  //   console.log(a);
  //   createFolder(reactFolder + "/images/user/" + a.uid);
  // });
};

module.exports.getConnectionToUser = async (req, res) =>
  res.send(await getConnectionToUserFunc(req.params.uid, req.user.uid));

module.exports.updateUser = async (req, res) => {
  const { uid } = req.params;
  await updateUserFunc(uid, req.body);
  updateReqUser(req, req.body);
  res.json({ data: req.user });
};

module.exports.getMyFriends = async (req, res) => {
  const friends = await getMyFriendsFunc(req.user.uid);

  res.json({ data: friends });
};
