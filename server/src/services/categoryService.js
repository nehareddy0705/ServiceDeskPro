const { Category } = require('../models');
const ApiError = require('../utils/apiError');
const logAudit = require('../utils/auditLogger');
const { AUDIT_ENTITY_TYPES, TICKET_PRIORITIES } = require('../constants');

const getCategories = async ({ isActive } = {}) => {
  const query = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  }

  const categories = await Category.find(query)
    .populate('parentCategory', 'name defaultPriority')
    .sort({ name: 1 });

  return categories;
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id).populate('parentCategory', 'name defaultPriority');
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  return category;
};

const createCategory = async (data, performedBy, req = null) => {
  const { name, description, parentCategory, defaultPriority } = data;

  if (!name || !name.trim()) {
    throw ApiError.badRequest('Category name is required');
  }

  const normalizedName = name.trim();
  const existingName = await Category.findOne({ name: normalizedName });
  if (existingName) {
    throw ApiError.conflict('A category with this name already exists');
  }

  let parentId = null;
  if (parentCategory) {
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      throw ApiError.badRequest('Specified parent category does not exist');
    }
    parentId = parent._id;
  }

  const newCategory = await Category.create({
    name: normalizedName,
    description: description ? description.trim() : '',
    parentCategory: parentId,
    defaultPriority: defaultPriority || TICKET_PRIORITIES.MEDIUM,
    isActive: true,
  });

  await logAudit({
    user: performedBy._id,
    action: 'CREATE_CATEGORY',
    entityType: AUDIT_ENTITY_TYPES.CATEGORY,
    entityId: newCategory._id,
    newValue: newCategory,
    req,
  });

  return await Category.findById(newCategory._id).populate('parentCategory', 'name defaultPriority');
};

const updateCategory = async (id, data, performedBy, req = null) => {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const oldValue = category.toObject();

  if (data.name) {
    const normalizedName = data.name.trim();
    if (normalizedName !== category.name) {
      const existing = await Category.findOne({ name: normalizedName, _id: { $ne: id } });
      if (existing) {
        throw ApiError.conflict('Category name is already in use');
      }
      category.name = normalizedName;
    }
  }

  if (data.parentCategory !== undefined) {
    if (data.parentCategory) {
      if (data.parentCategory.toString() === id.toString()) {
        throw ApiError.badRequest('A category cannot be its own parent category');
      }
      const parent = await Category.findById(data.parentCategory);
      if (!parent) {
        throw ApiError.badRequest('Specified parent category does not exist');
      }
      category.parentCategory = parent._id;
    } else {
      category.parentCategory = null;
    }
  }

  if (data.description !== undefined) {
    category.description = data.description ? data.description.trim() : '';
  }

  if (data.defaultPriority) {
    category.defaultPriority = data.defaultPriority;
  }

  if (data.isActive !== undefined) {
    category.isActive = data.isActive;
  }

  await category.save();

  const updatedCategory = await Category.findById(id).populate('parentCategory', 'name defaultPriority');

  await logAudit({
    user: performedBy._id,
    action: 'UPDATE_CATEGORY',
    entityType: AUDIT_ENTITY_TYPES.CATEGORY,
    entityId: id,
    oldValue,
    newValue: updatedCategory,
    req,
  });

  return updatedCategory;
};

const deleteCategory = async (id, performedBy, req = null) => {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const oldValue = category.toObject();
  category.isActive = false;
  await category.save();

  await logAudit({
    user: performedBy._id,
    action: 'DEACTIVATE_CATEGORY',
    entityType: AUDIT_ENTITY_TYPES.CATEGORY,
    entityId: id,
    oldValue,
    newValue: { isActive: false },
    req,
  });

  return { message: 'Category deactivated successfully' };
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
