const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const allowlistPath = path.join(__dirname, "external-link-allowlist.json");
const skipDirectories = new Set([".git", "node_modules", "screenshots"]);
const timeoutMs = 12000;
const concurrency = 8;
const userAgent = "Time Specialist Support link checker (+https://time-specialist-support.com)";

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

const decodeHtmlEntities = (value) =>
    String(value || "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

const getAttributes = (text, attributeName) =>
    [...text.matchAll(new RegExp(`${attributeName}\\s*=\\s*["']([^"']+)["']`, "gi"))]
        .map((match) => decodeHtmlEntities(match[1]));

const normalizeUrlForRequest = (value) => {
    try {
        const url = new URL(value);
        url.hash = "";
        return url.toString();
    } catch {
        return value;
    }
};

const isExternalHttpUrl = (value) => /^https?:\/\//i.test(String(value || ""));

const loadAllowlist = () => {
    if (!fs.existsSync(allowlistPath)) {
        return [];
    }

    const parsed = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
    return Array.isArray(parsed.entries) ? parsed.entries : [];
};

const allowlistEntries = loadAllowlist();

const entryMatches = (entry, url) => {
    const parsedUrl = new URL(url);

    if (entry.url && normalizeUrlForRequest(entry.url) === url) {
        return true;
    }

    if (entry.host && entry.host === parsedUrl.hostname) {
        return true;
    }

    if (entry.pattern && new RegExp(entry.pattern).test(url)) {
        return true;
    }

    return false;
};

const findAllowlistEntry = (url) => allowlistEntries.find((entry) => entryMatches(entry, url));

const collectExternalLinks = () => {
    const links = new Map();
    const htmlFiles = walk(root)
        .filter((filePath) => filePath.endsWith(".html"))
        .sort();

    for (const filePath of htmlFiles) {
        const relativeFile = path.relative(root, filePath);
        const text = fs.readFileSync(filePath, "utf8");

        for (const attributeName of ["href", "src", "action", "data-src"]) {
            for (const rawValue of getAttributes(text, attributeName)) {
                if (!isExternalHttpUrl(rawValue)) {
                    continue;
                }

                const url = normalizeUrlForRequest(rawValue);
                if (!links.has(url)) {
                    links.set(url, {
                        url,
                        sources: new Set()
                    });
                }

                links.get(url).sources.add(`${relativeFile} ${attributeName}`);
            }
        }
    }

    return [...links.values()].map((link) => ({
        url: link.url,
        sources: [...link.sources].sort()
    }));
};

const requestUrl = async (url, method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method,
            redirect: "follow",
            signal: controller.signal,
            headers: {
                "user-agent": userAgent,
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
        });

        return {
            ok: response.status >= 200 && response.status < 400,
            status: response.status,
            statusText: response.statusText,
            finalUrl: response.url
        };
    } finally {
        clearTimeout(timer);
    }
};

const checkUrl = async (url) => {
    let response;

    try {
        response = await requestUrl(url, "HEAD");
    } catch (error) {
        response = {
            ok: false,
            status: 0,
            statusText: error.name === "AbortError" ? "timeout" : error.message,
            finalUrl: url
        };
    }

    if (response.ok) {
        return response;
    }

    if ([0, 403, 405, 406, 429, 500, 501].includes(response.status)) {
        try {
            const fallbackResponse = await requestUrl(url, "GET");
            if (fallbackResponse.ok) {
                return fallbackResponse;
            }

            return fallbackResponse;
        } catch (error) {
            return {
                ok: false,
                status: 0,
                statusText: error.name === "AbortError" ? "timeout" : error.message,
                finalUrl: url
            };
        }
    }

    return response;
};

const printGroup = (title, items, formatter) => {
    console.log(`\n${title} (${items.length})`);
    if (!items.length) {
        console.log("- none");
        return;
    }

    for (const item of items) {
        console.log(formatter(item));
    }
};

(async () => {
    const links = collectExternalLinks();
    const passed = [];
    const manualVerify = [];
    const knownBlocked = [];
    const failed = [];
    const checkableLinks = [];

    for (const link of links) {
        const allowlistEntry = findAllowlistEntry(link.url);

        if (allowlistEntry) {
            const record = {
                ...link,
                reason: allowlistEntry.reason || "Allow-listed for manual handling."
            };

            if (allowlistEntry.status === "known_blocked") {
                knownBlocked.push(record);
            } else {
                manualVerify.push(record);
            }

            continue;
        }

        checkableLinks.push(link);
    }

    let nextIndex = 0;
    const workers = Array.from({ length: Math.min(concurrency, checkableLinks.length) }, async () => {
        while (nextIndex < checkableLinks.length) {
            const link = checkableLinks[nextIndex];
            nextIndex += 1;

            const result = await checkUrl(link.url);
            const record = {
                ...link,
                ...result
            };

            if (result.ok) {
                passed.push(record);
            } else if ([401, 403, 429].includes(result.status)) {
                knownBlocked.push({
                    ...record,
                    reason: `Automated request returned ${result.status}; verify manually or add a specific allow-list note if expected.`
                });
            } else {
                failed.push(record);
            }
        }
    });

    await Promise.all(workers);

    printGroup("Passed", passed, (item) =>
        `- ${item.status} ${item.url}${item.finalUrl && item.finalUrl !== item.url ? ` -> ${item.finalUrl}` : ""}`
    );
    printGroup("Manual verify", manualVerify, (item) =>
        `- ${item.url}\n  ${item.reason}\n  Sources: ${item.sources.join(", ")}`
    );
    printGroup("Known blocked", knownBlocked, (item) =>
        `- ${item.status || "allow-listed"} ${item.url}\n  ${item.reason}\n  Sources: ${item.sources.join(", ")}`
    );
    printGroup("Failed", failed, (item) =>
        `- ${item.status || "error"} ${item.url}: ${item.statusText || "request failed"}\n  Sources: ${item.sources.join(", ")}`
    );

    console.log(
        `\nExternal link check complete: ${passed.length} passed, ${manualVerify.length} manual verify, ${knownBlocked.length} known blocked, ${failed.length} failed.`
    );

    if (failed.length) {
        process.exit(1);
    }
})();
