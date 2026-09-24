const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const departmentRoutes = require('./departmentRoutes');
const categoryRoutes = require('./categoryRoutes');
const slaRoutes = require('./slaRoutes');
const ticketRoutes = require('./ticketRoutes');
const assetRoutes = require('./assetRoutes');
const vendorRoutes = require('./vendorRoutes');
const knowledgeRoutes = require('./knowledgeRoutes');
const notificationRoutes = require('./notificationRoutes');
const auditLogRoutes = require('./auditLogRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/sla', slaRoutes);
router.use('/tickets', ticketRoutes);
router.use('/assets', assetRoutes);
router.use('/vendors', vendorRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
