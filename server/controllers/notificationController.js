const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');
const { scope } = require('../services/trainingService');
const { toNotification } = require('../utils/mappers');

// GET /api/me/notifications — the cell's notification feed
const list = asyncHandler(async (req, res) => {
  const { keys, cell } = await scope(req.user.sub);
  const cellId = (cell && (cell.cellId || cell.id)) || null;
  const docs = await Notification.find({ assignedDepartment: { $in: keys } }).lean();
  const data = docs
    .map((n) => toNotification(n, cellId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, data });
});

// PATCH /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  const { keys } = await scope(req.user.sub);
  await Notification.updateMany({ assignedDepartment: { $in: keys } }, { $set: { read: true, isRead: true } });
  res.json({ success: true });
});

// PATCH /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const { keys } = await scope(req.user.sub);
  await Notification.updateOne(
    { $or: [{ id: req.params.id }, { notificationId: req.params.id }], assignedDepartment: { $in: keys } },
    { $set: { read: true, isRead: true } }
  );
  res.json({ success: true });
});

module.exports = { list, markAllRead, markRead };
