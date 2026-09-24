const mongoose = require('mongoose');
const { Schema } = mongoose;

const knowledgeArticleSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative'],
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
      min: [0, 'Not helpful count cannot be negative'],
    },
    embedding: {
      type: [Number],
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeArticleSchema.index({ tags: 1 });
knowledgeArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
