"use client";

import { SessionProvider } from "next-auth/react";
import { RoleProvider } from "@/lib/roles/context";
import { RoleSimulator } from "./role-simulator";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RoleProvider>
        {children}
        <RoleSimulator />
      </RoleProvider>
    </SessionProvider>
  );
}
