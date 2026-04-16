const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const userAuth = require('../middleware/userAuth');

// GET /api/notifications — user's notifications (newest first)
router.get('/', userAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    const unreadCount = notifications.filter(n => n.status !== 'seen').length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('GET /notifications error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/mark-all-seen — mark all as seen
router.put('/mark-all-seen', userAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, status: { $ne: 'seen' } },
      { status: 'seen' }
    );
    res.json({ message: 'All marked as seen' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/seen — mark single as seen
router.put('/:id/seen', userAuth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'seen' }
    );
    res.json({ message: 'Marked as seen' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
