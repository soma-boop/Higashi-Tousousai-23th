import { useTranslation } from "react-i18next";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import { getPath } from "@/constants/paths";
import { CUSTOM_CONFIG } from "@/constants/custom.config";

export default function Homepage() {
  const { t } = useTranslation();
  const hasLogo = CUSTOM_CONFIG.theme.mainLogoPath && CUSTOM_CONFIG.theme.mainLogoPath !== "";

  return (
    <CardBase title="ホームページ">
      <CardInside>
        {hasLogo ? (
          <a href={CUSTOM_CONFIG.navigation.homepageUrl || "#"} target="_blank" rel="noreferrer" style={{ pointerEvents: CUSTOM_CONFIG.navigation.homepageUrl ? "auto" : "none" }}>
            <img style={{ width: "60%" }} src={getPath(CUSTOM_CONFIG.theme.mainLogoPath)} alt="Logo" />
          </a>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-sub-color)" }}>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>ロゴが設定されていません</p>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>
              <code>src/constants/custom.config.ts</code> の <code>mainLogoPath</code> にロゴのパスを設定してください。
            </p>
          </div>
        )}
      </CardInside>
    </CardBase>
  );
}