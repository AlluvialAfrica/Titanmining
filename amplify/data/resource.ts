import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  NextOfKin: a.customType({
    firstName: a.string().required(),
    lastName: a.string().required(),
    mobileNumber: a.string().required(),
  }),

  Organization: a.model({
    name: a.string().required(),
    address: a.string(),
    profilePicture: a.string(),
    sites: a.string().array(),
    timeZone: a.string().required(),
    workingHoursStart: a.time(),
    workingHoursEnd: a.time(),
    businessDayClose: a.time(),
    defaultLanguage: a.string().default('en'),
    currency: a.string().default('USD'),
    whatsappNumber: a.string(),
  }).authorization((allow) => [
    allow.owner().to(['read', 'update']),
    allow.groups(['SiteControllers']),
  ]),

  User: a.model({
    orgId: a.string().required(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    mobileNumber: a.string().required(),
    email: a.email(),
    idNumber: a.string(),
    role: a.string().required(),
    shift: a.string(),
    assignedMachine: a.string(),
    nextOfKin: a.ref('NextOfKin'),
    status: a.string().default('PENDING'),
    cognitoSub: a.string(),
    createdBy: a.string(),
  }).authorization((allow) => [
    allow.owner().to(['read', 'update']),
    allow.groups(['SiteControllers']).to(['create', 'read', 'update', 'delete']),
  ]),

  DailyReport: a.model({
    orgId: a.string().required(),
    siteId: a.string().required(),
    userId: a.string().required(),
    role: a.string().required(),
    reportType: a.string().required(),
    reportDate: a.date().required(),
    shift: a.string(),
    status: a.string().default('DRAFT'),
    data: a.json().required(),
    signatures: a.json(),
    submittedAt: a.datetime(),
    verifiedBy: a.string(),
    verifiedAt: a.datetime(),
    source: a.string().default('WEB'),
  }).authorization((allow) => [
    allow.owner().to(['read', 'update']),
    allow.groups(['SiteControllers']).to(['read']),
  ]),

  GoldRecovery: a.model({
    orgId: a.string().required(),
    siteId: a.string().required(),
    bagSealNo: a.string().required(),
    source: a.string().required(),
    reportDate: a.date().required(),
    wetConc: a.float(),
    dryConc: a.float(),
    goldWeight: a.float(),
    receivedFrom: a.string().required(),
    receivedBy: a.string().required(),
    handedOverTo: a.string().required(),
    signatures: a.json().required(),
  }).authorization((allow) => [
    allow.groups(['SiteControllers', 'DepartmentLeads']).to(['read']),
    allow.owner().to(['create', 'read']),
  ]),

  FuelReconciliation: a.model({
    orgId: a.string().required(),
    siteId: a.string().required(),
    machineId: a.string().required(),
    reportDate: a.date().required(),
    shift: a.string(),
    openingStock: a.float(),
    received: a.float(),
    totalAvailable: a.float(),
    totalIssued: a.float(),
    closingStock: a.float(),
    variance: a.float(),
    varianceReason: a.string(),
  }).authorization((allow) => [
    allow.owner().to(['create', 'read', 'update']),
    allow.groups(['SiteControllers']).to(['read']),
  ]),

  Attendance: a.model({
    orgId: a.string().required(),
    siteId: a.string().required(),
    reportDate: a.date().required(),
    shift: a.string().required(),
    records: a.json().required(),
    totalPresent: a.integer(),
    totalAbsent: a.integer(),
    totalVisitors: a.integer(),
    totalCasuals: a.integer(),
  }).authorization((allow) => [
    allow.owner().to(['create', 'read', 'update']),
    allow.groups(['SiteControllers']).to(['read']),
  ]),

  Expense: a.model({
    orgId: a.string().required(),
    siteId: a.string().required(),
    reportDate: a.date().required(),
    item: a.string().required(),
    department: a.string().required(),
    qty: a.float(),
    unitCost: a.float(),
    totalCost: a.float(),
    requestedBy: a.string().required(),
    approvedBy: a.string().required(),
    receivedBy: a.string(),
    receiptUrl: a.string(),
  }).authorization((allow) => [
    allow.owner().to(['create', 'read']),
    allow.groups(['SiteControllers']).to(['read', 'update']),
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
