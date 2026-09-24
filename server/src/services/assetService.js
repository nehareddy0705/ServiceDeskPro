const { Asset, AssetHistory, User, Department, Vendor } = require('../models');
const ApiError = require('../utils/apiError');
const logAudit = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationService');
const {
  ROLES,
  ASSET_STATUSES,
  ASSET_ACTIONS,
  AUDIT_ENTITY_TYPES,
  NOTIFICATION_TYPES,
} = require('../constants');

/**
 * Reusable function to create an AssetHistory record
 */
const createAssetHistory = async ({
  asset,
  action,
  fromUser = null,
  toUser = null,
  performedBy,
  notes = '',
}) => {
  try {
    return await AssetHistory.create({
      asset,
      action,
      fromUser,
      toUser,
      performedBy,
      notes,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to create asset history:', error.message);
    return null;
  }
};

const createAsset = async (data, user, req = null) => {
  const normalizedTag = data.assetTag.trim().toUpperCase();

  const existingTag = await Asset.findOne({ assetTag: normalizedTag });
  if (existingTag) {
    throw ApiError.conflict('An asset with this asset tag already exists');
  }

  if (data.serialNumber && data.serialNumber.trim()) {
    const existingSerial = await Asset.findOne({ serialNumber: data.serialNumber.trim() });
    if (existingSerial) {
      throw ApiError.conflict('An asset with this serial number already exists');
    }
  }

  if (data.department) {
    const dept = await Department.findById(data.department);
    if (!dept) {
      throw ApiError.badRequest('Specified department does not exist');
    }
  }

  if (data.vendor) {
    const vendor = await Vendor.findById(data.vendor);
    if (!vendor) {
      throw ApiError.badRequest('Specified vendor does not exist');
    }
  }

  let assignedToId = null;
  let status = data.status || ASSET_STATUSES.AVAILABLE;

  if (data.assignedTo) {
    const targetUser = await User.findById(data.assignedTo);
    if (!targetUser) {
      throw ApiError.badRequest('Assigned user not found');
    }
    assignedToId = targetUser._id;
    status = ASSET_STATUSES.ASSIGNED;
  }

  const newAsset = await Asset.create({
    assetTag: normalizedTag,
    name: data.name.trim(),
    type: data.type,
    brand: data.brand ? data.brand.trim() : '',
    model: data.model ? data.model.trim() : '',
    serialNumber: data.serialNumber ? data.serialNumber.trim() : undefined,
    status,
    assignedTo: assignedToId,
    department: data.department || null,
    vendor: data.vendor || null,
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
    purchaseCost: data.purchaseCost !== undefined ? Number(data.purchaseCost) : undefined,
    warrantyStart: data.warrantyStart ? new Date(data.warrantyStart) : undefined,
    warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : undefined,
    location: data.location ? data.location.trim() : '',
    specifications: data.specifications || {},
    notes: data.notes ? data.notes.trim() : '',
  });

  // Record procurement history
  await createAssetHistory({
    asset: newAsset._id,
    action: ASSET_ACTIONS.PROCURED,
    fromUser: null,
    toUser: assignedToId,
    performedBy: user._id,
    notes: 'Asset created and procured into inventory',
  });

  if (assignedToId) {
    await createAssetHistory({
      asset: newAsset._id,
      action: ASSET_ACTIONS.ASSIGNED,
      fromUser: null,
      toUser: assignedToId,
      performedBy: user._id,
      notes: 'Initial assignment upon asset creation',
    });

    await createNotification({
      recipient: assignedToId,
      type: NOTIFICATION_TYPES.ASSET_ASSIGNED,
      title: `Asset Assigned: ${newAsset.assetTag}`,
      message: `You have been assigned ${newAsset.name} (${newAsset.assetTag}).`,
      asset: newAsset._id,
    });
  }

  await logAudit({
    user: user._id,
    action: 'CREATE_ASSET',
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: newAsset._id,
    newValue: newAsset,
    req,
  });

  return await Asset.findById(newAsset._id)
    .populate('assignedTo', 'name email employeeId')
    .populate('department', 'name code')
    .populate('vendor', 'name contactPerson');
};

const getAssets = async (query, user) => {
  const filter = {};

  // Employees can only view their own assigned assets
  if (user.role === ROLES.EMPLOYEE) {
    filter.assignedTo = user._id;
  } else {
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
  }

  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;
  if (query.vendor) filter.vendor = query.vendor;

  // Warranty filter
  if (query.warrantyStatus === 'active') {
    filter.warrantyEnd = { $gte: new Date() };
  } else if (query.warrantyStatus === 'expired') {
    filter.warrantyEnd = { $lt: new Date() };
  }

  // Search
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { assetTag: searchRegex },
      { name: searchRegex },
      { model: searchRegex },
      { brand: searchRegex },
      { serialNumber: searchRegex },
    ];
  }

  const pageNumber = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (pageNumber - 1) * limitNumber;

  const [assets, total] = await Promise.all([
    Asset.find(filter)
      .populate('assignedTo', 'name email employeeId')
      .populate('department', 'name code')
      .populate('vendor', 'name contactPerson')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    Asset.countDocuments(filter),
  ]);

  return {
    assets,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      pages: Math.ceil(total / limitNumber),
    },
  };
};

