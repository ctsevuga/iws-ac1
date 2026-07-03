// utils/activityLogger.js

import Activity from '../models/activityModel.js';

export const logActivity = async ({
  company,
  entityType,
  entityId,
  action,
  message,
}) => {
  try {
    await Activity.create({
      company,
      entityType,
      entityId,
      action,
      message,
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
};