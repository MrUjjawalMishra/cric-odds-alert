// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// HTTP server + Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// socket connection handling
io.on('connection', socket => {
  console.log('client connected:', socket.id);

  // join a match room
  socket.on('subscribe_match', matchId => {
    socket.join('match_' + matchId);
    console.log(`Socket ${socket.id} joined match_${matchId}`);
  });
});

// simulate odds endpoint
app.post('/simulate/odds', (req, res) => {
  const matchId = req.body.matchId || 'demo';
  const odds = req.body.odds || { home: 1.8, away: 2.1 };
  io.to('match_' + matchId).emit('odds_update', {
    matchId,
    odds,
    ts: Date.now()
  });
  return res.json({ ok: true, matchId, odds });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