const getAssetById = async (id, user) => {
  const asset = await Asset.findById(id)
    .populate('assignedTo', 'name email employeeId phone department')
    .populate('department', 'name code')
    .populate('vendor', 'name contactPerson email phone website');

  if (!asset) {
    throw ApiError.notFound('Asset not found');
  }

  if (user.role === ROLES.EMPLOYEE) {
    if (!asset.assignedTo || asset.assignedTo._id.toString() !== user._id.toString()) {
      throw ApiError.forbidden('Access denied: You can only view assets assigned to you');
    }
  }

  return asset;
};

const updateAsset = async (id, data, user, req = null) => {
  const asset = await Asset.findById(id);
  if (!asset) {
    throw ApiError.notFound('Asset not found');
  }

  const oldValue = asset.toObject();

  if (data.assetTag) {
    const normalizedTag = data.assetTag.trim().toUpperCase();
    if (normalizedTag !== asset.assetTag) {
      const existing = await Asset.findOne({ assetTag: normalizedTag, _id: { $ne: id } });
      if (existing) throw ApiError.conflict('Asset tag is already taken');
      asset.assetTag = normalizedTag;
    }
  }

  if (data.serialNumber) {
    const trimmedSerial = data.serialNumber.trim();
    if (trimmedSerial !== asset.serialNumber) {
      const existing = await Asset.findOne({ serialNumber: trimmedSerial, _id: { $ne: id } });
      if (existing) throw ApiError.conflict('Serial number is already taken');
      asset.serialNumber = trimmedSerial;
    }
  }

  if (data.department !== undefined) {
    if (data.department) {
      const dept = await Department.findById(data.department);
      if (!dept) throw ApiError.badRequest('Department not found');
      asset.department = dept._id;
    } else {
      asset.department = null;
    }
  }

  if (data.vendor !== undefined) {
    if (data.vendor) {
      const vendor = await Vendor.findById(data.vendor);
      if (!vendor) throw ApiError.badRequest('Vendor not found');
      asset.vendor = vendor._id;
    } else {
      asset.vendor = null;
    }
  }

  if (data.name) asset.name = data.name.trim();
  if (data.type) asset.type = data.type;
  if (data.brand !== undefined) asset.brand = data.brand ? data.brand.trim() : '';
  if (data.model !== undefined) asset.model = data.model ? data.model.trim() : '';
  if (data.purchaseDate !== undefined) asset.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : undefined;
  if (data.purchaseCost !== undefined) asset.purchaseCost = Number(data.purchaseCost);
  if (data.warrantyStart !== undefined) asset.warrantyStart = data.warrantyStart ? new Date(data.warrantyStart) : undefined;
  if (data.warrantyEnd !== undefined) asset.warrantyEnd = data.warrantyEnd ? new Date(data.warrantyEnd) : undefined;
  if (data.location !== undefined) asset.location = data.location ? data.location.trim() : '';
  if (data.specifications !== undefined) asset.specifications = data.specifications;
  if (data.notes !== undefined) asset.notes = data.notes ? data.notes.trim() : '';

  await asset.save();

  const updatedAsset = await Asset.findById(id)
    .populate('assignedTo', 'name email employeeId')
    .populate('department', 'name code')
    .populate('vendor', 'name contactPerson');

  await logAudit({
    user: user._id,
    action: 'UPDATE_ASSET',
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: id,
    oldValue,
    newValue: updatedAsset,
    req,
  });

  return updatedAsset;
};

const assignAsset = async (id, { toUserId, departmentId, notes }, user, req = null) => {
  const asset = await Asset.findById(id);
  if (!asset) {
    throw ApiError.notFound('Asset not found');
  }

  const targetUser = await User.findById(toUserId);
  if (!targetUser) {
    throw ApiError.badRequest('Target user does not exist');
  }

  const fromUser = asset.assignedTo || null;
  const isTransfer = fromUser && fromUser.toString() !== targetUser._id.toString();

  asset.assignedTo = targetUser._id;
  asset.status = ASSET_STATUSES.ASSIGNED;
  if (departmentId) {
    asset.department = departmentId;
  } else if (targetUser.department) {
    asset.department = targetUser.department._id || targetUser.department;
  }

  await asset.save();

  // Create Asset History
  const historyAction = isTransfer ? ASSET_ACTIONS.TRANSFERRED : ASSET_ACTIONS.ASSIGNED;
  await createAssetHistory({
    asset: asset._id,
    action: historyAction,
    fromUser,
    toUser: targetUser._id,
    performedBy: user._id,
    notes: notes || (isTransfer ? 'Transferred asset' : 'Assigned asset to user'),
  });

  // Create Notification
  await createNotification({
    recipient: targetUser._id,
    type: NOTIFICATION_TYPES.ASSET_ASSIGNED,
    title: `Asset Assigned: ${asset.assetTag}`,
    message: `You have been assigned ${asset.name} (${asset.assetTag}).`,
    asset: asset._id,
  });

  await logAudit({
    user: user._id,
    action: isTransfer ? 'TRANSFER_ASSET' : 'ASSIGN_ASSET',
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: id,
    newValue: { assignedTo: targetUser._id, status: ASSET_STATUSES.ASSIGNED },
    req,
  });

  return await Asset.findById(id)
    .populate('assignedTo', 'name email employeeId')
    .populate('department', 'name code')
    .populate('vendor', 'name');
};

