import { useState, useEffect, useCallback } from "react";
import { App } from "antd";
import QRCode from "qrcode";

import { BOOTH_IDS } from "@/constants/booth-ids";
import { getPath } from "@/constants/paths";
import { supabase } from "@/lib/Server/supabase";
import { useRole } from "@/contexts/RoleContext";

export const useBoothQRManager = () => {
  const { message } = App.useApp();
  const { isAdmin } = useRole();

  const [selectedStall, setSelectedStall] = useState<string | null>(null);
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

      const id = BOOTH_IDS[name];

      if (!id) {
        message.error("模擬店IDが見つかりません");
        setQrData(null);
        return;
      }

      setLoading(true);

      try {
        // Supabaseから、このブース専用tokenを取得
        const { data, error } = await supabase
          .from("booth_access_tokens")
          .select("token")
          .eq("stall_id", Number(id))
          .single();

        if (error) {
          throw error;
        }

        if (!data?.token) {
          throw new Error("Booth token not found");
        }

        const baseUrl =
          window.location.origin + getPath("/booth");

        const url =
          `${baseUrl}?id=${encodeURIComponent(id)}` +
          `&token=${encodeURIComponent(data.token)}`;

        // 外部サービスを使わず、ブラウザ内でQRを生成
        const qrImg = await QRCode.toDataURL(url, {
          width: 250,
          margin: 2,
        });

        setQrData({
          url,
          qrImg,
        });
      } catch (error) {
        console.error(
          "[BoothQRManager] QR generation failed:",
          error
        );

        message.error(
          "QRコードの生成に失敗しました"
        );

        setQrData(null);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, message]
  );

  useEffect(() => {
    if (selectedStall) {
      generateQR(selectedStall);
    } else {
      setQrData(null);
    }
  }, [selectedStall, generateQR]);

  const handleStallChange = (name: string) => {
    setSelectedStall(name);
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

  const stallOptions = Object.keys(BOOTH_IDS).map(
    (name) => ({
      label: name,
      value: name,
    })
  );

  return {
    selectedStall,
    qrData,
    loading,
    handleStallChange,
    handleCopy,
    stallOptions,
  };
};