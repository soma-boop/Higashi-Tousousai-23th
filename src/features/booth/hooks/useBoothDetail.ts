"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useMapControl } from "@/contexts/MapContext";
import { BoothItem } from "../components/BoothDetailModal";

export function useBoothDetail(
  item: BoothItem,
) {
  const [show, setShow] =
    useState(false);

  const [
    isMenuExpanded,
    setIsMenuExpanded,
  ] = useState(false);

  const [
    showHidden,
    setShowHidden,
  ] = useState(false);

  const mapControl =
    useMapControl();

  const modalRef =
    useRef<HTMLDivElement>(
      null,
    );

  // ----------------------------------
  // モーダルを表示
  // ----------------------------------

  useEffect(() => {
    const frame =
      requestAnimationFrame(
        () => {
          setShow(true);
        },
      );

    mapControl?.setProductModalOpen(
      true,
    );

    return () => {
      cancelAnimationFrame(
        frame,
      );

      mapControl?.setProductModalOpen(
        false,
      );
    };
  }, []);

  // ----------------------------------
  // 隠し画像
  // ----------------------------------

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    const hidden =
      params.get(
        "hidden",
      ) === "true";

    if (hidden) {
      setShowHidden(true);
      return;
    }

    if (
      item.image_hidden &&
      Math.random() <
        0.35
    ) {
      setShowHidden(true);
    }
  }, [
    item.name,
    item.image_hidden,
  ]);

  // ----------------------------------
  // メニュー展開
  // ----------------------------------

  useEffect(() => {
    if (
      !isMenuExpanded ||
      !modalRef.current
    ) {
      return;
    }

    const scrollTarget =
      modalRef.current;

    const timer =
      window.setTimeout(
        () => {
          scrollTarget.scrollTo(
            {
              top:
                scrollTarget.scrollHeight,
              behavior:
                "smooth",
            },
          );
        },
        100,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [isMenuExpanded]);

  // ----------------------------------
  // URLから詳細指定を削除
  // ----------------------------------

  const clearDetailUrl =
    () => {
      const params =
        new URLSearchParams(
          window.location.search,
        );

      params.delete(
        "booth-info",
      );

      params.delete(
        "checkin",
      );

      params.delete(
        "hidden",
      );

      const query =
        params.toString();

      const url =
        `${window.location.pathname}` +
        `${query ? `?${query}` : ""}` +
        `${window.location.hash}`;

      window.history.replaceState(
        {},
        "",
        url,
      );

      window.dispatchEvent(
        new Event(
          "booth-info-change",
        ),
      );
    };

  // ----------------------------------
  // 閉じる
  // ----------------------------------

  const handleClose = () => {
    setShow(false);

    window.setTimeout(
      () => {
        clearDetailUrl();
      },
      200,
    );
  };

  // ----------------------------------
  // MAP
  // ----------------------------------

  const handleLocationClick =
    () => {
      if (
        !mapControl ||
        !item.place
      ) {
        return;
      }

      setShow(false);

      window.setTimeout(
        () => {
          clearDetailUrl();

          mapControl.openMap(
            item.place!,
          );
        },
        200,
      );
    };

  // ----------------------------------
  // 共有
  // ----------------------------------

  const handleShare =
    async (
      title: string,
      text: string,
    ) => {
      const shareUrl =
        window.location.href;

      const shareData = {
        title,
        text,
        url: shareUrl,
      };

      try {
        if (
          navigator.share
        ) {
          await navigator.share(
            shareData,
          );
        } else {
          await navigator.clipboard.writeText(
            shareUrl,
          );

          alert(
            "URLをクリップボードにコピーしました",
          );
        }
      } catch (
        err
      ) {
        if (
          (
            err as Error
          ).name !==
          "AbortError"
        ) {
          console.error(
            "Share error:",
            err,
          );
        }
      }
    };

  return {
    show,
    isOpen: true,
    showHidden,
    isMenuExpanded,
    setIsMenuExpanded,
    modalRef,
    handleClose,
    handleLocationClick,
    handleShare,
    mapControl,
  };
}