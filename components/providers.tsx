"use client";

import { RoleProvider } from "@/lib/roles/context";
import { RoleSimulator } from "./role-simulator";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      {children}
      <RoleSimulator />
    </RoleProvider>
  );
}
