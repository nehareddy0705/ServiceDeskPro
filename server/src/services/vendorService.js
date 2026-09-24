const { Vendor } = require('../models');
const ApiError = require('../utils/apiError');
const logAudit = require('../utils/auditLogger');
const { AUDIT_ENTITY_TYPES } = require('../constants');

const getVendors = async ({ isActive } = {}) => {
  const query = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  }

  return await Vendor.find(query).sort({ name: 1 });
};

const getVendorById = async (id) => {
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw ApiError.notFound('Vendor not found');
  }
  return vendor;
};

const createVendor = async (data, user, req = null) => {
  const { name, contactPerson, email, phone, address, website } = data;

  if (!name || !name.trim()) {
    throw ApiError.badRequest('Vendor name is required');
  }

  const newVendor = await Vendor.create({
    name: name.trim(),
    contactPerson: contactPerson ? contactPerson.trim() : '',
    email: email ? email.trim().toLowerCase() : '',
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    website: website ? website.trim() : '',
    isActive: true,
  });

  await logAudit({
    user: user._id,
    action: 'CREATE_VENDOR',
    entityType: AUDIT_ENTITY_TYPES.VENDOR,
    entityId: newVendor._id,
    newValue: newVendor,
    req,
  });

  return newVendor;
};

const updateVendor = async (id, data, user, req = null) => {
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw ApiError.notFound('Vendor not found');
  }

  const oldValue = vendor.toObject();

  if (data.name) vendor.name = data.name.trim();
  if (data.contactPerson !== undefined) vendor.contactPerson = data.contactPerson ? data.contactPerson.trim() : '';
  if (data.email !== undefined) vendor.email = data.email ? data.email.trim().toLowerCase() : '';
  if (data.phone !== undefined) vendor.phone = data.phone ? data.phone.trim() : '';
  if (data.address !== undefined) vendor.address = data.address ? data.address.trim() : '';
  if (data.website !== undefined) vendor.website = data.website ? data.website.trim() : '';
  if (data.isActive !== undefined) vendor.isActive = data.isActive;

  await vendor.save();

  await logAudit({
    user: user._id,
    action: 'UPDATE_VENDOR',
    entityType: AUDIT_ENTITY_TYPES.VENDOR,
    entityId: id,
    oldValue,
    newValue: vendor,
    req,
  });

  return vendor;
};

const deleteVendor = async (id, user, req = null) => {
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw ApiError.notFound('Vendor not found');
  }

  const oldValue = vendor.toObject();
  vendor.isActive = false;
  await vendor.save();

  await logAudit({
    user: user._id,
    action: 'DEACTIVATE_VENDOR',
    entityType: AUDIT_ENTITY_TYPES.VENDOR,
    entityId: id,
    oldValue,
    newValue: { isActive: false },
    req,
  });

  return { message: 'Vendor deactivated successfully' };
};

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};
