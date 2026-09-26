export type UserRole = 'COLLEGE' | 'BANK' | 'HOSPITAL' | 'EMPLOYER' | 'ADMIN';

export type CredentialStatus = 'VALID' | 'REVOKED' | 'EXPIRED';
export type OrgStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';

export interface Organization {
  id: string;
  name: string;
  code: string;
  domain: UserRole;
  did: string;
  status: OrgStatus;
  authorizedCredentialTypes: string[];
  issuedCount: number;
  verifiedCount: number;
  createdAt: string;
}

export interface CredentialClaim {
  key: string;
  label: string;
  value: string;
  sensitive?: boolean;
}

export interface CredentialItem {
  id: string;
  credentialType: string;
  domain: UserRole;
  subjectId: string;
  subjectName: string;
  issuerName: string;
  issuerDid: string;
  issuanceDate: string;
  expirationDate?: string;
  status: CredentialStatus;
  claims: CredentialClaim[];
  qrPayload: string;
  consentGranted?: boolean;
}

export interface VerificationRequest {
  id: string;
  requesterName: string;
  requesterDomain: UserRole;
  targetSubjectName: string;
  targetSubjectId: string;
  purpose: string;
  requestedClaims: string[];
  approvedClaims: string[];
  status: VerificationStatus;
  createdAt: string;
  expiresAt: string;
  verificationResult?: {
    verified: boolean;
    timestamp: string;
    proofType: string;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  eventType: 'CREDENTIAL_ISSUED' | 'CREDENTIAL_REVOKED' | 'VERIFICATION_REQUESTED' | 'VERIFICATION_APPROVED' | 'ORGANIZATION_STATUS_CHANGED' | 'CONSENT_GRANTED';
  organization: string;
  domain: UserRole;
  action: string;
  actor: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'PENDING';
  details: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationName: string;
  organizationDid: string;
}
