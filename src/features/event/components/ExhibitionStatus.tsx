"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  CardBase,
  CardInside,
  SubList,
  Divider,
} from "@/components/Layout/CardComp";

import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { useBoothStatus } from "@/features/booth/hooks/useBoothStatus";
import { commonStyles as cStyles } from "@/features/booth/components/BoothCommon";

import { loadJSON } from "@/lib/Data/JSONLoader";
import { Exhibition } from "@/features/map/hooks/useSpotInfo";

import { useFavorites } from "@/features/booth/hooks/useFavorites";
import useAspectDetector from "@/hooks/useAspectDetector";

import {
  ExhibitionCrowdLevel,
  fetchAllExhibitionStatuses,
} from "@/features/exhibition/api";

import { motion, AnimatePresence } from "framer-motion";

import styles from "@/features/vote/components/VoteStatus.module.css";

type CrowdMap = Record<number, ExhibitionCrowdLevel>;

const getCrowdInfo = (
  level: ExhibitionCrowdLevel | undefined,
) => {
  switch (level) {
    case 0:
      return {
        label: "空いている",
        color: "#34a853",
      };

    case 1:
      return {
        label: "やや混雑",
        color: "#f9ab00",
      };

    case 2:
      return {
        label: "混雑",
        color: "#ea4335",
      };

    default:
      return {
        label: "確認中",
        color: "#999999",
      };
  }
};

