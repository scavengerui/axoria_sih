"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";

export type RoleType = "org:admin" | "org:manager" | "org:trainer" | "org:member";

interface RoleContextType {
  role: RoleType;
  setRole: (role: RoleType) => void;
  roleLabel: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { membership } = useOrganization();
  const [role, setRoleState] = useState<RoleType>("org:admin");

  useEffect(() => {
    // If Clerk organization provides a role, use it by default if user hasn't overridden
    if (membership?.role) {
      setRoleState(membership.role as RoleType);
    }
  }, [membership?.role]);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
  };

  const roleLabel =
    role === "org:admin"
      ? "Admin"
      : role === "org:manager"
        ? "Manager"
        : role === "org:trainer"
          ? "Trainer"
          : "Learner";

  return (
    <RoleContext.Provider value={{ role, setRole, roleLabel }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useCurrentRole() {
  const context = useContext(RoleContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      role: "org:admin" as RoleType,
      setRole: () => {},
      roleLabel: "Admin",
    };
  }
  return context;
}
