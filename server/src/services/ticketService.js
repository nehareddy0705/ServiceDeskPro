const { Ticket, Category, Department, Asset, SLAPolicy, TicketComment, WorkLog, User } = require('../models');
const ApiError = require('../utils/apiError');
const logAudit = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationService');
const { calculateSLADeadline } = require('./slaService');
const { validateStatusTransition } = require('../validators/ticketValidator');
const {
  ROLES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  AUDIT_ENTITY_TYPES,
  NOTIFICATION_TYPES,
} = require('../constants');

const generateTicketNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  let ticketNumber = `TCK-${datePrefix}-${randomSuffix}`;

  let exists = await Ticket.findOne({ ticketNumber });
  while (exists) {
    const nextRandom = Math.floor(1000 + Math.random() * 9000);
    ticketNumber = `TCK-${datePrefix}-${nextRandom}`;
    exists = await Ticket.findOne({ ticketNumber });
  }

  return ticketNumber;
};

const createTicket = async (data, requesterUser, req = null) => {
  const { title, description, category, priority, asset } = data;

  // Determine Department
  let departmentId = data.department;
  if (!departmentId) {
    if (requesterUser.department) {
      departmentId = requesterUser.department._id || requesterUser.department;
    } else {
      const defaultDept = await Department.findOne({ isActive: true });
      if (defaultDept) {
        departmentId = defaultDept._id;
      } else {
        throw ApiError.badRequest('Department could not be determined. Please specify a department.');
      }
    }
  }

  // Validate Asset if provided
  let assetId = null;
  if (asset) {
    const assetDoc = await Asset.findById(asset);
    if (!assetDoc) {
      throw ApiError.badRequest('Specified asset not found');
    }
    if (requesterUser.role === ROLES.EMPLOYEE) {
      const isAssignedToUser = assetDoc.assignedTo && assetDoc.assignedTo.toString() === requesterUser._id.toString();
      const isDepartmentAsset = assetDoc.department && departmentId && assetDoc.department.toString() === departmentId.toString();
      if (!isAssignedToUser && !isDepartmentAsset) {
        throw ApiError.forbidden('You do not have permission to attach this asset');
      }
    }
    assetId = assetDoc._id;
  }

  // Determine Category and Priority
  let categoryId = null;
  let determinedPriority = priority || null;

  if (category) {
    const categoryDoc = await Category.findById(category);
    if (categoryDoc) {
      categoryId = categoryDoc._id;
      if (!determinedPriority) {
        determinedPriority = categoryDoc.defaultPriority || TICKET_PRIORITIES.MEDIUM;
      }
    }
  }

  if (!determinedPriority) {
    determinedPriority = TICKET_PRIORITIES.MEDIUM;
  }

  // Generate unique Ticket Number
  const ticketNumber = await generateTicketNumber();

  // Find matching active SLA Policy
  const slaPolicy = await SLAPolicy.findOne({ priority: determinedPriority, isActive: true });
  const { responseDueAt, resolutionDueAt } = calculateSLADeadline({ createdAt: new Date() }, slaPolicy);

  // AI Classification stub (safe, does not throw if AI is absent)
  const aiClassification = {
    predictedCategory: categoryId,
    predictedPriority: determinedPriority,
    probableIssue: title.slice(0, 100),
    confidence: 0.85,
    suggestedArticles: [],
    analyzedAt: new Date(),
  };

  const newTicket = await Ticket.create({
    ticketNumber,
    title: title.trim(),
    description: description.trim(),
    requester: requesterUser._id,
    department: departmentId,
    category: categoryId,
    priority: determinedPriority,
    status: TICKET_STATUSES.OPEN,
    asset: assetId,
    sla: {
      policy: slaPolicy ? slaPolicy._id : null,
      responseDueAt,
      resolutionDueAt,
      responseBreached: false,
      resolutionBreached: false,
      escalated: false,
      escalationLevel: 0,
    },
    aiClassification,
  });

  // Create Audit Log
  await logAudit({
    user: requesterUser._id,
    action: 'CREATE_TICKET',
    entityType: AUDIT_ENTITY_TYPES.TICKET,
    entityId: newTicket._id,
    newValue: newTicket,
    req,
  });

  // Create Notification for requester
  await createNotification({
    recipient: requesterUser._id,
    type: NOTIFICATION_TYPES.TICKET_CREATED,
    title: `Ticket Created: ${ticketNumber}`,
    message: `Your ticket "${title}" has been registered successfully.`,
    ticket: newTicket._id,
    asset: assetId,
  });

  return await Ticket.findById(newTicket._id)
    .populate('requester', 'name email employeeId role')
    .populate('department', 'name code')
    .populate('category', 'name defaultPriority')
    .populate('asset', 'assetTag name type status')
    .populate('sla.policy', 'name priority responseTimeMinutes resolutionTimeMinutes');
};

