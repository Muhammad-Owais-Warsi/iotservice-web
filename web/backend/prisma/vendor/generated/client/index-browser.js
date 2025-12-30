
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.1.0
 * Query Engine version: 11f085a2012c0f4778414c8db2651556ee0ef959
 */
Prisma.prismaVersion = {
  client: "6.1.0",
  engine: "11f085a2012c0f4778414c8db2651556ee0ef959"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AgenciesScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  registration_number: 'registration_number',
  gstn: 'gstn',
  nsdc_code: 'nsdc_code',
  contact_person: 'contact_person',
  phone: 'phone',
  email: 'email',
  primary_location: 'primary_location',
  service_areas: 'service_areas',
  partnership_tier: 'partnership_tier',
  partnership_model: 'partnership_model',
  engineer_capacity: 'engineer_capacity',
  bank_account_name: 'bank_account_name',
  bank_account_number: 'bank_account_number',
  bank_ifsc: 'bank_ifsc',
  pan_number: 'pan_number',
  status: 'status',
  onboarded_at: 'onboarded_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.BidsScalarFieldEnum = {
  id: 'id',
  job_id: 'job_id',
  user_id: 'user_id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  price: 'price',
  created_at: 'created_at'
};

exports.Prisma.EngineersScalarFieldEnum = {
  id: 'id',
  agency_id: 'agency_id',
  user_id: 'user_id',
  name: 'name',
  phone: 'phone',
  email: 'email',
  photo_url: 'photo_url',
  certifications: 'certifications',
  skill_level: 'skill_level',
  specializations: 'specializations',
  availability_status: 'availability_status',
  last_location_update: 'last_location_update',
  total_jobs_completed: 'total_jobs_completed',
  average_rating: 'average_rating',
  total_ratings: 'total_ratings',
  success_rate: 'success_rate',
  employment_type: 'employment_type',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Fcm_tokensScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  token: 'token',
  device_type: 'device_type',
  device_id: 'device_id',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.InspectionScalarFieldEnum = {
  id: 'id',
  company_name: 'company_name',
  company_phone: 'company_phone',
  company_email: 'company_email',
  brand_name: 'brand_name',
  years_of_operation_in_equipment: 'years_of_operation_in_equipment',
  years_of_operations: 'years_of_operations',
  location: 'location',
  inspection_date: 'inspection_date',
  inspection_time: 'inspection_time',
  photos: 'photos',
  gst: 'gst',
  billing_address: 'billing_address',
  equipment_type: 'equipment_type',
  equipment_sl_no: 'equipment_sl_no',
  capacity: 'capacity',
  specification_plate_photo: 'specification_plate_photo',
  poc_name: 'poc_name',
  poc_phone: 'poc_phone',
  poc_email: 'poc_email',
  problem_statement: 'problem_statement',
  possible_solution: 'possible_solution',
  created_at: 'created_at'
};

exports.Prisma.Job_status_historyScalarFieldEnum = {
  id: 'id',
  job_id: 'job_id',
  status: 'status',
  changed_by: 'changed_by',
  notes: 'notes',
  created_at: 'created_at'
};

exports.Prisma.JobsScalarFieldEnum = {
  id: 'id',
  job_number: 'job_number',
  client_id: 'client_id',
  client_name: 'client_name',
  client_phone: 'client_phone',
  job_type: 'job_type',
  equipment_type: 'equipment_type',
  equipment_details: 'equipment_details',
  issue_description: 'issue_description',
  site_location: 'site_location',
  assigned_agency_id: 'assigned_agency_id',
  assigned_engineer_id: 'assigned_engineer_id',
  required_skill_level: 'required_skill_level',
  scheduled_time: 'scheduled_time',
  urgency: 'urgency',
  response_deadline: 'response_deadline',
  status: 'status',
  assigned_at: 'assigned_at',
  accepted_at: 'accepted_at',
  started_at: 'started_at',
  completed_at: 'completed_at',
  service_fee: 'service_fee',
  payment_status: 'payment_status',
  service_checklist: 'service_checklist',
  parts_used: 'parts_used',
  photos_before: 'photos_before',
  photos_after: 'photos_after',
  engineer_notes: 'engineer_notes',
  client_signature_url: 'client_signature_url',
  client_rating: 'client_rating',
  client_feedback: 'client_feedback',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.New_engineersScalarFieldEnum = {
  user_id: 'user_id',
  created_at: 'created_at',
  name: 'name',
  email: 'email',
  phone: 'phone',
  agency_id: 'agency_id',
  id: 'id'
};

exports.Prisma.New_engineers_requestsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  role: 'role',
  created_at: 'created_at',
  user_id: 'user_id',
  agency_id: 'agency_id'
};

exports.Prisma.New_jobsScalarFieldEnum = {
  id: 'id',
  location: 'location',
  photos: 'photos',
  assigned: 'assigned',
  price: 'price',
  equipment_type: 'equipment_type',
  equipment_sl_no: 'equipment_sl_no',
  poc_name: 'poc_name',
  poc_phone: 'poc_phone',
  poc_email: 'poc_email',
  problem_statement: 'problem_statement',
  possible_solution: 'possible_solution',
  created_at: 'created_at'
};

exports.Prisma.NotificationsScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  agency_id: 'agency_id',
  title: 'title',
  message: 'message',
  type: 'type',
  related_entity_type: 'related_entity_type',
  related_entity_id: 'related_entity_id',
  is_read: 'is_read',
  read_at: 'read_at',
  sent_via: 'sent_via',
  created_at: 'created_at'
};

