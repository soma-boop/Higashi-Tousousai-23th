import { BASE_PATH } from "@/constants/paths";

type JSONDataType =
  | "booth"
  | "exhibitions"
  | "events"
  | "vote"
  | "bus"
  | "spots";

const cache: Record<string, any> = {};
const pendingRequests: Record<
  string,
  Promise<any> | null
> = {};

const transformData = (
  type: JSONDataType,
  rawData: any,
) => {
  switch (type) {
    case "booth":
    case "spots":
    case "events":
    case "bus":
    case "exhibitions":
      return rawData;

    case "vote":
    default:
      return Array.isArray(rawData)
        ? rawData
        : [];
  }
};

const unique = (values: string[]) =>
  Array.from(
    new Set(
      values.filter(
        (value) =>
          value !== undefined,
      ),
    ),
  );

const getRuntimeBasePathCandidates =
  () => {
    const candidates = [
      BASE_PATH || "",
    ];

    if (
      typeof window !==
      "undefined"
    ) {
      const firstSegment =
        window.location.pathname
          .split("/")
          .filter(Boolean)[0];

      if (firstSegment) {
        candidates.push(
          `/${firstSegment}`,
        );
      }
    }

    candidates.push("");

    return unique(candidates);
  };

// 実際のJSONファイル名候補
const getFileNameCandidates = (
  type: JSONDataType,
) => {
  if (type === "exhibitions") {
    return [
      "exhibition.json",
      "exhibitions.json",
    ];
  }

  return [`${type}.json`];
};

export const loadJSON = async <
  T = any,
>(
  type: JSONDataType,
): Promise<T> => {
  if (cache[type]) {
    return cache[type];
  }

  if (pendingRequests[type]) {
    return pendingRequests[
      type
    ] as Promise<T>;
  }

  const request = (async () => {
    const errors: string[] =
      [];

    const basePaths =
      getRuntimeBasePathCandidates();

    const fileNames =
      getFileNameCandidates(
        type,
      );

    for (const basePath of basePaths) {
      for (const fileName of fileNames) {
        const url =
          `${basePath}/data/${fileName}`;

        try {
          const response =
            await fetch(url, {
              cache: "no-store",
            });

          if (!response.ok) {
            errors.push(
              `${url}: ${response.status}`,
            );

            continue;
          }

          const rawData =
            await response.json();

          const processedData =
            transformData(
              type,
              rawData,
            );

          cache[type] =
            processedData;

          pendingRequests[type] =
            null;

          return processedData as T;
        } catch (
          error: any
        ) {
          errors.push(
            `${url}: ${
              error?.message ||
              error
            }`,
          );
        }
      }
    }

    pendingRequests[type] =
      null;

    console.warn(
      `[JSONLoader] Could not load ${type}`,
      errors,
    );

    return transformData(
      type,
      [],
    ) as T;
  })();

  pendingRequests[type] =
    request;

  return request;
};