const getTickets = async (query, user) => {
  const filter = {};

  // Role-based scoping
  if (user.role === ROLES.EMPLOYEE) {
    filter.requester = user._id;
  } else if (user.role === ROLES.TECHNICIAN) {
    if (query.scope === 'assigned') {
      filter.assignedTo = user._id;
    } else if (query.scope === 'unassigned') {
      filter.assignedTo = null;
      if (user.department) {
        filter.department = user.department._id || user.department;
      }
    } else if (!query.assignedTo && !query.requester) {
      // Show assigned to technician or open in department
      const userDeptId = user.department ? (user.department._id || user.department) : null;
      if (userDeptId) {
        filter.$or = [
          { assignedTo: user._id },
          { assignedTo: null, department: userDeptId },
        ];
      } else {
        filter.assignedTo = user._id;
      }
    }
  } else if (user.role === ROLES.IT_MANAGER) {
    if (query.department) {
      filter.department = query.department;
    } else if (user.department) {
      filter.department = user.department._id || user.department;
    }
  }

  // Explicit filters
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;
  if (query.department && user.role === ROLES.SYSTEM_ADMIN) filter.department = query.department;
  if (query.assignedTo && user.role !== ROLES.EMPLOYEE) filter.assignedTo = query.assignedTo;
  if (query.requester && user.role !== ROLES.EMPLOYEE) filter.requester = query.requester;
  if (query.slaBreached === 'true') {
    filter.$or = [
      { 'sla.responseBreached': true },
      { 'sla.resolutionBreached': true },
    ];
  }

  // Date filtering
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  // Text search
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { ticketNumber: searchRegex },
      { title: searchRegex },
      { description: searchRegex },
    ];
  }

  const pageNumber = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (pageNumber - 1) * limitNumber;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('requester', 'name email employeeId')
      .populate('assignedTo', 'name email employeeId')
      .populate('department', 'name code')
      .populate('category', 'name defaultPriority')
      .populate('asset', 'assetTag name type')
      .populate('sla.policy', 'name priority')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    Ticket.countDocuments(filter),
  ]);

  return {
    tickets,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      pages: Math.ceil(total / limitNumber),
    },
  };
};

const getTicketById = async (id, user) => {
  const ticket = await Ticket.findById(id)
    .populate('requester', 'name email employeeId phone role')
    .populate('assignedTo', 'name email employeeId phone role')
    .populate('department', 'name code')
    .populate('category', 'name defaultPriority')
    .populate('asset', 'assetTag name type status serialNumber brand model')
    .populate('sla.policy', 'name priority responseTimeMinutes resolutionTimeMinutes businessHoursOnly')
    .populate('aiClassification.predictedCategory', 'name')
    .populate('aiClassification.suggestedArticles', 'title category status');

  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  // Role scoping checks
  if (user.role === ROLES.EMPLOYEE) {
    if (ticket.requester._id.toString() !== user._id.toString()) {
      throw ApiError.forbidden('Access denied: You can only view your own tickets');
    }
  }

  // Fetch comments (hide internal comments from employee)
  const commentFilter = { ticket: id };
  if (user.role === ROLES.EMPLOYEE) {
    commentFilter.isInternal = false;
  }

  const comments = await TicketComment.find(commentFilter)
    .populate('user', 'name email role')
    .sort({ createdAt: 1 });

  // Fetch worklogs (employees cannot view technician worklogs)
  let workLogs = [];
  if (user.role !== ROLES.EMPLOYEE) {
    workLogs = await WorkLog.find({ ticket: id })
      .populate('technician', 'name email employeeId')
      .sort({ createdAt: -1 });
  }

  const ticketObj = ticket.toObject();
  ticketObj.comments = comments;
  ticketObj.workLogs = workLogs;

  return ticketObj;
};

