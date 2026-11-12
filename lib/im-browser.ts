"use client";
import { useSyncExternalStore } from "react";

const nichts = () => () => {};

/** false beim Server-Rendern und beim ersten Hydrieren, danach true. Für Zugriffe auf sessionStorage/localStorage. */
export function useImBrowser(): boolean {
  return useSyncExternalStore(nichts, () => true, () => false);
}
