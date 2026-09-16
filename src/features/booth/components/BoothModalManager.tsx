"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import BoothDetailModal, {
  BoothItem,
} from "./BoothDetailModal";

import { loadJSON } from "@/lib/Data/JSONLoader";
import { Exhibition } from "@/features/map/hooks/useSpotInfo";

export default function BoothModalManager() {
  const [
    targetName,
    setTargetName,
  ] = useState<
    string | null
  >(null);

  const [
    allStalls,
    setAllStalls,
  ] = useState<
    BoothItem[]
  >([]);

  const [
    allExhibitions,
    setAllExhibitions,
  ] = useState<
    Exhibition[]
  >([]);

  // ----------------------------------
  // URLから選択中の名前を取得
  // ----------------------------------

  useEffect(() => {
    const syncFromUrl = () => {
      const params =
        new URLSearchParams(
          window.location.search,
        );

      const name =
        params.get(
          "booth-info",
        ) ||
        params.get(
          "checkin",
        );

      setTargetName(name);
    };

    // 初回
    syncFromUrl();

    // 戻る/進む
    window.addEventListener(
      "popstate",
      syncFromUrl,
    );

    // 詳細クリック時
    window.addEventListener(
      "booth-info-change",
      syncFromUrl,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        syncFromUrl,
      );

      window.removeEventListener(
        "booth-info-change",
        syncFromUrl,
      );
    };
  }, []);

  // ----------------------------------
  // データ読込
  // ----------------------------------

  useEffect(() => {
    const loadData =
      async () => {
        try {
          const [
            stalls,
            exhibitions,
          ] =
            await Promise.all([
              loadJSON(
                "booth",
              ),
              loadJSON(
                "exhibitions",
              ),
            ]);

          setAllStalls(
            Array.isArray(
              stalls,
            )
              ? stalls
              : [],
          );

          setAllExhibitions(
            Array.isArray(
              exhibitions,
            )
              ? exhibitions
              : [],
          );
        } catch (
          error
        ) {
          console.error(
            "[BoothModalManager] Failed to load data:",
            error,
          );

          setAllStalls([]);
          setAllExhibitions(
            [],
          );
        }
      };

    loadData();
  }, []);

  // ----------------------------------
  // 模擬店・展示を検索
  // ----------------------------------

  const selectedBooth =
    useMemo(() => {
      if (!targetName) {
        return null;
      }

      const stall =
        allStalls.find(
          (item) =>
            item.name ===
            targetName,
        );

      if (stall) {
        return stall;
      }

      const exhibition =
        allExhibitions.find(
          (item) =>
            item.name ===
            targetName,
        );

      if (
        exhibition
      ) {
        return {
          name:
            exhibition.name,
          team:
            exhibition.team,
          place:
            exhibition.place,
          image:
            exhibition.image,
        } as BoothItem;
      }

      return null;
    }, [
      targetName,
      allStalls,
      allExhibitions,
    ]);

  if (
    !targetName ||
    !selectedBooth
  ) {
    return null;
  }

  return (
    <BoothDetailModal
      key={targetName}
      item={selectedBooth}
    />
  );
}