const updateTicket = async (id, data, user, req = null) => {
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  // Check access permissions
  if (user.role === ROLES.EMPLOYEE) {
    if (ticket.requester.toString() !== user._id.toString()) {
      throw ApiError.forbidden('You can only update your own tickets');
    }
    // Employee can only reopen or close a resolved ticket, or cancel/edit description while open
    if (data.status) {
      if (![TICKET_STATUSES.CLOSED, TICKET_STATUSES.REOPENED].includes(data.status)) {
        throw ApiError.forbidden('Employees can only close or reopen resolved tickets');
      }
    }
  }

  const oldValue = ticket.toObject();

  // Status transitions
  if (data.status && data.status !== ticket.status) {
    validateStatusTransition(ticket.status, data.status, data.resolution);

    const prevStatus = ticket.status;
    ticket.status = data.status;

    if (data.status === TICKET_STATUSES.RESOLVED) {
      ticket.resolution = data.resolution ? data.resolution.trim() : ticket.resolution;
      ticket.resolvedBy = user._id;
      ticket.resolvedAt = new Date();
      if (ticket.sla && !ticket.sla.resolvedAt) {
        ticket.sla.resolvedAt = new Date();
        if (ticket.sla.resolutionDueAt && ticket.sla.resolvedAt > ticket.sla.resolutionDueAt) {
          ticket.sla.resolutionBreached = true;
        }
      }
      await createNotification({
        recipient: ticket.requester,
        type: NOTIFICATION_TYPES.TICKET_RESOLVED,
        title: `Ticket Resolved: ${ticket.ticketNumber}`,
        message: `Your ticket has been marked as resolved: "${ticket.title}". Please review and confirm closure.`,
        ticket: ticket._id,
      });
    }

    if (data.status === TICKET_STATUSES.CLOSED) {
      ticket.closedAt = new Date();
    }

    if (data.status === TICKET_STATUSES.REOPENED) {
      ticket.reopenedAt = new Date();
      await createNotification({
        recipient: ticket.assignedTo || ticket.requester,
        type: NOTIFICATION_TYPES.TICKET_REOPENED,
        title: `Ticket Reopened: ${ticket.ticketNumber}`,
        message: `Ticket "${ticket.title}" has been reopened.`,
        ticket: ticket._id,
      });
    }

    if (data.status === TICKET_STATUSES.IN_PROGRESS && !ticket.sla?.responseAt) {
      ticket.sla.responseAt = new Date();
      if (ticket.sla.responseDueAt && ticket.sla.responseAt > ticket.sla.responseDueAt) {
        ticket.sla.responseBreached = true;
      }
    }
  }

  // Technician assignment
  if (data.assignedTo !== undefined && user.role !== ROLES.EMPLOYEE) {
    if (data.assignedTo) {
      const technician = await User.findById(data.assignedTo);
      if (!technician) {
        throw ApiError.badRequest('Specified technician does not exist');
      }
      ticket.assignedTo = technician._id;
      ticket.assignedAt = new Date();

      if (ticket.status === TICKET_STATUSES.OPEN) {
        ticket.status = TICKET_STATUSES.ASSIGNED;
      }

      await createNotification({
        recipient: technician._id,
        type: NOTIFICATION_TYPES.TICKET_ASSIGNED,
        title: `Assigned to Ticket: ${ticket.ticketNumber}`,
        message: `You have been assigned ticket "${ticket.title}" (${ticket.priority} priority).`,
        ticket: ticket._id,
      });
    } else {
      ticket.assignedTo = null;
      ticket.assignedAt = null;
      if (ticket.status === TICKET_STATUSES.ASSIGNED) {
        ticket.status = TICKET_STATUSES.OPEN;
      }
    }
  }

  // Basic field updates
  if (data.title && user.role !== ROLES.EMPLOYEE) ticket.title = data.title.trim();
  if (data.description && (user.role !== ROLES.EMPLOYEE || ticket.status === TICKET_STATUSES.OPEN)) {
    ticket.description = data.description.trim();
  }
  if (data.category && user.role !== ROLES.EMPLOYEE) ticket.category = data.category;
  if (data.department && user.role === ROLES.SYSTEM_ADMIN) ticket.department = data.department;
  if (data.priority && user.role !== ROLES.EMPLOYEE) {
    ticket.priority = data.priority;
    // Re-evaluate SLA if priority changes
    const newPolicy = await SLAPolicy.findOne({ priority: data.priority, isActive: true });
    if (newPolicy) {
      ticket.sla.policy = newPolicy._id;
      const deadlines = calculateSLADeadline(ticket, newPolicy);
      ticket.sla.responseDueAt = deadlines.responseDueAt;
      ticket.sla.resolutionDueAt = deadlines.resolutionDueAt;
    }
  }

  await ticket.save();

  const updatedTicket = await Ticket.findById(id)
    .populate('requester', 'name email employeeId')
    .populate('assignedTo', 'name email employeeId')
    .populate('department', 'name code')
    .populate('category', 'name defaultPriority')
    .populate('asset', 'assetTag name type status')
    .populate('sla.policy', 'name priority');

  await logAudit({
    user: user._id,
    action: 'UPDATE_TICKET',
    entityType: AUDIT_ENTITY_TYPES.TICKET,
    entityId: id,
    oldValue,
    newValue: updatedTicket,
    req,
  });

  return updatedTicket;
};

