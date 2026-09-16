import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { useRole } from "@/contexts/RoleContext";
import { StatusLevel } from "@/features/booth/types";
import { updateStallStatus } from "@/features/booth/api";
import { useFavorites } from "@/features/booth/hooks/useFavorites";

export const useBoothStatus = (
  split?: "first" | "second",
) => {
  const {
    api: {
      fetchedData,
      fetchData,
      lastUpdated,
      isStallsLive,
    },
  } = useData();

  const {
    isAdmin,
    isStallAdmin,
    assignedStall,
  } = useRole();

  const allStatuses =
    fetchedData?.stalls || [];

  const {
    favorites,
    toggleFavorite,
    mounted,
  } = useFavorites();

  const statuses = useMemo(() => {
    const sortedStatuses = [
      ...allStatuses,
    ].sort(
      (a, b) =>
        Number(a.id) -
        Number(b.id),
    );

    if (!split) {
      return sortedStatuses;
    }

    const mid = Math.floor(
      sortedStatuses.length / 2,
    );

    return split === "first"
      ? sortedStatuses.slice(
          0,
          mid,
        )
      : sortedStatuses.slice(
          mid,
        );
  }, [allStatuses, split]);

  // ----------------------------------
  // 詳細を開く
  // ページ再読み込みはしない
  // ----------------------------------

  const handleStallClick = (
    stallName: string,
  ) => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search,
      );

    params.set(
      "booth-info",
      stallName,
    );

    params.delete("checkin");

    const query =
      params.toString();

    const url =
      `${window.location.pathname}` +
      `${query ? `?${query}` : ""}` +
      `${window.location.hash}`;

    window.history.pushState(
      {},
      "",
      url,
    );

    // モーダル側へURL変更を通知
    window.dispatchEvent(
      new Event(
        "booth-info-change",
      ),
    );
  };

  const cycleStatus = (
    current: StatusLevel,
  ): StatusLevel => {
    if (current === 0) return 1;
    if (current === 1) return 2;
    return 0;
  };

  const canEdit = (
    stallName: string,
  ) => {
    if (isAdmin) return true;

    if (
      isStallAdmin &&
      assignedStall === stallName
    ) {
      return true;
    }

    return false;
  };

  const handleCrowdClick =
    async (
      stallName: string,
      currentLevel: StatusLevel,
    ) => {
      if (!canEdit(stallName)) {
        return;
      }

      const newLevel =
        cycleStatus(
          currentLevel,
        );

      await updateStallStatus(
        stallName,
        {
          crowdLevel:
            newLevel,
        },
      );

      fetchData();
    };

  const handleStockClick =
    async (
      stallName: string,
      currentLevel: StatusLevel,
    ) => {
      if (!canEdit(stallName)) {
        return;
      }

      const newLevel =
        cycleStatus(
          currentLevel,
        );

      await updateStallStatus(
        stallName,
        {
          stockLevel:
            newLevel,
        },
      );

      fetchData();
    };

  return {
    isLoading: false,
    mounted,
    statuses,
    lastUpdated,
    isStallsLive,
    favorites,
    toggleFavorite,
    handleStallClick,
    handleCrowdClick,
    handleStockClick,
    canEdit,
  };
};