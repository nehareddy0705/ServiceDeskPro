const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  IT_MANAGER: 'it_manager',
  TECHNICIAN: 'technician',
  EMPLOYEE: 'employee',
  ASSET_MANAGER: 'asset_manager',
};

const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const TICKET_STATUSES = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
};

const ASSET_TYPES = {
  LAPTOP: 'laptop',
  DESKTOP: 'desktop',
  MONITOR: 'monitor',
  PRINTER: 'printer',
  SERVER: 'server',
  ROUTER: 'router',
  MOBILE: 'mobile',
  SOFTWARE: 'software',
  OTHER: 'other',
};

const ASSET_STATUSES = {
  AVAILABLE: 'available',
  ASSIGNED: 'assigned',
  UNDER_REPAIR: 'under_repair',
  LOST: 'lost',
  RETIRED: 'retired',
  DISPOSED: 'disposed',
};

const ASSET_ACTIONS = {
  PROCURED: 'procured',
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  REPAIR_STARTED: 'repair_started',
  REPAIR_COMPLETED: 'repair_completed',
  REPLACED: 'replaced',
  LOST: 'lost',
  RETIRED: 'retired',
  DISPOSED: 'disposed',
  TRANSFERRED: 'transferred',
};

const WORK_TYPES = {
  DIAGNOSIS: 'diagnosis',
  TROUBLESHOOTING: 'troubleshooting',
  REPAIR: 'repair',
  INSTALLATION: 'installation',
  COMMUNICATION: 'communication',
  OTHER: 'other',
};

const NOTIFICATION_TYPES = {
  TICKET_CREATED: 'ticket_created',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_UPDATED: 'ticket_updated',
  SLA_WARNING: 'sla_warning',
  SLA_BREACH: 'sla_breach',
  TICKET_RESOLVED: 'ticket_resolved',
  TICKET_REOPENED: 'ticket_reopened',
  ASSET_ASSIGNED: 'asset_assigned',
  SYSTEM: 'system',
};

const AUDIT_ENTITY_TYPES = {
  USER: 'user',
  TICKET: 'ticket',
  ASSET: 'asset',
  CATEGORY: 'category',
  SLA_POLICY: 'sla_policy',
  KNOWLEDGE_ARTICLE: 'knowledge_article',
  DEPARTMENT: 'department',
  VENDOR: 'vendor',
};

module.exports = {
  ROLES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  ASSET_TYPES,
  ASSET_STATUSES,
  ASSET_ACTIONS,
  WORK_TYPES,
  NOTIFICATION_TYPES,
  AUDIT_ENTITY_TYPES,
};
