"use client";

import React from "react";
import { Space, Typography, Select, Button, Divider } from "antd";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { useBoothQRManager } from "@/features/booth/hooks/useBoothQRManager";
import QRCode from "qrcode";
import styles from "./BoothQRManager.module.css";

const { Title, Text } = Typography;

interface BoothQRManagerProps {
  isMobile?: boolean;
}

const PUBLIC_SITE_URL =
  "https://soma-boop.github.io/Higashi-Tousousai-23th/";

export default function BoothQRManager({}: BoothQRManagerProps) {
  const {
    selectedStall,
    qrData,
    loading,
    handleStallChange,
    handleCopy,
    stallOptions,
  } = useBoothQRManager();

  const [publicQr, setPublicQr] = React.useState<string>("");

  React.useEffect(() => {
    QRCode.toDataURL(PUBLIC_SITE_URL, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setPublicQr(url);
      })
      .catch((error) => {
        console.error("公開サイトQR生成エラー:", error);
      });
  }, []);

  const handlePublicCopy = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_SITE_URL);
    } catch (error) {
      console.error("URLコピーエラー:", error);
    }
  };

  const handlePublicDownload = () => {
    if (!publicQr) return;

    const link = document.createElement("a");
    link.href = publicQr;
    link.download = "tousousai-site-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mainCanvas">
      <div className={styles.pccCanvas}>
        <PCCanvasColumn>
          <CardBase title="QRコード管理" disableTapAnimation={true}>
            <CardInside>

              {/* 一般公開サイトQR */}
              <div className={styles.guideText}>
                <Title level={4}>一般公開サイトQR</Title>
                <Text type="secondary">
                  ポスター・案内掲示用
                </Text>
              </div>

              <div className={styles.qrDisplayContainer}>
                {publicQr ? (
                  <Space orientation="vertical" size="middle">
                    <div className={styles.qrWrapper}>
                      <img
                        src={publicQr}
                        alt="東窓祭公開サイトQR"
                        className={styles.qrImage}
                      />
                    </div>

                    <Title level={4} className={styles.qrTitle}>
                      東窓祭特設サイト
                    </Title>

                    <Space wrap>
                      <Button type="primary" onClick={handlePublicDownload}>
                        QR画像を保存
                      </Button>

                      <Button onClick={handlePublicCopy}>
                        URLをコピー
                      </Button>
                    </Space>
                  </Space>
                ) : (
                  <div className={styles.loadingDisplay}>
                    QR生成中...
                  </div>
                )}
              </div>

              <Divider />

              {/* 模擬店QR */}
              <div className={styles.guideText}>
                <Title level={4}>模擬店QR</Title>
                <Text type="secondary">
                  模擬店を選択 → QRを生成
                </Text>
              </div>

              <div className={styles.selectContainer}>
                <Select
                  style={{ width: "100%", textAlign: "center" }}
                  placeholder="模擬店を選択"
                  optionFilterProp="children"
                  onChange={handleStallChange}
                  options={stallOptions}
                  size="large"
                  listHeight={600}
                  styles={{
                    popup: {
                      root: {
                        textAlign: "center",
                      },
                    },
                  }}
                />
              </div>

              {selectedStall ? (
                <div className={styles.qrDisplayContainer}>
                  {loading ? (
                    <div className={styles.loadingDisplay}>
                      生成中...
                    </div>
                  ) : qrData ? (
                    <Space orientation="vertical" size="middle">
                      <div className={styles.qrWrapper}>
                        <img
                          src={qrData.qrImg}
                          alt="QR"
                          className={styles.qrImage}
                        />
                      </div>

                      <Title level={4} className={styles.qrTitle}>
                        {selectedStall}
                      </Title>

                      <Space>
                        <Button type="primary" onClick={handleCopy}>
                          URLをコピー
                        </Button>
                      </Space>
                    </Space>
                  ) : (
                    <div className={styles.placeholderContainer}>
                      <Text type="danger">
                        QRの生成に失敗しました。設定を確認してください。
                      </Text>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.placeholderContainer}>
                  <QrCodeIcon className={styles.placeholderIcon} />
                  <br />
                  模擬店を選択してください
                </div>
              )}

            </CardInside>
          </CardBase>
        </PCCanvasColumn>
      </div>
    </div>
  );
}