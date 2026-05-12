const { chromium } = require("playwright");
const fs = require("node:fs/promises");
const path = require("node:path");

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:8765";
const outputDir = path.join(process.cwd(), "screenshots", "mobile");

const pages = [
    "index.html",
    "services.html",
    "contact.html",
    "team.html",
    "support-workers.html"
];

const viewports = [
    { name: "iphone-se", width: 375, height: 667 },
    { name: "iphone-12", width: 390, height: 844 },
    { name: "large-phone", width: 430, height: 932 }
];

const waitForPage = async (page) => {
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
};

(async () => {
    await fs.mkdir(outputDir, { recursive: true });
    const browser = await chromium.launch();
    const issues = [];

    for (const viewport of viewports) {
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: 1,
            isMobile: true,
            hasTouch: true
        });

        for (const pagePath of pages) {
            const page = await context.newPage();
            const url = `${baseUrl}/${pagePath}`;
            const response = await page.goto(url, { waitUntil: "domcontentloaded" });
            await waitForPage(page);

            const screenshotName = `${pagePath.replace(".html", "")}-${viewport.name}.png`;
            await page.screenshot({
                path: path.join(outputDir, screenshotName),
                fullPage: true
            });

            const metrics = await page.evaluate(() => ({
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                bodyScrollWidth: document.body.scrollWidth
            }));

            if (!response || !response.ok()) {
                issues.push(`${pagePath} ${viewport.name}: HTTP ${response ? response.status() : "no response"}`);
            }

            if (metrics.scrollWidth > metrics.clientWidth || metrics.bodyScrollWidth > metrics.clientWidth) {
                issues.push(
                    `${pagePath} ${viewport.name}: horizontal overflow (${metrics.scrollWidth}/${metrics.clientWidth})`
                );
            }

            await page.close();
        }

        await context.close();
    }

    await browser.close();

    if (issues.length) {
        console.error("Mobile screenshot pass found issues:");
        issues.forEach((issue) => console.error(`- ${issue}`));
        process.exitCode = 1;
        return;
    }

    console.log(`Mobile screenshots saved to ${outputDir}`);
})();
