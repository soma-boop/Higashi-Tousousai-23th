import { useState, useEffect, useCallback } from "react";
import { App } from "antd";
import QRCode from "qrcode";

import { EXHIBITION_IDS } from "@/constants/exhibition-ids";
import { getPath } from "@/constants/paths";
import { supabase } from "@/lib/Server/supabase";
import { useRole } from "@/contexts/RoleContext";

export const useExhibitionQRManager = () => {
  const { message } = App.useApp();
  const { isAdmin } = useRole();

  const [selectedExhibition, setSelectedExhibition] =
    useState<string | null>(null);

  const [qrData, setQrData] = useState<{
    url: string;
    qrImg: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const generateQR = useCallback(
    async (name: string) => {
      if (!name || !isAdmin) {
        setQrData(null);
        return;
      }

      const id = EXHIBITION_IDS[name];

      if (!id) {
        message.error("展示IDが見つかりません");
        setQrData(null);
        return;
      }

      setLoading(true);

      try {
        // Supabaseから、この展示専用tokenを取得
        const { data, error } = await supabase
          .from("exhibition_access_tokens")
          .select("token")
          .eq("exhibition_id", Number(id))
          .single();

        if (error) {
          throw error;
        }

        if (!data?.token) {
          throw new Error("Exhibition token not found");
        }

        const baseUrl =
          window.location.origin + getPath("/exhibition");

        const url =
          `${baseUrl}?id=${encodeURIComponent(id)}` +
          `&token=${encodeURIComponent(data.token)}`;

        // 印刷にも使いやすいよう少し大きめで生成
        const qrImg = await QRCode.toDataURL(url, {
          width: 500,
          margin: 2,
          errorCorrectionLevel: "H",
        });

        setQrData({
          url,
          qrImg,
        });
      } catch (error) {
        console.error(
          "[ExhibitionQRManager] QR generation failed:",
          error,
        );

        message.error(
          "展示QRコードの生成に失敗しました",
        );

        setQrData(null);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, message],
  );

  useEffect(() => {
    if (selectedExhibition) {
      generateQR(selectedExhibition);
    } else {
      setQrData(null);
    }
  }, [selectedExhibition, generateQR]);

  const handleExhibitionChange = (name: string) => {
    setSelectedExhibition(name);
  };

  const handleCopy = async () => {
    if (!qrData) return;

    try {
      await navigator.clipboard.writeText(qrData.url);
      message.success("URLをコピーしました");
    } catch {
      const textArea = document.createElement("textarea");

      textArea.value = qrData.url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        message.success("URLをコピーしました");
      } catch {
        message.error("コピーに失敗しました");
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleDownload = () => {
    if (!qrData || !selectedExhibition) return;

    const id = EXHIBITION_IDS[selectedExhibition];

    const link = document.createElement("a");
    link.href = qrData.qrImg;
    link.download = `exhibition-${id}-qr.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exhibitionOptions = Object.keys(EXHIBITION_IDS).map(
    (name) => ({
      label: name,
      value: name,
    }),
  );

  return {
    selectedExhibition,
    qrData,
    loading,
    handleExhibitionChange,
    handleCopy,
    handleDownload,
    exhibitionOptions,
  };
};