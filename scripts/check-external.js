const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const allowlistPath = path.join(__dirname, "external-link-allowlist.json");
const skipDirectories = new Set([".git", "node_modules", "screenshots"]);
const timeoutMs = Number(process.env.EXTERNAL_LINK_TIMEOUT_MS || 10000);

const walk = (directory) => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (!skipDirectories.has(entry.name)) {
                files.push(...walk(path.join(directory, entry.name)));
            }
            continue;
        }

        files.push(path.join(directory, entry.name));
    }

    return files;
};

const getAttributes = (text, attributeName) =>
    [...text.matchAll(new RegExp(`${attributeName}\\s*=\\s*["']([^"']+)["']`, "gi"))]
        .map((match) => match[1].replace(/&amp;/g, "&"));

const isCheckableExternalUrl = (value) => /^https?:\/\//i.test(String(value || ""));

const loadRules = () => {
    if (!fs.existsSync(allowlistPath)) {
        return [];
    }

    const config = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
    return (config.rules || []).map((rule) => ({
        ...rule,
        regex: new RegExp(rule.pattern)
    }));
};

const getRule = (url, rules) => rules.find((rule) => rule.regex.test(url));

const checkUrl = async (url) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method: "GET",
            redirect: "follow",
            signal: controller.signal,
            headers: {
                "user-agent": "Time Specialist Support handover link checker"
            }
        });

        return {
            status: response.status,
            ok: response.status >= 200 && response.status < 400,
            finalUrl: response.url
        };
    } finally {
        clearTimeout(timeout);
    }
};

const record = (buckets, category, item) => {
    buckets[category].push(item);
};

(async () => {
    const rules = loadRules();
    const htmlFiles = walk(root)
        .filter((filePath) => filePath.endsWith(".html"))
        .sort();
    const urlSources = new Map();

    for (const filePath of htmlFiles) {
        const relativeFile = path.relative(root, filePath);
        const text = fs.readFileSync(filePath, "utf8");

        for (const attributeName of ["href", "src", "action"]) {
            for (const value of getAttributes(text, attributeName)) {
                if (!isCheckableExternalUrl(value)) {
                    continue;
                }

                if (!urlSources.has(value)) {
                    urlSources.set(value, new Set());
                }

                urlSources.get(value).add(`${relativeFile} ${attributeName}`);
            }
        }
    }

    const buckets = {
        passed: [],
        "manual verify": [],
        "known blocked": [],
        failed: []
    };

    for (const [url, sources] of [...urlSources.entries()].sort(([first], [second]) => first.localeCompare(second))) {
        const rule = getRule(url, rules);
        const sourceList = [...sources].sort();

        if (rule && rule.skipCheck) {
            record(buckets, rule.category, { url, sources: sourceList, reason: rule.reason });
            continue;
        }

        try {
            const result = await checkUrl(url);

            if (result.ok) {
                record(buckets, "passed", { url, sources: sourceList, status: result.status, finalUrl: result.finalUrl });
                continue;
            }

            if (rule && (rule.allowedStatuses || []).includes(result.status)) {
                record(buckets, rule.category, {
                    url,
                    sources: sourceList,
                    status: result.status,
                    reason: rule.reason
                });
                continue;
            }

            record(buckets, "failed", { url, sources: sourceList, status: result.status, finalUrl: result.finalUrl });
        } catch (error) {
            if (rule) {
                record(buckets, rule.category, {
                    url,
                    sources: sourceList,
                    reason: `${rule.reason} (${error.message})`
                });
                continue;
            }

            record(buckets, "failed", { url, sources: sourceList, error: error.message });
        }
    }

    console.log("External link report");
    for (const category of ["passed", "manual verify", "known blocked", "failed"]) {
        console.log(`\n${category.toUpperCase()} (${buckets[category].length})`);
        for (const item of buckets[category]) {
            const status = item.status ? ` [${item.status}]` : "";
            const reason = item.reason ? ` - ${item.reason}` : "";
            console.log(`- ${item.url}${status}${reason}`);
            console.log(`  Sources: ${item.sources.join(", ")}`);
        }
    }

    if (buckets.failed.length) {
        process.exit(1);
    }

    process.exit(0);
})().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
