'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  ShieldCheck,
  Building2,
  Plus,
  ArrowUpRight,
  HeartPulse,
  GraduationCap,
  Landmark,
  Briefcase,
  Shield,
  Clock,
  CheckCircle2,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Shell } from '../../../components/layout/Shell';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { useRoleContext } from '../../../hooks/useRoleContext';
import { MOCK_CREDENTIALS, MOCK_VERIFICATION_REQUESTS, MOCK_ORGANIZATIONS } from '../../../lib/mockData';
import { getCredentialStatusBadge, getVerificationStatusBadge, truncateDid, getDomainBadgeStyle } from '../../../lib/utils';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';

export default function DashboardPage() {
  const { currentUser } = useRoleContext();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueSuccessToast, setIssueSuccessToast] = useState(false);

  // Form states for quick issuance modal
  const [subjectName, setSubjectName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [credentialType, setCredentialType] = useState(
    currentUser.role === 'HOSPITAL' ? 'Immunization Certificate' : 'Bachelor of Science'
  );

  const roleBadge = getDomainBadgeStyle(currentUser.role);

  // Filter credentials and verifications matching current role or overview
  const roleCredentials = MOCK_CREDENTIALS.filter(c => currentUser.role === 'ADMIN' || c.domain === currentUser.role);
  const roleVerifications = MOCK_VERIFICATION_REQUESTS.filter(v => currentUser.role === 'ADMIN' || v.requesterDomain === currentUser.role);

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssueModalOpen(false);
    setIssueSuccessToast(true);
    setTimeout(() => setIssueSuccessToast(false), 4000);
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Banner Notice / Demo Badge */}
        <div className="p-4 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-100 dark:bg-slate-200 dark:text-slate-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                {currentUser.organizationName}
              </h3>
              <p className="text-xs sm:text-sm opacity-80 font-mono mt-0.5">
                DID: {currentUser.organizationDid}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800 border-none text-xs">
              {currentUser.role} ENVIRONMENT
            </Badge>
            <Button
              variant={currentUser.role === 'HOSPITAL' ? 'health' : 'secondary'}
              size="sm"
              onClick={() => setIsIssueModalOpen(true)}
              className="gap-1.5 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Credential</span>
            </Button>
          </div>
        </div>

        {/* Role-Specific Operational Summary Header (Design Rule: Avoid identical 4-card grid) */}
        {currentUser.role === 'HOSPITAL' ? (
          <Card variant="health" className="p-5 border-teal-200/80 dark:border-teal-900/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-semibold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
                    Healthcare Realm & Privacy Controls
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Patient Consent & Health Credentials Overview
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  St. Jude Hospital operates under strict minimum disclosure principles. Health claims (immunization, insurance eligibility) are issued with Zero-Knowledge verification proofs.
                </p>
              </div>
              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-teal-200/60 dark:border-teal-900/60 pt-3 md:pt-0 md:pl-6 shrink-0">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Health Credentials</p>
                  <p className="text-xl font-bold text-teal-700 dark:text-teal-300">2,310</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Consent Verifications</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">1,940</p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Issued Credentials</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{roleCredentials.length * 450 + 120}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">↑ 12% this month</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Verification Requests</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{roleVerifications.length}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">100% Consent Controlled</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trust Registry Status</p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Authorized Issuer
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">{truncateDid(currentUser.organizationDid)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
            </Card>
          </div>
        )}

        {/* Section 1: Recent Credentials Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Recent Issued Credentials ({currentUser.role})</CardTitle>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Verifiable credentials issued under governance schema.
                </p>
              </div>
              <Link href="/credentials">
                <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm font-medium">
                  <span>View Catalog</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name & ID</TableHead>
                <TableHead>Credential Type</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Issuance Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleCredentials.map((cred) => {
                const statusBadge = getCredentialStatusBadge(cred.status);
                return (
                  <TableRow key={cred.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{cred.subjectName}</p>
                        <p className="text-xs font-mono text-slate-500">{cred.subjectId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{cred.credentialType}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {cred.domain}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs sm:text-sm text-slate-500">{cred.issuanceDate}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge.bg}>{statusBadge.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Section 2: Recent Verification Requests Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Verification Request Log</CardTitle>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Selective disclosure verification checks submitted by institutions.
                </p>
              </div>
              <Link href="/verification">
                <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm font-medium">
                  <span>Verification Center</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Target Subject</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Requested Claims</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_VERIFICATION_REQUESTS.map((req) => {
                const statusBadge = getVerificationStatusBadge(req.status);
                return (
                  <TableRow key={req.id}>
                    <TableCell>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{req.requesterName}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{req.targetSubjectName}</p>
                        <p className="text-xs font-mono text-slate-500">{req.targetSubjectId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{req.purpose}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {req.requestedClaims.map((claim) => (
                          <span key={claim} className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-600 dark:text-slate-300">
                            {claim}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge.bg}>{statusBadge.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Quick Issue Credential Modal */}
      <Dialog
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title={`Issue New Credential (${currentUser.role})`}
        description="Enter synthetic citizen data to issue a signed verifiable credential in demo mode."
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <Input
            label="Subject Full Name"
            placeholder="e.g. Aarav Sharma"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />
          <Input
            label="Subject Citizen ID / National Identifier"
            placeholder="e.g. CIT-990212"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
          />
          <Input
            label="Credential Type / Schema"
            value={credentialType}
            onChange={(e) => setCredentialType(e.target.value)}
            required
          />
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-400 space-y-1 border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Issuer Authorization:</p>
            <p className="font-mono text-[11px]">{currentUser.organizationName}</p>
            <p className="font-mono text-[10px] text-slate-500">{currentUser.organizationDid}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant={currentUser.role === 'HOSPITAL' ? 'health' : 'primary'} size="sm">
              Confirm & Issue VC (Demo)
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Toast Notification */}
      {issueSuccessToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-900 text-white rounded-lg shadow-xl text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="font-semibold">Credential Issued Successfully</p>
            <p className="text-[11px] opacity-80">Synthetically signed with DID {truncateDid(currentUser.organizationDid)}</p>
          </div>
        </div>
      )}
    </Shell>
  );
}