const analyzeTicketWithAI = async (id) => {
  const ticket = await Ticket.findById(id).populate('category');
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  const text = `${ticket.title} ${ticket.description}`.toLowerCase();

  // Smart category match
  const categories = await Category.find();
  let matchedCategory = ticket.category?._id || null;
  let categoryName = ticket.category?.name || 'General Support';

  for (const cat of categories) {
    const cName = cat.name.toLowerCase();
    if (
      (cName.includes('network') && (text.includes('vpn') || text.includes('wifi') || text.includes('ip') || text.includes('internet') || text.includes('dns') || text.includes('router'))) ||
      (cName.includes('hardware') && (text.includes('laptop') || text.includes('overheating') || text.includes('monitor') || text.includes('printer') || text.includes('mouse') || text.includes('fan'))) ||
      (cName.includes('security') && (text.includes('password') || text.includes('login') || text.includes('mfa') || text.includes('auth') || text.includes('access') || text.includes('locked'))) ||
      (cName.includes('email') && (text.includes('email') || text.includes('outlook') || text.includes('sync') || text.includes('mailbox') || text.includes('inbox'))) ||
      (cName.includes('software') && (text.includes('software') || text.includes('install') || text.includes('license') || text.includes('app') || text.includes('docker')))
    ) {
      matchedCategory = cat._id;
      categoryName = cat.name;
      break;
    }
  }

  let predictedPriority = TICKET_PRIORITIES.MEDIUM;
  if (text.includes('urgent') || text.includes('critical') || text.includes('outage') || text.includes('down') || text.includes('timeout') || text.includes('production')) {
    predictedPriority = TICKET_PRIORITIES.CRITICAL;
  } else if (text.includes('high') || text.includes('vpn') || text.includes('broken') || text.includes('blocked') || text.includes('fails')) {
    predictedPriority = TICKET_PRIORITIES.HIGH;
  } else if (text.includes('request') || text.includes('question') || text.includes('info') || text.includes('setup')) {
    predictedPriority = TICKET_PRIORITIES.LOW;
  }

  let probableIssue = 'Configuration or connectivity anomaly';
  let suggestedSteps = [
    'Verify physical connection and device power state',
    'Review system error event logs for failure codes',
    'Perform standard diagnostics and software reset',
    'Escalate to Tier 2 specialist if issue persists'
  ];

  if (text.includes('vpn')) {
    probableIssue = 'DNS routing and tunnel configuration problem';
    suggestedSteps = [
      'Verify base network connectivity',
      'Check DNS configuration and split tunnel route',
      'Flush DNS cache via client terminal',
      'Restart network adapter and re-authenticate VPN'
    ];
  } else if (text.includes('laptop') || text.includes('overheat') || text.includes('fan')) {
    probableIssue = 'Thermal throttling or rogue background process';
    suggestedSteps = [
      'Inspect system resource monitor for excessive CPU utilization',
      'Ensure cooling vents are unobstructed and fan is spinning',
      'Update BIOS firmware and manufacturer thermal drivers',
      'Run onboard hardware diagnostics'
    ];
  } else if (text.includes('printer')) {
    probableIssue = 'Print spooler stall or network IP collision';
    suggestedSteps = [
      'Verify printer IP address responds to ping',
      'Restart the local Print Spooler service',
      'Clear corrupted print queue jobs in Windows spool folder',
      'Reinstall certified PCL6 printer driver'
    ];
  } else if (text.includes('password') || text.includes('lock')) {
    probableIssue = 'Directory account lockout due to cached credentials';
    suggestedSteps = [
      'Check Active Directory lockout status and reset bad password counter',
      'Clear outdated saved credentials in Credential Manager',
      'Initiate self-service password reset with MFA',
      'Verify user account status and login permissions'
    ];
  } else if (text.includes('email') || text.includes('outlook')) {
    probableIssue = 'Corrupted offline cache or expired authentication token';
    suggestedSteps = [
      'Launch Outlook in safe mode to bypass conflicting add-ins',
      'Verify account credentials in Microsoft 365 portal',
      'Re-authenticate user Modern Auth session',
      'Rebuild local offline data cache file (.ost)'
    ];
  }

  const { KnowledgeArticle } = require('../models');
  const articles = await KnowledgeArticle.find({
    status: 'published',
    $or: [
      { title: new RegExp(categoryName.split(' ')[0], 'i') },
      { tags: { $in: [categoryName.toLowerCase(), 'vpn', 'hardware', 'network'] } }
    ]
  }).limit(2);

  ticket.aiClassification = {
    predictedCategory: matchedCategory,
    predictedPriority,
    probableIssue,
    confidence: 0.87,
    suggestedArticles: articles.map(a => a._id),
    suggestedTroubleshooting: suggestedSteps,
    analyzedAt: new Date(),
  };

  await ticket.save();

  return await Ticket.findById(id)
    .populate('requester', 'name email employeeId phone role')
    .populate('assignedTo', 'name email employeeId phone role')
    .populate('department', 'name code')
    .populate('category', 'name defaultPriority')
    .populate('asset', 'assetTag name type status serialNumber brand model')
    .populate('sla.policy', 'name priority responseTimeMinutes resolutionTimeMinutes')
    .populate('aiClassification.predictedCategory', 'name')
    .populate('aiClassification.suggestedArticles', 'title category status');
};

