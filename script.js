const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const currentPage = document.body.dataset.page;

if (navToggle && siteNav) {
    const mobileNav = window.matchMedia("(max-width: 900px)");

    const closeNav = () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
        document.body.classList.remove("nav-open");
    };

    const openNav = () => {
        siteNav.classList.add("is-open");
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "Close navigation");
        document.body.classList.add("nav-open");
    };

    navToggle.setAttribute("aria-label", "Open navigation");

    navToggle.addEventListener("click", () => {
        const isOpen = siteNav.classList.contains("is-open");
        if (isOpen) {
            closeNav();
            return;
        }

        openNav();
    });

    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (event) => {
        if (!mobileNav.matches || !siteNav.classList.contains("is-open")) {
            return;
        }

        if (siteNav.contains(event.target) || navToggle.contains(event.target)) {
            return;
        }

        closeNav();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
            closeNav();
            navToggle.focus();
        }
    });

    mobileNav.addEventListener("change", (event) => {
        if (!event.matches) {
            closeNav();
        }
    });
}

document.querySelectorAll(".site-nav a[data-page]").forEach((link) => {
    if (link.dataset.page === currentPage) {
        link.classList.add("is-current");
        link.setAttribute("aria-current", "page");
    }
});

const handleScroll = () => {
    document.body.classList.toggle("is-scrolled", window.scrollY > 12);
};

handleScroll();
window.addEventListener("scroll", handleScroll, { passive: true });

const escapeHtml = (value) =>
    String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

const getInitials = (name) =>
    String(name || "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

const normalizeTeamMember = (member) => ({
    name: member.name || member.Name || "",
    role: member.role || member.Role || "",
    bio: member.bio || member.Bio || "",
    team: (member.team || member.Team || "support").toLowerCase(),
    image_url: member.image_url || member.Image_URL || member.image || member.Image || ""
});

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

const parseCsv = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (!lines.length) {
        return [];
    }

    const headers = parseCsvLine(lines[0]).map((header) => header.trim());
    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        return headers.reduce((record, header, index) => {
            record[header] = values[index] ? values[index].trim() : "";
            return record;
        }, {});
    });
};

const buildGoogleSheetsCsvUrl = (source) => {
    if (!source || !source.sheetId) {
        return "";
    }

    const url = new URL(`https://docs.google.com/spreadsheets/d/${source.sheetId}/gviz/tq`);
    url.searchParams.set("tqx", "out:csv");

    if (source.gid) {
        url.searchParams.set("gid", source.gid);
    }

    if (source.sheetName) {
        url.searchParams.set("sheet", source.sheetName);
    }

    return url.toString();
};

const resolveTeamEndpoint = (config) => {
    const source = config.source || {};

    if (source.type === "google-sheets-csv") {
        return buildGoogleSheetsCsvUrl(source);
    }

    if (source.type === "json" || source.type === "csv") {
        return source.endpoint || "";
    }

    return config.endpoint || source.endpoint || "";
};

const renderTeamCard = (member, variant = "support") => {
    const cardClass = variant === "office" ? "profile-card staff-card office-card" : "profile-card staff-card support-card";
    const imageMarkup = member.image_url
        ? `<img class="staff-photo" src="${escapeHtml(member.image_url)}" alt="${escapeHtml(member.name)}">`
        : "";

    return `
        <article class="${cardClass}">
            <div class="staff-photo-wrap">
                ${imageMarkup}
                <div class="staff-photo-fallback" aria-hidden="true">${escapeHtml(getInitials(member.name))}</div>
            </div>
            <div class="staff-card-header">
                <h3 class="staff-name">${escapeHtml(member.name)}</h3>
                <p class="profile-role">${escapeHtml(member.role || "Support Worker")}</p>
            </div>
            <p>${escapeHtml(member.bio)}</p>
        </article>
    `;
};

const attachImageFallbacks = () => {
    document.querySelectorAll(".staff-photo").forEach((image) => {
        image.addEventListener(
            "error",
            () => {
                image.remove();
            },
            { once: true }
        );
    });
};

const initTeamDirectory = async () => {
    const officeDirectory = document.querySelector("#office-directory");
    const supportDirectory = document.querySelector("#support-directory");
    const supportSearch = document.querySelector("#support-worker-search");
    const supportCount = document.querySelector("#support-worker-count");
    const supportEmptyState = document.querySelector("#support-empty-state");

    if (!officeDirectory || !supportDirectory) {
        return;
    }

    const config = window.teamDirectoryConfig || {};
    let teamMembers = Array.isArray(config.fallback) ? config.fallback.slice() : [];
    const endpoint = resolveTeamEndpoint(config);

    if (endpoint) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Request failed with ${response.status}`);
            }

            const contentType = response.headers.get("content-type") || "";
            const shouldParseCsv =
                contentType.includes("text/csv") ||
                contentType.includes("text/plain") ||
                endpoint.includes("out:csv") ||
                endpoint.includes("format=csv") ||
                endpoint.endsWith(".csv");
            const payload = shouldParseCsv
                ? parseCsv(await response.text())
                : await response.json();

            if (Array.isArray(payload) && payload.length) {
                teamMembers = payload;
            }
        } catch (error) {
            console.warn("Using fallback team data:", error);
        }
    }

    const normalizedMembers = teamMembers
        .map(normalizeTeamMember)
        .filter((member) => member.name && member.bio);

    const officeMembers = normalizedMembers.filter((member) => member.team === "office");
    const supportMembers = normalizedMembers.filter((member) => member.team !== "office");

    officeDirectory.innerHTML = officeMembers.map((member) => renderTeamCard(member, "office")).join("");
    attachImageFallbacks();

    const renderSupportMembers = (query = "") => {
        const searchTerm = query.trim().toLowerCase();
        const filteredMembers = supportMembers.filter((member) => {
            if (!searchTerm) {
                return true;
            }

            return [member.name, member.role, member.bio]
                .join(" ")
                .toLowerCase()
                .includes(searchTerm);
        });

        supportDirectory.innerHTML = filteredMembers.map((member) => renderTeamCard(member)).join("");
        attachImageFallbacks();

        if (supportCount) {
            const noun = filteredMembers.length === 1 ? "profile" : "profiles";
            supportCount.textContent = `${filteredMembers.length} support worker ${noun} shown`;
        }

        if (supportEmptyState) {
            supportEmptyState.hidden = filteredMembers.length !== 0;
        }
    };

    renderSupportMembers();

    if (supportSearch) {
        supportSearch.addEventListener("input", (event) => {
            renderSupportMembers(event.target.value);
        });
    }

};

initTeamDirectory();
