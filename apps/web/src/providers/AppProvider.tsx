"use client";

import React from "react";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      options={{
        showSpinner: false,
      }}
      height="4px"
      color="#FFFFFFFF"
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
