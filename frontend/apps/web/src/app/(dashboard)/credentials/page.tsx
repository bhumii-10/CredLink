'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, QrCode, ShieldAlert, CheckCircle2, FileText, Lock, Eye, Trash2 } from 'lucide-react';
import { Shell } from '../../../components/layout/Shell';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Input } from '../../../components/ui/Input';
import { Drawer } from '../../../components/ui/Drawer';
import { Dialog } from '../../../components/ui/Dialog';
import { MOCK_CREDENTIALS } from '../../../lib/mockData';
import { CredentialItem, CredentialStatus, UserRole } from '../../../types';
import { getCredentialStatusBadge, truncateDid, getDomainBadgeStyle } from '../../../lib/utils';
import { useRoleContext } from '../../../hooks/useRoleContext';

export default function CredentialsPage() {
  const { currentUser } = useRoleContext();
  const [credentials, setCredentials] = useState<CredentialItem[]>(MOCK_CREDENTIALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Selected credential for details drawer & QR presentation modal
  const [selectedCred, setSelectedCred] = useState<CredentialItem | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<CredentialItem | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  // New Issue Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newCredentialType, setNewCredentialType] = useState('Immunization Attestation');
  const [newClaimKey, setNewClaimKey] = useState('batchId');
  const [newClaimValue, setNewClaimValue] = useState('VAX-2026-X9');

  const filteredCredentials = credentials.filter((item) => {
    const matchesSearch =
      item.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.credentialType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subjectId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'ALL' || item.domain === selectedDomain;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesDomain && matchesStatus;
  });

  const handleRevokeConfirm = () => {
    if (!revokeTarget) return;
    setCredentials((prev) =>
      prev.map((c) => (c.id === revokeTarget.id ? { ...c, status: 'REVOKED' as CredentialStatus } : c))
    );
    setShowRevokeDialog(false);
    setRevokeTarget(null);
  };

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    const newVc: CredentialItem = {
      id: `vc_custom_${Date.now()}`,
      credentialType: newCredentialType,
      domain: currentUser.role,
      subjectId: newSubjectId || 'CIT-100299',
      subjectName: newSubjectName || 'Demo Citizen',
      issuerName: currentUser.organizationName,
      issuerDid: currentUser.organizationDid,
      issuanceDate: new Date().toISOString().split('T')[0],
      status: 'VALID',
      claims: [
        { key: newClaimKey, label: newClaimKey, value: newClaimValue },
        { key: 'verificationProof', label: 'Proof', value: 'Ed25519Signature2020' }
      ],
      qrPayload: `credlink://verify?vc=vc_custom_${Date.now()}&issuer=${currentUser.organizationDid}`
    };
    setCredentials([newVc, ...credentials]);
    setShowIssueModal(false);
    setNewSubjectName('');
    setNewSubjectId('');
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Verifiable Credential Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Issue, inspect claims, present simulated QR proofs, or manage credential revocation lifecycles.
            </p>
          </div>
          <Button
            variant={currentUser.role === 'HOSPITAL' ? 'health' : 'primary'}
            onClick={() => setShowIssueModal(true)}
            className="gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Credential</span>
          </Button>
        </div>

        {/* Filter Controls */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search subject name, ID, or credential type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mr-2">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="h-9 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="ALL">All Domains</option>
                <option value="HOSPITAL">Healthcare / Hospital</option>
                <option value="COLLEGE">Education / College</option>
                <option value="BANK">Bank / Finance</option>
                <option value="EMPLOYER">Employer</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="VALID">Valid</option>
                <option value="REVOKED">Revoked</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Credential Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Catalog of Issued Credentials ({filteredCredentials.length})</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Credential Type</TableHead>
                <TableHead>Issuer & Domain</TableHead>
                <TableHead>Issuance Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCredentials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    No matching credentials found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCredentials.map((cred) => {
                  const statusStyle = getCredentialStatusBadge(cred.status);
                  const domainBadge = getDomainBadgeStyle(cred.domain);

                  return (
                    <TableRow key={cred.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{cred.subjectName}</p>
                          <p className="text-[10px] font-mono text-slate-500">{cred.subjectId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{cred.credentialType}</p>
                          <p className="text-[10px] text-slate-400">{cred.claims.length} verified claims</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{cred.issuerName}</p>
                          <Badge className={`text-[10px] mt-0.5 ${domainBadge.bg} ${domainBadge.text} ${domainBadge.border}`}>
                            {cred.domain}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">{cred.issuanceDate}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyle.bg}>{statusStyle.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCred(cred)}
                            className="h-7 text-xs px-2"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedCred(cred);
                              setShowQrModal(true);
                            }}
                            className="h-7 text-xs px-2"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR Code</span>
                          </Button>
                          {cred.status === 'VALID' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRevokeTarget(cred);
                                setShowRevokeDialog(true);
                              }}
                              className="h-7 text-xs px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Credential Details Side Drawer */}
      <Drawer
        isOpen={selectedCred !== null && !showQrModal}
        onClose={() => setSelectedCred(null)}
        title="Verifiable Credential Inspector"
        description={`ID: ${selectedCred?.id}`}
      >
        {selectedCred && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <Badge className={getCredentialStatusBadge(selectedCred.status).bg}>
                  {selectedCred.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Credential Type</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedCred.credentialType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subject Name</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedCred.subjectName} ({selectedCred.subjectId})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Issuer DID</span>
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">{truncateDid(selectedCred.issuerDid)}</span>
              </div>
            </div>

            {/* Claims Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                Verified Claims Payload
              </h4>
              <div className="space-y-2">
                {selectedCred.claims.map((claim) => (
                  <div key={claim.key} className="p-3 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">{claim.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{claim.key}</p>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{claim.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Cryptographic Proof */}
            <div className="p-3 bg-slate-900 text-slate-200 rounded-md font-mono text-[10px] space-y-1">
              <p className="text-emerald-400 font-semibold">// Cryptographic Attestation</p>
              <p>Type: Ed25519Signature2020</p>
              <p>ProofPurpose: assertionMethod</p>
              <p className="break-all text-slate-400">SignatureValue: z5A89n...901mKq23L</p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Simulated QR Code Modal */}
      <Dialog
        isOpen={showQrModal && selectedCred !== null}
        onClose={() => setShowQrModal(false)}
        title="Simulated Credential Delivery QR"
        description="Scan from citizen mobile wallet to import credential (UI Demo)."
      >
        {selectedCred && (
          <div className="text-center space-y-4 py-2">
            <div className="inline-block p-4 bg-white border border-slate-300 rounded-xl shadow-md">
              {/* Simulated Crisp QR Pattern */}
              <div className="w-48 h-48 bg-slate-900 rounded-md flex flex-col items-center justify-center p-3 text-white space-y-2 relative overflow-hidden">
                <QrCode className="w-24 h-24 text-white" />
                <span className="text-[9px] font-mono tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                  CREDLINK-VC-PRESENTATION
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{selectedCred.credentialType}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedCred.qrPayload}</p>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-md text-[11px] text-amber-800 dark:text-amber-300">
              Note: This is a synthetic QR representation for hackathon visual demonstration.
            </div>
          </div>
        )}
      </Dialog>

      {/* Revocation Confirm Dialog */}
      <Dialog
        isOpen={showRevokeDialog && revokeTarget !== null}
        onClose={() => setShowRevokeDialog(false)}
        title="Revoke Credential Confirmation"
        description="Are you sure you want to mark this credential as REVOKED?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Revoking this credential will immediately update the trust registry status. Verification requests for this credential will fail.
          </p>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-md text-xs text-rose-800 dark:text-rose-300">
            <p className="font-semibold">{revokeTarget?.credentialType}</p>
            <p className="text-[10px]">Subject: {revokeTarget?.subjectName} ({revokeTarget?.subjectId})</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRevokeConfirm}>
              Confirm Revocation
            </Button>
          </div>
        </div>
      </Dialog>

      {/* New Issue Credential Dialog */}
      <Dialog
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title={`Issue Credential — ${currentUser.role}`}
        description="Create a new verifiable credential record for demo subject."
      >
        <form onSubmit={handleCreateCredential} className="space-y-3 text-xs">
          <Input
            label="Subject Full Name"
            placeholder="e.g. Elena Rostova"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            required
          />
          <Input
            label="Subject Citizen / ID"
            placeholder="e.g. CIT-771239"
            value={newSubjectId}
            onChange={(e) => setNewSubjectId(e.target.value)}
            required
          />
          <Input
            label="Credential Type"
            placeholder="e.g. Immunization Record / Bachelor Degree"
            value={newCredentialType}
            onChange={(e) => setNewCredentialType(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Input
              label="Claim Field Key"
              placeholder="e.g. vaccineType"
              value={newClaimKey}
              onChange={(e) => setNewClaimKey(e.target.value)}
            />
            <Input
              label="Claim Field Value"
              placeholder="e.g. Hepatitis B Booster"
              value={newClaimValue}
              onChange={(e) => setNewClaimValue(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowIssueModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Issue & Add to Catalog
            </Button>
          </div>
        </form>
      </Dialog>
    </Shell>
  );
}
