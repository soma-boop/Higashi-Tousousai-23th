"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Button,
  Card,
  message,
  Spin,
  Tag,
} from "antd";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { supabase } from "@/lib/Server/supabase";

import styles from "./AllStatusManager.module.css";

type CrowdLevel = 0 | 1 | 2;
type StockLevel = 0 | 1 | 2;

interface StallStatusRow {
  id: number;
  stall_name: string;
  crowd_level: CrowdLevel;
  stock_level: StockLevel;
  updated_at?: string;
}

interface ExhibitionStatusRow {
  id: number;
  exhibition_name: string;
  crowd_level: CrowdLevel;
  updated_at?: string;
}

const CROWD_OPTIONS: {
  value: CrowdLevel;
  label: string;
}[] = [
  {
    value: 0,
    label: "空いている",
  },
  {
    value: 1,
    label: "やや混雑",
  },
  {
    value: 2,
    label: "混雑",
  },
];

const STOCK_OPTIONS: {
  value: StockLevel;
  label: string;
}[] = [
  {
    value: 0,
    label: "在庫あり",
  },
  {
    value: 1,
    label: "残りわずか",
  },
  {
    value: 2,
    label: "売り切れ",
  },
];

export default function AllStatusManager() {
  const [stalls, setStalls] =
    useState<StallStatusRow[]>([]);

  const [exhibitions, setExhibitions] =
    useState<ExhibitionStatusRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [savingKey, setSavingKey] =
    useState<string | null>(null);

  const [messageApi, contextHolder] =
    message.useMessage();

  // =========================================================
  // データ取得
  // =========================================================

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        stallResult,
        exhibitionResult,
      ] = await Promise.all([
        supabase
          .from("stalls_status")
          .select(
            "id, stall_name, crowd_level, stock_level, updated_at",
          )
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("exhibitions_status")
          .select(
            "id, exhibition_name, crowd_level, updated_at",
          )
          .order("id", {
            ascending: true,
          }),
      ]);

      if (stallResult.error) {
        throw stallResult.error;
      }

      if (exhibitionResult.error) {
        throw exhibitionResult.error;
      }

      setStalls(
        (stallResult.data ??
          []) as StallStatusRow[],
      );

      setExhibitions(
        (exhibitionResult.data ??
          []) as ExhibitionStatusRow[],
      );
    } catch (error: any) {
      console.error(
        "[AllStatusManager] fetch error:",
        error,
      );

      messageApi.error(
        error?.message ||
          "状況の取得に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================================================
  // 模擬店 混雑変更
  // =========================================================

  const updateStallCrowd = async (
    id: number,
    crowdLevel: CrowdLevel,
  ) => {
    const key = `stall-crowd-${id}`;

    if (savingKey) return;

    setSavingKey(key);

    try {
      const { error } = await supabase
        .from("stalls_status")
        .update({
          crowd_level: crowdLevel,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setStalls((current) =>
        current.map((stall) =>
          stall.id === id
            ? {
                ...stall,
                crowd_level:
                  crowdLevel,
                updated_at:
                  new Date().toISOString(),
              }
            : stall,
        ),
      );

      messageApi.success(
        "混雑状況を更新しました",
      );
    } catch (error: any) {
      console.error(
        "[AllStatusManager] stall crowd update error:",
        error,
      );

      messageApi.error(
        error?.message ||
          "更新に失敗しました",
      );
    } finally {
      setSavingKey(null);
    }
  };

  // =========================================================
  // 模擬店 在庫変更
  // =========================================================

  const updateStallStock = async (
    id: number,
    stockLevel: StockLevel,
  ) => {
    const key = `stall-stock-${id}`;

    if (savingKey) return;

    setSavingKey(key);

    try {
      const { error } = await supabase
        .from("stalls_status")
        .update({
          stock_level: stockLevel,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setStalls((current) =>
        current.map((stall) =>
          stall.id === id
            ? {
                ...stall,
                stock_level:
                  stockLevel,
                updated_at:
                  new Date().toISOString(),
              }
            : stall,
        ),
      );

      messageApi.success(
        "在庫状況を更新しました",
      );
    } catch (error: any) {
      console.error(
        "[AllStatusManager] stall stock update error:",
        error,
      );

      messageApi.error(
        error?.message ||
          "更新に失敗しました",
      );
    } finally {
      setSavingKey(null);
    }
  };

  // =========================================================
  // 展示 混雑変更
  // =========================================================

  const updateExhibitionCrowd =
    async (
      id: number,
      crowdLevel: CrowdLevel,
    ) => {
      const key =
        `exhibition-crowd-${id}`;

      if (savingKey) return;

      setSavingKey(key);

      try {
        const { error } =
          await supabase
            .from(
              "exhibitions_status",
            )
            .update({
              crowd_level:
                crowdLevel,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
          throw error;
        }

        setExhibitions(
          (current) =>
            current.map(
              (exhibition) =>
                exhibition.id === id
                  ? {
                      ...exhibition,
                      crowd_level:
                        crowdLevel,
                      updated_at:
                        new Date().toISOString(),
                    }
                  : exhibition,
            ),
        );

        messageApi.success(
          "展示の混雑状況を更新しました",
        );
      } catch (error: any) {
        console.error(
          "[AllStatusManager] exhibition update error:",
          error,
        );

        messageApi.error(
          error?.message ||
            "更新に失敗しました",
        );
      } finally {
        setSavingKey(null);
      }
    };

  // =========================================================
  // 読み込み中
  // =========================================================

  if (loading) {
    return (
      <>
        {contextHolder}

        <div
          className={
            styles.loading
          }
        >
          <Spin size="large" />
          <p>
            状況を取得しています...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {contextHolder}

      <div
        className={
          styles.container
        }
      >
        {/* ========================= */}
        {/* ヘッダー */}
        {/* ========================= */}

        <div
          className={
            styles.header
          }
        >
          <div>
            <h2
              className={
                styles.title
              }
            >
              全ブース管理
            </h2>

            <p
              className={
                styles.description
              }
            >
              模擬店・展示の状況を
              運営本部から変更できます。
            </p>
          </div>

          <Button
            icon={
              <RefreshRoundedIcon />
            }
            onClick={fetchData}
          >
            再読み込み
          </Button>
        </div>

        {/* ========================= */}
        {/* 模擬店 */}
        {/* ========================= */}

        <section
          className={
            styles.section
          }
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <h3>模擬店</h3>

            <Tag>
              {stalls.length}件
            </Tag>
          </div>

          <div
            className={
              styles.cardList
            }
          >
            {stalls.map(
              (stall) => (
                <Card
                  key={stall.id}
                  className={
                    styles.statusCard
                  }
                >
                  <div
                    className={
                      styles.cardHeader
                    }
                  >
                    <div>
                      <span
                        className={
                          styles.idText
                        }
                      >
                        ID {stall.id}
                      </span>

                      <h4
                        className={
                          styles.name
                        }
                      >
                        {
                          stall.stall_name
                        }
                      </h4>
                    </div>
                  </div>

                  {/* 混雑状況 */}

                  <div
                    className={
                      styles.controlGroup
                    }
                  >
                    <p
                      className={
                        styles.controlTitle
                      }
                    >
                      混雑状況
                    </p>

                    <div
                      className={
                        styles.buttonRow
                      }
                    >
                      {CROWD_OPTIONS.map(
                        (option) => (
                          <Button
                            key={
                              option.value
                            }
                            type={
                              stall.crowd_level ===
                              option.value
                                ? "primary"
                                : "default"
                            }
                            loading={
                              savingKey ===
                              `stall-crowd-${stall.id}`
                            }
                            disabled={
                              !!savingKey &&
                              savingKey !==
                                `stall-crowd-${stall.id}`
                            }
                            onClick={() =>
                              updateStallCrowd(
                                stall.id,
                                option.value,
                              )
                            }
                          >
                            {
                              option.label
                            }
                          </Button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* 在庫状況 */}

                  <div
                    className={
                      styles.controlGroup
                    }
                  >
                    <p
                      className={
                        styles.controlTitle
                      }
                    >
                      在庫状況
                    </p>

                    <div
                      className={
                        styles.buttonRow
                      }
                    >
                      {STOCK_OPTIONS.map(
                        (option) => (
                          <Button
                            key={
                              option.value
                            }
                            type={
                              stall.stock_level ===
                              option.value
                                ? "primary"
                                : "default"
                            }
                            loading={
                              savingKey ===
                              `stall-stock-${stall.id}`
                            }
                            disabled={
                              !!savingKey &&
                              savingKey !==
                                `stall-stock-${stall.id}`
                            }
                            onClick={() =>
                              updateStallStock(
                                stall.id,
                                option.value,
                              )
                            }
                          >
                            {
                              option.label
                            }
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                </Card>
              ),
            )}
          </div>
        </section>

        {/* ========================= */}
        {/* 展示 */}
        {/* ========================= */}

        <section
          className={
            styles.section
          }
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <h3>展示</h3>

            <Tag>
              {
                exhibitions.length
              }
              件
            </Tag>
          </div>

          <div
            className={
              styles.cardList
            }
          >
            {exhibitions.map(
              (exhibition) => (
                <Card
                  key={
                    exhibition.id
                  }
                  className={
                    styles.statusCard
                  }
                >
                  <div
                    className={
                      styles.cardHeader
                    }
                  >
                    <div>
                      <span
                        className={
                          styles.idText
                        }
                      >
                        ID{" "}
                        {
                          exhibition.id
                        }
                      </span>

                      <h4
                        className={
                          styles.name
                        }
                      >
                        {
                          exhibition.exhibition_name
                        }
                      </h4>
                    </div>
                  </div>

                  <div
                    className={
                      styles.controlGroup
                    }
                  >
                    <p
                      className={
                        styles.controlTitle
                      }
                    >
                      混雑状況
                    </p>

                    <div
                      className={
                        styles.buttonRow
                      }
                    >
                      {CROWD_OPTIONS.map(
                        (option) => (
                          <Button
                            key={
                              option.value
                            }
                            type={
                              exhibition.crowd_level ===
                              option.value
                                ? "primary"
                                : "default"
                            }
                            loading={
                              savingKey ===
                              `exhibition-crowd-${exhibition.id}`
                            }
                            disabled={
                              !!savingKey &&
                              savingKey !==
                                `exhibition-crowd-${exhibition.id}`
                            }
                            onClick={() =>
                              updateExhibitionCrowd(
                                exhibition.id,
                                option.value,
                              )
                            }
                          >
                            {
                              option.label
                            }
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                </Card>
              ),
            )}
          </div>
        </section>
      </div>
    </>
  );
}