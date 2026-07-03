import express from 'express';
import {
  createActivity,
  getActivities,
  getActivityById,
  getEntityActivities,
  deleteActivity,
} from '../controllers/activityController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Base route: /api/activities
 */

// Create activity
router.route('/')
  .post(protect, createActivity)
  .get(protect, getActivities);

// Get activity by ID
router.route('/:id')
  .get(protect, getActivityById)
  .delete(protect, admin, deleteActivity);

// Get activities for a specific entity
router.route('/entity/:entityType/:entityId')
  .get(protect, getEntityActivities);

export default router;