const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const {
  User,
  Session,
  SessionEvent,
} = require('./schemas');

app.use(bodyParser.json());
// HTTP Request Handlers
app.use(cors({
    origin: '*'
}));

app.post('/user', async (req, res, next) => {
  const user = new User({ name: req.body.name, online: false });
  await user.save();
  res.send(user).end();
  next();
})

app.post('/create', async (req, res, next) => {
  console.log(req.body)
  const session = new Session({ url: req.body.payload.url, name: req.body.name, id: req.body.payload.sessionId, status: 'PAUSED' });
  await session.save();
  const sessionEvent = new SessionEvent({
    username: req.body.username,
    payload: { name: req.body.name },
    sessionId: session.id,
    event: 'CREATE',
  });
  await sessionEvent.save();

  res.send(session).end();
  next();
})

app.get('/watch/:sessionId', async (req, res, next) => {
  const session = await Session.findOne({ id: req.params.sessionId }).exec();
  res.send(session).end();
  next();
})

app.get('/replay/:sessionId', async (req, res, next) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  })

  // update so that it queries them in sorted order by time
  for await (const doc of SessionEvent.find({ sessionId: req.params.sessionId })) {
    res.write(JSON.stringify(doc.toJSON()) + '\n');
  }

  res.end()
  next()
});

// WS Event Handlers

io.on('connection', (socket) => {
  socket.on('session_event', async (message) => {
    console.log('SESSION EVENT: ', message);
    if (message.event === 'JOIN') {
      socket.join(message.sessionId);
    } else if (message.event === 'LEAVE') {
      socket.leave(message.sessionId);
    }
    // emit session payload immediately so others get update real time
    io.to(message.sessionId).emit('session_event', {
      username: message.username,
      payload: message.payload,
      event: message.event,
      sessionId: message.sessionId,
    });
    // save event for so we can process state
    const sessionEvent = new SessionEvent({
      username: message.username,
      payload: message.payload,
      sessionId: message.sessionId,
      event: message.event,
    });
    await sessionEvent.save();

  });
  SessionEvent.on('change', async (next) => {
    if (next.operationType === 'insert') {
      const session = await Session.findOne({ id: next.fullDocument.sessionId }).exec();
      if (session.status !== 'ENDED') {
        if (next.fullDocument.event === 'PLAY') {
          session.state = 'PLAYING';
        } else if (next.fullDocument.event === 'PAUSE') {
          session.state = 'PAUSED';
        } else if (next.fullDocument.event === 'ENDED') {
          session.state = 'ENDED';
        }
      }
      await session.save();
    }
  })
  User.on('change', next => {
    console.log(next);
    if (next.operationType === 'update') {
      console.log(next.fullDocument);
    }
  })
  socket.on('disconnect', () => {
    console.log(`User disconnected`);
    io.emit('disconnection');
  });
})


mongoose.connect(process.env.MONGODB_URI).then(() => {
  server.listen(4001, () => {
    console.log('Server listening on http://localhost:4001')
  });
})

