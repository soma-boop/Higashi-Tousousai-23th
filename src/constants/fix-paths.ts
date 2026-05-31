import * as fs from "fs";
import * as path from "path";
import { CUSTOM_CONFIG } from "./custom.config";

const docsDir = path.resolve(process.cwd(), "docs");
const basePath = CUSTOM_CONFIG.navigation.basePath || "";
const cleanBaseName = basePath.startsWith("/") ? basePath.slice(1) : basePath;

function walk(dir: string): void {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return;
  }
  
  if (!basePath) {
      console.log("basePath is empty in custom.config.ts, skipping path fix.");
      return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.(html|json|js|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf8");
      let newContent = content;

      if (entry.name.endsWith(".html")) {
        const regex = new RegExp(`(src|href)="\\/((?!${cleanBaseName}\\/|https?|ftp)[^"]+)"`, 'g');
        newContent = newContent.replace(regex, `$1="${basePath}/$2"`);
      }

      if (/\.(js|json)$/.test(entry.name)) {
        const regex = new RegExp(`(["'])\\/(?!(?:${cleanBaseName}|https?|ftp)\\/)([^"']+\\.(?:png|jpg|jpeg|svg|gif|webp|json|js))(["'])`, 'g');
        newContent = newContent.replace(regex, `$1${basePath}/$2$3`);
      }

      if (entry.name.endsWith(".css")) {
        newContent = newContent.replace(/url\(\s*["']?\/([^"'>)]+)["']?\s*\)/g, (match, p1) => {
          if (p1.startsWith(`${cleanBaseName}/`) || p1.startsWith(`/${cleanBaseName}/`)) return match;
          const cleanPath = p1.startsWith("/") ? p1.slice(1) : p1;
          return `url("${basePath}/${cleanPath}")`;
        });
      }

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, "utf8");
        console.log(`Enforced ${basePath} in: ${path.relative(docsDir, fullPath)}`);
      }
    }
  }
}

console.log(`Target directory: ${docsDir}`);
walk(docsDir);
console.log("Finished updating paths.");

