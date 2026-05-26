"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { lockBodyScroll, unlockBodyScroll } from "@/utils/scrollLock";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleTabTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTabTrap);
    lockBodyScroll();

    const previouslyFocused = document.activeElement as HTMLElement;
    requestAnimationFrame(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTabTrap);
      unlockBodyScroll();
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose, handleTabTrap]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md rounded-xl bg-surface border border-border shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-hover transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleEscape);
    lockBodyScroll();

    const previouslyFocused = document.activeElement as HTMLElement;
    requestAnimationFrame(() => {
      const firstBtn = modalRef.current?.querySelector<HTMLElement>("button");
      firstBtn?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleEscape);
      unlockBodyScroll();
      previouslyFocused?.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-sm rounded-xl bg-surface border border-border shadow-xl"
      >
        <div className="px-5 pt-5 pb-1">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex gap-2 p-4 pt-3">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-hover transition-colors min-h-[44px]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
              variant === "danger"
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "bg-accent/10 text-accent hover:bg-accent/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface RenameChatModalProps {
  isOpen: boolean;
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
}

export function RenameChatModal({
  isOpen,
  currentTitle,
  onConfirm,
  onCancel,
}: RenameChatModalProps) {
  const [value, setValue] = useState("");
  const [prevOpen, setPrevOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = value.trim().length === 0;

  if (isOpen && !prevOpen) {
    setValue(currentTitle);
  }
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
  }

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleEscape);
    lockBodyScroll();

    const previouslyFocused = document.activeElement as HTMLElement;
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    });

    return () => {
      document.removeEventListener("keydown", handleEscape);
      unlockBodyScroll();
      previouslyFocused?.focus();
    };
  }, [isOpen, currentTitle, onCancel]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isEmpty) {
      onConfirm(value.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Rename Chat"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-surface border border-border shadow-xl">
        <div className="px-5 pt-5 pb-1">
          <h3 className="text-sm font-semibold text-text-primary">
            Rename Chat
          </h3>
          <label htmlFor="rename-input" className="sr-only">
            New title
          </label>
          <input
            id="rename-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-3 w-full px-3 py-2 rounded-lg text-sm bg-input border border-input-border text-text-primary placeholder-text-muted focus:border-accent/50 focus:outline-none transition-colors"
            placeholder="Enter new title"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
              if (e.key === "Escape") onCancel();
            }}
          />
        </div>
        <div className="flex gap-2 p-4 pt-3">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-hover transition-colors min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isEmpty}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
              isEmpty
                ? "bg-accent/10 text-accent/40 cursor-not-allowed"
                : "bg-accent/10 text-accent hover:bg-accent/20"
            }`}
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}
