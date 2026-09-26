'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, CheckCircle2, AlertCircle, QrCode, FileCheck, Eye, Lock } from 'lucide-react';
import { Shell } from '../../../components/layout/Shell';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Input } from '../../../components/ui/Input';
import { Dialog } from '../../../components/ui/Dialog';
import { Drawer } from '../../../components/ui/Drawer';
import { MOCK_VERIFICATION_REQUESTS } from '../../../lib/mockData';
import { VerificationRequest } from '../../../types';
import { getVerificationStatusBadge } from '../../../lib/utils';
import { useRoleContext } from '../../../hooks/useRoleContext';

export default function VerificationPage() {
  const { currentUser } = useRoleContext();
  const [requests, setRequests] = useState<VerificationRequest[]>(MOCK_VERIFICATION_REQUESTS);
  const [selectedReq, setSelectedReq] = useState<VerificationRequest | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // New Request State
  const [targetSubjectName, setTargetSubjectName] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState('');
  const [purpose, setPurpose] = useState('Income & Employment Verification for Financial Services');
  const [selectedClaims, setSelectedClaims] = useState<string[]>(['Degree Name', 'Employment Status']);

  const claimOptions = [
    'Degree Name',
    'Graduation Year',
    'GPA / Grade Attestation',
    'Employment Status',
    'Current Role',
    'Income Attestation',
    'Immunization Record',
    'Coverage Tier'
  ];

  const toggleClaim = (claim: string) => {
    if (selectedClaims.includes(claim)) {
      setSelectedClaims(selectedClaims.filter((c) => c !== claim));
    } else {
      setSelectedClaims([...selectedClaims, claim]);
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: VerificationRequest = {
      id: `vr_custom_${Date.now()}`,
      requesterName: currentUser.organizationName,
      requesterDomain: currentUser.role,
      targetSubjectName: targetSubjectName || 'Demo Citizen',
      targetSubjectId: targetSubjectId || 'CIT-884920',
      purpose: purpose,
      requestedClaims: selectedClaims,
      approvedClaims: [],
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      expiresAt: '2026-03-30'
    };
    setRequests([newReq, ...requests]);
    setShowCreateModal(false);
    setTargetSubjectName('');
    setTargetSubjectId('');
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Selective Disclosure Verification Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Request zero-knowledge claims from citizens across education, employment, banking, and healthcare domains.
            </p>
          </div>
          <Button
            variant={currentUser.role === 'HOSPITAL' ? 'health' : 'primary'}
            onClick={() => setShowCreateModal(true)}
            className="gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Verification Request</span>
          </Button>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active & Historical Verification Requests ({requests.length})</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester Entity</TableHead>
                <TableHead>Target Citizen</TableHead>
                <TableHead>Verification Purpose</TableHead>
                <TableHead>Requested Claims</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => {
                const statusStyle = getVerificationStatusBadge(req.status);
                return (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{req.requesterName}</p>
                        <Badge variant="neutral" className="text-[10px] mt-0.5">{req.requesterDomain}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{req.targetSubjectName}</p>
                        <p className="text-[10px] font-mono text-slate-500">{req.targetSubjectId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{req.purpose}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {req.requestedClaims.map((claim) => (
                          <span
                            key={claim}
                            className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-600 dark:text-slate-300"
                          >
                            {claim}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyle.bg}>{statusStyle.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReq(req)}
                          className="h-7 text-xs px-2"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedReq(req);
                            setShowQrModal(true);
                          }}
                          className="h-7 text-xs px-2"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Request QR</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Verification Inspector Drawer */}
      <Drawer
        isOpen={selectedReq !== null && !showQrModal}
        onClose={() => setSelectedReq(null)}
        title="Verification Request & Consent Inspector"
        description={`Request ID: ${selectedReq?.id}`}
      >
        {selectedReq && (
          <div className="space-y-5">
            {/* Status box */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Request Status</span>
                <Badge className={getVerificationStatusBadge(selectedReq.status).bg}>
                  {selectedReq.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Requesting Entity</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedReq.requesterName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Citizen Subject</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedReq.targetSubjectName} ({selectedReq.targetSubjectId})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Verification Purpose</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedReq.purpose}</span>
              </div>
            </div>

            {/* Requested vs Approved Claims comparison */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                Selective Disclosure breakdown
              </h4>
              <div className="space-y-2">
                {selectedReq.requestedClaims.map((claim) => {
                  const isApproved = selectedReq.approvedClaims.includes(claim);
                  return (
                    <div
                      key={claim}
                      className="p-3 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 flex justify-between items-center text-xs"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{claim}</span>
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Disclosed & Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                          <Lock className="w-3 h-3" /> Citizen Withheld
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Proof Result */}
            {selectedReq.verificationResult && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Zero-Knowledge Proof Verified
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Verified at: {selectedReq.verificationResult.timestamp}
                </p>
                <p className="text-slate-500 font-mono text-[10px]">
                  Proof Engine: {selectedReq.verificationResult.proofType}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Verification Request QR Modal */}
      <Dialog
        isOpen={showQrModal && selectedReq !== null}
        onClose={() => setShowQrModal(false)}
        title="Verification Request Presentation QR"
        description="Present to citizen to scan and grant selective consent (UI Demo)."
      >
        {selectedReq && (
          <div className="text-center space-y-4 py-2">
            <div className="inline-block p-4 bg-white border border-slate-300 rounded-xl shadow-md">
              <div className="w-48 h-48 bg-slate-900 rounded-md flex flex-col items-center justify-center p-3 text-white space-y-2 relative overflow-hidden">
                <QrCode className="w-24 h-24 text-teal-400" />
                <span className="text-[9px] font-mono tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                  VERIFY-REQUEST-SESSION
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{selectedReq.requesterName}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">credlink://request?id={selectedReq.id}</p>
            </div>
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-md text-[11px] text-teal-800 dark:text-teal-300">
              Note: Clearly identified as a Verification Request QR (requires citizen consent).
            </div>
          </div>
        )}
      </Dialog>

      {/* Create Request Modal */}
      <Dialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Selective Disclosure Verification Request"
        description="Specify requested claims and purpose."
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <Input
            label="Target Citizen Full Name"
            placeholder="e.g. Aarav Sharma"
            value={targetSubjectName}
            onChange={(e) => setTargetSubjectName(e.target.value)}
            required
          />
          <Input
            label="Target Citizen ID"
            placeholder="e.g. CIT-884920"
            value={targetSubjectId}
            onChange={(e) => setTargetSubjectId(e.target.value)}
            required
          />
          <Input
            label="Verification Purpose / Context"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Specific Requested Claims (Zero-Knowledge Selective Disclosure)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {claimOptions.map((claim) => {
                const isChecked = selectedClaims.includes(claim);
                return (
                  <button
                    key={claim}
                    type="button"
                    onClick={() => toggleClaim(claim)}
                    className={`p-2 rounded border text-left flex items-center justify-between text-xs transition-colors ${
                      isChecked
                        ? 'border-slate-900 bg-slate-100 font-semibold dark:border-slate-100 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{claim}</span>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create & Generate Request QR
            </Button>
          </div>
        </form>
      </Dialog>
    </Shell>
  );
}
