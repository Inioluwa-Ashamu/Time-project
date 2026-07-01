const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const issues = [];

const htmlPages = fs.readdirSync(root)
    .filter((fileName) => fileName.endsWith(".html"))
    .sort()
    .concat("admin/index.html");

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true
    });

    await context.route("**/*", async (route) => {
        const requestUrl = route.request().url();
        if (
            requestUrl.startsWith("file://") ||
            requestUrl.startsWith("data:") ||
            requestUrl.startsWith("blob:") ||
            requestUrl.startsWith("about:")
        ) {
            await route.continue();
            return;
        }

        await route.abort();
    });

    for (const pagePath of htmlPages) {
        const page = await context.newPage();
        const pageErrors = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        const pageUrl = pathToFileURL(path.join(root, pagePath)).toString();

        try {
            await page.goto(pageUrl, {
                waitUntil: "domcontentloaded",
                timeout: 10000
            });

            await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
            await page.waitForTimeout(120);

            const metrics = await page.evaluate(() => ({
                overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth,
                title: document.title
            }));

            if (!metrics.title) {
                issues.push(`${pagePath}: missing document title in browser`);
            }

            if (metrics.overflow > 0) {
                issues.push(`${pagePath}: horizontal overflow of ${metrics.overflow}px`);
            }
        } catch (error) {
            issues.push(`${pagePath}: browser load failed: ${error.message}`);
        }

        for (const pageError of pageErrors) {
            issues.push(`${pagePath}: page error: ${pageError}`);
        }

        await page.close();
    }

    const teamPage = await context.newPage();
    await teamPage.goto(pathToFileURL(path.join(root, "team.html")).toString(), { waitUntil: "domcontentloaded" });
    await teamPage.waitForFunction(
        () => document.querySelectorAll("#office-directory .profile-card").length > 0 &&
            document.querySelectorAll("#support-directory .profile-card").length > 0,
        null,
        { timeout: 5000 }
    ).catch(() => {
        issues.push("team.html: team directory did not render office and support cards");
    });
    const teamState = await teamPage.evaluate(() => {
        const fallback = window.teamDirectoryConfig && Array.isArray(window.teamDirectoryConfig.fallback)
            ? window.teamDirectoryConfig.fallback
            : [];
        const expectedOfficeCount = fallback.filter((member) => member.team === "office").length;
        const expectedSupportCount = fallback.filter((member) => member.team !== "office").length;

        return {
            expectedOfficeCount,
            expectedSupportCount,
            renderedOfficeCount: document.querySelectorAll("#office-directory .profile-card").length,
            renderedSupportCount: document.querySelectorAll("#support-directory .profile-card").length,
            supportCountText: document.querySelector("#support-worker-count")?.textContent || ""
        };
    });
    if (teamState.expectedOfficeCount !== 5 || teamState.renderedOfficeCount !== 5) {
        issues.push(`team.html: expected 5 office fallback profiles, rendered ${teamState.renderedOfficeCount}`);
    }
    if (!teamState.supportCountText.includes(String(teamState.expectedSupportCount)) || teamState.expectedSupportCount < 60) {
        issues.push(`team.html: fallback support count was not reflected in the directory (${teamState.supportCountText})`);
    }
    await teamPage.close();

    const hubPage = await context.newPage();
    await hubPage.addInitScript(() => {
        const staffResources = [
            {
                id: "staff-resource-smoke-test",
                title: "Smoke test staff handbook",
                description: "Rendered from the Supabase staff_resources table.",
                section: "Admin",
                link_label: "Open handbook",
                url: "policies.html",
                resource_type: "page",
                visibility: "staff",
                sort_order: 10
            },
            {
                id: "staff-resource-smoke-video",
                title: "Smoke test training video",
                description: "A searchable training item.",
                section: "Training",
                link_label: "Watch video",
                url: "https://example.com/training",
                resource_type: "video",
                visibility: "staff",
                sort_order: 20
            }
        ];
        const query = {
            select() {
                return this;
            },
            eq() {
                return this;
            },
            in() {
                return this;
            },
            order() {
                return this;
            },
            then(resolve) {
                return Promise.resolve({ data: staffResources, error: null }).then(resolve);
            }
        };
        window.supabase = {
            createClient() {
                return {
                    from(tableName) {
                        return tableName === "staff_resources" ? query : null;
                    }
                };
            }
        };
    });
    await hubPage.goto(pathToFileURL(path.join(root, "support-workers.html")).toString(), { waitUntil: "domcontentloaded" });
    await hubPage.fill("#support-worker-password", "Aut15m2008");
    await hubPage.click("#support-worker-login button[type='submit']");
    await hubPage.waitForFunction(() => !document.querySelector("#support-worker-content").hidden, null, { timeout: 3000 })
        .catch(() => {
            issues.push("support-workers.html: password unlock did not reveal hub content");
        });
    await hubPage.waitForFunction(
        () => document.querySelector("#support-resource-list")?.textContent.includes("Smoke test staff handbook"),
        null,
        { timeout: 3000 }
    ).catch(() => {
        issues.push("support-workers.html: Supabase-rendered staff resource did not appear after unlock");
    });
    await hubPage.fill("#support-resource-search", "training video");
    const hubSearchState = await hubPage.evaluate(() => ({
        visibleSmokeResources: [...document.querySelectorAll("#support-resource-list [data-resource-card]")]
            .filter((card) => !card.hidden && card.textContent.includes("Smoke test"))
            .length,
        emptyVisible: !document.querySelector("#support-resource-empty").hidden
    }));
    if (hubSearchState.visibleSmokeResources !== 1 || hubSearchState.emptyVisible) {
        issues.push("support-workers.html: search did not filter Supabase-rendered resources");
    }
    await hubPage.close();

    const adminPage = await context.newPage();
    await adminPage.goto(pathToFileURL(path.join(root, "admin", "index.html")).toString(), { waitUntil: "domcontentloaded" });
    const adminState = await adminPage.evaluate(() => ({
        configWarningVisible: !document.querySelector("#admin-config-warning").hidden,
        loginVisible: !document.querySelector("#admin-login-section").hidden
    }));
    if (!adminState.configWarningVisible && !adminState.loginVisible) {
        issues.push("admin/index.html: admin did not reach config warning or login state");
    }
    await adminPage.close();

    await browser.close();

    if (issues.length) {
        console.error("Browser smoke checks failed:");
        for (const issue of issues) {
            console.error(`- ${issue}`);
        }
        process.exit(1);
    }

    console.log(`Browser smoke checks passed for ${htmlPages.length} HTML pages.`);
})().catch(async (error) => {
    console.error(error.message);
    process.exit(1);
});
