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
import { getPath } from "@/constants/paths";

export default function BoothModalManager() {
  const [targetName, setTargetName] =
    useState<string | null>(null);

  const [allStalls, setAllStalls] =
    useState<BoothItem[]>([]);

  const [allExhibitions, setAllExhibitions] =
    useState<Exhibition[]>([]);

  // ----------------------------------
  // URLから現在選択中のブース名を取得
  // ----------------------------------

  useEffect(() => {
    const syncFromUrl = () => {
      const params =
        new URLSearchParams(
          window.location.search,
        );

      const name =
        params.get("booth-info") ||
        params.get("checkin");

      setTargetName(name);
    };

    // 初回
    syncFromUrl();

    // ブラウザの戻る・進む
    window.addEventListener(
      "popstate",
      syncFromUrl,
    );

    // ブースクリック時
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
  // 模擬店・展示データ読み込み
  // ----------------------------------

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          stalls,
          exhibitions,
        ] = await Promise.all([
          loadJSON("booth"),
          loadJSON("exhibitions"),
        ]);

        setAllStalls(
          Array.isArray(stalls)
            ? stalls
            : [],
        );

        setAllExhibitions(
          Array.isArray(exhibitions)
            ? exhibitions
            : [],
        );
      } catch (error) {
        console.error(
          "[BoothModalManager] Failed to load data:",
          error,
        );

        setAllStalls([]);
        setAllExhibitions([]);
      }
    };

    loadData();
  }, []);

  // ----------------------------------
  // 詳細画像をバックグラウンドで先読み
  // ----------------------------------

  useEffect(() => {
    const imagePaths = [
      ...allStalls.map(
        (item) => item.image,
      ),
      ...allExhibitions.map(
        (item) => item.image,
      ),
    ].filter(
      (path): path is string =>
        Boolean(path),
    );

    const uniquePaths =
      Array.from(
        new Set(imagePaths),
      );

    if (
      uniquePaths.length === 0
    ) {
      return;
    }

    const preloadImages = () => {
      uniquePaths.forEach(
        (path) => {
          const image =
            new Image();

          image.src =
            getPath(path);

          // 対応ブラウザでは
          // デコードも先に済ませる
          if (image.decode) {
            image
              .decode()
              .catch(() => {
                // 先読み失敗は
                // 通常表示時に再取得されるので無視
              });
          }
        },
      );
    };

    // 最初の画面表示を邪魔しないよう、
    // 少し待ってから画像を先読み
    const timer =
      window.setTimeout(
        preloadImages,
        700,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    allStalls,
    allExhibitions,
  ]);

  // ----------------------------------
  // URLで指定された模擬店・展示を検索
  // ----------------------------------

  const selectedBooth =
    useMemo(() => {
      if (!targetName) {
        return null;
      }

      // 模擬店
      const stall =
        allStalls.find(
          (item) =>
            item.name ===
            targetName,
        );

      if (stall) {
        return stall;
      }

      // 展示
      const exhibition =
        allExhibitions.find(
          (item) =>
            item.name ===
            targetName,
        );

      if (exhibition) {
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