const { Ticket, Asset, User, KnowledgeArticle, Department, SLAPolicy } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { ROLES, TICKET_STATUSES, TICKET_PRIORITIES } = require('../constants');

const getDashboardStats = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (role === ROLES.EMPLOYEE) {
    const [openCount, resolvedCount, totalCount, myAssetsCount, recentTickets] = await Promise.all([
      Ticket.countDocuments({
        requester: userId,
        status: { $in: [TICKET_STATUSES.OPEN, TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.IN_PROGRESS, TICKET_STATUSES.PENDING] },
      }),
      Ticket.countDocuments({
        requester: userId,
        status: { $in: [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED] },
      }),
      Ticket.countDocuments({ requester: userId }),
      Asset.countDocuments({ assignedTo: userId }),
      Ticket.find({ requester: userId })
        .populate('category', 'name')
        .populate('assignedTo', 'name email')
        .sort({ updatedAt: -1 })
        .limit(6),
    ]);

    return successResponse(res, 200, 'Employee dashboard stats retrieved', {
      metrics: {
        openTickets: openCount,
        resolvedTickets: resolvedCount,
        totalTickets: totalCount,
        assignedAssets: myAssetsCount,
      },
      recentTickets,
    });
  }

  if (role === ROLES.TECHNICIAN) {
    const [activeTickets, slaAtRisk, criticalCount, resolvedToday, recentAssigned, totalAssigned, breachedAssigned, activePoliciesCount] = await Promise.all([
      Ticket.countDocuments({
        assignedTo: userId,
        status: { $in: [TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.IN_PROGRESS, TICKET_STATUSES.PENDING] },
      }),
      Ticket.countDocuments({
        assignedTo: userId,
        status: { $in: [TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.IN_PROGRESS] },
        'sla.resolutionDueAt': { $lte: new Date(Date.now() + 4 * 60 * 60 * 1000) },
        'sla.resolutionBreached': false,
      }),
      Ticket.countDocuments({
        assignedTo: userId,
        priority: TICKET_PRIORITIES.CRITICAL,
        status: { $nin: [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED] },
      }),
      Ticket.countDocuments({
        assignedTo: userId,
        status: TICKET_STATUSES.RESOLVED,
        resolvedAt: { $gte: today },
      }),
      Ticket.find({ assignedTo: userId })
        .populate('requester', 'name email')
        .populate('category', 'name')
        .sort({ updatedAt: -1 })
        .limit(6),
      Ticket.countDocuments({ assignedTo: userId }),
      Ticket.countDocuments({
        assignedTo: userId,
        $or: [{ 'sla.responseBreached': true }, { 'sla.resolutionBreached': true }],
      }),
      SLAPolicy.countDocuments({ isActive: true }),
    ]);

    const breachedRate = totalAssigned > 0 ? Math.round((breachedAssigned / totalAssigned) * 100) : 0;
    const atRiskRate = totalAssigned > 0 ? Math.round((slaAtRisk / totalAssigned) * 100) : 0;
    const withinSlaRate = totalAssigned > 0 ? Math.max(0, 100 - breachedRate - atRiskRate) : 0;

    return successResponse(res, 200, 'Technician dashboard stats retrieved', {
      metrics: {
        activeTickets,
        slaAtRisk,
        criticalCount,
        resolvedToday,
      },
      slaOverview: {
        withinSLA: withinSlaRate,
        atRisk: atRiskRate,
        breached: breachedRate,
        activePoliciesCount,
      },
      recentTickets: recentAssigned,
    });
  }

  if (role === ROLES.IT_MANAGER || role === ROLES.SYSTEM_ADMIN) {
    const now = new Date();
    const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000);

    const [
      openTickets,
      slaAtRisk,
      criticalTickets,
      resolvedToday,
      totalTickets,
      breachedCount,
      technicians,
      recentTickets,
      ticketsByPriority,
      ticketsByStatus,
      activePoliciesCount,
    ] = await Promise.all([
      Ticket.countDocuments({
        status: { $in: [TICKET_STATUSES.OPEN, TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.IN_PROGRESS, TICKET_STATUSES.PENDING] },
      }),
      Ticket.countDocuments({
        status: { $in: [TICKET_STATUSES.OPEN, TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.IN_PROGRESS] },
        'sla.resolutionDueAt': { $lte: fourHoursFromNow, $gte: now },
        'sla.resolutionBreached': false,
      }),
      Ticket.countDocuments({
        priority: TICKET_PRIORITIES.CRITICAL,
        status: { $nin: [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED] },
      }),
      Ticket.countDocuments({
        status: TICKET_STATUSES.RESOLVED,
        resolvedAt: { $gte: today },
      }),
      Ticket.countDocuments(),
      Ticket.countDocuments({
        $or: [{ 'sla.responseBreached': true }, { 'sla.resolutionBreached': true }],
      }),
      User.find({ role: ROLES.TECHNICIAN, isActive: true }).select('name email employeeId'),
      Ticket.find()
        .populate('requester', 'name email')
        .populate('assignedTo', 'name email')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(6),
      Ticket.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      SLAPolicy.countDocuments({ isActive: true }),
    ]);

    // Calculate technician workloads
    const technicianWorkload = await Promise.all(
      technicians.map(async (tech) => {
        const activeCount = await Ticket.countDocuments({
          assignedTo: tech._id,
          status: { $in: [TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.IN_PROGRESS, TICKET_STATUSES.PENDING] },
        });
        const criticalCount = await Ticket.countDocuments({
          assignedTo: tech._id,
          priority: TICKET_PRIORITIES.CRITICAL,
          status: { $nin: [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED] },
        });
        const capacity = 8;
        const status = activeCount >= 7 ? 'Busy' : activeCount >= 4 ? 'Moderate' : 'Available';

        return {
          id: tech._id,
          name: tech.name,
          email: tech.email,
          activeTickets: activeCount,
          criticalTickets: criticalCount,
          capacity,
          status,
        };
      })
    );

    const breachedRate = totalTickets > 0 ? Math.round((breachedCount / totalTickets) * 100) : 0;
    const atRiskRate = totalTickets > 0 ? Math.round((slaAtRisk / totalTickets) * 100) : 0;
    const withinSlaRate = totalTickets > 0 ? Math.max(0, 100 - breachedRate - atRiskRate) : 0;

    // Compute real 7-day daily ticket volume from MongoDB
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyVolume = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(sevenDaysAgo);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [createdCount, resolvedCount] = await Promise.all([
        Ticket.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),
        Ticket.countDocuments({
          status: { $in: [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED] },
          resolvedAt: { $gte: dayStart, $lt: dayEnd },
        }),
      ]);

      weeklyVolume.push({
        day: dayNames[dayStart.getDay()],
        date: dayStart.toISOString().slice(0, 10),
        created: createdCount,
        resolved: resolvedCount,
      });
    }

    return successResponse(res, 200, 'Manager dashboard stats retrieved', {
      metrics: {
        openTickets,
        slaAtRisk,
        criticalTickets,
        resolvedToday,
      },
      slaOverview: {
        withinSLA: withinSlaRate,
        atRisk: atRiskRate,
        breached: breachedRate,
        activePoliciesCount,
      },
      technicianWorkload,
      recentTickets,
      weeklyVolume,
      ticketsByPriority: ticketsByPriority.map((item) => ({ priority: item._id, count: item.count })),
      ticketsByStatus: ticketsByStatus.map((item) => ({ status: item._id, count: item.count })),
    });
  }

  if (role === ROLES.ASSET_MANAGER) {
    const [totalAssets, assignedAssets, availableAssets, underRepairAssets, assetsByType, recentAssets] =
      await Promise.all([
        Asset.countDocuments(),
        Asset.countDocuments({ status: 'assigned' }),
        Asset.countDocuments({ status: 'available' }),
        Asset.countDocuments({ status: 'under_repair' }),
        Asset.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
        Asset.find()
          .populate('assignedTo', 'name email')
          .populate('department', 'name')
          .sort({ updatedAt: -1 })
          .limit(6),
      ]);

    return successResponse(res, 200, 'Asset manager dashboard stats retrieved', {
      metrics: {
        totalAssets,
        assignedAssets,
        availableAssets,
        underRepairAssets,
      },
      assetsByType: assetsByType.map((item) => ({ type: item._id, count: item.count })),
      recentAssets,
    });
  }

  return successResponse(res, 200, 'Dashboard stats retrieved', { metrics: {} });
});

module.exports = {
  getDashboardStats,
};
