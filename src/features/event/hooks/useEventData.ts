import { useState, useMemo, useEffect } from "react";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { useAppTime } from "@/contexts/TimeContext";
import { usePathname } from "next/navigation";
import { CUSTOM_CONFIG } from "@/constants/custom.config";
import dayjs from "dayjs";

export interface Event {
    name: string;
    start: string;
    end: string;
}

export const useEventData = () => {
    const [filterMode, setFilterMode] = useState<"hour" | "all">("hour");
    const [eventData, setEventData] = useState<any>(null);
    const { currentTime } = useAppTime();
    const pathname = usePathname();

    useEffect(() => {
        loadJSON("events").then(setEventData).catch(() => setEventData(null));
    }, []);

    const getEventTime = (timeStr: string) => {
        return dayjs(currentTime.format("YYYY-MM-DD") + " " + timeStr);
    };

    const filteredEvents = useMemo(() => {
        if (!eventData) return [];

        const isDemo = pathname?.startsWith("/demo");
        const dateStr = currentTime.format("YYYY-MM-DD");

        let dayKey = "";
        if (isDemo) {
            dayKey = Object.keys(eventData)[0] || "";
        } else {
            const startDate = CUSTOM_CONFIG.identity.eventStartDate;
            const endDate = CUSTOM_CONFIG.identity.eventEndDate;
            if (dateStr === startDate) {
                dayKey = "day1";
            } else if (dateStr === endDate) {
                dayKey = "day2";
            }
            if (!dayKey && Array.isArray(eventData)) {
                return eventData.filter((e: Event) => {
                    if (filterMode === "all") return true;
                    const start = getEventTime(e.start);
                    const end = getEventTime(e.end);
                    const oneHourLater = currentTime.add(1, "hour");
                    const isOngoing =
                        (currentTime.isAfter(start) || currentTime.isSame(start)) && currentTime.isBefore(end);
                    const isUpcoming =
                        start.isAfter(currentTime) && (start.isBefore(oneHourLater) || start.isSame(oneHourLater));
                    return isOngoing || isUpcoming;
                });
            }
        }

        if (!dayKey && !isDemo) return [];

        const events: Event[] = dayKey ? (eventData as any)[dayKey] || [] : Array.isArray(eventData) ? eventData : [];
        const oneHourLater = currentTime.add(1, "hour");

        return events.filter((e) => {
            if (filterMode === "all") return true;
            const start = getEventTime(e.start);
            const end = getEventTime(e.end);
            const isOngoing = (currentTime.isAfter(start) || currentTime.isSame(start)) && currentTime.isBefore(end);
            const isUpcoming =
                start.isAfter(currentTime) && (start.isBefore(oneHourLater) || start.isSame(oneHourLater));
            return isOngoing || isUpcoming;
        });
    }, [currentTime, filterMode, eventData, pathname]);

    const isInHourRange = (e: Event) => {
        const start = getEventTime(e.start);
        const end = getEventTime(e.end);
        const oneHourLater = currentTime.add(1, "hour");
        const isOngoing = (currentTime.isAfter(start) || currentTime.isSame(start)) && currentTime.isBefore(end);
        const isUpcoming = start.isAfter(currentTime) && (start.isBefore(oneHourLater) || start.isSame(oneHourLater));
        return isOngoing || isUpcoming;
    };

    const newIndexMap = useMemo(() => {
        if (filterMode !== "all") return new Map<string, number>();
        const map = new Map<string, number>();
        let i = 0;
        for (const e of filteredEvents) {
            if (!isInHourRange(e)) {
                map.set(e.name, i++);
            }
        }

        return map;
    }, [filteredEvents, filterMode, currentTime]);

    return {
        filterMode,
        setFilterMode,
        filteredEvents,
        currentTime,
        getEventTime,
        newIndexMap,
    };
};
