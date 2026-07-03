import asyncHandler from '../middleware/asyncHandler.js';
import Activity from '../models/activityModel.js';

/**
 * @desc    Create new activity log
 * @route   POST /api/activities
 * @access  Private
 */
const createActivity = asyncHandler(async (req, res) => {
  const { entityType, entityId, action, message } = req.body;

  const activity = await Activity.create({
    company: req.user.company,
    entityType,
    entityId,
    action,
    message,
  });

  if (activity) {
    res.status(201).json(activity);
  } else {
    res.status(400);
    throw new Error('Invalid activity data');
  }
});

/**
 * @desc    Get all activities (company scoped)
 * @route   GET /api/activities
 * @access  Private
 */
const getActivities = asyncHandler(async (req, res) => {
  const { entityType, entityId, page = 1, limit = 20 } = req.query;

  const query = { company: req.user.company };

  if (entityType) query.entityType = entityType;
  if (entityId) query.entityId = entityId;

  const skip = (Number(page) - 1) * Number(limit);

  const activities = await Activity.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const count = await Activity.countDocuments(query);

  res.json({
    activities,
    page: Number(page),
    pages: Math.ceil(count / Number(limit)),
    total: count,
  });
});

/**
 * @desc    Get activity by ID (company scoped)
 * @route   GET /api/activities/:id
 * @access  Private
 */
const getActivityById = asyncHandler(async (req, res) => {
  const activity = await Activity.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (activity) {
    res.json(activity);
  } else {
    res.status(404);
    throw new Error('Activity not found');
  }
});

/**
 * @desc    Get activities for a specific entity
 * @route   GET /api/activities/entity/:entityType/:entityId
 * @access  Private
 */
const getEntityActivities = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;

  const activities = await Activity.find({
    company: req.user.company,
    entityType,
    entityId,
  }).sort({ createdAt: -1 });

  res.json(activities);
});

/**
 * @desc    Delete activity (optional - usually restricted)
 * @route   DELETE /api/activities/:id
 * @access  Private/Admin
 */
const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  await activity.deleteOne();

  res.json({ message: 'Activity removed' });
});

export {
  createActivity,
  getActivities,
  getActivityById,
  getEntityActivities,
  deleteActivity,
};