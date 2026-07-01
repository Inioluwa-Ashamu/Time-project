const fs = require("fs");
const path = require("path");
const { buildTeamDirectoryFallback } = require("./generate-supabase-imports");

const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "team-data.js");
const endpoint = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTEc0lO0TJJwNxrtSknoGG_XNDZL7G2VYeRdtly4vp3cnlcJhp6sRkecvYbDWZSIgvBjys-HP6ep6pa/pub?gid=2077489984&single=true&output=csv";

const fallback = buildTeamDirectoryFallback();
const officeCount = fallback.filter((member) => member.team === "office").length;
const supportCount = fallback.filter((member) => member.team !== "office").length;

const contents = `window.teamDirectoryConfig = ${JSON.stringify({ endpoint, fallback }, null, 4)};\n`;

fs.writeFileSync(outputPath, contents);

console.log(`Wrote team-data.js with ${officeCount} office profiles and ${supportCount} support worker profiles.`);
