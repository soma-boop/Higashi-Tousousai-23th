"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Space,
  Spin,
  Typography,
} from "antd";

import { EXHIBITION_IDS } from "@/constants/exhibition-ids";

import {
  ExhibitionCrowdLevel,
  fetchExhibitionStatus,
  updateExhibitionStatus,
} from "@/features/exhibition/api";

const { Title, Text } = Typography;

const CROWD_OPTIONS: {
  value: ExhibitionCrowdLevel;
  label: string;
}[] = [
  {
    value: 0,
    label: "空いている",
  },
  {
    value: 1,
    label: "やや混雑",
  },
  {
    value: 2,
    label: "混雑",
  },
];

export default function ExhibitionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [exhibitionId, setExhibitionId] =
    useState<number | null>(null);

  const [exhibitionName, setExhibitionName] =
    useState("");

  const [token, setToken] =
    useState("");

  const [crowdLevel, setCrowdLevel] =
    useState<ExhibitionCrowdLevel>(0);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // --------------------------------------------------
  // QRまたはsessionStorageから展示情報を取得
  // --------------------------------------------------

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError("");

      try {
        const queryId = searchParams.get("id");
        const queryToken = searchParams.get("token");

        let id = queryId;
        let exhibitionToken = queryToken;

        // QRからアクセスした場合
        if (queryId && queryToken) {
          sessionStorage.setItem(
            "exhibition_id",
            queryId,
          );

          sessionStorage.setItem(
            "exhibition_token",
            queryToken,
          );

          // URLからtokenを消す
          router.replace("/exhibition");
        } else {
          // 既に認証済みならsessionStorageから復元
          id =
            sessionStorage.getItem(
              "exhibition_id",
            );

          exhibitionToken =
            sessionStorage.getItem(
              "exhibition_token",
            );
        }

        if (!id || !exhibitionToken) {
          throw new Error(
            "展示用QRコードからアクセスしてください。",
          );
        }

        // IDから展示名を取得
        const name =
          Object.keys(EXHIBITION_IDS).find(
            (key) =>
              EXHIBITION_IDS[key] === id,
          );

        if (!name) {
          throw new Error(
            "展示IDが正しくありません。",
          );
        }

        const numericId = Number(id);

        setExhibitionId(numericId);
        setExhibitionName(name);
        setToken(exhibitionToken);

        // Supabaseから現在の混雑状況を取得
        const current =
          await fetchExhibitionStatus(
            numericId,
          );

        setCrowdLevel(
          current.crowd_level,
        );
      } catch (err) {
        console.error(
          "[Exhibition] initialization failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "展示情報を取得できませんでした。",
        );
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [searchParams, router]);

  // --------------------------------------------------
  // 混雑状況更新
  // --------------------------------------------------

  const handleUpdate = async (
    newLevel: ExhibitionCrowdLevel,
  ) => {
    if (!exhibitionId || !token) {
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      await updateExhibitionStatus(
        exhibitionId,
        token,
        newLevel,
      );

      setCrowdLevel(newLevel);

      setSuccess(
        "混雑状況を更新しました。",
      );
    } catch (err) {
      console.error(
        "[Exhibition] update failed:",
        err,
      );

      setError(
        "更新に失敗しました。QRコードが正しいか確認してください。",
      );
    } finally {
      setUpdating(false);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // --------------------------------------------------
  // 認証失敗
  // --------------------------------------------------

  if (error && !exhibitionId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 500,
          }}
        >
          <Title level={3}>
            アクセス制限
          </Title>

          <Alert
            type="error"
            showIcon
            message={error}
          />

          <div
            style={{
              marginTop: 20,
            }}
          >
            <Text type="secondary">
              展示担当者用QRコードからアクセスしてください。
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------
  // 展示管理画面
  // --------------------------------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 16px 60px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 550,
        }}
      >
        <Space
          orientation="vertical"
          size="large"
          style={{
            width: "100%",
          }}
        >
          <div>
            <Text type="secondary">
              展示混雑状況管理
            </Text>

            <Title
              level={3}
              style={{
                marginTop: 5,
              }}
            >
              {exhibitionName}
            </Title>

            <Text type="secondary">
              展示ID：{exhibitionId}
            </Text>
          </div>

          <div>
            <Text>
              現在の混雑状況
            </Text>

            <Title
              level={2}
              style={{
                marginTop: 5,
              }}
            >
              {
                CROWD_OPTIONS.find(
                  (option) =>
                    option.value ===
                    crowdLevel,
                )?.label
              }
            </Title>
          </div>

          {success && (
            <Alert
              type="success"
              showIcon
              title={success}
            />
          )}

          {error && (
            <Alert
              type="error"
              showIcon
              title={error}
            />
          )}

          <div>
            <Text strong>
              混雑状況を選択
            </Text>

            <Space
              orientation="vertical"
              size="middle"
              style={{
                width: "100%",
                marginTop: 15,
              }}
            >
              {CROWD_OPTIONS.map(
                (option) => (
                  <Button
                    key={
                      option.value
                    }
                    type={
                      crowdLevel ===
                      option.value
                        ? "primary"
                        : "default"
                    }
                    size="large"
                    block
                    loading={
                      updating
                    }
                    onClick={() =>
                      handleUpdate(
                        option.value,
                      )
                    }
                  >
                    {option.label}
                  </Button>
                ),
              )}
            </Space>
          </div>

          <Text
            type="secondary"
            style={{
              fontSize: 12,
            }}
          >
            担当者以外にこのQRコードを共有しないでください。
          </Text>
        </Space>
      </Card>
    </div>
  );
}