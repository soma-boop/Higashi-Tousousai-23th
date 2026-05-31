import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = "./public/data";
const BOOTH_IDS_FILE = path.join(process.cwd(), "src/constants/booth-ids.ts");

function generateShortId(name: string): string {
  const hash = crypto.createHash("md5").update(name).digest("hex");
  return parseInt(hash.substring(0, 8), 16).toString(36).toUpperCase().padStart(6, "0").substring(0, 6);
}

function generateBoothIds() {
  console.log("Generating booth-ids.ts from booth.json...");

  const boothJsonPath = path.join(DATA_DIR, "booth.json");
  let boothIds: Record<string, string> = {};

  if (fs.existsSync(boothJsonPath)) {
    const boothsRaw = JSON.parse(fs.readFileSync(boothJsonPath, "utf8"));
    const allBooths = Array.isArray(boothsRaw) 
      ? boothsRaw 
      : Object.values(boothsRaw).flat() as any[];

    allBooths.forEach((b) => {
      boothIds[b.name] = generateShortId(b.name);
    });

    const tsContent = `// Auto-generated from booth.json. Do not edit manually.\nexport const BOOTH_IDS: Record<string, string> = ${JSON.stringify(boothIds, null, 4)};\n`;
    
    fs.writeFileSync(BOOTH_IDS_FILE, tsContent);
    console.log(`Successfully generated: ${BOOTH_IDS_FILE}`);
  } else {
    console.error(`Error: ${boothJsonPath} not found.`);
  }
}

generateBoothIds();
