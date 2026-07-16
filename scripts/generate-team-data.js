const fs = require("fs");
const path = require("path");
const { buildTeamDirectoryFallback } = require("./generate-supabase-imports");

const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "team-data.js");

const fallback = buildTeamDirectoryFallback();
const officeCount = fallback.filter((member) => member.team === "office").length;
const supportCount = fallback.filter((member) => member.team !== "office").length;

const contents = `window.teamDirectoryConfig = ${JSON.stringify({ fallback }, null, 4)};\n`;

fs.writeFileSync(outputPath, contents);

console.log(`Wrote team-data.js with ${officeCount} office profiles and ${supportCount} support worker profiles.`);
