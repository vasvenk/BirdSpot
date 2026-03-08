"use client";

import { Toaster } from "react-hot-toast";
import { SWRConfig } from "swr";

import { AuthProvider } from "@/components/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "18px",
              background: "#fffdf7",
              color: "#294332",
              border: "1px solid rgba(91, 125, 96, 0.2)",
            },
          }}
        />
      </AuthProvider>
    </SWRConfig>
  );
}
