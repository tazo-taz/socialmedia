const { getMyNotificationsFunc, seenMyNotificationsFunc } = require('../functions/notifications');

module.exports.getMyNotifications = async (req, res) => {
  const notifications = await getMyNotificationsFunc(req.user.uid);
  res.json({ data: notifications });
};

module.exports.seenMyNotifications = async (req, res) => {
  seenMyNotificationsFunc(req.user.uid);
  res.json({});
};
