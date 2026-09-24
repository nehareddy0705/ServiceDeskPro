require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  User,
  Department,
  Category,
  SLAPolicy,
  Asset,
  Vendor,
  Ticket,
  TicketComment,
  WorkLog,
  AssetHistory,
  KnowledgeArticle,
  Notification,
  AuditLog,
} = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servicedesk_pro';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log('Clearing all sample/demo data collections...');
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Category.deleteMany({}),
    SLAPolicy.deleteMany({}),
    Asset.deleteMany({}),
    Vendor.deleteMany({}),
    Ticket.deleteMany({}),
    TicketComment.deleteMany({}),
    WorkLog.deleteMany({}),
    AssetHistory.deleteMany({}),
    KnowledgeArticle.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('Creating Departments...');
  const itDept = await Department.create({
    name: 'Information Technology',
    code: 'IT',
    description: 'Corporate IT, Infrastructure, and End-User Computing',
    isActive: true,
  });

  const engDept = await Department.create({
    name: 'Engineering',
    code: 'ENG',
    description: 'Product Development, DevOps, and Platform Engineering',
    isActive: true,
  });

  const hrDept = await Department.create({
    name: 'Human Resources',
    code: 'HR',
    description: 'People Operations, Talent Acquisition, and Workplace',
    isActive: true,
  });

  const finDept = await Department.create({
    name: 'Finance & Operations',
    code: 'FIN',
    description: 'Corporate Finance, Payroll, and Accounting Operations',
    isActive: true,
  });

  const prdDept = await Department.create({
    name: 'Product & Design',
    code: 'PRD',
    description: 'Product Strategy, UX Research, and Product Design',
    isActive: true,
  });

  console.log('Creating SLA Policies...');
  const slaCritical = await SLAPolicy.create({
    name: 'Critical Incident SLA',
    description: 'Immediate response policy for severe business interruptions',
    priority: 'critical',
    responseTimeMinutes: 15,
    resolutionTimeMinutes: 120,
    escalationThresholdMinutes: 60,
    escalateToRole: 'it_manager',
    businessHoursOnly: false,
    isActive: true,
  });

  const slaHigh = await SLAPolicy.create({
    name: 'High Urgency SLA',
    description: 'Priority resolution for degraded workflows and high-impact issues',
    priority: 'high',
    responseTimeMinutes: 30,
    resolutionTimeMinutes: 240,
    escalationThresholdMinutes: 120,
    escalateToRole: 'it_manager',
    businessHoursOnly: false,
    isActive: true,
  });

  const slaMedium = await SLAPolicy.create({
    name: 'Standard Operations SLA',
    description: 'Default resolution window for non-blocking support requests',
    priority: 'medium',
    responseTimeMinutes: 120,
    resolutionTimeMinutes: 720,
    escalationThresholdMinutes: 360,
    escalateToRole: 'technician',
    businessHoursOnly: true,
    isActive: true,
  });

  const slaLow = await SLAPolicy.create({
    name: 'Low Urgency SLA',
    description: 'Extended resolution window for minor cosmetic or informational queries',
    priority: 'low',
    responseTimeMinutes: 240,
    resolutionTimeMinutes: 2880,
    escalationThresholdMinutes: 1440,
    escalateToRole: 'technician',
    businessHoursOnly: true,
    isActive: true,
  });

  console.log('Creating Categories...');
  await Category.create([
    {
      name: 'Network & Connectivity',
      description: 'VPN, enterprise Wi-Fi, DNS, subnets, routers, firewalls',
      defaultPriority: 'high',
      defaultSLAPolicy: slaHigh._id,
      isActive: true,
    },
    {
      name: 'Hardware & Workstations',
      description: 'Laptops, desktops, displays, docking stations, printers',
      defaultPriority: 'medium',
      defaultSLAPolicy: slaMedium._id,
      isActive: true,
    },
    {
      name: 'Security & Identity',
      description: 'Account access, MFA tokens, permissions, credential reset',
      defaultPriority: 'high',
      defaultSLAPolicy: slaHigh._id,
      isActive: true,
    },
    {
      name: 'Software & Tools',
      description: 'Operating systems, desktop applications, developer tooling',
      defaultPriority: 'medium',
      defaultSLAPolicy: slaMedium._id,
      isActive: true,
    },
    {
      name: 'Email & Collaboration',
      description: 'Outlook, Microsoft 365, Teams, calendar synchronization',
      defaultPriority: 'medium',
      defaultSLAPolicy: slaMedium._id,
      isActive: true,
    },
    {
      name: 'Infrastructure & Cloud',
      description: 'Production servers, Kubernetes clusters, database outages',
      defaultPriority: 'critical',
      defaultSLAPolicy: slaCritical._id,
      isActive: true,
    },
  ]);

  console.log('Creating Vendors...');
  await Vendor.create([
    {
      name: 'Dell Technologies',
      contactPerson: 'Enterprise Support',
      email: 'enterprise-support@dell.com',
      phone: '+1-800-456-3355',
      category: 'Hardware',
      contractStartDate: new Date('2023-01-01'),
      contractEndDate: new Date('2027-12-31'),
      isActive: true,
    },
    {
      name: 'HP Inc.',
      contactPerson: 'Commercial Service',
      email: 'commercial.service@hp.com',
      phone: '+1-800-474-6836',
      category: 'Hardware & Printers',
      contractStartDate: new Date('2023-06-01'),
      contractEndDate: new Date('2026-12-31'),
      isActive: true,
    },
    {
      name: 'Cisco Systems',
      contactPerson: 'SmartNet Support',
      email: 'smartnet-support@cisco.com',
      phone: '+1-800-553-2447',
      category: 'Networking',
      contractStartDate: new Date('2022-03-01'),
      contractEndDate: new Date('2028-03-01'),
      isActive: true,
    },
    {
      name: 'Apple Enterprise Care',
      contactPerson: 'Enterprise Care',
      email: 'enterprisecare@apple.com',
      phone: '+1-866-752-7753',
      category: 'Hardware',
      contractStartDate: new Date('2024-01-01'),
      contractEndDate: new Date('2027-01-01'),
      isActive: true,
    },
  ]);

  console.log('Creating essential authentication test accounts...');
  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('Password123!', salt);

  // 1. System Admin
  await User.create({
    name: 'System Administrator',
    email: 'admin@servicedesk.local',
    password: commonPasswordHash,
    role: 'system_admin',
    employeeId: 'EMP-ADM-01',
    department: itDept._id,
    phone: '+1 (555) 019-2831',
    isActive: true,
  });

  // 2. IT Manager
  await User.create({
    name: 'IT Operations Manager',
    email: 'manager@servicedesk.local',
    password: commonPasswordHash,
    role: 'it_manager',
    employeeId: 'EMP-MGR-02',
    department: itDept._id,
    phone: '+1 (555) 019-2832',
    isActive: true,
  });

  // 3. Technician
  await User.create({
    name: 'Support Technician',
    email: 'technician@servicedesk.local',
    password: commonPasswordHash,
    role: 'technician',
    employeeId: 'EMP-TECH-03',
    department: itDept._id,
    phone: '+1 (555) 019-2833',
    isActive: true,
  });

  // 4. Asset Manager
  await User.create({
    name: 'Asset Manager',
    email: 'assetmanager@servicedesk.local',
    password: commonPasswordHash,
    role: 'asset_manager',
    employeeId: 'EMP-AST-04',
    department: itDept._id,
    phone: '+1 (555) 019-2836',
    isActive: true,
  });

  // 5. Employee
  await User.create({
    name: 'Enterprise Employee',
    email: 'employee@servicedesk.local',
    password: commonPasswordHash,
    role: 'employee',
    employeeId: 'EMP-EMP-05',
    department: engDept._id,
    phone: '+1 (555) 019-2837',
    isActive: true,
  });

  console.log('==============================================');
  console.log('INITIALIZATION COMPLETED WITH ZERO SAMPLE APPLICATION DATA!');
  console.log('No sample tickets, assets, notifications, comments, work logs, or fake users.');
  console.log('Test login accounts preserved (Password: Password123!):');
  console.log('1. System Admin:   admin@servicedesk.local');
  console.log('2. IT Manager:     manager@servicedesk.local');
  console.log('3. Technician:     technician@servicedesk.local');
  console.log('4. Asset Manager:  assetmanager@servicedesk.local');
  console.log('5. Employee:       employee@servicedesk.local');
  console.log('==============================================');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
