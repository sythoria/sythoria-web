"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, ChevronDown, Check } from "lucide-react";
import { STATUS_COLORS, type ModelConfig } from "@/lib/types";
import type { ModelStatuses } from "@/lib/types";
import { MAX_INPUT_LENGTH, MAX_TEXTAREA_HEIGHT } from "@/lib/config";
import { SYSTEM_PROMPTS } from "@/config/systemPrompts";

interface InputBarProps {
  models: ModelConfig[];
  onSend: (message: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
  modelStatuses: ModelStatuses;
  systemPromptId: string | null;
  onSystemPromptChange: (id: string | null) => void;
  inputAutoFocus?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  disconnected: "Disconnected",
  connecting: "Connecting\u2026",
  connected: "Connected",
  error: "Connection error",
};

export default function InputBar({
  models,
  onSend,
  selectedModel,
  onModelChange,
  disabled,
  modelStatuses,
  systemPromptId,
  onSystemPromptChange,
  inputAutoFocus,
}: InputBarProps) {
  const [value, setValue] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isOverLimit = value.length > MAX_INPUT_LENGTH;
  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !isOverLimit && !disabled;

  useEffect(() => {
    if (inputAutoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [inputAutoFocus]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT);
      textareaRef.current.style.height = newHeight + "px";
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    }
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [canSend, trimmed, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (modelOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, models.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && focusedIndex >= 0) {
          e.preventDefault();
          onModelChange(models[focusedIndex].id);
          setModelOpen(false);
          setFocusedIndex(-1);
        } else if (e.key === "Escape") {
          setModelOpen(false);
          setFocusedIndex(-1);
        }
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [modelOpen, focusedIndex, models, onModelChange, handleSubmit],
  );

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_INPUT_LENGTH + 100) {
      setValue(val);
    }
  };

  const currentModel = models.find((m) => m.id === selectedModel) ?? models[0];
  const currentStatus = modelStatuses[selectedModel] ?? "disconnected";

  return (
    <div className="px-4 pb-[env(safe-area-inset-bottom,16px)] pt-2 md:px-0 md:pb-4">
      <div className="max-w-3xl mx-auto">
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <div className="flex items-center gap-1 mb-1.5 px-1">
          {SYSTEM_PROMPTS.map((p) => {
            const isActive = systemPromptId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSystemPromptChange(isActive ? null : p.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-text-muted hover:text-text-secondary hover:bg-hover border border-transparent"
                }`}
                aria-label={`${isActive ? "Deselect" : "Select"} ${p.label} mode`}
                aria-pressed={isActive}
              >
                <span className="shrink-0" aria-hidden="true">
                  {p.icon}
                </span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
        <div
          className={`flex items-center gap-2 glass-panel rounded-2xl px-4 py-3 transition-all focus-within:border-accent/40 focus-within:shadow-lg focus-within:shadow-accent/5 ${isOverLimit ? "border-red-500/50" : ""}`}
        >
          <button
            className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-hover transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Attach file"
            aria-label="Attach file (coming soon)"
            disabled
          >
            <Paperclip size={18} />
          </button>

          <textarea
            id="chat-input"
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${currentModel?.name ?? "Sythoria"}...`}
            rows={1}
            disabled={disabled}
            aria-describedby={isOverLimit ? "input-limit-error" : "input-hint"}
            aria-invalid={isOverLimit}
            className={`flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted resize-none outline-none leading-relaxed max-h-[${MAX_TEXTAREA_HEIGHT}px] overflow-y-hidden ${isOverLimit ? "text-red-400" : ""}`}
          />

          <div ref={dropdownRef} className="relative shrink-0">
            <button
              onClick={() => {
                setModelOpen(!modelOpen);
                setFocusedIndex(-1);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-secondary hover:bg-hover transition-colors whitespace-nowrap min-h-[44px]"
              aria-label={`Select model: currently ${currentModel?.name ?? "None"}`}
              aria-expanded={modelOpen}
              aria-haspopup="listbox"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[currentStatus]}`}
                title={STATUS_LABELS[currentStatus] ?? currentStatus}
                aria-hidden="true"
              />
              <span>{currentModel?.name || "No Model"}</span>
              <ChevronDown
                size={12}
                className={`transition-transform ${modelOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {modelOpen && (
              <div
                className="absolute bottom-full right-0 mb-2 w-56 bg-surface border border-border rounded-xl shadow-2xl py-1 z-50 animate-fade-in max-h-64 overflow-y-auto"
                role="listbox"
                aria-label="Available models"
              >
                {models.map((model, idx) => {
                  const status = modelStatuses[model.id] ?? "disconnected";
                  return (
                    <button
                      key={model.id}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      onClick={() => {
                        onModelChange(model.id);
                        setModelOpen(false);
                        setFocusedIndex(-1);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors min-h-[44px] ${
                        focusedIndex === idx
                          ? "bg-hover text-text-primary"
                          : "text-text-secondary hover:bg-hover hover:text-text-primary"
                      } ${selectedModel === model.id ? "bg-accent-soft" : ""}`}
                      role="option"
                      aria-selected={selectedModel === model.id}
                    >
                      <div className="flex flex-col items-start">
                        <span className="flex items-center gap-1.5 font-medium">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status]}`}
                            title={STATUS_LABELS[status] ?? status}
                            aria-label={STATUS_LABELS[status] ?? status}
                          />
                          {model.name}
                        </span>
                        <span
                          className="text-[10px] text-text-muted max-w-full truncate overflow-hidden text-ellipsis whitespace-nowrap"
                          style={{ maxWidth: "150px" }}
                          title={model.apiBase}
                        >
                          {model.modelId}
                        </span>
                      </div>
                      {selectedModel === model.id && (
                        <Check size={14} className="text-accent shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className="shrink-0 p-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        <p
          id={isOverLimit ? "input-limit-error" : "input-hint"}
          className="mt-2 text-center text-[11px] text-text-muted"
        >
          {isOverLimit ? (
            <span className="text-red-400" role="alert">
              Message exceeds {MAX_INPUT_LENGTH.toLocaleString()} character limit
            </span>
          ) : (
            "Sythoria can make mistakes. Consider checking important information."
          )}
        </p>
      </div>
    </div>
  );
}
