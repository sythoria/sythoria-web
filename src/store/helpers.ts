import { useUIStore } from "./useUIStore";
import { useModelStore } from "./useModelStore";
import { useSearchStore } from "./useSearchStore";

export function uiToast(
  message: string,
  variant: "info" | "success" | "error" = "info"
) {
  useUIStore.getState().addToast(message, variant);
}

export function uiLoading(
  key:
    | "init"
    | "sendMessage"
    | "checkConnection"
    | "saveConfig"
    | "toolExecution",
  value: boolean
) {
  useUIStore.getState().setLoading(key, value);
}

export function uiConfigLoaded(loaded: boolean) {
  useUIStore.getState().setConfigLoaded(loaded);
}

export function uiHasStarted(started: boolean) {
  useUIStore.getState().setHasStarted(started);
}

export function uiTheme(theme: "light" | "dark") {
  useUIStore.getState().setTheme(theme);
}

export function uiSidebarOpen(open: boolean) {
  useUIStore.getState().setSidebarOpen(open);
}

export function uiView(view: "chat" | "settings") {
  useUIStore.getState().setView(view);
}

export function uiCloseRenameModal() {
  useUIStore.getState().closeRenameModal();
}

export function modelCheckConnections(modelIds?: string[]) {
  return useModelStore.getState().checkModelConnections(modelIds);
}

export function modelStartHealthCheck() {
  useModelStore.getState().startHealthCheck();
}

export function modelStopHealthCheck() {
  useModelStore.getState().stopHealthCheck();
}

export type ModelState = ReturnType<typeof useModelStore.getState>;
export type SearchState = ReturnType<typeof useSearchStore.getState>;

export function modelSetState(partial: Partial<ModelState>) {
  useModelStore.setState(partial);
}

export function searchSetState(partial: Partial<SearchState>) {
  useSearchStore.setState(partial);
}

export function searchPerformSearch(
  ...args: Parameters<SearchState["performSearch"]>
) {
  return useSearchStore.getState().performSearch(...args);
}

export function searchFetchUrlContent(
  ...args: Parameters<SearchState["fetchUrlContent"]>
) {
  return useSearchStore.getState().fetchUrlContent(...args);
}
