const Notification = require('./models/Notification');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on('markSeen', async ({ notificationId, userId }) => {
      await Notification.findByIdAndUpdate(notificationId, { status: 'seen' });
      socket.to(userId).emit('messageSeen', { notificationId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

