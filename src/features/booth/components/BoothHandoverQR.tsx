import React, { useState, useEffect } from "react";
import { Button, Modal, App } from "antd";
import QrCodeIcon from "@mui/icons-material/QrCode";
import QRCode from "qrcode";

import { BOOTH_IDS } from "@/constants/booth-ids";
import { getPath } from "@/constants/paths";
import styles from "./BoothHandoverQR.module.css";

interface BoothHandoverQRProps {
  assignedStall: string | null;
}

export default function BoothHandoverQR({
  assignedStall,
}: BoothHandoverQRProps) {
  const { message } = App.useApp();

  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const updateQR = async () => {
      if (typeof window === "undefined" || !assignedStall) {
        return;
      }

      const id = BOOTH_IDS[assignedStall];
      const token = sessionStorage.getItem("booth_token");
      const storedId = sessionStorage.getItem("booth_id");

      if (!id) {
        console.error(
          "[HandoverQR] No ID found for stall:",
          assignedStall
        );

        message.error(
          "模擬店IDが見つかりません。運営に伝えてください。"
        );

        return;
      }

      if (!token || !storedId) {
        console.error(
          "[HandoverQR] Booth authentication information not found."
        );

        message.error(
          "認証情報が見つかりません。一度QRコードから再ログインしてください。"
        );

        return;
      }

      // 他ブースのQRにならないよう確認
      if (storedId !== id) {
        console.error(
          "[HandoverQR] Booth ID mismatch."
        );

        message.error(
          "担当ブース情報が一致しません。運営に確認してください。"
        );

        return;
      }

      const baseUrl =
        window.location.origin + getPath("/booth");

      const finalUrl =
        `${baseUrl}?id=${encodeURIComponent(id)}` +
        `&token=${encodeURIComponent(token)}`;

      try {
        const qrImage = await QRCode.toDataURL(finalUrl, {
          width: 250,
          margin: 2,
        });

        setQrUrl(qrImage);
      } catch (error) {
        console.error(
          "[HandoverQR] Failed to generate QR:",
          error
        );

        message.error(
          "QRコードの生成に失敗しました。"
        );
      }
    };

    if (showQR) {
      setQrUrl("");
      updateQR();
    }
  }, [showQR, assignedStall, message]);

  return (
    <>
      <div className={styles.container}>
        <Button
          type="default"
          icon={<QrCodeIcon />}
          onClick={() => setShowQR(true)}
          className={styles.handoverBtn}
        >
          交代用QRコードを表示
        </Button>
      </div>

      <Modal
        title="シフト引き継ぎ用QR"
        open={showQR}
        onCancel={() => setShowQR(false)}
        footer={null}
        centered
        getContainer={() =>
          document.getElementById("app-root") ||
          document.body
        }
      >
        <div className={styles.modalContainer}>
          <p className={styles.modalGuide}>
            次の担当者のスマホでこのQRを読み取ってください。
            <br />
            読み取ると同じブースの管理画面を開けます。
            <br />
            <span className={styles.urgentNote}>
              このQRは担当ブース専用です。第三者には共有しないでください。
            </span>
          </p>

          <div className={styles.qrWrapper}>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="Handover QR"
                className={styles.qrImage}
              />
            ) : (
              <div className={styles.loadingPlaceholder}>
                QR生成中...
              </div>
            )}
          </div>

          <p className={styles.assignedStallText}>
            担当: {assignedStall}
          </p>
        </div>
      </Modal>
    </>
  );
}