const unassignAsset = async (id, { notes }, user, req = null) => {
  const asset = await Asset.findById(id);
  if (!asset) {
    throw ApiError.notFound('Asset not found');
  }

  const fromUser = asset.assignedTo || null;
  asset.assignedTo = null;
  asset.status = ASSET_STATUSES.AVAILABLE;

  await asset.save();

  await createAssetHistory({
    asset: asset._id,
    action: ASSET_ACTIONS.UNASSIGNED,
    fromUser,
    toUser: null,
    performedBy: user._id,
    notes: notes || 'Unassigned asset from user',
  });

  await logAudit({
    user: user._id,
    action: 'UNASSIGN_ASSET',
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: id,
    newValue: { assignedTo: null, status: ASSET_STATUSES.AVAILABLE },
    req,
  });

  return await Asset.findById(id)
    .populate('assignedTo', 'name email employeeId')
    .populate('department', 'name code')
    .populate('vendor', 'name');
};

const updateAssetStatus = async (id, { status, notes }, user, req = null) => {
  const asset = await Asset.findById(id);
  if (!asset) {
    throw ApiError.notFound('Asset not found');
  }

  const previousStatus = asset.status;
  asset.status = status;

  if (status === ASSET_STATUSES.DISPOSED || status === ASSET_STATUSES.RETIRED || status === ASSET_STATUSES.LOST) {
    asset.assignedTo = null;
  }

  await asset.save();

  // Map to history action
  let historyAction = ASSET_ACTIONS.REPAIR_STARTED;
  if (status === ASSET_STATUSES.UNDER_REPAIR) historyAction = ASSET_ACTIONS.REPAIR_STARTED;
  else if (status === ASSET_STATUSES.AVAILABLE && previousStatus === ASSET_STATUSES.UNDER_REPAIR) historyAction = ASSET_ACTIONS.REPAIR_COMPLETED;
  else if (status === ASSET_STATUSES.RETIRED) historyAction = ASSET_ACTIONS.RETIRED;
  else if (status === ASSET_STATUSES.DISPOSED) historyAction = ASSET_ACTIONS.DISPOSED;
  else if (status === ASSET_STATUSES.LOST) historyAction = ASSET_ACTIONS.LOST;

  await createAssetHistory({
    asset: asset._id,
    action: historyAction,
    fromUser: asset.assignedTo,
    toUser: null,
    performedBy: user._id,
    notes: notes || `Asset status changed from ${previousStatus} to ${status}`,
  });

  await logAudit({
    user: user._id,
    action: 'UPDATE_ASSET_STATUS',
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: id,
    oldValue: { status: previousStatus },
    newValue: { status },
    req,
  });

  return await Asset.findById(id)
    .populate('assignedTo', 'name email employeeId')
    .populate('department', 'name code')
    .populate('vendor', 'name');
};

const deleteAsset = async (id, user, req = null) => {
  const asset = await Asset.findById(id);
  if (!asset) {
    throw ApiError.notFound('Asset not found');
  }

  asset.status = ASSET_STATUSES.DISPOSED;
  asset.assignedTo = null;
  await asset.save();

  await createAssetHistory({
    asset: asset._id,
    action: ASSET_ACTIONS.DISPOSED,
    fromUser: null,
    toUser: null,
    performedBy: user._id,
    notes: 'Asset marked as disposed / deleted from active register',
  });

  await logAudit({
    user: user._id,
    action: 'DELETE_ASSET',
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: id,
    newValue: { status: ASSET_STATUSES.DISPOSED },
    req,
  });

  return { message: 'Asset removed from active inventory successfully' };
};

const getAssetHistory = async (assetId) => {
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw ApiError.notFound('Asset not found');
  }

  const history = await AssetHistory.find({ asset: assetId })
    .populate('fromUser', 'name email employeeId')
    .populate('toUser', 'name email employeeId')
    .populate('performedBy', 'name email role')
    .sort({ timestamp: -1 });

  return history;
};

module.exports = {
  createAssetHistory,
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  assignAsset,
  unassignAsset,
  updateAssetStatus,
  deleteAsset,
  getAssetHistory,
};
