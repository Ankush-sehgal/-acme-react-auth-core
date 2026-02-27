import { StorageAdapter } from "./StorageAdapter";

export const localStorageAdapter = (key = "refresh_token"): StorageAdapter => ({
  get: () => localStorage.getItem(key),
  set: (value: string) => localStorage.setItem(key, value),
  clear: () => localStorage.removeItem(key),
});
