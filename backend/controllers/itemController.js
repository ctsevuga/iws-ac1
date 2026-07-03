import asyncHandler from "../middleware/asyncHandler.js";
import Item from "../models/itemModel.js";
import Invoice from "../models/invoiceItemsModel.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * @desc    Create new item
 * @route   POST /api/items
 * @access  Private
 */
const createItem = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    sku,
    price,
    currency,
    taxRate,
    unit,
    category,
    isTaxable,
  } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Item name is required");
  }

  if (price === undefined || price === null) {
    res.status(400);
    throw new Error("Item price is required");
  }

  // ✅ Prevent duplicate item name per company
  const existingItem = await Item.findOne({
    company: req.user.company,
    name: name.trim(),
  });

  if (existingItem) {
    res.status(400);
    throw new Error("Item already exists");
  }

  const item = await Item.create({
    company: req.user.company,
    name: name.trim(),
    description,
    sku,
    price,
    currency,
    taxRate,
    unit,
    category,
    isTaxable,
    createdBy: req.user._id,
  });

  await logActivity({
    company: req.user.company,
    entityType: "Item",
    entityId: item._id,
    action: "CREATE_ITEM",
    message: `Item ${item.name} created`,
  });

  res.status(201).json(item);
});

/**
 * @desc    Get all items (with search + pagination)
 * @route   GET /api/items
 * @access  Private
 */
const getItems = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20, includeInactive } = req.query;

  const query = {
    company: req.user.company,
  };

  // ✅ Active filter
  if (!includeInactive) {
    query.isActive = true;
  }

  // ✅ Search support
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const items = await Item.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Item.countDocuments(query);

  res.json({
    items,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

/**
 * @desc    Get item by ID
 * @route   GET /api/items/:id
 * @access  Private
 */
const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  res.json(item);
});

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Private
 */
const updateItem = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    sku,
    price,
    currency,
    taxRate,
    unit,
    category,
    isActive,
    isTaxable,
  } = req.body;

  const item = await Item.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  // ✅ Prevent duplicate name
  if (name && name !== item.name) {
    const existingItem = await Item.findOne({
      company: req.user.company,
      name: name.trim(),
      _id: { $ne: item._id },
    });

    if (existingItem) {
      res.status(400);
      throw new Error("Another item already exists with this name");
    }
  }

  const oldName = item.name;

  item.name = name || item.name;
  item.description = description ?? item.description;
  item.sku = sku ?? item.sku;
  item.price = price ?? item.price;
  item.currency = currency ?? item.currency;
  item.taxRate = taxRate ?? item.taxRate;
  item.unit = unit ?? item.unit;
  item.category = category ?? item.category;
  item.isActive = isActive ?? item.isActive;
  item.isTaxable = isTaxable ?? item.isTaxable;

  const updatedItem = await item.save();

  await logActivity({
    company: req.user.company,
    entityType: "Item",
    entityId: item._id,
    action: "UPDATE_ITEM",
    message: `Item updated (${oldName} → ${updatedItem.name})`,
  });

  res.json(updatedItem);
});

/**
 * @desc    Delete item (soft delete recommended)
 * @route   DELETE /api/items/:id
 * @access  Private
 */
const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  // Optional safety check: prevent deletion if used in invoices
  const usedInInvoices = await Invoice.countDocuments({
    company: req.user.company,
    "items.item": item._id,
  });

  if (usedInInvoices > 0) {
    // safer than hard delete → deactivate instead
    item.isActive = false;
    await item.save();

    await logActivity({
      company: req.user.company,
      entityType: "Item",
      entityId: item._id,
      action: "DEACTIVATE_ITEM",
      message: `Item ${item.name} deactivated (used in invoices)`,
    });

    return res.json({
      message:
        "Item is used in invoices, so it was deactivated instead of deleted",
    });
  }

  await item.deleteOne();

  await logActivity({
    company: req.user.company,
    entityType: "Item",
    entityId: item._id,
    action: "DELETE_ITEM",
    message: `Item ${item.name} deleted`,
  });

  res.json({
    message: "Item deleted successfully",
  });
});

export {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};