import { supabase } from "@/lib/Server/supabase";
import { fetchWithCache, performMutation } from "@/lib/Server/baseApi";
import { BOOTH_IDS } from "@/constants/booth-ids";
import { StallStatus } from "./types";

export const fetchStallsOnly = async (ttl: number = 0) => {
  return fetchWithCache(
    "stalls_only",
    async () => {
      const { data, error } = await supabase.rpc("get_stalls_only");

      if (error) throw error;

      return data;
    },
    ttl,
  );
};

export const updateStallStatus = async (
  stallName: string,
  updates: Partial<StallStatus>,
) => {
  return performMutation(
    async () => {
      console.log(`[API] Update Sent: Stall (${stallName})`);

      // --------------------------------------------------
      // ブース責任者用のQR情報があるか確認
      // --------------------------------------------------

      const boothToken =
        typeof window !== "undefined"
          ? sessionStorage.getItem("booth_token")
          : null;

      const boothId =
        typeof window !== "undefined"
          ? sessionStorage.getItem("booth_id")
          : null;

      // --------------------------------------------------
      // ブース責任者の場合
      // QRのID + tokenを使って専用RPCから更新
      // --------------------------------------------------

      if (boothToken && boothId) {
        const expectedId = BOOTH_IDS[stallName];

        // 開こうとしているブースとQRのIDが違ったら拒否
        if (!expectedId || expectedId !== boothId) {
          throw new Error("このQRでは別のブースを更新できません");
        }

        // 現在の値を取得
        // crowdだけ、stockだけ更新する場合にも対応するため
        const { data: currentData, error: currentError } =
          await supabase
            .from("stalls_status")
            .select("crowd_level, stock_level")
            .eq("id", Number(boothId))
            .single();

        if (currentError) {
          throw currentError;
        }

        const crowdLevel =
          updates.crowdLevel !== undefined
            ? updates.crowdLevel
            : currentData.crowd_level;

        const stockLevel =
          updates.stockLevel !== undefined
            ? updates.stockLevel
            : currentData.stock_level;

        const { data, error } = await supabase.rpc(
          "update_booth_status",
          {
            p_stall_id: Number(boothId),
            p_token: boothToken,
            p_crowd_level: crowdLevel,
            p_stock_level: stockLevel,
          },
        );

        if (error) {
          throw error;
        }

        if (data !== true) {
          throw new Error("ブース情報の更新に失敗しました");
        }

        return { success: true };
      }

      // --------------------------------------------------
      // 全体管理者の場合
      // Supabase Auth + RLSでadminか確認される
      // --------------------------------------------------

      const dbUpdates: Record<string, number> = {};

      if (updates.crowdLevel !== undefined) {
        dbUpdates.crowd_level = updates.crowdLevel;
      }

      if (updates.stockLevel !== undefined) {
        dbUpdates.stock_level = updates.stockLevel;
      }

      const { error } = await supabase
        .from("stalls_status")
        .update(dbUpdates)
        .eq("stall_name", stallName);

      if (error) {
        throw error;
      }

      return { success: true };
    },
    ["all", "stalls_only"],
  );
};