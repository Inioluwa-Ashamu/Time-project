const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "supabase", "imports");
const imageMode = process.argv.includes("--image-mode=storage") ? "storage" : "local";
const teamCsvCandidates = [
    "team-spreadsheet - time-team-directory-sheet.csv",
    "team-directory-google-sheet.csv"
];

const findFirstExistingFile = (fileNames) => {
    const filePath = fileNames
        .map((fileName) => path.join(root, fileName))
        .find((candidatePath) => fs.existsSync(candidatePath));

    if (!filePath) {
        throw new Error(`None of these files exist: ${fileNames.join(", ")}`);
    }

    return filePath;
};

const parseCsvLine = (line) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        const nextCharacter = line[index + 1];

        if (character === '"' && inQuotes && nextCharacter === '"') {
            current += '"';
            index += 1;
            continue;
        }

        if (character === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (character === "," && !inQuotes) {
            values.push(current);
            current = "";
            continue;
        }

        current += character;
    }

    values.push(current);
    return values;
};

const parseCsv = (filePath) => {
    const text = fs.readFileSync(filePath, "utf8");
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    const headers = parseCsvLine(lines[0]).map((header) => header.trim());

    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        return headers.reduce((record, header, index) => {
            record[header] = values[index] ? values[index].trim() : "";
            return record;
        }, {});
    });
};

const toCsvValue = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    const text = String(value);
    if (/[",\n\r]/.test(text)) {
        return `"${text.replaceAll('"', '""')}"`;
    }

    return text;
};

const writeCsv = (filePath, headers, rows) => {
    const csv = [
        headers.join(","),
        ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(","))
    ].join("\n");

    fs.writeFileSync(filePath, `${csv}\n`);
};

const teamImageFileNames = new Set(
    fs.existsSync(path.join(root, "assets", "images", "team"))
        ? fs.readdirSync(path.join(root, "assets", "images", "team"))
        : []
);

const localizeTeamImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "";
    }

    if (!/^https?:\/\//i.test(imageUrl)) {
        return imageUrl;
    }

    let fileName = "";
    try {
        fileName = decodeURIComponent(new URL(imageUrl).pathname.split("/").pop() || "");
    } catch (error) {
        return imageUrl;
    }

    return teamImageFileNames.has(fileName)
        ? `assets/images/team/${fileName}`
        : imageUrl;
};

const getTeamImageFileName = (imageUrl) => {
    if (!imageUrl) {
        return "";
    }

    if (!/^https?:\/\//i.test(imageUrl)) {
        return path.basename(imageUrl);
    }

    try {
        return decodeURIComponent(new URL(imageUrl).pathname.split("/").pop() || "");
    } catch (error) {
        return "";
    }
};

const getStorageImagePath = (imageUrl) => {
    const fileName = getTeamImageFileName(imageUrl);
    return fileName && teamImageFileNames.has(fileName) ? `team/${fileName}` : "";
};

const inferResourceType = (url) => {
    const lowerUrl = String(url || "").toLowerCase();

    if (/\.(pdf|doc|docx|xls|xlsx|png|jpe?g)(?:$|[?#])/.test(lowerUrl)) {
        return "document";
    }

    if (lowerUrl.includes("forms.gle") || lowerUrl.includes("docs.google.com/forms")) {
        return "form";
    }

    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be") || lowerUrl.includes("vimeo.com")) {
        return "video";
    }

    if (/^[a-z0-9-]+\.html(?:#.*)?$/i.test(url)) {
        return "page";
    }

    return "link";
};

const normalizeResourceTitle = (row) => {
    const text = row.link_text || row.context || "Open resource";

    if (/^https?:\/\//i.test(text)) {
        return text.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    }

    return text.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
};

const buildTeamProfiles = () => {
    const rows = parseCsv(findFirstExistingFile(teamCsvCandidates));
    const groupCounts = { office: 0, support: 0 };

    return rows.map((row) => {
        const directoryGroup = row.team === "office" ? "office" : "support";
        groupCounts[directoryGroup] += 1;

        return {
            display_name: row.name,
            role: row.role || (directoryGroup === "office" ? "Office Team" : "Support Worker"),
            directory_group: directoryGroup,
            bio: row.bio,
            image_path: imageMode === "storage" ? getStorageImagePath(row.image_url) : "",
            image_url: imageMode === "storage" ? "" : localizeTeamImageUrl(row.image_url),
            public_profile: "true",
            published: "true",
            sort_order: directoryGroup === "office"
                ? groupCounts[directoryGroup] * 10
                : 1000 + groupCounts[directoryGroup] * 10
        };
    });
};

const buildTeamDirectoryFallback = () => {
    const rows = parseCsv(findFirstExistingFile(teamCsvCandidates));

    return rows.map((row) => ({
        name: row.name,
        role: row.role || (row.team === "office" ? "Office Team" : "Support Worker"),
        team: row.team === "office" ? "office" : "support",
        image_url: localizeTeamImageUrl(row.image_url),
        bio: row.bio
    }));
};

const buildStaffResources = () => {
    const rows = parseCsv(path.join(root, "support-worker-resources.csv"));

    return rows.map((row, index) => ({
        title: normalizeResourceTitle(row),
        description: row.context || "",
        section: row.section || "General",
        link_label: normalizeResourceTitle(row),
        url: row.url,
        resource_type: inferResourceType(row.url),
        visibility: "staff",
        published: "true",
        sort_order: 1000 + index * 10
    }));
};

const generateSupabaseImports = () => {
    fs.mkdirSync(outputDir, { recursive: true });

    writeCsv(
        path.join(outputDir, "team_profiles.csv"),
        [
            "display_name",
            "role",
            "directory_group",
            "bio",
            "image_path",
            "image_url",
            "public_profile",
            "published",
            "sort_order"
        ],
        buildTeamProfiles()
    );

    writeCsv(
        path.join(outputDir, "staff_resources.csv"),
        [
            "title",
            "description",
            "section",
            "link_label",
            "url",
            "resource_type",
            "visibility",
            "published",
            "sort_order"
        ],
        buildStaffResources()
    );

    console.log(`Wrote Supabase import CSVs to supabase/imports/ using ${imageMode} image mode.`);
};

if (require.main === module) {
    generateSupabaseImports();
}

module.exports = {
    buildTeamDirectoryFallback,
    buildTeamProfiles,
    buildStaffResources,
    generateSupabaseImports
};
