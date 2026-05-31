"use client";

import React, { Suspense, useMemo } from "react";
import "@/styles/global-app.css";
import { useUserView } from "@/features/main/hooks/useUserView";
import { calculateLayout } from "@/features/main/utils/layoutUtils";
import { CUSTOM_CONFIG } from "@/constants/custom.config";
import { useTranslation } from "react-i18next";
import { useData } from "@/contexts/DataContext";
import { Drawer } from "vaul";
import { usePathname } from "next/navigation";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import Settings from "@/components/Misc/Settings";

import Menu from "@/components/Layout/menu";
import Header from "@/components/Layout/Header";
import InfoHeader from "@/components/Layout/InfoHeader";
import BottomNavigator from "@/components/Layout/Bottom";
import EventStatus from "@/features/event/components/EventStatus";
import VoteStatus from "@/features/vote/components/VoteStatus";
import BoothStatus from "@/features/booth/components/BoothStatus";
import BoothStatusFavorite from "@/features/booth/components/BoothStatusFavorite";
import ExhibitionStatus from "@/features/event/components/ExhibitionStatus";
import NewsStatus from "@/features/news/components/NewsStatus";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import Homepage from "@/components/Layout/Homepage";
import styles from "./UserView.module.css";
import ClosedView from "@/app/_components/ClosedView";

const BusStatus = React.lazy(() => import("@/features/bus/components/BusStatus"));
const LostStatus = React.lazy(() => import("@/features/lost/components/LostStatus"));
const QAStatus = React.lazy(() => import("@/features/qa/components/QAStatus"));
const MapModal = React.lazy(() => import("@/features/map/components/MapModal"));
const SpotStatus = React.lazy(() => import("@/features/map/components/SpotStatus"));
const AppShare = React.lazy(() => import("@/components/Layout/AppShare"));
const BoothModalManager = React.lazy(() => import("@/features/booth/components/BoothModalManager"));

const FallbackLoader = ({ text = "Loading..." }) => <div className={styles.fallbackLoader}>{text}</div>;

