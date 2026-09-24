const { Department, User } = require('../models');
const ApiError = require('../utils/apiError');
const logAudit = require('../utils/auditLogger');
const { AUDIT_ENTITY_TYPES } = require('../constants');

const getDepartments = async ({ isActive } = {}) => {
  const query = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  }

  const departments = await Department.find(query)
    .populate('manager', 'name email employeeId')
    .sort({ name: 1 });

  return departments;
};

const getDepartmentById = async (id) => {
  const department = await Department.findById(id).populate('manager', 'name email employeeId');
  if (!department) {
    throw ApiError.notFound('Department not found');
  }
  return department;
};

const createDepartment = async (data, performedBy, req = null) => {
  const { name, code, description, manager } = data;

  if (!name || !name.trim()) {
    throw ApiError.badRequest('Department name is required');
  }

  if (!code || !code.trim()) {
    throw ApiError.badRequest('Department code is required');
  }

  const normalizedName = name.trim();
  const normalizedCode = code.trim().toUpperCase();

  const existingName = await Department.findOne({ name: normalizedName });
  if (existingName) {
    throw ApiError.conflict('A department with this name already exists');
  }

  const existingCode = await Department.findOne({ code: normalizedCode });
  if (existingCode) {
    throw ApiError.conflict('A department with this code already exists');
  }

  if (manager) {
    const managerUser = await User.findById(manager);
    if (!managerUser) {
      throw ApiError.badRequest('Specified manager does not exist');
    }
  }

  const newDept = await Department.create({
    name: normalizedName,
    code: normalizedCode,
    description: description ? description.trim() : '',
    manager: manager || null,
    isActive: true,
  });

  await logAudit({
    user: performedBy._id,
    action: 'CREATE_DEPARTMENT',
    entityType: AUDIT_ENTITY_TYPES.DEPARTMENT,
    entityId: newDept._id,
    newValue: newDept,
    req,
  });

  return await Department.findById(newDept._id).populate('manager', 'name email employeeId');
};

const updateDepartment = async (id, data, performedBy, req = null) => {
  const department = await Department.findById(id);
  if (!department) {
    throw ApiError.notFound('Department not found');
  }

  const oldValue = department.toObject();

  if (data.name) {
    const normalizedName = data.name.trim();
    if (normalizedName !== department.name) {
      const existing = await Department.findOne({ name: normalizedName, _id: { $ne: id } });
      if (existing) {
        throw ApiError.conflict('Department name is already in use');
      }
      department.name = normalizedName;
    }
  }

  if (data.code) {
    const normalizedCode = data.code.trim().toUpperCase();
    if (normalizedCode !== department.code) {
      const existing = await Department.findOne({ code: normalizedCode, _id: { $ne: id } });
      if (existing) {
        throw ApiError.conflict('Department code is already in use');
      }
      department.code = normalizedCode;
    }
  }

  if (data.description !== undefined) {
    department.description = data.description ? data.description.trim() : '';
  }

  if (data.manager !== undefined) {
    if (data.manager) {
      const managerUser = await User.findById(data.manager);
      if (!managerUser) {
        throw ApiError.badRequest('Specified manager does not exist');
      }
      department.manager = managerUser._id;
    } else {
      department.manager = null;
    }
  }

  if (data.isActive !== undefined) {
    department.isActive = data.isActive;
  }

  await department.save();

  const updatedDept = await Department.findById(id).populate('manager', 'name email employeeId');

  await logAudit({
    user: performedBy._id,
    action: 'UPDATE_DEPARTMENT',
    entityType: AUDIT_ENTITY_TYPES.DEPARTMENT,
    entityId: id,
    oldValue,
    newValue: updatedDept,
    req,
  });

  return updatedDept;
};

const deleteDepartment = async (id, performedBy, req = null) => {
  const department = await Department.findById(id);
  if (!department) {
    throw ApiError.notFound('Department not found');
  }

  const oldValue = department.toObject();
  department.isActive = false;
  await department.save();

  await logAudit({
    user: performedBy._id,
    action: 'DEACTIVATE_DEPARTMENT',
    entityType: AUDIT_ENTITY_TYPES.DEPARTMENT,
    entityId: id,
    oldValue,
    newValue: { isActive: false },
    req,
  });

  return { message: 'Department deactivated successfully' };
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
