"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Input, Button } from "antd";
import dayjs from "dayjs";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppTime } from "@/contexts/TimeContext";
import { usePathname } from "next/navigation";
import { useQAData } from "../hooks/useQAData";
import styles from "./QAStatus.module.css";
import { CUSTOM_CONFIG } from "@/constants/custom.config";

export default function QAStatus() {
  const { t } = useTranslation();
  const { currentTime } = useAppTime();
  const pathname = usePathname();
  const {
    text,
    setText,
    loading,
    isSuccess,
    handleAsk,
    isLoading,
    answeredQuestions,
    unansweredQuestions,
  } = useQAData();

  const theme = useTheme();
  const isDark = theme?.isDarkMode || false;

  const isEventDay = useMemo(() => {
    if (pathname?.startsWith("/demo")) return true;
    const now = dayjs();
    const start = dayjs(CUSTOM_CONFIG.identity.eventStartDate).startOf("day");
    const end = dayjs(CUSTOM_CONFIG.identity.eventEndDate).endOf("day");
    return now.isAfter(start) && now.isBefore(end);
  }, [pathname]);

  return (
    <CardBase title={t("CardTitles.QA")}>
      <CardInside>
        {isEventDay ? (
          <div className={styles.inputContainer}>
            <Input.TextArea
              placeholder={t("QA.Placeholder")}
              autoSize={{ minRows: 1, maxRows: 4 }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              size="large"
            />
            <Button
              type="primary"
              onClick={handleAsk}
              loading={loading}
              disabled={isSuccess}
              className={styles.sendBtn}
              style={{
                background: isSuccess ? "#52c41a" : isDark ? "#f0f0f0" : "#1f1f1f",
                borderColor: isSuccess ? "#52c41a" : isDark ? "#f0f0f0" : "#1f1f1f",
              }}
              size="large"
            >
              {isSuccess ? t("QA.Sent") : t("QA.Send")}
            </Button>
          </div>
        ) : (
          <div className={styles.emptyText} style={{ textAlign: "left", color: "var(--text-color)" }}>
            {t("QA.OutsideEvent")}
            <div style={{ marginTop: "8px" }}>
              <a 
                href={CUSTOM_CONFIG.navigation.homepageUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "#1b7fea", textDecoration: "underline" }}
              >
                {CUSTOM_CONFIG.navigation.homepageUrl || "公式サイト"}
              </a>
            </div>
          </div>
        )}
        <p className={styles.sectionTitle}>{t("QA.AnsweredSection")}</p>

        {isLoading ? (
          <p className={styles.loadingText}>{t("Common.Loading")}</p>
        ) : (
          <>
            {answeredQuestions.length > 0 ? (
              answeredQuestions.map((q, index) => (
                <React.Fragment key={q.id}>
                  {index !== 0 && <Divider margin="20px 0" height="0px" />}
                  <div className={styles.qaItem}>
                    <p className={styles.questionText}>
                      <span className={styles.questionLabel}>Q.&ensp;</span>
                      {q.text}
                    </p>
                    <p className={styles.answerText}>
                      <span className={styles.answerLabel}>A.&ensp;</span>
                      {q.answer}
                    </p>
                    {q.edit_reason && <p className="edited-text">{t("Common.Edited")}: {q.edit_reason}</p>}
                  </div>
                </React.Fragment>
              ))
            ) : (
              <p className={styles.emptyText}>{t("QA.NoData")}</p>
            )}

            {unansweredQuestions.length > 0 && (
              <>
                <p className={styles.waitingSection}>{t("QA.WaitingSection")}</p>
                {unansweredQuestions.map((q, index) => (
                  <React.Fragment key={q.id}>
                    {index !== 0 && (
                      <Divider height="1px" margin="8px" />
                    )}
                    <div className={styles.waitingItem}>
                      <p className={styles.waitingQuestionText}>
                        <span className={styles.waitingQuestionLabel}>Q.&ensp;</span>
                        {q.text}
                      </p>
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}
          </>
        )}
      </CardInside>
    </CardBase>
  );
}