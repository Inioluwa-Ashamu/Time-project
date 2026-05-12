const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const currentPage = document.body.dataset.page;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let revealObserver;
let revealDelayIndex = 0;

if (navToggle && siteNav) {
    const mobileNav = window.matchMedia("(max-width: 1100px)");

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

const createRevealObserver = () => {
    if (revealObserver || !("IntersectionObserver" in window) || reducedMotionQuery.matches) {
        return revealObserver;
    }

    revealObserver = new IntersectionObserver(
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

    return revealObserver;
};

const queueRevealItems = (items) => {
    const revealItems = Array.from(items).filter((item) => item && !item.classList.contains("reveal-item"));

    if (!revealItems.length) {
        return;
    }

    if (!("IntersectionObserver" in window) || reducedMotionQuery.matches) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = createRevealObserver();

    revealItems.forEach((item, index) => {
        item.classList.add("reveal-item");
        item.style.setProperty("--reveal-delay", `${Math.min((revealDelayIndex + index) % 6, 5) * 45}ms`);
        observer.observe(item);
    });

    revealDelayIndex += revealItems.length;
};

const initScrollReveals = () => {
    const revealItems = document.querySelectorAll(
        ".section-heading, .proof-list, .info-card, .mini-card, .timeline-card, .pathway-card, .detail-card, .quote-card, .resource-card, .contact-card, .contact-helper, .split-panel, .founder-profile, .practice-strip, .support-snapshot"
    );

    queueRevealItems(revealItems);
};

initScrollReveals();

const initScrollControls = () => {
    const progress = document.createElement("div");
    const backToTop = document.createElement("button");

    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");

    backToTop.className = "back-to-top";
    backToTop.type = "button";
    backToTop.textContent = "Top";
    backToTop.setAttribute("aria-label", "Back to top");

    document.body.append(progress, backToTop);

    const updateScrollControls = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressValue = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

        progress.style.transform = `scaleX(${Math.min(Math.max(progressValue, 0), 1)})`;
        backToTop.classList.toggle("is-visible", window.scrollY > 520);
    };

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: reducedMotionQuery.matches ? "auto" : "smooth"
        });
    });

    updateScrollControls();
    window.addEventListener("scroll", updateScrollControls, { passive: true });
    window.addEventListener("resize", updateScrollControls);
};

initScrollControls();

const initExternalLinkLabels = () => {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
        if (link.querySelector(".sr-only")) {
            return;
        }

        const hiddenLabel = document.createElement("span");
        hiddenLabel.className = "sr-only";
        hiddenLabel.textContent = " (opens in a new tab)";
        link.append(hiddenLabel);
    });
};

initExternalLinkLabels();

const initContactHelper = () => {
    const helperButtons = document.querySelectorAll(".helper-option[data-template]");
    const enquiryType = document.querySelector("#contact-type");
    const messageField = document.querySelector("#contact-message");
    const status = document.querySelector("#contact-helper-status");

    if (!messageField) {
        return;
    }

    const templates = {
        support: {
            type: "Support enquiry",
            message:
                "I am looking for support for a young person. It would be helpful to talk about their interests, routine, communication, sensory needs, and what would make family life feel steadier."
        },
        referral: {
            type: "Referral or professional enquiry",
            message:
                "I am contacting you as a professional. I would like to discuss whether Time Specialist Support may be suitable for a young person or family I am working with."
        },
        recruitment: {
            type: "Recruitment",
            message:
                "I am interested in support worker opportunities and would like to ask about current recruitment, availability, and the application process."
        },
        feedback: {
            type: "Feedback or complaint",
            message:
                "I would like to share feedback or raise a concern. Please let me know the next step and who will be handling this."
        }
    };

    const applyTemplate = ({ type, message }, shouldFocus = true) => {
        if (enquiryType && type) {
            enquiryType.value = type;
        }

        if (!messageField.value.trim()) {
            messageField.value = message;
        } else if (!messageField.value.includes(message)) {
            messageField.value = `${messageField.value.trim()}\n\n${message}`;
        }

        if (status) {
            status.textContent = "A suggested message has been added. You can edit it before sending.";
        }

        if (shouldFocus) {
            messageField.focus();
        }
    };

    helperButtons.forEach((button) => {
        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", () => {
            helperButtons.forEach((option) => {
                option.classList.remove("is-selected");
                option.setAttribute("aria-pressed", "false");
            });

            button.classList.add("is-selected");
            button.setAttribute("aria-pressed", "true");

            applyTemplate({
                type: button.dataset.enquiryType || "",
                message: button.dataset.template || ""
            });
        });
    });

    const topic = new URLSearchParams(window.location.search).get("topic");
    if (topic && templates[topic]) {
        applyTemplate(templates[topic], false);

        const matchingButton = Array.from(helperButtons).find((button) => button.dataset.enquiryType === templates[topic].type);
        if (matchingButton) {
            matchingButton.classList.add("is-selected");
            matchingButton.setAttribute("aria-pressed", "true");
        }
    }
};

initContactHelper();

const initFormSubmissionFeedback = () => {
    document.querySelectorAll(".contact-form").forEach((form) => {
        form.addEventListener("submit", () => {
            const submitButton = form.querySelector('button[type="submit"]');

            if (!submitButton) {
                return;
            }

            form.setAttribute("aria-busy", "true");
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.textContent;
            submitButton.textContent = "Sending...";
        });
    });
};

initFormSubmissionFeedback();

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
    const actionMarkup =
        variant === "support"
            ? `<button class="text-link profile-toggle" type="button" aria-expanded="false" aria-label="Read full profile for ${escapeHtml(member.name)}" data-profile-name="${escapeHtml(member.name)}">Read full profile</button>`
            : "";

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
    queueRevealItems(officeDirectory.querySelectorAll(".office-card"));

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
        queueRevealItems(supportDirectory.querySelectorAll(".support-card"));

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

    supportDirectory.addEventListener("click", (event) => {
        const toggle = event.target.closest(".profile-toggle");
        if (!toggle) {
            return;
        }

        const card = toggle.closest(".support-card");
        const isExpanded = card.classList.toggle("is-expanded");
        const profileName = toggle.dataset.profileName || "this support worker";

        toggle.setAttribute("aria-expanded", String(isExpanded));
        toggle.setAttribute("aria-label", isExpanded ? `Show less of profile for ${profileName}` : `Read full profile for ${profileName}`);
        toggle.textContent = isExpanded ? "Show less" : "Read full profile";
    });

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
        passwordInput.removeAttribute("aria-invalid");
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
        passwordInput.removeAttribute("aria-invalid");
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

            passwordInput.removeAttribute("aria-invalid");
            unlockHub();
            return;
        }

        if (errorMessage) {
            errorMessage.hidden = false;
        }

        passwordInput.setAttribute("aria-invalid", "true");
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
