const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookieSession = require('cookie-session');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');

const { PORT } = require('./config/default');
const { addUserSocket, removeUserSocket, getUserBySocketId } = require('./socket/users');
const { getChatUsersFunc, setNotseenFunc } = require('./functions/chat');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
io.on('connection', (socket) => {
  socket.on('join', (uid) => {
    socket.join(uid);
  });

  socket.on('sendMessage', async ({ message, uid, from, notification = 0 } = {}) => {
    const date = new Date();
    socket.broadcast.to(uid).emit('message', { from, message, date: date - 1, notification });

    const users = await getChatUsersFunc(uid, true);

    users
      .filter((a) => a.userUid !== from)
      .forEach((a) => {
        io.to('user' + a.userUid).emit('openChat', uid);
      });

    setNotseenFunc(from, uid);

    io.to('user' + from).emit('sendMessageToDb');
  });

  socket.on('disconnectchat', (uid) => {
    socket.leave(uid);
  });

  socket.on('disconnect', () => {
    console.log('disconect');
    // removeUserSocket(socket.id);
  });
});

// middlewares
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000'],
  }),
);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  }),
);
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'hubwiz app',
    cookie: { maxAge: 60 * 1000 * 30 },
  }),
);
require('./passport/passport-local')(passport);
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use(require('./routes'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public', 'index.html'));
});

app.use(function (err, req, res, next) {
  console.log(err);
  res.json({ error: String(err) });
});

server.listen(PORT);
