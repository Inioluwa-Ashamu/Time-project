const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const skipDirectories = new Set([".git", "node_modules", "screenshots"]);
const issues = [];

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

const htmlFiles = walk(root)
    .filter((filePath) => filePath.endsWith(".html"))
    .sort();

const getAttributes = (text, attributeName) =>
    [...text.matchAll(new RegExp(`${attributeName}\\s*=\\s*["']([^"']+)["']`, "gi"))]
        .map((match) => match[1].replace(/&amp;/g, "&"));

const isExternalOrSpecialUrl = (value) =>
    /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value) ||
    value.startsWith("data:") ||
    value.startsWith("javascript:");

const getIdsAndNames = (text) =>
    new Set([
        ...getAttributes(text, "id"),
        ...getAttributes(text, "name")
    ].filter(Boolean));

const htmlCache = new Map();
const readHtml = (filePath) => {
    if (!htmlCache.has(filePath)) {
        htmlCache.set(filePath, fs.readFileSync(filePath, "utf8"));
    }

    return htmlCache.get(filePath);
};

const publicHtmlFiles = [];

for (const filePath of htmlFiles) {
    const relativeFile = path.relative(root, filePath);
    const text = readHtml(filePath);
    const directory = path.dirname(filePath);
    const ids = getIdsAndNames(text);
    const isNoIndex = /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(text);
    const isAdminPage = relativeFile.startsWith(`admin${path.sep}`);

    if (!isNoIndex && !isAdminPage) {
        publicHtmlFiles.push(relativeFile);
    }

    for (const attributeName of ["href", "src", "action"]) {
        for (const rawValue of getAttributes(text, attributeName)) {
            if (!rawValue || isExternalOrSpecialUrl(rawValue)) {
                continue;
            }

            const [targetWithQuery, hash] = rawValue.split("#");
            const target = targetWithQuery.split("?")[0];

            if (!target) {
                if (hash && !ids.has(hash)) {
                    issues.push(`${relativeFile}: missing local anchor #${hash}`);
                }
                continue;
            }

            const resolvedPath = path.normalize(path.join(directory, target));
            if (!resolvedPath.startsWith(root) || !fs.existsSync(resolvedPath)) {
                issues.push(`${relativeFile}: ${attributeName}="${rawValue}" points to missing ${path.relative(root, resolvedPath)}`);
                continue;
            }

            if (hash && resolvedPath.endsWith(".html")) {
                const targetIds = getIdsAndNames(readHtml(resolvedPath));
                if (!targetIds.has(hash)) {
                    issues.push(`${relativeFile}: ${attributeName}="${rawValue}" points to missing #${hash}`);
                }
            }
        }
    }

    for (const imageMarkup of text.match(/<img\b[^>]*>/gi) || []) {
        if (!/\salt\s*=\s*["'][^"']*["']/i.test(imageMarkup)) {
            issues.push(`${relativeFile}: image is missing alt text: ${imageMarkup.slice(0, 120)}`);
        }
    }

    if (!isNoIndex && !isAdminPage) {
        if (!/<title>[^<]+<\/title>/i.test(text)) {
            issues.push(`${relativeFile}: public page is missing a title`);
        }

        if (!/<meta\s+name=["']description["'][^>]*content=["'][^"']+["']/i.test(text)) {
            issues.push(`${relativeFile}: public page is missing a meta description`);
        }
    }
}

const sitemapPath = path.join(root, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
    const sitemap = fs.readFileSync(sitemapPath, "utf8");
    const sitemapPaths = new Set(
        [...sitemap.matchAll(/<loc>https?:\/\/[^/]+\/?([^<]*)<\/loc>/gi)]
            .map((match) => match[1].replace(/^\/+/, "") || "index.html")
    );

    for (const relativeFile of publicHtmlFiles) {
        const expectedPath = relativeFile === "index.html" ? "index.html" : relativeFile;
        if (!sitemapPaths.has(expectedPath)) {
            issues.push(`${relativeFile}: public indexable page is missing from sitemap.xml`);
        }
    }
}

if (issues.length) {
    console.error("Local project checks failed:");
    for (const issue of issues) {
        console.error(`- ${issue}`);
    }
    process.exit(1);
}

console.log(`Local project checks passed for ${htmlFiles.length} HTML files.`);
