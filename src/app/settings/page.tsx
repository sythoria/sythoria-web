"use client";

import { useEffect } from "react";
import Settings from "@/components/chat/Settings";
import { Spinner } from "@/components/chat/ui/Spinner";
import { ToastContainer } from "@/components/chat/ui/Toast";
import { useAppStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export default function SettingsPage() {
  const isConfigLoaded = useAppStore((s) => s.isConfigLoaded);
  const loading = useAppStore((s) => s.loading);
  const toasts = useAppStore((s) => s.toasts);
  const init = useAppStore((s) => s.init);
  const dismissToast = useAppStore((s) => s.dismissToast);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const modelStatuses = useAppStore((s) => s.modelStatuses);

  useEffect(() => {
    init();
  }, [init]);

  if (!isConfigLoaded || loading.init) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center bg-chat"
        role="status"
        aria-label="Loading application"
      >
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-text-muted">Loading Sythoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chat">
      <Settings />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
