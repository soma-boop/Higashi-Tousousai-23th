export interface EventConfig {
  identity: {
    eventName: string;
    organizationName: string;
    appTitle: string;
    appDescription: string;
    eventStartDate: string; // YYYY-MM-DD
    eventEndDate: string;   // YYYY-MM-DD
  };
  
  navigation: {
    homepageUrl: string;
    basePath: string;
  };
  
  theme: {
    primaryColor: { light: string; dark: string; };
    backgroundColor: { light: string; dark: string; };
    mainLogoPath: string ;
  };
  
  api: {
    pollingIntervalMs: number;
    fullRefreshFrequency: number;
  };

  external: {
    gaId?: string;
  };

  features: {
    vote: boolean;
    bus: boolean;
    qa: boolean;
    lost: boolean;
    exhibition: boolean;
    event: boolean;
    news: boolean;
    map: boolean;
    closedOverlay: boolean;
  };

  bus?: {
    defaultFromStop: string;
    defaultToStop: string;
    routeLabels: {
      [routeKey: string]: {
        ja: string;
        en: string;
      };
    };
    stopTranslations?: {
      [stopName: string]: {
        ja: string;
        en: string;
      };
    };
  };
}

export const CUSTOM_CONFIG: EventConfig = {
  identity: {
    eventName: "FesTime 2026",
    organizationName: "Organization Name",
    appTitle: "FesTime App",
    appDescription: "Real-time status, voting, and management",
    eventStartDate: "2026-05-27",
    eventEndDate: "2026-05-28",
  },
  
  navigation: {
    homepageUrl: "https://soma-pop.github.io/Higashi-Tousousai-23th/",
    basePath: "/Higashi-Tousousai-23th",
  },
  
  theme: {
    primaryColor: { light: "#1f1f1f", dark: "#f0f0f0" },
    backgroundColor: { light: "#ffffff", dark: "#18181a" },
    mainLogoPath: "/Higashi-Tousousai-23th/img/logo/test-logo.png",
  },
  
  api: {
    pollingIntervalMs: 30000,
    fullRefreshFrequency: 3,
  },

  external: {
    gaId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  },

  features: {
    vote: true,
    bus: true,
    qa: true,
    lost: true,
    exhibition: true,
    event: true,
    news: true,
    map: true,
    closedOverlay: false,
  },

  bus: {
    defaultFromStop: "キャンパス 発",
    defaultToStop: "中央駅 着",
    routeLabels: {
      Outbound: { ja: "キャンパス 行", en: "To Campus" },
      Inbound: { ja: "中央駅 行", en: "To Central Station" },
    },
    stopTranslations: {
      "キャンパス 発": { ja: "キャンパス 発", en: "Campus (Dep.)" },
      "キャンパス 着": { ja: "キャンパス 着", en: "Campus (Arr.)" },
      "北駅 発": { ja: "北駅 発", en: "North St. (Dep.)" },
      "北駅 着": { ja: "北駅 着", en: "North St. (Arr.)" },
      "中央駅 発": { ja: "中央駅 発", en: "Central St. (Dep.)" },
      "中央駅 着": { ja: "中央駅 着", en: "Central St. (Arr.)" },
    }
  },
};
