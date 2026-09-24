const knowledgeService = require('../services/knowledgeService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getArticles = asyncHandler(async (req, res) => {
  const result = await knowledgeService.getArticles(req.query, req.user);
  return successResponse(res, 200, 'Articles retrieved successfully', result.articles, result.pagination);
});

const getArticleById = asyncHandler(async (req, res) => {
  const article = await knowledgeService.getArticleById(req.params.id, req.user);
  return successResponse(res, 200, 'Article retrieved successfully', { article });
});

const createArticle = asyncHandler(async (req, res) => {
  const article = await knowledgeService.createArticle(req.body, req.user, req);
  return successResponse(res, 201, 'Article created successfully', { article });
});

const updateArticle = asyncHandler(async (req, res) => {
  const article = await knowledgeService.updateArticle(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'Article updated successfully', { article });
});

const deleteArticle = asyncHandler(async (req, res) => {
  const result = await knowledgeService.deleteArticle(req.params.id, req.user, req);
  return successResponse(res, 200, result.message);
});

const submitFeedback = asyncHandler(async (req, res) => {
  const feedback = await knowledgeService.submitFeedback(req.params.id, req.body);
  return successResponse(res, 200, 'Feedback recorded successfully', { feedback });
});

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  submitFeedback,
};
