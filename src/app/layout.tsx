import { GoogleAnalytics } from "@next/third-parties/google";
import { getPath } from "@/constants/paths";
import { CUSTOM_CONFIG } from "@/constants/custom.config";
import ClientProviders from "@/contexts/ClientProviders";
import "@/styles/global-app.css";

export const metadata = {
  title: `${CUSTOM_CONFIG.identity.appTitle} | ${CUSTOM_CONFIG.identity.organizationName}`,
  description: CUSTOM_CONFIG.identity.appDescription,
  icons: {
    icon: getPath("/img/common/favicon.ico"),
    apple: getPath("/img/common/apple-touch-icon.png"),
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f0f5" },
    { media: "(prefers-color-scheme: dark)", color: "#18181a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var fixViewport = function() {
                  var viewport = document.querySelector("meta[name=viewport]");
                  if (viewport) {
                    var content = viewport.getAttribute("content");
                    if (content.indexOf("height=") === -1) {
                      viewport.setAttribute("content", content + ", height=" + window.innerHeight);
                    }
                  }
                };
                fixViewport();
                window.addEventListener('load', fixViewport);
              })();
            `,
          }}
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}
    </html>
  );
}
