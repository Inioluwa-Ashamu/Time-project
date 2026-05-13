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

const elearningModules = {
    "online-booking-system": {
        title: "Using the Online Booking System",
        group: "Orientation e-learning - Admin",
        summary: "How support workers view sessions, check key details, and use the booking system responsibly.",
        points: [
            "Find booked sessions and check the date, time, location, and family notes before you travel.",
            "Use booking information only for work purposes and keep personal information private.",
            "Contact bookings promptly if anything looks wrong or a session detail needs checking."
        ],
        checklist: [
            "Open the booking system and make sure you can access your current sessions.",
            "Check you know who to contact for booking changes, errors, or access problems.",
            "Keep login details secure and never share them with another person."
        ],
        links: [
            { label: "Open booking system", href: "https://booking-system.time-specialist-support.com/" },
            { label: "Email bookings", href: "mailto:bookings@time-specialist-support.com" }
        ]
    },
    "data-protection": {
        title: "Data protection",
        group: "Orientation e-learning - Admin",
        summary: "How to handle information about families, young people, colleagues, sessions, and records.",
        points: [
            "Only collect, use, and share information that is needed for the support being delivered.",
            "Keep family and young person information out of public places, personal social media, and unsecured messages.",
            "Report lost information, wrong recipients, or confidentiality concerns straight away."
        ],
        checklist: [
            "Read the relevant data protection, confidentiality, and retention policies.",
            "Check that you know the difference between useful session notes and unnecessary personal detail.",
            "Ask the office before sharing information if you are unsure."
        ],
        links: [
            { label: "Policies", href: "policies.html" },
            { label: "Privacy notice", href: "privacy.html" }
        ]
    },
    "cancellation-procedures": {
        title: "Cancellation Procedures",
        group: "Orientation e-learning - Admin",
        summary: "What to do when a session changes, cannot go ahead, or needs urgent office input.",
        points: [
            "Communicate early so families, workers, and the office are not left uncertain.",
            "Use the agreed booking route rather than informal arrangements that bypass the office.",
            "Record the reason for a cancellation or change clearly and professionally."
        ],
        checklist: [
            "Read the Cancellation Policy.",
            "Save the bookings email and office phone number somewhere easy to reach.",
            "Check what to do if illness, travel disruption, or family changes affect a planned session."
        ],
        links: [
            { label: "Policies", href: "policies.html" },
            { label: "Email bookings", href: "mailto:bookings@time-specialist-support.com" }
        ]
    },
    safeguarding: {
        title: "Safeguarding",
        group: "Orientation e-learning - Theory",
        summary: "Recognising concerns, responding calmly, recording accurately, and reporting without delay.",
        points: [
            "Listen and take concerns seriously, without promising secrecy or trying to investigate yourself.",
            "Record facts, dates, words used, visible signs, and actions taken as soon as possible.",
            "Use the agreed safeguarding route immediately when a child, young person, or adult may be at risk."
        ],
        checklist: [
            "Read the safeguarding policy and reporting form before orientation.",
            "Know who to contact at Time Specialist Support for urgent safeguarding advice.",
            "Call 999 if someone is in immediate danger."
        ],
        links: [
            { label: "What to do if you are worried a child is being abused", href: "https://time-specialist-support.com/wp-content/uploads/2019/11/What_to_do_if_you_re_worried_a_child_is_being_abused.pdf" },
            { label: "Reporting a safeguarding concern form", href: "https://time-specialist-support.com/wp-content/uploads/2021/05/Time-Specialist-Support-Reporting-a-Safeguarding-Concern-Form.docx" },
            { label: "Policies", href: "policies.html" }
        ]
    },
    autism: {
        title: "Autism",
        group: "Orientation e-learning - Theory",
        summary: "A practical introduction to autism, individual differences, predictability, communication, and sensory needs.",
        points: [
            "Start with the young person's own profile rather than assumptions about autism.",
            "Plan predictable, respectful support that gives time to process and reduces avoidable demands.",
            "Notice how communication, sensory processing, anxiety, and activity choice can affect a session."
        ],
        checklist: [
            "Read the person's available support information before meeting them.",
            "Prepare flexible activities that can be changed if the young person needs something different.",
            "Bring questions to orientation about anything in the young person's plan that is unclear."
        ],
        links: [
            { label: "How Time support works", href: "services.html" },
            { label: "Support Worker Hub", href: "support-workers.html" }
        ]
    },
    communication: {
        title: "Communication",
        group: "Orientation e-learning - Theory",
        summary: "Using clear, patient, individual communication with children, young people, families, and colleagues.",
        points: [
            "Give time to process and avoid filling every pause with more language.",
            "Use the communication tools, visuals, objects, signs, or routines already agreed with the family.",
            "Check understanding gently and adapt your pace, environment, and wording."
        ],
        checklist: [
            "Read any communication guidance in the young person's support information.",
            "Prepare simple language and visual choices for planned activities.",
            "Reflect after sessions on what helped communication and what could be adjusted."
        ],
        links: [
            { label: "Other ways of speaking", href: "https://time-specialist-support.com/wp-content/uploads/2016/02/other_ways_of_speaking_final.pdf" },
            { label: "5 good communication standards", href: "https://time-specialist-support.com/wp-content/uploads/2016/01/RCSLT-Good-standards-v-8-Nov-13.pdf" }
        ]
    },
    "sensory-theory": {
        title: "Sensory theory",
        group: "Orientation e-learning - Theory",
        summary: "How sensory processing can affect confidence, behaviour, communication, transitions, and activity planning.",
        points: [
            "Look for sensory needs behind distress, avoidance, movement, shutdown, or repeated requests.",
            "Plan around known preferences for noise, light, touch, smell, movement, food, clothing, and crowds.",
            "Use sensory information to prevent overload rather than only reacting after distress has built."
        ],
        checklist: [
            "Read sensory information in the young person's plan.",
            "Think through the sensory demands of travel, venues, queues, toilets, food, and transitions.",
            "Link this module with the sensory strategies module."
        ],
        links: [
            { label: "Luke Beardon sensory framework", href: "https://time-specialist-support.com/wp-content/uploads/2016/01/Luke-Beardon-SENSORY-FRAMEWORK.docx" },
            { label: "Sensory strategies module", href: "elearning-module.html?module=sensory-strategies" }
        ]
    },
    behaviour: {
        title: "Behaviour",
        group: "Orientation e-learning - Theory",
        summary: "Understanding behaviour as communication and using calm, person-centred support.",
        points: [
            "Ask what the behaviour may be communicating before deciding how to respond.",
            "Reduce triggers where possible and use familiar plans, routines, and regulation strategies.",
            "Record patterns and share relevant information with the office so support can improve."
        ],
        checklist: [
            "Read any behaviour support plan before your first session.",
            "Know what helps the young person feel safe, regulated, and listened to.",
            "Ask for advice if behaviour feels unsafe, unfamiliar, or outside your training."
        ],
        links: [
            { label: "Understanding challenging behaviour - part 1", href: "https://time-specialist-support.com/wp-content/uploads/2016/01/01-Understanding-Challenging-Behaviour-Part-1-web-1.pdf" },
            { label: "Positive Behaviour Support planning", href: "https://time-specialist-support.com/wp-content/uploads/2016/01/03-Positive-Behaviour-Support-Planning-Part-3-web-2014.pdf" }
        ]
    },
    "first-aid": {
        title: "First Aid",
        group: "Orientation e-learning - Theory",
        summary: "Basic first aid awareness, emergency response, and knowing when to seek urgent help.",
        points: [
            "Follow current first aid guidance and do not attempt support that is outside your training.",
            "Use emergency services immediately when someone is seriously unwell, injured, or in danger.",
            "Record incidents and notify the office using the agreed reporting route."
        ],
        checklist: [
            "Install or review a reputable first aid reference app.",
            "Read any person-specific health or seizure plan before a session.",
            "Know where incident reporting forms are kept in the Support Worker Hub."
        ],
        links: [
            { label: "British Red Cross first aid app", href: "https://www.redcross.org.uk/first-aid/first-aid-apps#app" },
            { label: "Tonic seizure video", href: "https://www.youtube.com/watch?v=pjmDY3tR6ak" },
            { label: "Tonic clonic seizure video", href: "https://www.youtube.com/watch?v=olArThAgUd8" }
        ]
    },
    "best-support-worker": {
        title: "How to be the best Support Worker you can be",
        group: "Orientation e-learning - Practical",
        summary: "The habits that make support reliable, thoughtful, boundaried, and person-led.",
        points: [
            "Be prepared, punctual, and clear with communication before and after sessions.",
            "Keep the young person's preferences, consent, dignity, and safety at the centre.",
            "Reflect honestly, ask questions early, and use feedback to keep improving."
        ],
        checklist: [
            "Read the support worker guide and checklist.",
            "Check you understand boundaries, lone working, transport, money, and communication expectations.",
            "Bring any practical questions to orientation."
        ],
        links: [
            { label: "Support Worker Hub", href: "support-workers.html" },
            { label: "Policies", href: "policies.html" }
        ]
    },
    "personal-care": {
        title: "Personal care",
        group: "Orientation e-learning - Practical",
        summary: "Supporting personal care with dignity, consent, privacy, safeguarding awareness, and clear boundaries.",
        points: [
            "Only provide personal care that is agreed, planned, and within your training.",
            "Protect privacy and dignity, and explain what you are doing in a way the person can understand.",
            "Report any concern, change, refusal, or uncertainty through the right route."
        ],
        checklist: [
            "Read the Personal Care Policy.",
            "Check the person's care plan before providing any personal care support.",
            "Ask the office before doing anything you have not been trained or asked to do."
        ],
        links: [
            { label: "Policies", href: "policies.html" },
            { label: "Ask the office", href: "mailto:info@time-specialist-support.com" }
        ]
    },
    "manual-handling": {
        title: "Manual Handling",
        group: "Orientation e-learning - Practical",
        summary: "Staying safe and only using agreed moving, handling, or physical support approaches.",
        points: [
            "Do not lift, move, or physically support someone in a way you have not been trained to do.",
            "Follow person-specific plans and ask for guidance when equipment, transfers, or risk changes.",
            "Report accidents, near misses, pain, or unsafe arrangements promptly."
        ],
        checklist: [
            "Read the Health and Safety Policy.",
            "Check whether a person has any moving or handling plan before the session.",
            "Stop and ask for advice if you are uncertain."
        ],
        links: [
            { label: "Policies", href: "policies.html" },
            { label: "Ask the office", href: "mailto:info@time-specialist-support.com" }
        ]
    },
    "sensory-strategies": {
        title: "Sensory strategies",
        group: "Orientation e-learning - Practical",
        summary: "Turning sensory understanding into practical session planning and support.",
        points: [
            "Prepare activities with sensory preferences, predictable breaks, and quieter alternatives in mind.",
            "Use agreed tools and routines, and avoid introducing unfamiliar sensory input without care.",
            "Notice early signs of overload and adapt before distress escalates."
        ],
        checklist: [
            "Pair this with the sensory theory module.",
            "Plan a lower-demand alternative before each session.",
            "Record what sensory adjustments helped so future sessions are easier."
        ],
        links: [
            { label: "Sensory theory module", href: "elearning-module.html?module=sensory-theory" },
            { label: "Support Worker Hub", href: "support-workers.html" }
        ]
    },
    "top-tips": {
        title: "Top tips from other Support Workers",
        group: "Orientation e-learning - Practical",
        summary: "Practical reminders gathered from support work: prepare well, stay flexible, and communicate early.",
        points: [
            "Read the plan, check travel, and have a backup idea before the session starts.",
            "Let the young person lead where possible and avoid rushing transitions.",
            "Share useful feedback with the office so the next session can build on what worked."
        ],
        checklist: [
            "Write down two habits you want to use in your first sessions.",
            "Use one minute feedback after sessions where it is requested.",
            "Ask experienced workers or the office for advice when something feels unclear."
        ],
        links: [
            { label: "One minute feedback", href: "one-minute-feedback.html" },
            { label: "Support Worker Hub", href: "support-workers.html" }
        ]
    },
    epilepsy: {
        title: "Epilepsy",
        group: "Extra e-learning",
        summary: "Epilepsy awareness, seizure first aid, person-specific plans, and reporting.",
        points: [
            "Know the person's seizure plan, triggers, emergency route, and recovery needs before the session.",
            "Stay calm, keep the person safe from injury, time the seizure, and follow current guidance.",
            "Record what happened and contact the office or emergency services as the plan requires."
        ],
        checklist: [
            "Watch the seizure awareness videos if epilepsy support is relevant to your role.",
            "Read any person-specific epilepsy plan before supporting the person.",
            "Ask the office if you are unsure about rescue medication, emergency thresholds, or recording."
        ],
        links: [
            { label: "Tonic seizure video", href: "https://www.youtube.com/watch?v=pjmDY3tR6ak" },
            { label: "Tonic clonic seizure video", href: "https://www.youtube.com/watch?v=olArThAgUd8" },
            { label: "First Aid module", href: "elearning-module.html?module=first-aid" }
        ]
    },
    "behaviour-that-challenges": {
        title: "Understanding and dealing with behaviour that challenges",
        group: "Extra e-learning",
        summary: "A deeper look at prevention, causes, distress, communication, and positive behaviour support.",
        points: [
            "Look for causes such as pain, sensory overload, communication difficulty, anxiety, or unmet needs.",
            "Focus on prevention, regulation, and agreed support plans before behaviour escalates.",
            "Share patterns with the office so support plans can be reviewed and improved."
        ],
        checklist: [
            "Complete the behaviour orientation module first.",
            "Read the linked challenging behaviour resources.",
            "Bring questions to the office if a plan feels unclear or risk has changed."
        ],
        links: [
            { label: "Behaviour module", href: "elearning-module.html?module=behaviour" },
            { label: "Finding the causes of challenging behaviour", href: "https://time-specialist-support.com/wp-content/uploads/2016/01/02-Finding-the-Causes-of-Challenging-Behaviour-Part-2-web.pdf" }
        ]
    },
    "sensory-perception": {
        title: "Sensory perception and autism",
        group: "Extra e-learning",
        summary: "Extra sensory learning for understanding how environments, activities, and transitions may feel different.",
        points: [
            "Consider how noise, smell, touch, movement, visual information, and unpredictability may affect the person.",
            "Use sensory preferences to plan enjoyable sessions, not only to prevent difficult moments.",
            "Review what helped after each session and adapt future plans."
        ],
        checklist: [
            "Complete sensory theory and sensory strategies first.",
            "Check the young person's known sensory likes, dislikes, and regulation tools.",
            "Plan transport, venues, timings, food, and breaks with sensory needs in mind."
        ],
        links: [
            { label: "Sensory theory module", href: "elearning-module.html?module=sensory-theory" },
            { label: "Sensory strategies module", href: "elearning-module.html?module=sensory-strategies" }
        ]
    },
    "diabetes-awareness": {
        title: "Diabetes Awareness Training",
        group: "Extra e-learning",
        summary: "Diabetes awareness for workers who may support someone with person-specific diabetes needs.",
        points: [
            "Follow the person's plan exactly and do not improvise clinical support.",
            "Know the signs that the person may be unwell and the emergency route in their plan.",
            "Ask the office for person-specific guidance before the first relevant session."
        ],
        checklist: [
            "Read any health plan supplied for the person.",
            "Confirm what your role is and what is outside your role.",
            "Check who to contact in an emergency or if readings, food, activity, or illness create concern."
        ],
        links: [
            { label: "Ask for person-specific guidance", href: "mailto:info@time-specialist-support.com" },
            { label: "Policies", href: "policies.html" }
        ]
    },
    "modern-slavery-awareness": {
        title: "Modern Slavery Awareness Training",
        group: "Extra e-learning",
        summary: "Recognising signs of exploitation and understanding how modern slavery awareness connects with safeguarding.",
        points: [
            "Be alert to indicators of exploitation, coercion, control, unsafe work, or restricted freedom.",
            "Treat concerns as safeguarding concerns and use the agreed reporting route.",
            "Record factual observations and avoid investigating or confronting alleged perpetrators yourself."
        ],
        checklist: [
            "Read the Modern Slavery Statement.",
            "Review the relevant policy route in the policies page.",
            "Ask for safeguarding advice immediately if exploitation may be present."
        ],
        links: [
            { label: "Modern Slavery Statement", href: "modern-slavery.html" },
            { label: "Policies", href: "policies.html" }
        ]
    }
};

