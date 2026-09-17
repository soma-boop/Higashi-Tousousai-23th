"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataContext, DataContextType } from "./DataContext";
import { supabase } from "@/lib/Server/supabase";
import { fetchAllData } from "@/lib/Server/baseApi";
import { fetchStallsOnly } from "@/features/booth/api";
import { askQuestion as postQuestion } from "@/features/qa/api";
import { StallStatus } from "@/features/booth/types";
import { NewsItem } from "@/features/news/types";
import { LostItem } from "@/features/lost/types";
import { Question } from "@/features/qa/types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { usePathname, useSearchParams } from "next/navigation";
import { useMapControl } from "@/contexts/MapContext";
import { loadJSON } from "@/lib/Data/JSONLoader";

dayjs.extend(customParseFormat);

const FETCH_INTERVAL_MS = 30000;
const FULL_REFRESH_FREQ = 3;

export const DataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mapControl = useMapControl();

  const isMapOpen = mapControl?.isMapOpen || false;
  const isBoothModalOpen = !!searchParams.get("booth-info");

  const isAdminPage =
    pathname?.includes("/admin") ||
    pathname?.includes("/booth");

  const isSuspended =
    isMapOpen || isBoothModalOpen;

  const [isLoading, setIsLoading] =
    useState(!isSuspended);

  const [stalls, setStalls] =
    useState<StallStatus[]>([]);

  const [news, setNews] =
    useState<NewsItem[]>([]);

  const [lostItems, setLostItems] =
    useState<LostItem[]>([]);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [config, setConfig] =
    useState<Record<string, number | null>>({});

  const [lastUpdated, setLastUpdated] =
    useState<number>(Date.now());

  const [isStallsLive, setIsStallsLive] =
    useState(false);

  const isStallsLiveRef =
    useRef(false);

  const [isJSONLoaded, setIsJSONLoaded] =
    useState(false);

  const staticStallNameMap =
    useRef<Record<number | string, string>>({});

  // =========================================================
  // 静的な模擬店データを読み込む
  // =========================================================

  useEffect(() => {
    loadJSON("booth")
      .then((data: any[]) => {
        const boothList =
          Array.isArray(data)
            ? data
            : [];

        boothList.forEach((stall) => {
          if (stall.id) {
            staticStallNameMap.current[
              stall.id
            ] = stall.name;
          }
        });

        setStalls((current) =>
          current.length > 0
            ? current
            : boothList.map(
                (stall) => ({
                  id: stall.id,
                  stallName:
                    stall.name ||
                    "名称未設定",
                  crowdLevel: 0 as const,
                  stockLevel: 0 as const,
                }),
              ),
        );
      })
      .catch((error) => {
        console.warn(
          "[DataProvider] Static booth data could not be loaded",
          error,
        );
      })
      .finally(() => {
        setIsJSONLoaded(true);
        setIsLoading(false);
      });
  }, []);

  // =========================================================
  // Suspended状態
  // =========================================================

  const isSuspendedRef =
    useRef(isSuspended);

  useEffect(() => {
    isSuspendedRef.current =
      isSuspended;
  }, [isSuspended]);

  // =========================================================
  // データ取得用ref
  // =========================================================

  const isInitialRefreshStarted =
    useRef(false);

  const refreshCycle =
    useRef(0);

  const lastFetchTime =
    useRef(0);

  const stallNameMap =
    useRef<
      Record<number | string, string>
    >({});

  // =========================================================
  // 日時変換
  // =========================================================

  const parseCompactDate = (
    compactDateStr: string,
  ) => {
    if (!compactDateStr) {
      return new Date().toISOString();
    }

    const currentYear =
      new Date().getFullYear();

    const parsed = dayjs(
      `${currentYear}${compactDateStr}`,
      "YYYYMMDDHHmm",
    );

    return parsed.toISOString();
  };

  // =========================================================
  // Supabaseからデータ取得
  // =========================================================

  const performRefresh = async (
    forceFull = false,
  ) => {
    if (
      isSuspendedRef.current &&
      !forceFull
    ) {
      console.log(
        "[DataProvider] Refresh blocked (App is suspended or modal is open)",
      );

      return;
    }

    const isFullRefresh =
      forceFull ||
      refreshCycle.current %
        FULL_REFRESH_FREQ ===
        0;

    const currentInterval =
      config.poll_interval_ms ||
      FETCH_INTERVAL_MS;

    const ttl = forceFull
      ? 0
      : currentInterval - 1000;

    if (
      !isFullRefresh &&
      isStallsLiveRef.current
    ) {
      console.log(
        "[DataProvider] Skipping stalls-only polling (Realtime is active)",
      );

      refreshCycle.current =
        (refreshCycle.current + 1) %
        24;

      return;
    }

    try {
      const allData =
        isFullRefresh
          ? await fetchAllData(ttl)
          : await fetchStallsOnly(
              ttl,
            );

      if (allData) {
        lastFetchTime.current =
          Date.now();

        setLastUpdated(
          Date.now(),
        );

        // -----------------------------
        // 模擬店
        // -----------------------------

        if (allData.s) {
          setStalls(
            allData.s
              .map((row: any) => {
                const id =
                  row.i;

                const name =
                  staticStallNameMap
                    .current[id] ||
                  row.n ||
                  stallNameMap
                    .current[id];

                if (!name) {
                  return null;
                }

                if (row.n) {
                  stallNameMap.current[
                    id
                  ] = row.n;
                }

                return {
                  id,
                  stallName: name,
                  crowdLevel:
                    row.c,
                  stockLevel:
                    row.l,
                };
              })
              .filter(
                (
                  stall:
                    | StallStatus
                    | null,
                ): stall is StallStatus =>
                  stall !== null,
              ),
          );
        }

        // -----------------------------
        // 全体更新
        // -----------------------------

        if (isFullRefresh) {
          // お知らせ
          if (allData.n) {
            setNews(
              allData.n.map(
                (row: any) => ({
                  id: row.i,
                  title: row.t,
                  content: row.c,
                  created_at:
                    parseCompactDate(
                      row.a,
                    ),
                  edit_reason:
                    row.r,
                }),
              ),
            );
          }

          // 落とし物
          if (allData.l) {
            setLostItems(
              allData.l.map(
                (row: any) => ({
                  id: row.i,
                  name: row.n,
                  place: row.p,
                  photo_path:
                    row.f,
                  created_at:
                    parseCompactDate(
                      row.a,
                    ),
                  edit_reason:
                    row.r,
                }),
              ),
            );
          }

          // -----------------------------
          // Q&A
          // -----------------------------

          if (allData.q) {
            setQuestions(
              allData.q.map(
                (row: any) => ({
                  id: row.i,
                  text: row.t,
                  answer: row.w,
                  created_at:
                    parseCompactDate(
                      row.a,
                    ),
                  edit_reason:
                    row.r,
                }),
              ),
            );
          }

          // 設定
          if (
            allData.config
          ) {
            setConfig(
              allData.config,
            );
          }
        }
      }
    } catch (error: any) {
      console.error(
        "[DataProvider] Refresh Error:",
        error?.message ||
          error,
      );
    } finally {
      setIsLoading(false);

      refreshCycle.current =
        (refreshCycle.current + 1) %
        24;
    }
  };

  // =========================================================
  // 模擬店 Supabase Realtime
  // =========================================================

  useEffect(() => {
    if (isSuspended) {
      setIsStallsLive(false);

      isStallsLiveRef.current =
        false;

      return;
    }

    console.log(
      "[DataProvider] Connecting stalls realtime...",
    );

    const stallChannel =
      supabase
        .channel(
          "stalls-changes",
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table:
              "stalls_status",
          },
          (payload) => {
            const updatedRow =
              payload.new as any;

            console.log(
              "[DataProvider] Stall realtime update:",
              updatedRow,
            );

            setStalls(
              (
                currentStalls,
              ) =>
                currentStalls.map(
                  (stall) =>
                    stall.id ===
                    updatedRow.id
                      ? {
                          ...stall,
                          crowdLevel:
                            updatedRow.crowd_level,
                          stockLevel:
                            updatedRow.stock_level,
                        }
                      : stall,
                ),
            );

            setLastUpdated(
              Date.now(),
            );
          },
        )
        .subscribe(
          (status) => {
            console.log(
              "[DataProvider] stalls realtime:",
              status,
            );

            const isLive =
              status ===
              "SUBSCRIBED";

            setIsStallsLive(
              isLive,
            );

            isStallsLiveRef.current =
              isLive;
          },
        );

    return () => {
      console.log(
        "[DataProvider] Disconnecting stalls realtime...",
      );

      setIsStallsLive(
        false,
      );

      isStallsLiveRef.current =
        false;

      supabase.removeChannel(
        stallChannel,
      );
    };
  }, [isSuspended]);

  // =========================================================
  // 初回取得
  // =========================================================

  useEffect(() => {
    if (
      isInitialRefreshStarted.current ||
      !isJSONLoaded
    ) {
      return;
    }

    const shouldFetchImmediately =
      isAdminPage ||
      !isSuspended;

    if (
      !shouldFetchImmediately
    ) {
      return;
    }

    isInitialRefreshStarted.current =
      true;

    performRefresh(true);
  }, [
    isSuspended,
    config.poll_interval_ms,
    isJSONLoaded,
    isAdminPage,
  ]);

  // =========================================================
  // Context
  // =========================================================

  const value: DataContextType = {
    api: {
      fetchedData: {
        stalls,
        news,
        lostItems,
        questions,
        config,
      },

      isLoading,

      isPosting: false,

      error: "",

      fetchData: async () =>
        performRefresh(true),

      handlePost: () => {},

      // -----------------------------
      // 質問送信
      // -----------------------------

      askQuestion: async (
        text: string,
      ) => {
        await postQuestion(text);

        // 送信直後に最新のQ&Aを取得
        await performRefresh(true);
      },

      lastUpdated,

      isStallsLive,
    },

    work: {} as any,
  };

  return (
    <DataContext.Provider
      value={value}
    >
      {children}
    </DataContext.Provider>
  );
};