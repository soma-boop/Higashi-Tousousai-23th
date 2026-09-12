"use client";

import React from "react";
import { Space, Typography, Select, Button } from "antd";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import QrCodeIcon from "@mui/icons-material/QrCode";

import { useExhibitionQRManager } from "@/features/exhibition/hooks/useExhibitionQRManager";

import styles from "@/features/booth/components/BoothQRManager.module.css";

const { Title, Text } = Typography;

interface ExhibitionQRManagerProps {
  isMobile?: boolean;
}

export default function ExhibitionQRManager(
  {}: ExhibitionQRManagerProps,
) {
  const {
    selectedExhibition,
    qrData,
    loading,
    handleExhibitionChange,
    handleCopy,
    handleDownload,
    exhibitionOptions,
  } = useExhibitionQRManager();

  return (
    <div className="mainCanvas">
      <div className={styles.pccCanvas}>
        <PCCanvasColumn>
          <CardBase
            title="展示QR"
            disableTapAnimation={true}
          >
            <CardInside>
              <div className={styles.guideText}>
                <Text type="secondary">
                  展示を選択 → 担当者用QRを生成
                </Text>
              </div>

              <div className={styles.selectContainer}>
                <Select
                  style={{
                    width: "100%",
                    textAlign: "center",
                  }}
                  placeholder="展示を選択"
                  optionFilterProp="label"
                  showSearch
                  onChange={handleExhibitionChange}
                  options={exhibitionOptions}
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

              {selectedExhibition ? (
                <div className={styles.qrDisplayContainer}>
                  {loading ? (
                    <div className={styles.loadingDisplay}>
                      生成中...
                    </div>
                  ) : qrData ? (
                    <Space
                      orientation="vertical"
                      size="middle"
                    >
                      <div className={styles.qrWrapper}>
                        <img
                          src={qrData.qrImg}
                          alt="展示担当者用QR"
                          className={styles.qrImage}
                        />
                      </div>

                      <Title
                        level={4}
                        className={styles.qrTitle}
                      >
                        {selectedExhibition}
                      </Title>

                      <Text type="secondary">
                        このQRは展示担当者専用です
                      </Text>

                      <Space wrap>
                        <Button
                          type="primary"
                          onClick={handleDownload}
                        >
                          QR画像を保存
                        </Button>

                        <Button onClick={handleCopy}>
                          URLをコピー
                        </Button>
                      </Space>
                    </Space>
                  ) : (
                    <div
                      className={
                        styles.placeholderContainer
                      }
                    >
                      <Text type="danger">
                        QRコードを生成できませんでした。
                      </Text>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={
                    styles.placeholderContainer
                  }
                >
                  <QrCodeIcon
                    className={
                      styles.placeholderIcon
                    }
                  />
                  <br />
                  展示を選択してください
                </div>
              )}
            </CardInside>
          </CardBase>
        </PCCanvasColumn>
      </div>
    </div>
  );
}