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
