// Simple Socket.IO backend for proximity alerts
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(PORT, { cors: { origin: '*' } });

const users = new Map(); // socket.id -> { username, lat, lng, ts }

io.on('connection', (socket) => {
  console.log('client connected', socket.id);

  socket.on('location', (data) => {
    users.set(socket.id, data);
    // console.log('location', data);
  });

  socket.on('alert', (data) => {
    console.log('alert', data?.username, data?.lat, data?.lng);
    socket.broadcast.emit('alert', data);
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    console.log('client disconnected', socket.id);
  });
});

console.log(`Socket.IO server listening on :${PORT}`);
