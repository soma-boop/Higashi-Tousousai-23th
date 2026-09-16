"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { getPath } from "@/constants/paths";

import styles from "./BoothDetailModal.module.css";

import CloseIcon from "@mui/icons-material/Close";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListIcon from "@mui/icons-material/List";

import { useBoothDetail } from "../hooks/useBoothDetail";

type ProductModalPropsMenu = {
  content: string;
  price: number;
};

export interface BoothItem {
  name: string;
  team?: string;
  place?: string;
  menu?: ProductModalPropsMenu[];
  image?: string;
  image2?: string;
  image_hidden?: string;
}

interface BoothDetailModalProps {
  item: BoothItem;
}

export default function BoothDetailModal({
  item,
}: BoothDetailModalProps) {
  const { t } =
    useTranslation();

  const [imgError, setImgError] =
    React.useState(false);

  const [mounted, setMounted] =
    React.useState(false);

  // ----------------------------------
  // Portalを使える状態にする
  // ----------------------------------

  React.useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  // 画像が変わったらエラー状態解除
  React.useEffect(() => {
    setImgError(false);
  }, [item.image]);

  const {
    show,
    isMenuExpanded,
    setIsMenuExpanded,
    modalRef,
    handleClose,
    handleLocationClick,
    handleShare,
    mapControl,
  } = useBoothDetail(item);

  const isAccordion =
    (item.menu?.length ?? 0) >=
    4;

  const onShare = () => {
    handleShare(
      `${item.name} | 詳細`,
      `${item.name} (${
        item.team || ""
      }) の詳細をチェック`,
    );
  };

  if (!mounted) {
    return null;
  }

  const modal = (
    <div
      className={`${styles.overlay} ${
        show
          ? styles.open
          : ""
      }`}
      onClick={handleClose}
    >
      <div
        className={styles.modal}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className={
            styles.closeBtn
          }
          onClick={handleClose}
          aria-label="閉じる"
        >
          <CloseIcon />
        </button>

        <div
          className={
            styles.scrollArea
          }
          ref={modalRef}
        >
          {!imgError &&
          item.image ? (
            <>
              {/* メイン画像 */}
              <img
                src={getPath(
                  item.image,
                )}
                alt={item.name}
                className={
                  styles.image
                }
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onError={() =>
                  setImgError(
                    true,
                  )
                }
              />

              {/* 背景ぼかし画像 */}
              <img
                src={getPath(
                  item.image,
                )}
                alt=""
                className={
                  styles.imageback
                }
                loading="eager"
                decoding="async"
                aria-hidden="true"
              />
            </>
          ) : (
            <div
              className={
                styles.imagePlaceholder
              }
            >
              <p
                className={
                  styles.placeholderText
                }
              >
                {item.name}
              </p>
            </div>
          )}

          <div
            className={
              styles.content
            }
          >
            <p
              className={
                styles.name
              }
            >
              {item.name}
            </p>

            {item.team && (
              <p
                className={
                  styles.team
                }
              >
                {item.team}
              </p>
            )}

            <div
              className={
                styles.details
              }
            >
              {/* 場所 */}
              {item.place && (
                <div
                  className={`${styles.detailItem} ${
                    mapControl
                      ? styles.clickable
                      : ""
                  }`}
                  onClick={
                    handleLocationClick
                  }
                >
                  <div
                    className={
                      styles.iconWrapper
                    }
                  >
                    <LocationOnOutlinedIcon
                      className={
                        styles.detailIcon
                      }
                    />
                  </div>

                  <div>
                    <div
                      className={
                        styles.detailItemInner
                      }
                    >
                      <p
                        className={
                          styles.value
                        }
                      >
                        {
                          item.place
                        }
                        &ensp;
                      </p>

                      {mapControl && (
                        <p
                          className={
                            styles.mapLink
                          }
                        >
                          {t(
                            "Booth.ViewMap",
                          )}{" "}
                          ↗
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* メニュー */}
              {item.menu &&
                item.menu
                  .length >
                  0 && (
                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <div
                      className={
                        styles.iconWrapper
                      }
                    >
                      <ListIcon
                        className={
                          styles.detailIcon
                        }
                      />
                    </div>

                    <div
                      className={
                        styles.menuContainer
                      }
                    >
                      {isAccordion ? (
                        <>
                          <div
                            className={
                              styles.accordionHeader
                            }
                            onClick={() =>
                              setIsMenuExpanded(
                                !isMenuExpanded,
                              )
                            }
                          >
                            <p
                              className={
                                styles.value
                              }
                            >
                              {t(
                                "Booth.ViewMenu",
                              )}{" "}
                              (
                              {
                                item
                                  .menu
                                  .length
                              }
                              件)
                            </p>

                            <ExpandMoreIcon
                              className={`${styles.accordionIcon} ${
                                isMenuExpanded
                                  ? styles.expanded
                                  : ""
                              }`}
                            />
                          </div>

                          <div
                            className={`${styles.accordionContent} ${
                              isMenuExpanded
                                ? styles.expanded
                                : ""
                            }`}
                          >
                            <div
                              className={
                                styles.menuGrid
                              }
                            >
                              {item.menu.map(
                                (
                                  menuItem,
                                  index,
                                ) => (
                                  <React.Fragment
                                    key={
                                      index
                                    }
                                  >
                                    <span
                                      className={
                                        styles.value
                                      }
                                    >
                                      {
                                        menuItem.content
                                      }
                                    </span>

                                    <span
                                      className={`${styles.value} ${styles.menuPrice}`}
                                    >
                                      {
                                        menuItem.price
                                      }
                                      円
                                    </span>
                                  </React.Fragment>
                                ),
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div
                          className={
                            styles.menuGrid
                          }
                        >
                          {item.menu.map(
                            (
                              menuItem,
                              index,
                            ) => (
                              <React.Fragment
                                key={
                                  index
                                }
                              >
                                <span
                                  className={
                                    styles.value
                                  }
                                >
                                  {
                                    menuItem.content
                                  }
                                </span>

                                <span
                                  className={`${styles.value} ${styles.menuPrice}`}
                                >
                                  {
                                    menuItem.price
                                  }
                                  円
                                </span>
                              </React.Fragment>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* 共有 */}
            <div
              className={
                styles.actionButtons
              }
            >
              <button
                className={
                  styles.shareBtn
                }
                onClick={
                  onShare
                }
              >
                <ShareOutlinedIcon
                  className={
                    styles.detailIcon
                  }
                  style={{
                    color:
                      "inherit",
                  }}
                />

                {t(
                  "Booth.Share",
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 親レイアウトの影響を受けないよう
  // body直下に表示
  return createPortal(
    modal,
    document.body,
  );
}