const getRecommendedTechnicians = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId).populate('department');
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const technicians = await User.find({ role: ROLES.TECHNICIAN, isActive: true })
    .populate('department', 'name code');

  const recommendations = await Promise.all(
    technicians.map(async (tech) => {
      const activeTickets = await Ticket.countDocuments({
        assignedTo: tech._id,
        status: { $in: [TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.IN_PROGRESS, TICKET_STATUSES.PENDING] }
      });

      const isSameDept = tech.department?._id?.toString() === ticket.department?._id?.toString();
      const capacity = 8;
      const isAvailable = activeTickets < 6;

      const reasons = [];
      if (isSameDept || tech.department?.name?.toLowerCase().includes('it')) {
        reasons.push('Relevant support area');
      }
      if (isAvailable) {
        reasons.push('Currently available');
      } else {
        reasons.push('High workload queue');
      }
      if (activeTickets <= 4) {
        reasons.push(`Lower active workload (${activeTickets} tickets)`);
      } else {
        reasons.push(`Active tickets: ${activeTickets}`);
      }

      const score = (10 - activeTickets) + (isSameDept ? 5 : 0) + (isAvailable ? 3 : 0);

      return {
        technician: {
          _id: tech._id,
          name: tech.name,
          email: tech.email,
          employeeId: tech.employeeId,
          department: tech.department?.name || 'IT Support',
        },
        activeTickets,
        capacity,
        status: activeTickets >= 7 ? 'Busy' : activeTickets >= 4 ? 'Moderate' : 'Available',
        reasons,
        score,
      };
    })
  );

  recommendations.sort((a, b) => b.score - a.score);
  return recommendations;
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  analyzeTicketWithAI,
  getRecommendedTechnicians,
};
