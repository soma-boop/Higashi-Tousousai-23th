"use client";

import dynamic from "next/dynamic";
import { getPath } from "@/constants/paths";
import { useMapData } from "@/features/map/hooks/useMapData";
import styles from "./MapSection.module.css";
import "@/features/map/components/map.css";

const MapInstance = dynamic(() => import("./MapInstance"), {
  ssr: false,
  loading: () => <div className={styles.loadingDisplay}>Loading Map Engine...</div>,
});

export default function MapSection({ initialPlace }: { initialPlace?: string | null }) {
  const {
    activeIndex,
    setActiveIndex,
    ratio,
    isReady,
    isCurrentlyFullscreen,
    containerRef,
    toggleFullscreen,
    getBounds,
    mapList,
  } = useMapData(initialPlace);

  return (
    <div className="carddiv" style={{ margin: 0 }}>
      <div className="subProp">
        <div className="cardTitle">
          <p>Maps</p>
        </div>
      </div>

      <div className={`card ${styles.mapCard}`} style={{ overflow: "hidden" }}>
        <div className={styles.mapWrapper}>

          <div className={styles.buttonsCell}>
            {mapList.map((map, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`${styles.mapButton} ${
                  activeIndex === index
                    ? styles.mapButtonActive
                    : styles.mapButtonInactive
                }`}
              >
                {map.title}
              </button>
            ))}
          </div>

          <div
            ref={containerRef}
            className={styles.mapContainer}
            style={{ height: "45vh", maxHeight: "450px" }}
          >
            <MapInstance
              activeIndex={activeIndex}
              ratio={ratio}
              src={getPath(mapList[activeIndex].src)}
              bounds={getBounds()}
              toggleFullscreen={toggleFullscreen}
              isFullscreen={isCurrentlyFullscreen}
              isReady={isReady}
              initialPlace={initialPlace}
            />

            {!isReady && (
              <div className={styles.loadingOverlay}>
                Preparing Map Data...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}