"use client";

import React, {
  Suspense,
  useMemo,
  useState,
  useEffect,
} from "react";

import {
  Tabs,
  Button,
  App as AntdApp,
  Space,
} from "antd";

import "@/styles/global-app.css";

import Menu from "@/components/Layout/menu";
import BottomNavigator from "@/components/Layout/Bottom";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import { useMapControl } from "@/contexts/MapContext";
import AspectDetector from "@/hooks/useAspectDetector";
import useColumnDetector from "@/hooks/useColumnDetector";
import { TabSelector } from "@/features/main/hooks/useTabSelector";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";

import MapRoundedIcon from "@mui/icons-material/MapRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import PollIcon from "@mui/icons-material/Poll";
import RefreshIcon from "@mui/icons-material/Refresh";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import styles from "./AdminView.module.css";

// =========================================================
// Lazy Components
// =========================================================

const NewsManager = React.lazy(
  () =>
    import(
      "@/features/news/components/NewsManager"
    ),
);

const BoothManager = React.lazy(
  () =>
    import(
      "@/features/booth/components/BoothManager"
    ),
);

const LostManager = React.lazy(
  () =>
    import(
      "@/features/lost/components/LostManager"
    ),
);

const QAManager = React.lazy(
  () =>
    import(
      "@/features/qa/components/QAManager"
    ),
);

const MapModal = React.lazy(
  () =>
    import(
      "@/features/map/components/MapModal"
    ),
);

const NewsStatus = React.lazy(
  () =>
    import(
      "@/features/news/components/NewsStatus"
    ),
);

const VoteAdmin = React.lazy(
  () =>
    import(
      "@/features/vote/components/VoteAdmin"
    ),
);

const BoothQRManager = React.lazy(
  () =>
    import(
      "@/features/booth/components/BoothQRManager"
    ),
);

// 展示QR管理
const ExhibitionQRManager =
  React.lazy(
    () =>
      import(
        "./ExhibitionQRManager"
      ),
  );

// 全ブース管理
const AllStatusManager =
  React.lazy(
    () =>
      import(
        "./AllStatusManager"
      ),
  );

const ServerStatus = React.lazy(
  () =>
    import(
      "@/features/admin/components/ServerStatus"
    ),
);

import Settings from "@/components/Misc/Settings";

// =========================================================
// Fallback
// =========================================================

const FallbackLoader = ({
  text = "Loading...",
}: {
  text?: string;
}) => (
  <div
    className={
      styles.fallbackLoader
    }
  >
    {text}
  </div>
);

// =========================================================
// AdminView
// =========================================================