const initElearningModule = () => {
    const modulePage = document.querySelector("[data-elearning-module]");
    if (!modulePage) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedModule = params.get("module") || window.location.hash.replace("#", "");
    const moduleKey = elearningModules[requestedModule] ? requestedModule : "online-booking-system";
    const module = elearningModules[moduleKey];

    document.title = `${module.title} | Time Specialist Support`;
    modulePage.querySelector("[data-module-group]").textContent = module.group;
    modulePage.querySelector("[data-module-title]").textContent = `${module.title}.`;
    modulePage.querySelector("[data-module-summary]").textContent = module.summary;

    modulePage.querySelector("[data-module-points]").innerHTML = module.points
        .map((point) => `<article class="detail-card"><p>${escapeHtml(point)}</p></article>`)
        .join("");

    modulePage.querySelector("[data-module-checklist]").innerHTML = module.checklist
        .map((item) => `<span>${escapeHtml(item)}</span>`)
        .join("");

    modulePage.querySelector("[data-module-links]").innerHTML = module.links
        .map((link) => {
            const isExternal = /^https?:\/\//.test(link.href);
            const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
            return `<a href="${escapeHtml(link.href)}"${target}>${escapeHtml(link.label)}</a>`;
        })
        .join("");

    history.replaceState(null, "", `?module=${encodeURIComponent(moduleKey)}`);
};

initElearningModule();

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
    const actionMarkup =
        variant === "support"
            ? `<button class="text-link profile-toggle" type="button" aria-expanded="false">Read full profile</button>`
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

    supportDirectory.addEventListener("click", (event) => {
        const toggle = event.target.closest(".profile-toggle");
        if (!toggle) {
            return;
        }

        const card = toggle.closest(".support-card");
        const isExpanded = card.classList.toggle("is-expanded");
        toggle.setAttribute("aria-expanded", String(isExpanded));
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
