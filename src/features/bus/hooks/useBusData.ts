import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { useAppTime } from "@/contexts/TimeContext";
import { CUSTOM_CONFIG } from "@/constants/custom.config";
import dayjs from "dayjs";

export interface BusTrip {
  time: string;
  arrivalTime: string;
  isoTime: string;
  routeTitle: string;
  routeKey: string;
}

export const useBusData = () => {
  const { t, i18n } = useTranslation();
  const [busData, setBusData] = useState<any>(null);
  const { currentTime } = useAppTime();

  useEffect(() => {
    loadJSON("bus").then(setBusData).catch(() => setBusData(null));
  }, []);

  const allStops = useMemo(() => {
    if (!busData) return [];
    const stops = new Set<string>();
    Object.values(busData).forEach((routeData: any) => {
      if (routeData.route) {
        routeData.route.forEach((s: string) => stops.add(s));
      }
    });
    return Array.from(stops);
  }, [busData]);

  const nowTimeStr = currentTime.format("HH:mm");
  const oneHourLaterStr = currentTime.add(1, "hour").format("HH:mm");
  
  const [fromStop, setFromStop] = useState(CUSTOM_CONFIG.bus?.defaultFromStop || "");
  const [toStop, setToStop] = useState(CUSTOM_CONFIG.bus?.defaultToStop || "");
  const [filterMode, setFilterMode] = useState<"hour" | "all">("hour");

  useEffect(() => {
    if (CUSTOM_CONFIG.bus?.defaultFromStop && !fromStop) {
        setFromStop(CUSTOM_CONFIG.bus.defaultFromStop);
    }
    if (CUSTOM_CONFIG.bus?.defaultToStop && !toStop) {
        setToStop(CUSTOM_CONFIG.bus.defaultToStop);
    }
  }, [fromStop, toStop]);

  const normalizeTime = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  const filteredBuses = useMemo(() => {
    if (!busData) return [];
    const results: BusTrip[] = [];
    
    Object.entries(busData).forEach(([routeKey, routeData]: [string, any]) => {
      if (!routeData.route || !routeData.time) return;

      const fromIdx = routeData.route.indexOf(fromStop);
      const toIdx = routeData.route.indexOf(toStop);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
        routeData.time[fromIdx].forEach((time: string, tripIndex: number) => {
          const arrivalTime = routeData.time[toIdx][tripIndex];

          if (time && arrivalTime) {
            const isoTime = normalizeTime(time);
            const isUpcoming = isoTime > nowTimeStr;
            const isWithinHour = isUpcoming && isoTime <= oneHourLaterStr;

            if (filterMode === "all" || isWithinHour) {
              const lang = i18n.language.startsWith("ja") ? "ja" : "en";
              const routeLabel = CUSTOM_CONFIG.bus?.routeLabels[routeKey]?.[lang] || routeKey;

              results.push({
                time,
                arrivalTime,
                isoTime,
                routeTitle: routeLabel,
                routeKey: routeKey,
              });
            }
          }
        });
      }
    });

    return results.sort((a, b) => a.isoTime.localeCompare(b.isoTime));
  }, [busData, fromStop, toStop, nowTimeStr, oneHourLaterStr, filterMode, i18n.language]);

  const stopOptions = allStops
    .filter((s) => s.includes("発") || s.includes("着"))
    .map((s) => ({
      value: s,
      label: CUSTOM_CONFIG.bus?.stopTranslations?.[s]?.[i18n.language.startsWith("ja") ? "ja" : "en"] || s,
    }));

  const isInHourRange = (bus: BusTrip) => {
    const isUpcoming = bus.isoTime > nowTimeStr;
    return isUpcoming && bus.isoTime <= oneHourLaterStr;
  };

  const newIndexMap = useMemo(() => {
    if (filterMode !== "all") return new Map<string, number>();
    const map = new Map<string, number>();
    let i = 0;
    for (const bus of filteredBuses) {
      if (!isInHourRange(bus)) {
        map.set(bus.isoTime, i++);
      }
    }

    return map;
  }, [filteredBuses, filterMode, nowTimeStr, oneHourLaterStr]);

  return {
    busData,
    fromStop,
    setFromStop,
    toStop,
    setToStop,
    filterMode,
    setFilterMode,
    filteredBuses,
    stopOptions,
    nowTimeStr,
    newIndexMap,
    isInHourRange,
  };
};
