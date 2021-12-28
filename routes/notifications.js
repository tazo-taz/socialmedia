const notifications = require('../controllers/notifications');
const use = require('../middleware/errorHandler');
const { isUser, isOwnUserOrAdmin } = require('../middleware/statusCheck');

const router = require('express').Router();

router.get('/notifications', use(notifications.getMyNotifications));

router.put('/seennotifications', use(notifications.seenMyNotifications));

module.exports = router;
