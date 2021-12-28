const users = require('../controllers/users');
const use = require('../middleware/errorHandler');
const { isUser, isOwnUserOrAdmin } = require('../middleware/statusCheck');

const router = require('express').Router();

router.get('/users', use(users.getUsers));

router.get('/user/:uid', use(users.getUser));

router.post('/sendrequest/:uid', isUser, use(users.sendRequest));

router.delete('/sendrequest/:uid', isUser, use(users.deleteRequest));

router.delete('/sendrequestbyuid/:uid', isUser, use(users.deleteRequestByUid));

router.delete('/recieverequest/:uid', isUser, use(users.deleteRecieveRequest));

router.delete('/recieverequestByUid/:uid', isUser, use(users.deleteRecieveRequestByUid));

router.post('/friend/:uid', isUser, use(users.addFriend));

router.post('/friendbyuid/:uid', isUser, use(users.addFriendByUid));

router.delete('/friend/:uid', isUser, use(users.deleteFriend));

router.get('/userconnection/:uid', use(users.getConnectionToUser));

router.put('/user/:uid', isOwnUserOrAdmin, use(users.updateUser));

router.get('/myfriends', use(users.getMyFriends));

router.get('/', use(users.main));

module.exports = router;
