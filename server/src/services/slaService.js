const { SLAPolicy } = require('../models');
const ApiError = require('../utils/apiError');
const logAudit = require('../utils/auditLogger');
const { AUDIT_ENTITY_TYPES, TICKET_PRIORITIES } = require('../constants');

/**
 * Adds business minutes respecting Monday-Friday 09:00 - 17:00
 */
const addBusinessMinutes = (startDate, minutesNeeded) => {
  let current = new Date(startDate);

  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

  const moveToNextBusinessHour = (d) => {
    while (true) {
      if (isWeekend(d)) {
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        continue;
      }
      const hour = d.getHours();
      if (hour < 9) {
        d.setHours(9, 0, 0, 0);
        break;
      }
      if (hour >= 17) {
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        continue;
      }
      break;
    }
  };

  moveToNextBusinessHour(current);

  let remaining = minutesNeeded;
  while (remaining > 0) {
    const endOfDay = new Date(current);
    endOfDay.setHours(17, 0, 0, 0);

    const availableMinutesToday = Math.floor((endOfDay - current) / 60000);

    if (remaining <= availableMinutesToday) {
      current = new Date(current.getTime() + remaining * 60000);
      remaining = 0;
    } else {
      remaining -= availableMinutesToday;
      current.setDate(current.getDate() + 1);
      current.setHours(9, 0, 0, 0);
      moveToNextBusinessHour(current);
    }
  }

  return current;
};

/**
 * Calculates response and resolution deadlines for a ticket given an SLA policy
 */
const calculateSLADeadline = (ticket, slaPolicy) => {
  if (!slaPolicy) {
    return {
      responseDueAt: null,
      resolutionDueAt: null,
    };
  }

  const baseTime = ticket.createdAt ? new Date(ticket.createdAt) : new Date();
  const responseMinutes = slaPolicy.responseTimeMinutes || 60;
  const resolutionMinutes = slaPolicy.resolutionTimeMinutes || 240;

  if (slaPolicy.businessHoursOnly) {
    const responseDueAt = addBusinessMinutes(baseTime, responseMinutes);
    const resolutionDueAt = addBusinessMinutes(baseTime, resolutionMinutes);
    return { responseDueAt, resolutionDueAt };
  } else {
    const responseDueAt = new Date(baseTime.getTime() + responseMinutes * 60 * 1000);
    const resolutionDueAt = new Date(baseTime.getTime() + resolutionMinutes * 60 * 1000);
    return { responseDueAt, resolutionDueAt };
  }
};

const getSLAPolicies = async ({ isActive } = {}) => {
  const query = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  }

  const policies = await SLAPolicy.find(query).sort({ priority: 1, responseTimeMinutes: 1 });
  return policies;
};

const getSLAPolicyById = async (id) => {
  const policy = await SLAPolicy.findById(id);
  if (!policy) {
    throw ApiError.notFound('SLA Policy not found');
  }
  return policy;
};

const getSLAPolicyByPriority = async (priority) => {
  return await SLAPolicy.findOne({ priority, isActive: true });
};

const createSLAPolicy = async (data, performedBy, req = null) => {
  const {
    name,
    description,
    priority,
    responseTimeMinutes,
    resolutionTimeMinutes,
    businessHoursOnly,
    escalationRules,
  } = data;

  if (!name || !name.trim()) {
    throw ApiError.badRequest('SLA Policy name is required');
  }

  if (!priority || !Object.values(TICKET_PRIORITIES).includes(priority)) {
    throw ApiError.badRequest(
      `Priority is required. Allowed values: ${Object.values(TICKET_PRIORITIES).join(', ')}`
    );
  }

  if (!responseTimeMinutes || responseTimeMinutes < 1) {
    throw ApiError.badRequest('responseTimeMinutes must be at least 1 minute');
  }

  if (!resolutionTimeMinutes || resolutionTimeMinutes < 1) {
    throw ApiError.badRequest('resolutionTimeMinutes must be at least 1 minute');
  }

  const newPolicy = await SLAPolicy.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    priority,
    responseTimeMinutes: Number(responseTimeMinutes),
    resolutionTimeMinutes: Number(resolutionTimeMinutes),
    businessHoursOnly: businessHoursOnly !== undefined ? businessHoursOnly : true,
    escalationRules: Array.isArray(escalationRules) ? escalationRules : [],
    isActive: true,
  });

  await logAudit({
    user: performedBy._id,
    action: 'CREATE_SLA_POLICY',
    entityType: AUDIT_ENTITY_TYPES.SLA_POLICY,
    entityId: newPolicy._id,
    newValue: newPolicy,
    req,
  });

  return newPolicy;
};

const updateSLAPolicy = async (id, data, performedBy, req = null) => {
  const policy = await SLAPolicy.findById(id);
  if (!policy) {
    throw ApiError.notFound('SLA Policy not found');
  }

  const oldValue = policy.toObject();

  if (data.name) policy.name = data.name.trim();
  if (data.description !== undefined) policy.description = data.description ? data.description.trim() : '';
  if (data.priority) {
    if (!Object.values(TICKET_PRIORITIES).includes(data.priority)) {
      throw ApiError.badRequest(`Invalid priority. Allowed values: ${Object.values(TICKET_PRIORITIES).join(', ')}`);
    }
    policy.priority = data.priority;
  }
  if (data.responseTimeMinutes !== undefined) {
    if (data.responseTimeMinutes < 1) throw ApiError.badRequest('responseTimeMinutes must be at least 1');
    policy.responseTimeMinutes = Number(data.responseTimeMinutes);
  }
  if (data.resolutionTimeMinutes !== undefined) {
    if (data.resolutionTimeMinutes < 1) throw ApiError.badRequest('resolutionTimeMinutes must be at least 1');
    policy.resolutionTimeMinutes = Number(data.resolutionTimeMinutes);
  }
  if (data.businessHoursOnly !== undefined) policy.businessHoursOnly = data.businessHoursOnly;
  if (data.escalationRules !== undefined) policy.escalationRules = data.escalationRules;
  if (data.isActive !== undefined) policy.isActive = data.isActive;

  await policy.save();

  await logAudit({
    user: performedBy._id,
    action: 'UPDATE_SLA_POLICY',
    entityType: AUDIT_ENTITY_TYPES.SLA_POLICY,
    entityId: id,
    oldValue,
    newValue: policy,
    req,
  });

  return policy;
};

const deleteSLAPolicy = async (id, performedBy, req = null) => {
  const policy = await SLAPolicy.findById(id);
  if (!policy) {
    throw ApiError.notFound('SLA Policy not found');
  }

  const oldValue = policy.toObject();
  policy.isActive = false;
  await policy.save();

  await logAudit({
    user: performedBy._id,
    action: 'DEACTIVATE_SLA_POLICY',
    entityType: AUDIT_ENTITY_TYPES.SLA_POLICY,
    entityId: id,
    oldValue,
    newValue: { isActive: false },
    req,
  });

  return { message: 'SLA Policy deactivated successfully' };
};

module.exports = {
  calculateSLADeadline,
  getSLAPolicies,
  getSLAPolicyById,
  getSLAPolicyByPriority,
  createSLAPolicy,
  updateSLAPolicy,
  deleteSLAPolicy,
};