export default function UserView() {
  const { t } = useTranslation();
  const {
    api: { fetchedData },
  } = useData();
  const pathname = usePathname();
  const [showClosedOverlay, setShowClosedOverlay] = React.useState(CUSTOM_CONFIG.features.closedOverlay);
  const {
    isMobile,
    columns,
    isAdmin,
    isStallAdmin,
    tabValue,
    setTabValue,
    isMoving,
    setIsMoving,
    isMapOpen,
    setIsMapOpen,
    hasHotNews,
    hotTime,
    targetPlace,
    isSettingsOpen,
    setIsSettingsOpen,
    hasVotedBoth,
  } = useUserView();

  const isMaintenance = fetchedData?.config?.maintenance_mode === 1;
  const showMaintenance = isMaintenance && !isAdmin && !isStallAdmin;

  const isEventDay = useMemo(() => {
    if (pathname?.startsWith("/demo")) return true;
    const now = dayjs();
    const start = dayjs(CUSTOM_CONFIG.identity.eventStartDate).startOf("day");
    const end = dayjs(CUSTOM_CONFIG.identity.eventEndDate).endOf("day");
    return now.isAfter(start) && now.isBefore(end);
  }, [pathname]);

  const cards = useMemo(
    () => ({
      Spot: null,
      HotNews: (hasHotNews && CUSTOM_CONFIG.features.news) ? <NewsStatus key="hotnews" onlyHot={true} hotTime={hotTime} /> : null,
      Events: (CUSTOM_CONFIG.features.event && isEventDay) ? <EventStatus key="events" /> : null,
      Vote: CUSTOM_CONFIG.features.vote ? <VoteStatus key="vote" /> : null,
      Exhibition: CUSTOM_CONFIG.features.exhibition ? <ExhibitionStatus key="exhibition" /> : null,
      BoothFav: <BoothStatusFavorite key="boothfav" />,
      Booth: <BoothStatus key="booth" />,
      Booth1: <BoothStatus key="booth1" split="first" />,
      Booth2: <BoothStatus key="booth2" split="second" />,
      News: CUSTOM_CONFIG.features.news ? <NewsStatus key="news" /> : null,
      Bus: (CUSTOM_CONFIG.features.bus && isEventDay) ? (
        <Suspense key="bus" fallback={<FallbackLoader text="Loading Bus..." />}>
          <BusStatus />
        </Suspense>
      ) : null,
      QA: CUSTOM_CONFIG.features.qa ? (
        <Suspense key="qa" fallback={<FallbackLoader text="Loading Q&A..." />}>
          <QAStatus />
        </Suspense>
      ) : null,
      Lost: CUSTOM_CONFIG.features.lost ? (
        <Suspense key="lost" fallback={<FallbackLoader text="Loading Lost..." />}>
          <LostStatus />
        </Suspense>
      ) : null,
      Header: <Header key="header" />,
      InfoTitle: <InfoHeader key="info-header" onSettingsClick={() => setIsSettingsOpen(true)} />,
      Homepage: <Homepage key="homepage" />,
    }),
    [hasHotNews, hotTime, setIsSettingsOpen],
  );

  const layout = useMemo(() => {
    return calculateLayout(cards, { isMobile, columns, isStallAdmin, hasVotedBoth });
  }, [cards, isMobile, columns, isStallAdmin, hasVotedBoth]);

  if (showMaintenance) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          inset: "0",
          position: "absolute",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          textAlign: "center",
          backgroundColor: CUSTOM_CONFIG.theme.primaryColor.light,
        }}
      >
        <h2 style={{ color: CUSTOM_CONFIG.theme.primaryColor.dark }}>
          <BuildRoundedIcon style={{ fontSize: "16px", marginRight: "8px" }} />
          Maintenance
        </h2>
        <p style={{ marginTop: "10px", color: CUSTOM_CONFIG.theme.primaryColor.dark }}>
          ただいまメンテナンス中です。
          <br />
          しばらくしてから再度アクセスしてください。
        </p>
      </div>
    );
  }

  return (
    <div className="mainCanvas">
      <AnimatePresence>
        {CUSTOM_CONFIG.features.closedOverlay && showClosedOverlay && (
          <motion.div
            key="closed-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 20000, position: "fixed", inset: 0 }}
          >
            <ClosedView onClose={() => setShowClosedOverlay(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        {CUSTOM_CONFIG.features.map && (
          <>
            <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} targetPlace={targetPlace} />
            <BoothModalManager />
            <SpotStatus />
          </>
        )}
      </Suspense>

      <Drawer.Root open={isSettingsOpen} onOpenChange={setIsSettingsOpen} modal={false}>
        <Drawer.Portal>
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onPointerDown={() => setIsSettingsOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(4px)",
                  zIndex: 10001,
                  pointerEvents: "auto",
                  cursor: "pointer",
                }}
              />
            )}
          </AnimatePresence>

          <Drawer.Content
            style={{
              backgroundColor: "var(--mainCanvas-color)",
              display: "flex",
              flexDirection: "column",
              borderRadius: "24px 24px 0 0",
              height: "auto",
              maxHeight: "85vh",
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10002,
              padding: "20px",
              paddingTop: "10px",
              outline: "none",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                borderRadius: "2px",
                backgroundColor: "rgba(128, 128, 128, 0.3)",
                margin: "0 auto 15px",
                flexShrink: 0,
              }}
            />
            <div style={{ overflowY: "auto", paddingBottom: "30px" }}>
              <Drawer.Title
                style={{
                  margin: "0 0 20px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "var(--text-color)",
                }}
              >
                {t("CardTitles.SETTINGS", "設定")}
              </Drawer.Title>
              <Drawer.Description style={{ display: "none" }}>アプリケーションの設定を変更します。</Drawer.Description>
              <Settings />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {!isMobile && (
        <div className="PCCanvas">
          {layout.map((column, i) => (
            <PCCanvasColumn key={i} width={`${100 / layout.length}%`}>
              {column}
            </PCCanvasColumn>
          ))}
          <AppShare />
          <button className="map-float-btn" onClick={() => setIsMapOpen(true)}>
            <MapRoundedIcon className={styles.mapFloatIcon} />
            <span className={styles.mapFloatText}>MAP</span>
          </button>
          <Menu />
          <div style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            opacity: 0.5,
            fontSize: "15px",
            color: "var(--text-color)",
            zIndex: 1000,
            pointerEvents: "none"
          }}>
            Powered by <a href="https://github.com/rsu-Suba/FesTime" target="_blank" rel="noreferrer" style={{color: "inherit", textDecoration: "underline", pointerEvents: "auto"}}>FesTime</a>
          </div>
        </div>
      )}

      {isMobile && (
        <>
          <div className="canvas" id="canvas" style={{ width: `${layout.length * 100}%` }}>
            {layout.map((column, i) => (
              <PCCanvasColumn key={i}>
                {column}
                {i === 0 && (
                  <div style={{ 
                    textAlign: "center", 
                    padding: "20px 0 100px", 
                    opacity: 0.5, 
                    fontSize: "13px",
                    color: "var(--text-color)" 
                  }}>
                    Powered by <a href="https://github.com/rsu-Suba/FesTime" target="_blank" rel="noreferrer" style={{color: "inherit", textDecoration: "underline"}}>FesTime</a>
                  </div>
                )}
              </PCCanvasColumn>
            ))}
          </div>
          <div className="bottomCanvas">
            <BottomNavigator
              mode={isStallAdmin ? "booth" : "user"}
              value={tabValue}
              setValue={setTabValue}
              isMoving={isMoving}
              setIsMoving={setIsMoving}
              disabled={isMapOpen}
            />
            <button className="map-float-btn" onClick={() => setIsMapOpen(true)}>
              <MapRoundedIcon className={styles.mapFloatIconMobile} />
              <span className={styles.mapFloatTextMobile}>MAP</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
