"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import InputBar from "@/components/chat/InputBar";
import StartScreen from "@/components/chat/StartScreen";
import ScrollToBottomButton from "@/components/chat/ui/ScrollToBottomButton";
import { RenameChatModal } from "@/components/chat/ui/Modal";
import { Spinner } from "@/components/chat/ui/Spinner";
import { ToastContainer } from "@/components/chat/ui/Toast";
import { useChatStore } from "@/store/useChatStore";
import { useModelStore } from "@/store/useModelStore";
import { useUIStore, type LoadingKey } from "@/store/useUIStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useScrollButton } from "@/hooks/useScrollPosition";
import { useShallow } from "zustand/react/shallow";

export default function ChatPage() {
  const {
    conversations,
    activeId,
    isStreaming,
    generationState,
    generationLabel,
  } = useChatStore(
    useShallow((s) => ({
      conversations: s.conversations,
      activeId: s.activeId,
      isStreaming: s.isStreaming,
      generationState: s.generationState,
      generationLabel: s.generationLabel,
    }))
  );

  const {
    init,
    setActiveId,
    newChat,
    deleteChat,
    confirmRename,
    stopStreaming,
    exportChat,
    sendMessage,
    retryLastMessage,
  } = useChatStore(
    useShallow((s) => ({
      init: s.init,
      setActiveId: s.setActiveId,
      newChat: s.newChat,
      deleteChat: s.deleteChat,
      confirmRename: s.confirmRename,
      stopStreaming: s.stopStreaming,
      exportChat: s.exportChat,
      sendMessage: s.sendMessage,
      retryLastMessage: s.retryLastMessage,
    }))
  );

  const { models, selectedModel, modelStatuses } = useModelStore(
    useShallow((s) => ({
      models: s.models,
      selectedModel: s.selectedModel,
      modelStatuses: s.modelStatuses,
    }))
  );

  const { setSelectedModel } = useModelStore(
    useShallow((s) => ({
      setSelectedModel: s.setSelectedModel,
    }))
  );

  const {
    sidebarOpen,
    isConfigLoaded,
    hasStarted,
    showRenameModal,
    renameCurrentTitle,
    loading,
    toasts,
    systemPromptId,
  } = useUIStore(
    useShallow((s) => ({
      sidebarOpen: s.sidebarOpen,
      isConfigLoaded: s.isConfigLoaded,
      hasStarted: s.hasStarted,
      showRenameModal: s.showRenameModal,
      renameCurrentTitle: s.renameCurrentTitle,
      loading: s.loading,
      toasts: s.toasts,
      systemPromptId: s.systemPromptId,
    }))
  );

  const {
    setSidebarOpen,
    openRenameModal,
    closeRenameModal,
    dismissToast,
    setHasStarted,
    setSystemPromptId,
  } = useUIStore(
    useShallow((s) => ({
      setSidebarOpen: s.setSidebarOpen,
      openRenameModal: s.openRenameModal,
      closeRenameModal: s.closeRenameModal,
      dismissToast: s.dismissToast,
      setHasStarted: s.setHasStarted,
      setSystemPromptId: s.setSystemPromptId,
    }))
  );

  const { isSearchEnabled } = useSearchStore(
    useShallow((s) => ({
      isSearchEnabled: s.isSearchEnabled,
    }))
  );

  const { toggleSearchEnabled } = useSearchStore(
    useShallow((s) => ({
      toggleSearchEnabled: s.toggleSearchEnabled,
    }))
  );

  const { isAtBottom, setIsAtBottom, scrollToBottom, virtuosoRef } =
    useScrollButton();

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const conv = useChatStore
      .getState()
      .conversations.find((c) => c.id === activeId);
    useUIStore.getState().setSystemPromptId(conv?.systemPromptId ?? null);
  }, [activeId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isStreaming) {
        stopStreaming();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isStreaming, stopStreaming]);

  useEffect(() => {
    return () => {
      useChatStore.getState().cleanup();
    };
  }, []);

  const handleNewChat = useCallback(() => {
    return newChat();
  }, [newChat]);

  const handleDeleteChat = useCallback(
    (id: string) => {
      deleteChat(id);
    },
    [deleteChat]
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveId(id);
      setSidebarOpen(false);
    },
    [setActiveId, setSidebarOpen]
  );

  const handleSettingsClick = useCallback(() => {
    window.location.href = "/settings";
  }, []);

  const [inputAutoFocus, setInputAutoFocus] = useState(false);

  const handleSuggestionClick = useCallback(() => {
    toggleSearchEnabled(!isSearchEnabled);
    setInputAutoFocus(false);
    requestAnimationFrame(() => setInputAutoFocus(true));
  }, [toggleSearchEnabled, isSearchEnabled]);

  const handleRetry = useCallback(() => {
    if (activeId) retryLastMessage(activeId);
  }, [activeId, retryLastMessage]);

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

  if (!hasStarted) {
    return (
      <>
        <StartScreen onStart={() => setHasStarted(true)} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chat">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onSettingsClick={handleSettingsClick}
        onDeleteChat={handleDeleteChat}
        onRenameChat={openRenameModal}
        onExportChat={exportChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        modelStatuses={modelStatuses}
      />

      <main
        className="flex-1 flex flex-col min-w-0 bg-chat"
        aria-label="Chat area"
      >
        <header className="shrink-0 flex items-center justify-between px-4 py-3 md:px-6 border-b border-border/50 bg-chat/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-hover transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <h2 className="text-sm font-medium text-text-secondary truncate">
              {activeConversation?.title ?? "Sythoria"}
            </h2>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 relative">
          <ChatArea
            messages={messages}
            onSuggestionClick={handleSuggestionClick}
            isAtBottom={isAtBottom}
            setIsAtBottom={setIsAtBottom}
            virtuosoRef={virtuosoRef}
            onRetry={handleRetry}
          />

          {!isAtBottom && messages.length > 0 && (
            <div className="absolute bottom-4 right-4 z-20">
              <ScrollToBottomButton onClick={scrollToBottom} />
            </div>
          )}
        </div>

        <InputBar
          models={models}
          onSend={sendMessage}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={isStreaming}
          modelStatuses={modelStatuses}
          isSearchEnabled={isSearchEnabled}
          onToggleSearch={toggleSearchEnabled}
          isStreaming={isStreaming}
          onStop={stopStreaming}
          inputAutoFocus={inputAutoFocus}
        />
      </main>

      <RenameChatModal
        isOpen={showRenameModal}
        currentTitle={renameCurrentTitle}
        onConfirm={confirmRename}
        onCancel={closeRenameModal}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
