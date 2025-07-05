// FHIR R4 Resource Types for eClinicalWorks Integration
export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: FHIRMeta;
}

export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: FHIRCoding[];
  tag?: FHIRCoding[];
}

export interface FHIRCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRIdentifier {
  use?: "usual" | "official" | "temp" | "secondary" | "old";
  type?: FHIRCodeableConcept;
  system?: string;
  value?: string;
  period?: FHIRPeriod;
  assigner?: FHIRReference;
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: FHIRIdentifier;
  display?: string;
}

export interface FHIRHumanName {
  use?:
    | "usual"
    | "official"
    | "temp"
    | "nickname"
    | "anonymous"
    | "old"
    | "maiden";
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: FHIRPeriod;
}

export interface FHIRContactPoint {
  system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
  value?: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
  rank?: number;
  period?: FHIRPeriod;
}

export interface FHIRAddress {
  use?: "home" | "work" | "temp" | "old" | "billing";
  type?: "postal" | "physical" | "both";
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: FHIRPeriod;
}

// FHIR Patient Resource
export interface FHIRPatient extends FHIRResource {
  resourceType: "Patient";
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  deceased?: boolean | string;
  address?: FHIRAddress[];
  maritalStatus?: FHIRCodeableConcept;
  multipleBirth?: boolean | number;
  photo?: FHIRAttachment[];
  contact?: FHIRPatientContact[];
  communication?: FHIRPatientCommunication[];
  generalPractitioner?: FHIRReference[];
  managingOrganization?: FHIRReference;
  link?: FHIRPatientLink[];
}

export interface FHIRAttachment {
  contentType?: string;
  language?: string;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: string;
}

export interface FHIRPatientContact {
  relationship?: FHIRCodeableConcept[];
  name?: FHIRHumanName;
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress;
  gender?: "male" | "female" | "other" | "unknown";
  organization?: FHIRReference;
  period?: FHIRPeriod;
}

export interface FHIRPatientCommunication {
  language: FHIRCodeableConcept;
  preferred?: boolean;
}

export interface FHIRPatientLink {
  other: FHIRReference;
  type: "replaced-by" | "replaces" | "refer" | "seealso";
}

// FHIR Practitioner Resource
export interface FHIRPractitioner extends FHIRResource {
  resourceType: "Practitioner";
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  photo?: FHIRAttachment[];
  qualification?: FHIRPractitionerQualification[];
  communication?: FHIRCodeableConcept[];
}

export interface FHIRPractitionerQualification {
  identifier?: FHIRIdentifier[];
  code: FHIRCodeableConcept;
  period?: FHIRPeriod;
  issuer?: FHIRReference;
}

// FHIR Appointment Resource
export interface FHIRAppointment extends FHIRResource {
  resourceType: "Appointment";
  identifier?: FHIRIdentifier[];
  status:
    | "proposed"
    | "pending"
    | "booked"
    | "arrived"
    | "fulfilled"
    | "cancelled"
    | "noshow"
    | "entered-in-error"
    | "checked-in"
    | "waitlist";
  cancelationReason?: FHIRCodeableConcept;
  serviceCategory?: FHIRCodeableConcept[];
  serviceType?: FHIRCodeableConcept[];
  specialty?: FHIRCodeableConcept[];
  appointmentType?: FHIRCodeableConcept;
  reasonCode?: FHIRCodeableConcept[];
  reasonReference?: FHIRReference[];
  priority?: number;
  description?: string;
  supportingInformation?: FHIRReference[];
  start?: string;
  end?: string;
  minutesDuration?: number;
  slot?: FHIRReference[];
  created?: string;
  comment?: string;
  patientInstruction?: string;
  basedOn?: FHIRReference[];
  participant: FHIRAppointmentParticipant[];
  requestedPeriod?: FHIRPeriod[];
}

export interface FHIRAppointmentParticipant {
  type?: FHIRCodeableConcept[];
  actor?: FHIRReference;
  required?: "required" | "optional" | "information-only";
  status: "accepted" | "declined" | "tentative" | "needs-action";
  period?: FHIRPeriod;
}

// FHIR Schedule Resource
export interface FHIRSchedule extends FHIRResource {
  resourceType: "Schedule";
  identifier?: FHIRIdentifier[];
  active?: boolean;
  serviceCategory?: FHIRCodeableConcept[];
  serviceType?: FHIRCodeableConcept[];
  specialty?: FHIRCodeableConcept[];
  actor: FHIRReference[];
  planningHorizon?: FHIRPeriod;
  comment?: string;
}

// FHIR Bundle for search results
export interface FHIRBundle extends FHIRResource {
  resourceType: "Bundle";
  identifier?: FHIRIdentifier;
  type:
    | "document"
    | "message"
    | "transaction"
    | "transaction-response"
    | "batch"
    | "batch-response"
    | "history"
    | "searchset"
    | "collection";
  timestamp?: string;
  total?: number;
  link?: FHIRBundleLink[];
  entry?: FHIRBundleEntry[];
  signature?: FHIRSignature;
}

export interface FHIRBundleLink {
  relation: string;
  url: string;
}

export interface FHIRBundleEntry {
  link?: FHIRBundleLink[];
  fullUrl?: string;
  resource?: FHIRResource;
  search?: FHIRBundleEntrySearch;
  request?: FHIRBundleEntryRequest;
  response?: FHIRBundleEntryResponse;
}

export interface FHIRBundleEntrySearch {
  mode?: "match" | "include" | "outcome";
  score?: number;
}

export interface FHIRBundleEntryRequest {
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  ifMatch?: string;
  ifNoneExist?: string;
}

export interface FHIRBundleEntryResponse {
  status: string;
  location?: string;
  etag?: string;
  lastModified?: string;
  outcome?: FHIRResource;
}

export interface FHIRSignature {
  type: FHIRCoding[];
  when: string;
  who: FHIRReference;
  onBehalfOf?: FHIRReference;
  targetFormat?: string;
  sigFormat?: string;
  data?: string;
}

import { DoctorAvailability } from "./doctor";

// Enhanced types for integration with existing system
export interface EnhancedPatient {
  id: string; // Internal system ID
  fhirId?: string; // FHIR Patient ID
  workflowStatus?: string; // Current workflow status
  currentRoom?: string; // Room assignment
  arrivalTime?: Date; // Check-in time
  estimatedWaitTime?: number; // Estimated wait time
  // FHIR data is fetched separately when needed
}

export interface EnhancedPractitioner {
  id: string; // Internal system ID
  fhirId?: string; // FHIR Practitioner ID
  // Inherit from existing Doctor interface
  name: string;
  specialty: string;
  email: string;
  phone: string;
  roomsAssigned: string[];
  assistantsAssigned: string[];
  patients: string[];
  availability: DoctorAvailability; // Existing availability structure
  // Additional FHIR sync metadata
  lastFhirSync?: Date;
  fhirSyncStatus?: "synced" | "pending" | "error";
}

// FHIR API Response wrapper
export interface FHIRResponse<T = FHIRResource> {
  data?: T;
  error?: string;
  status: number;
  timestamp: Date;
}

// FHIR Search parameters
export interface FHIRSearchParams {
  [key: string]: string | string[] | undefined;
  _count?: string;
  _sort?: string;
  _include?: string | string[];
  _revinclude?: string | string[];
}
