'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserRole, CurrentUser } from '../types';
import { INITIAL_USER, MOCK_ORGANIZATIONS } from '../lib/mockData';

interface RoleContextType {
  currentUser: CurrentUser;
  switchRole: (role: UserRole) => void;
  activeOrgDid: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(INITIAL_USER);

  const switchRole = (role: UserRole) => {
    const matchingOrg = MOCK_ORGANIZATIONS.find((o) => o.domain === role) || MOCK_ORGANIZATIONS[0];
    setCurrentUser({
      id: `usr_${role.toLowerCase()}`,
      name: `Bhumi Patel (${role})`,
      email: `${role.toLowerCase()}@credlink.network`,
      role: role,
      organizationName: matchingOrg.name,
      organizationDid: matchingOrg.did
    });
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        switchRole,
        activeOrgDid: currentUser.organizationDid
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
}
