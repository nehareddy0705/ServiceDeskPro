const { KnowledgeArticle, Category } = require('../models');
const ApiError = require('../utils/apiError');
const logAudit = require('../utils/auditLogger');
const { ROLES, AUDIT_ENTITY_TYPES } = require('../constants');

const getArticles = async (query, user) => {
  const filter = {};

  // Employees can only view published articles
  if (user.role === ROLES.EMPLOYEE) {
    filter.status = 'published';
  } else if (query.status) {
    filter.status = query.status;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.tag) {
    filter.tags = query.tag.toLowerCase().trim();
  }

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { title: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ];
  }

  const pageNumber = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (pageNumber - 1) * limitNumber;

  const [articles, total] = await Promise.all([
    KnowledgeArticle.find(filter)
      .populate('category', 'name defaultPriority')
      .populate('author', 'name email employeeId')
      .select('-embedding')
      .sort({ views: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    KnowledgeArticle.countDocuments(filter),
  ]);

  return {
    articles,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      pages: Math.ceil(total / limitNumber),
    },
  };
};

const getArticleById = async (id, user) => {
  const article = await KnowledgeArticle.findById(id)
    .populate('category', 'name defaultPriority')
    .populate('author', 'name email employeeId role');

  if (!article) {
    throw ApiError.notFound('Knowledge article not found');
  }

  if (user.role === ROLES.EMPLOYEE && article.status !== 'published') {
    throw ApiError.forbidden('Access denied: Article is not published');
  }

  // Increment views
  article.views = (article.views || 0) + 1;
  await article.save();

  return article;
};

const createArticle = async (data, user, req = null) => {
  const { title, content, category, tags, status, embedding } = data;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw ApiError.badRequest('Article title is required');
  }

  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw ApiError.badRequest('Article content is required');
  }

  let categoryId = null;
  if (category) {
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      throw ApiError.badRequest('Specified category does not exist');
    }
    categoryId = categoryDoc._id;
  }

  const processedTags = Array.isArray(tags)
    ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
    : [];

  const newArticle = await KnowledgeArticle.create({
    title: title.trim(),
    content: content.trim(),
    category: categoryId,
    tags: processedTags,
    author: user._id,
    status: status || 'draft',
    embedding: Array.isArray(embedding) ? embedding : undefined,
  });

  await logAudit({
    user: user._id,
    action: 'CREATE_KNOWLEDGE_ARTICLE',
    entityType: AUDIT_ENTITY_TYPES.KNOWLEDGE_ARTICLE,
    entityId: newArticle._id,
    newValue: newArticle,
    req,
  });

  return await KnowledgeArticle.findById(newArticle._id)
    .populate('category', 'name defaultPriority')
    .populate('author', 'name email employeeId');
};

const updateArticle = async (id, data, user, req = null) => {
  const article = await KnowledgeArticle.findById(id);
  if (!article) {
    throw ApiError.notFound('Knowledge article not found');
  }

  const oldValue = article.toObject();

  if (data.title) article.title = data.title.trim();
  if (data.content) article.content = data.content.trim();
  if (data.status) article.status = data.status;
  if (data.category !== undefined) {
    if (data.category) {
      const cat = await Category.findById(data.category);
      if (!cat) throw ApiError.badRequest('Category does not exist');
      article.category = cat._id;
    } else {
      article.category = null;
    }
  }
  if (data.tags) {
    article.tags = Array.isArray(data.tags)
      ? data.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
      : [];
  }
  if (data.embedding !== undefined) {
    article.embedding = Array.isArray(data.embedding) ? data.embedding : undefined;
  }

  await article.save();

  const updatedArticle = await KnowledgeArticle.findById(id)
    .populate('category', 'name defaultPriority')
    .populate('author', 'name email employeeId');

  await logAudit({
    user: user._id,
    action: 'UPDATE_KNOWLEDGE_ARTICLE',
    entityType: AUDIT_ENTITY_TYPES.KNOWLEDGE_ARTICLE,
    entityId: id,
    oldValue,
    newValue: updatedArticle,
    req,
  });

  return updatedArticle;
};

const deleteArticle = async (id, user, req = null) => {
  const article = await KnowledgeArticle.findById(id);
  if (!article) {
    throw ApiError.notFound('Knowledge article not found');
  }

  const oldValue = article.toObject();
  article.status = 'archived';
  await article.save();

  await logAudit({
    user: user._id,
    action: 'ARCHIVE_KNOWLEDGE_ARTICLE',
    entityType: AUDIT_ENTITY_TYPES.KNOWLEDGE_ARTICLE,
    entityId: id,
    oldValue,
    newValue: { status: 'archived' },
    req,
  });

  return { message: 'Knowledge article archived successfully' };
};

const submitFeedback = async (id, { helpful }) => {
  const article = await KnowledgeArticle.findById(id);
  if (!article) {
    throw ApiError.notFound('Knowledge article not found');
  }

  if (helpful === true || helpful === 'true') {
    article.helpfulCount = (article.helpfulCount || 0) + 1;
  } else {
    article.notHelpfulCount = (article.notHelpfulCount || 0) + 1;
  }

  await article.save();

  return {
    helpfulCount: article.helpfulCount,
    notHelpfulCount: article.notHelpfulCount,
  };
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  submitFeedback,
};
