const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const bucket = process.env.SUPABASE_PROFILE_IMAGE_BUCKET || "profile-images";
const teamCsvCandidates = [
    "team-spreadsheet - time-team-directory-sheet.csv",
    "team-directory-google-sheet.csv"
];

const loadDotEnv = () => {
    const envPath = path.join(root, ".env");

    if (!fs.existsSync(envPath)) {
        return;
    }

    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
            continue;
        }

        const [key, ...valueParts] = trimmed.split("=");
        if (!process.env[key]) {
            process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
        }
    }
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

const findFirstExistingFile = (fileNames) => {
    const filePath = fileNames
        .map((fileName) => path.join(root, fileName))
        .find((candidatePath) => fs.existsSync(candidatePath));

    if (!filePath) {
        throw new Error(`None of these files exist: ${fileNames.join(", ")}`);
    }

    return filePath;
};

const getImageFileName = (imageUrl) => {
    if (!imageUrl) {
        return "";
    }

    if (!/^https?:\/\//i.test(imageUrl)) {
        return path.basename(imageUrl);
    }

    return decodeURIComponent(new URL(imageUrl).pathname.split("/").pop() || "");
};

const getContentType = (fileName) => {
    const extension = path.extname(fileName).toLowerCase();
    if (extension === ".png") {
        return "image/png";
    }
    if (extension === ".webp") {
        return "image/webp";
    }
    if (extension === ".gif") {
        return "image/gif";
    }
    return "image/jpeg";
};

const uploadObject = async ({ supabaseUrl, serviceRoleKey, objectPath, filePath }) => {
    const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${objectPath}`;
    const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": getContentType(filePath),
            "Cache-Control": "3600",
            "x-upsert": "true"
        },
        body: fs.readFileSync(filePath)
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${body}`);
    }
};

const main = async () => {
    loadDotEnv();

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in a local .env file.");
    }

    const rows = parseCsv(findFirstExistingFile(teamCsvCandidates));
    const imageDir = path.join(root, "assets", "images", "team");
    let uploaded = 0;
    const missing = [];

    for (const row of rows) {
        const fileName = getImageFileName(row.image_url);
        const filePath = path.join(imageDir, fileName);

        if (!fileName || !fs.existsSync(filePath)) {
            missing.push(`${row.name || "Unnamed"}: ${fileName || "no image"}`);
            continue;
        }

        await uploadObject({
            supabaseUrl,
            serviceRoleKey,
            objectPath: `team/${fileName}`,
            filePath
        });
        uploaded += 1;
        console.log(`Uploaded ${fileName}`);
    }

    if (missing.length > 0) {
        console.warn(`Missing ${missing.length} image(s):`);
        for (const item of missing) {
            console.warn(`- ${item}`);
        }
    }

    console.log(`Uploaded ${uploaded} image(s) to ${bucket}/team/.`);
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
