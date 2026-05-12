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

const initScrollReveals = () => {
    const revealItems = document.querySelectorAll(
        ".section-heading, .info-card, .mini-card, .timeline-card, .pathway-card, .detail-card, .step-card, .faq-item, .quote-card, .resource-card, .contact-card, .split-panel, .founder-profile, .practice-strip, .support-snapshot, .proof-grid article"
    );

    if (!revealItems.length) {
        return;
    }

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    revealItems.forEach((item, index) => {
        item.classList.add("reveal-item");
        item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 45}ms`);
    });

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -8% 0px"
        }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
};

initScrollReveals();

const initEnquiryAssistant = () => {
    const assistant = document.createElement("section");
    assistant.className = "chat-assistant";
    assistant.setAttribute("aria-label", "Quick help");

    assistant.innerHTML = `
        <button
            class="chat-launcher"
            type="button"
            aria-expanded="false"
            aria-controls="chat-panel"
        >
            Quick help
        </button>
        <div class="chat-panel" id="chat-panel" role="region" aria-labelledby="chat-title" hidden>
            <div class="chat-header">
                <div>
                    <p class="chat-kicker">Time Specialist Support</p>
                    <h2 id="chat-title">How can we help?</h2>
                </div>
                <button class="chat-close" type="button" aria-label="Close quick help">Close</button>
            </div>
            <div class="chat-body" aria-live="polite">
                <p class="chat-message">
                    Choose the option closest to what you need. For emergencies or urgent safeguarding concerns,
                    use emergency services or your local safeguarding route.
                </p>
                <div class="chat-options" aria-label="Quick help options"></div>
                <div class="chat-response" tabindex="-1"></div>
            </div>
        </div>
    `;

    document.body.appendChild(assistant);

    const launcher = assistant.querySelector(".chat-launcher");
    const panel = assistant.querySelector(".chat-panel");
    const closeButton = assistant.querySelector(".chat-close");
    const optionsWrap = assistant.querySelector(".chat-options");
    const response = assistant.querySelector(".chat-response");

    const options = [
        {
            label: "Family support",
            title: "Looking for support for a child or young person?",
            text: "Tell us a little about the support needed, the area you live in, and the best way to contact you.",
            links: [
                { label: "Make an enquiry", href: "contact.html" },
                { label: "Read how support works", href: "services.html" }
            ]
        },
        {
            label: "Referral",
            title: "Making or discussing a referral?",
            text: "Professionals can contact the team to discuss suitability, matching, and what information would help.",
            links: [
                { label: "Contact the team", href: "contact.html" },
                { label: "Read parent FAQs", href: "faq.html" }
            ]
        },
        {
            label: "Recruitment",
            title: "Interested in support work?",
            text: "The careers page explains the role, current locations, application form, and job description.",
            links: [
                { label: "View careers", href: "careers.html" },
                { label: "Email recruitment", href: "mailto:recruitment@time-specialist-support.com" }
            ]
        },
        {
            label: "Staff resources",
            title: "Looking for worker forms or policies?",
            text: "The Support Worker Hub contains forms, safeguarding documents, policies, training links, and session resources. It is password protected for current workers.",
            links: [
                { label: "Open Support Worker Hub", href: "support-workers.html" },
                { label: "Useful links", href: "resources.html" }
            ]
        },
        {
            label: "Feedback",
            title: "Need to share feedback or a complaint?",
            text: "Use the contact form or phone/email the office. If your concern involves management, you can contact Tori directly.",
            links: [
                { label: "Send feedback", href: "contact.html" },
                { label: "Email Tori", href: "mailto:tori@time-specialist-support.com" }
            ]
        },
        {
            label: "Urgent concern",
            title: "Urgent safeguarding or emergency concern",
            text: "Do not wait for an online response in an emergency. If someone is in immediate danger, call 999. For urgent safeguarding concerns, use the relevant local safeguarding route.",
            links: [
                { label: "Call 999", href: "tel:999" },
                { label: "Call Time", href: "tel:+441618797984" }
            ]
        }
    ];

    const renderResponse = (option) => {
        response.innerHTML = `
            <h3>${escapeHtml(option.title)}</h3>
            <p>${escapeHtml(option.text)}</p>
            <div class="chat-links">
                ${option.links
                    .map((link) => `<a class="button button-secondary" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
                    .join("")}
            </div>
        `;
        response.focus();
    };

    optionsWrap.innerHTML = options
        .map((option, index) => `<button class="chat-option" type="button" data-option-index="${index}">${escapeHtml(option.label)}</button>`)
        .join("");

    const openPanel = () => {
        panel.hidden = false;
        launcher.setAttribute("aria-expanded", "true");
        const firstOption = optionsWrap.querySelector("button");
        if (firstOption) {
            firstOption.focus();
        }
    };

    const closePanel = () => {
        panel.hidden = true;
        launcher.setAttribute("aria-expanded", "false");
        launcher.focus();
    };

    launcher.addEventListener("click", () => {
        if (panel.hidden) {
            openPanel();
            return;
        }

        closePanel();
    });

    closeButton.addEventListener("click", closePanel);

    optionsWrap.addEventListener("click", (event) => {
        const optionButton = event.target.closest("[data-option-index]");
        if (!optionButton) {
            return;
        }

        const option = options[Number(optionButton.dataset.optionIndex)];
        if (option) {
            renderResponse(option);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !panel.hidden) {
            closePanel();
        }
    });
};

const escapeHtml = (value) =>
    String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

initEnquiryAssistant();

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
    const actionMarkup = `<button class="text-link profile-toggle" type="button" aria-expanded="false">Read full profile</button>`;

    return `
        <article class="${cardClass}">
            <div class="staff-photo-wrap">
                ${imageMarkup}
                <div class="staff-photo-fallback" aria-hidden="true">${escapeHtml(getInitials(member.name))}</div>
            </div>
            <div class="staff-card-body">
                <div class="staff-card-header">
                    <h3 class="staff-name">${escapeHtml(member.name)}</h3>
                    <p class="profile-role">${escapeHtml(member.role || "Support Worker")}</p>
                </div>
                <p class="staff-bio">${escapeHtml(member.bio)}</p>
                ${actionMarkup}
            </div>
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
    const supportLoadMore = document.querySelector("#support-worker-load-more");
    const supportReset = document.querySelector("#support-worker-reset");

    if (!officeDirectory || !supportDirectory) {
        return;
    }

    const initialSupportCount = 12;
    const supportBatchSize = 12;
    let visibleSupportCount = initialSupportCount;

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
        const shouldLimitResults = !searchTerm;
        const visibleMembers = shouldLimitResults
            ? filteredMembers.slice(0, visibleSupportCount)
            : filteredMembers;

        supportDirectory.innerHTML = visibleMembers.map((member) => renderTeamCard(member)).join("");
        attachImageFallbacks();

        if (supportCount) {
            const noun = filteredMembers.length === 1 ? "profile" : "profiles";
            supportCount.textContent = shouldLimitResults && filteredMembers.length > visibleMembers.length
                ? `${visibleMembers.length} of ${filteredMembers.length} support worker ${noun} shown`
                : `${filteredMembers.length} support worker ${noun} shown`;
        }

        if (supportEmptyState) {
            supportEmptyState.hidden = filteredMembers.length !== 0;
        }

        if (supportLoadMore) {
            supportLoadMore.hidden = !shouldLimitResults || visibleMembers.length >= filteredMembers.length;
            supportLoadMore.textContent = `Show ${Math.min(supportBatchSize, filteredMembers.length - visibleMembers.length)} more profiles`;
        }

        if (supportReset) {
            supportReset.hidden = !searchTerm;
        }
    };

    renderSupportMembers();

    if (supportSearch) {
        supportSearch.addEventListener("input", (event) => {
            visibleSupportCount = initialSupportCount;
            renderSupportMembers(event.target.value);
        });
    }

    if (supportLoadMore) {
        supportLoadMore.addEventListener("click", () => {
            visibleSupportCount += supportBatchSize;
            renderSupportMembers(supportSearch ? supportSearch.value : "");
        });
    }

    if (supportReset && supportSearch) {
        supportReset.addEventListener("click", () => {
            supportSearch.value = "";
            visibleSupportCount = initialSupportCount;
            renderSupportMembers();
            supportSearch.focus();
        });
    }

    const handleProfileToggle = (event) => {
        const toggle = event.target.closest(".profile-toggle");
        if (!toggle) {
            return;
        }

        const card = toggle.closest(".support-card, .office-card");
        const isExpanded = card.classList.toggle("is-expanded");
        toggle.setAttribute("aria-expanded", String(isExpanded));
        toggle.textContent = isExpanded ? "Show less" : "Read full profile";
    };

    officeDirectory.addEventListener("click", handleProfileToggle);
    supportDirectory.addEventListener("click", handleProfileToggle);

};

initTeamDirectory();

const initSupportWorkerHub = () => {
    const lockSection = document.querySelector("#support-worker-lock");
    const contentSection = document.querySelector("#support-worker-content");
    const loginForm = document.querySelector("#support-worker-login");
    const passwordInput = document.querySelector("#support-worker-password");
    const errorMessage = document.querySelector("#support-worker-password-error");
    const lockButton = document.querySelector("#support-worker-lock-button");
    const resourceSearch = document.querySelector("#support-resource-search");
    const emptyState = document.querySelector("#support-resource-empty");
    const resourceCards = Array.from(document.querySelectorAll("[data-resource-card]"));

    if (!lockSection || !contentSection || !loginForm || !passwordInput) {
        return;
    }

    const passwordHash = "b03ae420e342195770900e49fd6ff0f2f3d266b631075c7dc57c87782625a3c3";
    const storageKey = "tssSupportWorkerHubUnlocked";

    const hashPassword = async (value) => {
        const encodedValue = new TextEncoder().encode(value);
        const digest = await crypto.subtle.digest("SHA-256", encodedValue);
        return Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
    };

    const unlockHub = () => {
        lockSection.hidden = true;
        contentSection.hidden = false;
        sessionStorage.setItem(storageKey, "true");

        if (resourceSearch) {
            resourceSearch.focus();
        }
    };

    const lockHub = () => {
        sessionStorage.removeItem(storageKey);
        contentSection.hidden = true;
        lockSection.hidden = false;
        passwordInput.value = "";
        passwordInput.focus();
    };

    if (sessionStorage.getItem(storageKey) === "true") {
        unlockHub();
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        let enteredHash = "";

        try {
            enteredHash = await hashPassword(passwordInput.value);
        } catch (error) {
            enteredHash = "";
        }

        if (enteredHash === passwordHash) {
            if (errorMessage) {
                errorMessage.hidden = true;
            }

            unlockHub();
            return;
        }

        if (errorMessage) {
            errorMessage.hidden = false;
        }

        passwordInput.select();
    });

    if (lockButton) {
        lockButton.addEventListener("click", lockHub);
    }

    if (resourceSearch) {
        resourceSearch.addEventListener("input", (event) => {
            const searchTerm = event.target.value.trim().toLowerCase();
            let visibleCount = 0;

            resourceCards.forEach((card) => {
                const isMatch = !searchTerm || card.textContent.toLowerCase().includes(searchTerm);
                card.hidden = !isMatch;

                if (isMatch) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        });
    }
};

initSupportWorkerHub();
