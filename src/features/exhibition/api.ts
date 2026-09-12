import { supabase } from "@/lib/Server/supabase";

export type ExhibitionCrowdLevel = 0 | 1 | 2;

export interface ExhibitionStatus {
  id: number;
  exhibition_name: string;
  crowd_level: ExhibitionCrowdLevel;
  updated_at: string;
}

// 展示1件の現在状況を取得
export const fetchExhibitionStatus = async (
  exhibitionId: number,
): Promise<ExhibitionStatus> => {
  const { data, error } = await supabase
    .from("exhibitions_status")
    .select("id, exhibition_name, crowd_level, updated_at")
    .eq("id", exhibitionId)
    .single();

  if (error) {
    throw error;
  }

  return data as ExhibitionStatus;
};

// 展示16件の現在状況をまとめて取得
export const fetchAllExhibitionStatuses = async (): Promise<
  ExhibitionStatus[]
> => {
  const { data, error } = await supabase
    .from("exhibitions_status")
    .select("id, exhibition_name, crowd_level, updated_at")
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ExhibitionStatus[];
};

// 展示担当者がQRのtokenで混雑状況を更新
export const updateExhibitionStatus = async (
  exhibitionId: number,
  token: string,
  crowdLevel: ExhibitionCrowdLevel,
) => {
  const { data, error } = await supabase.rpc(
    "update_exhibition_status",
    {
      p_exhibition_id: exhibitionId,
      p_token: token,
      p_crowd_level: crowdLevel,
    },
  );

  if (error) {
    throw error;
  }

  if (data !== true) {
    throw new Error("展示の混雑状況を更新できませんでした");
  }

  return { success: true };
};