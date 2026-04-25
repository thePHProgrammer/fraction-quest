import { useMemo } from "react";

export function useDeviceTier() {
  return useMemo(() => {
    if (typeof navigator === "undefined") return "high";
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 4;
    if (cores <= 4 || mem <= 2) return "low";
    if (cores <= 6 || mem <= 4) return "mid";
    return "high";
  }, []);
}