export default function ExhibitionStatus() {
  const { t } = useTranslation();

  const [exhibitions, setExhibitions] =
    useState<Exhibition[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [crowdStatuses, setCrowdStatuses] =
    useState<CrowdMap>({});

  const { handleStallClick } =
    useBoothStatus();

  const {
    mounted,
  } = useFavorites();

  const isMobile =
    useAspectDetector();

  const [isExpanded, setIsExpanded] =
    useState(false);

  // PCでは折りたたみ
  // Mobileでは最初から展開
  useEffect(() => {
    setIsExpanded(isMobile);
  }, [isMobile]);

  // 展示基本情報をJSONから取得
  useEffect(() => {
    loadJSON("exhibitions")
      .then((data) => {
        setExhibitions(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.warn(
          "[ExhibitionStatus] exhibitions.json could not be loaded",
          error,
        );

        setExhibitions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Supabaseから混雑状況取得
  useEffect(() => {
    let active = true;

    const loadCrowdStatuses =
      async () => {
        try {
          const statuses =
            await fetchAllExhibitionStatuses();

          if (!active) {
            return;
          }

          const next: CrowdMap = {};

          statuses.forEach(
            (status) => {
              next[status.id] =
                status.crowd_level;
            },
          );

          setCrowdStatuses(next);
        } catch (error) {
          console.warn(
            "[ExhibitionStatus] crowd status could not be loaded",
            error,
          );
        }
      };

    // 最初に1回取得
    loadCrowdStatuses();

    // 30秒ごとに更新
    const timer =
      window.setInterval(
        loadCrowdStatuses,
        30000,
      );

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <CardBase
      title={t(
        "CardTitles.EXHIBITIONS",
        "展示一覧",
      )}
      disableTapAnimation={true}
    >
      <CardInside>
        <AnimatePresence
          initial={false}
          mode="wait"
        >
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={() =>
                setIsExpanded(true)
              }
              className={
                styles.container
              }
            >
              <div
                className={
                  styles.iconWrapper
                }
              >
                <VisibilityRoundedIcon
                  className={
                    styles.voteIcon
                  }
                />
              </div>

              <div
                className={
                  styles.contentWrapper
                }
              >
                <h4
                  className={
                    styles.titleText
                  }
                >
                  展示一覧を見る
                </h4>

                <p
                  className={
                    styles.descText
                  }
                >
                  {isLoading
                    ? "確認中..."
                    : exhibitions.length >
                        0
                      ? `全 ${exhibitions.length} 件`
                      : "展示情報はありません"}
                </p>
              </div>

              <ExpandMoreIcon
                className={
                  styles.arrowIcon
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              style={{
                overflow: "hidden",
              }}
            >
              {!isMobile && (
                <div
                  onClick={() =>
                    setIsExpanded(
                      false,
                    )
                  }
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    cursor:
                      "pointer",
                    padding: "10px",
                    color:
                      "var(--text-sub-color)",
                    fontSize:
                      "12px",
                    fontWeight:
                      "bold",
                  }}
                >
                  折りたたむ
                  <ExpandLessIcon
                    fontSize="small"
                  />
                </div>
              )}

              {isLoading ||
              !mounted ? (
                <SubList>
                  <p
                    style={{
                      textAlign:
                        "center",
                      color:
                        "#999",
                      width:
                        "100%",
                    }}
                  >
                    Loading...
                  </p>
                </SubList>
              ) : exhibitions.length >
                0 ? (
                exhibitions.map(
                  (
                    exhibition,
                    index,
                  ) => {
                    const crowd =
                      getCrowdInfo(
                        crowdStatuses[
                          Number(
                            exhibition.id,
                          )
                        ],
                      );

                    return (
                      <motion.div
                        key={
                          exhibition.id
                        }
                        layout
                        initial={{
                          opacity: 0,
                          y: 30,
                          scale: 0.8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -30,
                          scale: 0.8,
                          transition: {
                            duration:
                              0.1,
                          },
                        }}
                        transition={{
                          layout: {
                            type: "spring",
                            stiffness:
                              500,
                            damping: 40,
                          },
                          opacity: {
                            delay:
                              index *
                              0.02,
                            duration:
                              0.25,
                          },
                          y: {
                            delay:
                              index *
                              0.02,
                            duration:
                              0.25,
                          },
                          scale: {
                            delay:
                              index *
                              0.02,
                            duration:
                              0.25,
                          },
                        }}
                      >
                        {index !==
                          0 && (
                          <Divider
                            margin="8px 0"
                            height="1px"
                          />
                        )}

                        <div
                          className={
                            cStyles.stallRow
                          }
                          onClick={() =>
                            handleStallClick(
                              exhibition.name,
                            )
                          }
                        >
                          <div
                            className={
                              cStyles.stallInfo
                            }
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "space-between",
                                gap: "12px",
                                width:
                                  "100%",
                              }}
                            >
                              <span
                                className={
                                  cStyles.stallNameContainer
                                }
                              >
                                {
                                  exhibition.name
                                }
                              </span>

                              <span
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "5px",
                                  flexShrink: 0,
                                  fontSize:
                                    "0.78em",
                                  fontWeight:
                                    600,
                                  color:
                                    crowd.color,
                                }}
                              >
                                <span
                                  style={{
                                    width:
                                      "8px",
                                    height:
                                      "8px",
                                    borderRadius:
                                      "50%",
                                    backgroundColor:
                                      crowd.color,
                                    display:
                                      "inline-block",
                                  }}
                                />

                                {
                                  crowd.label
                                }
                              </span>
                            </div>

                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                alignItems:
                                  "center",
                                width:
                                  "100%",
                              }}
                            >
                              <span
                                className={
                                  cStyles.stallDetails
                                }
                              >
                                {t(
                                  "Booth.Details",
                                )}
                              </span>

                              <span
                                style={{
                                  fontSize:
                                    "0.8em",
                                  color:
                                    "var(--text-sub-color)",
                                }}
                              >
                                {
                                  exhibition.team
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  },
                )
              ) : (
                <SubList>
                  <p
                    style={{
                      textAlign:
                        "center",
                      color:
                        "#999",
                      width:
                        "100%",
                    }}
                  >
                    {t(
                      "Booth.NoData",
                    )}
                  </p>
                </SubList>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardInside>
    </CardBase>
  );
}