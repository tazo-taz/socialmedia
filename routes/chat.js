const chat = require('../controllers/chat');
const use = require('../middleware/errorHandler');
const { isUser, isOwnUserOrAdmin } = require('../middleware/statusCheck');

const router = require('express').Router();

router.get('/chatmessages/:uid', use(chat.getChatMessages));

router.get('/privateconnection/:uid', use(chat.getPrivateConnection));

router.post('/chatmessage/:uid', use(chat.createChatMessage));

router.put('/seenchat/:uid', use(chat.seenChat));

router.get('/chatsandnotifications', use(chat.getChatsAndNotifications));

router.post('/room', use(chat.createRoom));

router.put('/room/:uid', use(chat.updateRoom));

router.delete('/room/:uid', use(chat.deleteRoom));

module.exports = router;