export default function AdminView() {
  const isMobile =
    AspectDetector();

  const columns =
    useColumnDetector();

  const {
    isAdmin,
    isStallAdmin,
  } = useRole();

  const {
    api: {
      fetchData,
      isLoading,
    },
  } = useData();

  const { message } =
    AntdApp.useApp();

  const mapControl =
    useMapControl();

  const [
    activeTab,
    setActiveTab,
  ] = useState("1");

  const [
    subTab,
    setSubTab,
  ] = useState("0");

  const [
    isMoving,
    setIsMoving,
  ] = useState(false);

  const isMapOpen =
    mapControl?.isMapOpen ||
    false;

  const setIsMapOpen = (
    open: boolean,
  ) =>
    open
      ? mapControl?.openMap()
      : mapControl?.closeMap();

  // =========================================================
  // Mobile tab position control
  // =========================================================

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    if (
      isStallAdmin ||
      activeTab === "1" ||
      activeTab === "2"
    ) {
      TabSelector(
        Number(subTab),
      );

      return;
    }

    if (
      activeTab === "3" ||
      activeTab === "5" ||
      activeTab === "6" ||
      activeTab === "7"
    ) {
      const canvas =
        document.getElementById(
          "canvas",
        );

      if (canvas) {
        canvas.style.left =
          "0";
      }
    }
  }, [
    isMobile,
    activeTab,
    subTab,
    isStallAdmin,
  ]);

  // =========================================================
  // Manual refresh
  // =========================================================

  const handleManualRefresh =
    async () => {
      try {
        await fetchData();

        message.success(
          "最新データを取得しました",
        );
      } catch (error) {
        console.error(
          "[AdminView] Refresh failed",
          error,
        );

        message.error(
          "更新に失敗しました",
        );
      }
    };

  // =========================================================
  // Layout
  // =========================================================

  const layout =
    useMemo(() => {
      const managers = {
        News: (
          <Suspense
            key="news-mgr"
            fallback={
              <FallbackLoader />
            }
          >
            <NewsManager />
          </Suspense>
        ),

        QA: (
          <Suspense
            key="qa-mgr"
            fallback={
              <FallbackLoader />
            }
          >
            <QAManager />
          </Suspense>
        ),

        Lost: (
          <Suspense
            key="lost-mgr"
            fallback={
              <FallbackLoader />
            }
          >
            <LostManager />
          </Suspense>
        ),

        Booth: (
          <Suspense
            key="booth-mgr"
            fallback={
              <FallbackLoader />
            }
          >
            <BoothManager />
          </Suspense>
        ),

        QR: (
          <Suspense
            key="qr-mgr"
            fallback={
              <FallbackLoader />
            }
          >
            <BoothQRManager />
          </Suspense>
        ),

        ExhibitionQR: (
          <Suspense
            key="exhibition-qr-mgr"
            fallback={
              <FallbackLoader />
            }
          >
            <ExhibitionQRManager />
          </Suspense>
        ),

        AllStatus: (
          <Suspense
            key="all-status-mgr"
            fallback={
              <FallbackLoader text="ブース状況を読み込んでいます..." />
            }
          >
            <AllStatusManager />
          </Suspense>
        ),

        NewsStatus: (
          <Suspense
            key="news-status-mgr"
            fallback={
              <FallbackLoader />
            }
          >
            <NewsStatus />
          </Suspense>
        ),

        Status: (
          <Suspense
            key="status-mgr"
            fallback={
              <FallbackLoader />
            }
          >
            <ServerStatus />
          </Suspense>
        ),

        Settings: (
          <Settings
            key="settings-mgr"
          />
        ),
      };

      // =====================================================
      // 模擬店責任者
      // =====================================================

      if (isStallAdmin) {
        if (isMobile) {
          return [
            [
              managers.Booth,
            ],
            [
              managers.NewsStatus,
            ],
          ];
        }

        if (
          columns >= 3
        ) {
          return [
            [
              managers.Booth,
            ],
            [
              managers.NewsStatus,
            ],
            [],
          ];
        }

        return [
          [
            managers.Booth,
          ],
          [
            React.cloneElement(
              managers.NewsStatus as React.ReactElement,
              {
                key:
                  "news-status-col",
              },
            ),
          ],
        ];
      }

      // =====================================================
      // 1: 管理ダッシュボード
      // =====================================================

      if (
        activeTab === "1"
      ) {
        if (isMobile) {
          return [
            [
              managers.News,
            ],
            [
              managers.QA,
            ],
            [
              managers.Lost,
            ],
            [
              managers.Settings,
            ],
          ];
        }

        if (
          columns >= 3
        ) {
          return [
            [
              managers.News,
            ],
            [
              managers.QA,
            ],
            [
              managers.Lost,
            ],
          ];
        }

        return [
          [
            managers.News,
          ],
          [
            React.cloneElement(
              managers.Lost as React.ReactElement,
              {
                key:
                  "lost-col",
              },
            ),
          ],
        ];
      }

      // =====================================================
      // 2: 投票集計
      // =====================================================

      if (
        activeTab === "2"
      ) {
        if (isMobile) {
          return [
            [
              <VoteAdmin
                key="stall"
                filterCategory="s"
              />,
            ],
            [
              <VoteAdmin
                key="exhibition"
                filterCategory="e"
              />,
            ],
            [
              <VoteAdmin
                key="other"
                filterCategory="o"
              />,
            ],
          ];
        }

        if (
          columns >= 3
        ) {
          return [
            [
              <VoteAdmin
                key="stall"
                filterCategory="s"
              />,
            ],
            [
              <VoteAdmin
                key="exhibition"
                filterCategory="e"
              />,
            ],
            [
              <VoteAdmin
                key="other"
                filterCategory="o"
              />,
            ],
          ];
        }

        return [
          [
            <VoteAdmin
              key="stall"
              filterCategory="s"
            />,

            <VoteAdmin
              key="exhibition"
              filterCategory="e"
            />,
          ],
          [
            <VoteAdmin
              key="other"
              filterCategory="o"
            />,
          ],
        ];
      }

      // =====================================================
      // 4 PC / 3 Mobile: 模擬店QR
      // =====================================================

      if (
        activeTab === "4" ||
        (
          isMobile &&
          activeTab ===
            "3"
        )
      ) {
        return [
          [
            managers.QR,
          ],
        ];
      }

      // =====================================================
      // 6: 展示QR
      // =====================================================

      if (
        activeTab === "6"
      ) {
        return [
          [
            managers.ExhibitionQR,
          ],
        ];
      }

      // =====================================================
      // 7: 全ブース管理
      // =====================================================

      if (
        activeTab === "7"
      ) {
        return [
          [
            managers.AllStatus,
          ],
        ];
      }

      // =====================================================
      // 5: サーバー
      // =====================================================

      if (
        activeTab === "5"
      ) {
        return [
          [
            managers.Status,
          ],
        ];
      }

      return [[]];
    }, [
      isMobile,
      columns,
      isStallAdmin,
      activeTab,
    ]);

  // =========================================================
  // Tabs
  // =========================================================

  const tabItems = [
    // -------------------------------------------------------
    // Dashboard
    // -------------------------------------------------------

    {
      key: "1",

      label: (
        <Space>
          <SettingsIcon
            className={
              styles.tabIcon
            }
            style={{
              fontSize:
                isMobile
                  ? "16px"
                  : "18px",
            }}
          />

          {isMobile
            ? "管理"
            : "ダッシュボード"}
        </Space>
      ),
    },

    // -------------------------------------------------------
    // Vote
    // -------------------------------------------------------

    {
      key: "2",

      label: (
        <Space>
          <PollIcon
            className={
              styles.tabIcon
            }
            style={{
              fontSize:
                isMobile
                  ? "16px"
                  : "18px",
            }}
          />

          {isMobile
            ? "集計"
            : "投票集計"}
        </Space>
      ),
    },

    // -------------------------------------------------------
    // All status manager
    // -------------------------------------------------------

    {
      key: "7",

      label: (
        <Space>
          <StorefrontRoundedIcon
            className={
              styles.tabIcon
            }
            style={{
              fontSize:
                isMobile
                  ? "16px"
                  : "18px",
            }}
          />

          {isMobile
            ? "状況管理"
            : "全ブース管理"}
        </Space>
      ),
    },

    // -------------------------------------------------------
    // Booth QR
    // -------------------------------------------------------

    {
      key:
        isMobile
          ? "3"
          : "4",

      label: (
        <Space>
          <QrCodeIcon
            className={
              styles.tabIcon
            }
            style={{
              fontSize:
                isMobile
                  ? "16px"
                  : "18px",
            }}
          />

          {isMobile
            ? "模擬店QR"
            : "模擬店QR生成"}
        </Space>
      ),
    },

    // -------------------------------------------------------
    // Exhibition QR
    // -------------------------------------------------------

    {
      key: "6",

      label: (
        <Space>
          <QrCodeIcon
            className={
              styles.tabIcon
            }
            style={{
              fontSize:
                isMobile
                  ? "16px"
                  : "18px",
            }}
          />

          {isMobile
            ? "展示QR"
            : "展示QR生成"}
        </Space>
      ),
    },

    // -------------------------------------------------------
    // Server
    // -------------------------------------------------------

    {
      key: "5",

      label: (
        <Space>
          <CloudQueueIcon
            className={
              styles.tabIcon
            }
            style={{
              fontSize:
                isMobile
                  ? "16px"
                  : "18px",
            }}
          />

          サーバー
        </Space>
      ),
    },
  ];

  // =========================================================
  // Bottom Navigation
  // =========================================================

  const showBottomNav =
    isMobile &&
    (
      isStallAdmin ||
      activeTab === "1" ||
      activeTab === "2"
    );

  // =========================================================
  // Render
  // =========================================================

  return (
    <div
      className={`mainCanvas ${styles.adminView}`}
    >
      {/* Map */}

      <Suspense
        fallback={null}
      >
        <MapModal
          isOpen={
            isMapOpen
          }
          onClose={() =>
            setIsMapOpen(
              false,
            )
          }
          targetPlace={
            mapControl?.targetPlace
          }
        />
      </Suspense>

      {/* =================================================== */}
      {/* Admin header */}
      {/* =================================================== */}

      {isAdmin && (
        <div
          className={`${styles.header} ${
            isMobile
              ? styles.headerMobile
              : styles.headerDesktop
          }`}
        >
          <Tabs
            activeKey={
              activeTab
            }
            onChange={(
              value,
            ) => {
              setActiveTab(
                value,
              );

              setSubTab("0");

              if (
                isMobile
              ) {
                setIsMoving(
                  true,
                );

                setTimeout(
                  () =>
                    setIsMoving(
                      false,
                    ),
                  100,
                );
              }
            }}
            items={
              tabItems
            }
            size={
              isMobile
                ? "middle"
                : "large"
            }
            tabBarStyle={{
              marginBottom: 0,
              fontWeight:
                "bold",
            }}
          />

          <Space
            size="middle"
          >
            <Button
              icon={
                <RefreshIcon
                  style={{
                    fontSize:
                      "16px",
                  }}
                />
              }
              onClick={
                handleManualRefresh
              }
              loading={
                isLoading
              }
              type="text"
            >
              {!isMobile &&
                "全体更新"}
            </Button>
          </Space>
        </div>
      )}

      {/* =================================================== */}
      {/* Contents */}
      {/* =================================================== */}

      <div
        className={
          styles.contentWrapper
        }
      >
        <div
          className={
            isMobile
              ? "canvas"
              : "PCCanvas"
          }
          id={
            isMobile
              ? "canvas"
              : undefined
          }
          style={
            isMobile
              ? {
                  width: `${
                    layout.length *
                    100
                  }%`,
                }
              : activeTab ===
                    "4" ||
                  activeTab ===
                    "6" ||
                  activeTab ===
                    "7" ||
                  (
                    isMobile &&
                    activeTab ===
                      "3"
                  )
                ? {
                    margin: 0,
                    width:
                      "100%",
                  }
                : undefined
          }
        >
          {layout.map(
            (
              column,
              index,
            ) => (
              <PCCanvasColumn
                key={
                  index
                }
                width={
                  isMobile
                    ? "100%"
                    : `${
                        100 /
                        layout.length
                      }%`
                }
              >
                {column}
              </PCCanvasColumn>
            ),
          )}

          {/* Desktop map button */}

          {!isMobile && (
            <button
              className="map-float-btn"
              onClick={() =>
                setIsMapOpen(
                  true,
                )
              }
            >
              <MapRoundedIcon
                style={{
                  fontSize:
                    "48px",
                }}
              />

              <span
                style={{
                  fontSize:
                    "16px",
                  fontWeight:
                    "bold",
                }}
              >
                MAP
              </span>
            </button>
          )}
        </div>
      </div>

      {!isMobile && (
        <Menu />
      )}

      {/* =================================================== */}
      {/* Mobile Bottom Navigator */}
      {/* =================================================== */}

      {showBottomNav && (
        <div
          className="bottomCanvas"
        >
          <BottomNavigator
            mode={
              isStallAdmin
                ? "booth"
                : activeTab ===
                    "1"
                  ? "admin"
                  : "vote"
            }
            value={
              subTab
            }
            setValue={
              setSubTab
            }
            isMoving={
              isMoving
            }
            setIsMoving={
              setIsMoving
            }
            disabled={
              isMapOpen
            }
          />

          <button
            className="map-float-btn"
            onClick={() =>
              setIsMapOpen(
                true,
              )
            }
            style={{
              zIndex: 1000,
            }}
          >
            <MapRoundedIcon
              style={{
                fontSize:
                  "28px",
              }}
            />

            <span
              style={{
                fontSize:
                  "10px",
                fontWeight:
                  "bold",
              }}
            >
              MAP
            </span>
          </button>
        </div>
      )}
    </div>
  );
}