exports.Prisma.PaymentsScalarFieldEnum = {
  id: 'id',
  agency_id: 'agency_id',
  job_id: 'job_id',
  amount: 'amount',
  payment_type: 'payment_type',
  status: 'status',
  payment_method: 'payment_method',
  payment_gateway_id: 'payment_gateway_id',
  invoice_number: 'invoice_number',
  invoice_url: 'invoice_url',
  invoice_date: 'invoice_date',
  due_date: 'due_date',
  paid_at: 'paid_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.RequestsScalarFieldEnum = {
  id: 'id',
  created_at: 'created_at',
  name: 'name',
  email: 'email',
  phone: 'phone'
};

exports.Prisma.Spatial_ref_sysScalarFieldEnum = {
  srid: 'srid',
  auth_name: 'auth_name',
  auth_srid: 'auth_srid',
  srtext: 'srtext',
  proj4text: 'proj4text'
};

exports.Prisma.SurveysScalarFieldEnum = {
  id: 'id',
  job_number: 'job_number',
  description: 'description',
  equipments_required: 'equipments_required',
  amount: 'amount',
  photos: 'photos',
  created_at: 'created_at',
  agency_id: 'agency_id',
  engineer_id: 'engineer_id'
};

exports.Prisma.TicketsScalarFieldEnum = {
  id: 'id',
  company_name: 'company_name',
  company_phone: 'company_phone',
  company_email: 'company_email',
  brand_name: 'brand_name',
  years_of_operation_in_equipment: 'years_of_operation_in_equipment',
  location: 'location',
  inspection_date: 'inspection_date',
  inspection_time: 'inspection_time',
  photos: 'photos',
  gst: 'gst',
  billing_address: 'billing_address',
  equipment_type: 'equipment_type',
  equipment_sl_no: 'equipment_sl_no',
  capacity: 'capacity',
  specification_plate_photo: 'specification_plate_photo',
  poc_name: 'poc_name',
  poc_phone: 'poc_phone',
  poc_email: 'poc_email',
  problem_statement: 'problem_statement',
  created_at: 'created_at'
};

exports.Prisma.UsersScalarFieldEnum = {
  id: 'id',
  email: 'email',
  role: 'role'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.agency_type = exports.$Enums.agency_type = {
  ITI: 'ITI',
  Training: 'Training',
  Service: 'Service',
  Vendor: 'Vendor'
};

exports.partnership_tier = exports.$Enums.partnership_tier = {
  standard: 'standard',
  premium: 'premium',
  enterprise: 'enterprise'
};

exports.partnership_model = exports.$Enums.partnership_model = {
  job_placement: 'job_placement',
  dedicated_resource: 'dedicated_resource',
  training_placement: 'training_placement'
};

exports.agency_status = exports.$Enums.agency_status = {
  pending_approval: 'pending_approval',
  active: 'active',
  suspended: 'suspended',
  inactive: 'inactive'
};

exports.availability_status = exports.$Enums.availability_status = {
  available: 'available',
  on_job: 'on_job',
  offline: 'offline',
  on_leave: 'on_leave'
};

exports.employment_type = exports.$Enums.employment_type = {
  full_time: 'full_time',
  part_time: 'part_time',
  gig: 'gig',
  apprentice: 'apprentice'
};

exports.job_status = exports.$Enums.job_status = {
  pending: 'pending',
  assigned: 'assigned',
  accepted: 'accepted',
  travelling: 'travelling',
  onsite: 'onsite',
  completed: 'completed',
  cancelled: 'cancelled'
};

exports.job_type = exports.$Enums.job_type = {
  AMC: 'AMC',
  Repair: 'Repair',
  Installation: 'Installation',
  Emergency: 'Emergency'
};

exports.urgency_level = exports.$Enums.urgency_level = {
  emergency: 'emergency',
  urgent: 'urgent',
  normal: 'normal',
  scheduled: 'scheduled'
};

exports.payment_status = exports.$Enums.payment_status = {
  pending: 'pending',
  processing: 'processing',
  paid: 'paid',
  failed: 'failed'
};

exports.payment_type = exports.$Enums.payment_type = {
  job_payment: 'job_payment',
  subscription: 'subscription',
  advance: 'advance',
  refund: 'refund'
};

exports.user_role = exports.$Enums.user_role = {
  admin: 'admin',
  manager: 'manager',
  engineer: 'engineer'
};

exports.Prisma.ModelName = {
  agencies: 'agencies',
  bids: 'bids',
  engineers: 'engineers',
  fcm_tokens: 'fcm_tokens',
  inspection: 'inspection',
  job_status_history: 'job_status_history',
  jobs: 'jobs',
  new_engineers: 'new_engineers',
  new_engineers_requests: 'new_engineers_requests',
  new_jobs: 'new_jobs',
  notifications: 'notifications',
  payments: 'payments',
  requests: 'requests',
  spatial_ref_sys: 'spatial_ref_sys',
  surveys: 'surveys',
  tickets: 'tickets',
  users: 'users'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
