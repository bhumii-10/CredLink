'use client';

import React, { useState } from 'react';
import { Lock, Search, Building2, CheckCircle2, ShieldAlert, Filter, Eye, AlertTriangle } from 'lucide-react';
import { Shell } from '../../../components/layout/Shell';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Input } from '../../../components/ui/Input';
import { Drawer } from '../../../components/ui/Drawer';
import { Dialog } from '../../../components/ui/Dialog';
import { MOCK_ORGANIZATIONS } from '../../../lib/mockData';
import { Organization, OrgStatus } from '../../../types';
import { getOrgStatusBadge, truncateDid, getDomainBadgeStyle } from '../../../lib/utils';
import { useRoleContext } from '../../../hooks/useRoleContext';

export default function TrustRegistryPage() {
  const { currentUser } = useRoleContext();
  const [orgs, setOrgs] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<Organization | null>(null);
  const [newStatus, setNewStatus] = useState<OrgStatus>('SUSPENDED');

  const filteredOrgs = orgs.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.did.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'ALL' || o.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const handleUpdateOrgStatus = () => {
    if (!statusChangeTarget) return;
    setOrgs((prev) =>
      prev.map((o) => (o.id === statusChangeTarget.id ? { ...o, status: newStatus } : o))
    );
    setStatusChangeTarget(null);
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Network Trust Registry & Issuer Authorization
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifiable Decentralized Identifiers (DIDs) and authorized credential schemas for verified institutions.
            </p>
          </div>
          <Badge variant="neutral" className="self-start sm:self-auto py-1 px-3">
            Root Governance: CredLink Authority
          </Badge>
        </div>

        {/* Filter Controls */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search institution name, DID, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Realm:</span>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="h-9 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="ALL">All Realms</option>
                <option value="HOSPITAL">Healthcare</option>
                <option value="COLLEGE">Education</option>
                <option value="BANK">Financial</option>
                <option value="EMPLOYER">Employer</option>
                <option value="ADMIN">Governance Root</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Directory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Authorized Issuer Directory ({filteredOrgs.length})</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution Name & Code</TableHead>
                <TableHead>Decentralized Identifier (DID)</TableHead>
                <TableHead>Realm Domain</TableHead>
                <TableHead>Authorized Schemas</TableHead>
                <TableHead>Issuer Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.map((org) => {
                const statusStyle = getOrgStatusBadge(org.status);
                const domainStyle = getDomainBadgeStyle(org.domain);

                return (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{org.name}</p>
                        <p className="text-[10px] font-mono text-slate-500">{org.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        {truncateDid(org.did)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${domainStyle.bg} ${domainStyle.text} ${domainStyle.border}`}>
                        {org.domain}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {org.authorizedCredentialTypes.map((type) => (
                          <span key={type} className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-600 dark:text-slate-300">
                            {type}
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
                          onClick={() => setSelectedOrg(org)}
                          className="h-7 text-xs px-2"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Button>
                        {currentUser.role === 'ADMIN' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setStatusChangeTarget(org);
                              setNewStatus(org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
                            }}
                            className="h-7 text-xs px-2"
                          >
                            <span>Toggle Status</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Org Details Drawer */}
      <Drawer
        isOpen={selectedOrg !== null}
        onClose={() => setSelectedOrg(null)}
        title="Trust Registry Entry Details"
        description={`Issuer Code: ${selectedOrg?.code}`}
      >
        {selectedOrg && (
          <div className="space-y-5">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Registry Status</span>
                <Badge className={getOrgStatusBadge(selectedOrg.status).bg}>
                  {selectedOrg.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Institution Name</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedOrg.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Full Root DID</span>
                <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-900 p-2 rounded block break-all text-slate-800 dark:text-slate-200">
                  {selectedOrg.did}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                Permitted Credential Schemas
              </h4>
              <div className="space-y-1.5">
                {selectedOrg.authorizedCredentialTypes.map((schema) => (
                  <div key={schema} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{schema}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Admin Status Change Dialog */}
      <Dialog
        isOpen={statusChangeTarget !== null}
        onClose={() => setStatusChangeTarget(null)}
        title="Admin Governance Action"
        description="Update Trust Registry authorization status for this institution."
      >
        {statusChangeTarget && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-md text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold">{statusChangeTarget.name}</p>
              <p className="text-[11px]">Current Status: {statusChangeTarget.status} → New Target: {newStatus}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setStatusChangeTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateOrgStatus}>
                Confirm Status Update
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Shell>
  );
}
