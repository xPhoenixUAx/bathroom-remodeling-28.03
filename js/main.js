(() => {
  const body = document.body;
  body.classList.add("js-ready");
  const header = document.querySelector(".site-header");
  const menu = document.getElementById("mobile-menu");
  const openButtons = document.querySelectorAll("[data-menu-open]");
  const closeButtons = document.querySelectorAll("[data-menu-close]");
  const mobileServicesToggle = menu?.querySelector("[data-mobile-services-toggle]");
  const mobileServicesPanel = menu?.querySelector("[data-mobile-services-panel]");
  const faqGroups = document.querySelectorAll("[data-faq-group]");
  const forms = document.querySelectorAll("form");
  const revealItems = document.querySelectorAll("[data-reveal]");
  const page = body.dataset.page;
  const service = body.dataset.service;
  let lastFocusedElement = null;

  const createIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  };

  const updateHeaderState = () => {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  const markActiveNav = () => {
    if (!page) {
      return;
    }

    document.querySelectorAll(`[data-nav="${page}"]`).forEach((link) => {
      link.classList.add("is-active");
    });

    if (!service) {
      return;
    }

    document.querySelectorAll(`[data-service-link="${service}"]`).forEach((link) => {
      link.classList.add("is-current");
    });
  };

  const toggleMenu = (open) => {
    if (!menu) {
      return;
    }

    if (open) {
      lastFocusedElement = document.activeElement;
    }

    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    body.classList.toggle("menu-open", open);

    openButtons.forEach((button) => {
      button.setAttribute("aria-expanded", String(open));
    });

    if (open) {
      window.requestAnimationFrame(() => {
        menu.querySelector("a, button")?.focus();
      });
    } else if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const setMobileServicesState = (open) => {
    if (!mobileServicesToggle || !mobileServicesPanel) {
      return;
    }

    const mobileServicesItem = mobileServicesToggle.closest(".mobile-submenu");

    mobileServicesItem?.classList.toggle("is-open", open);
    mobileServicesToggle.setAttribute("aria-expanded", String(open));
    mobileServicesPanel.setAttribute("aria-hidden", String(!open));
  };

  const bindMenu = () => {
    if (!menu) {
      return;
    }

    if (mobileServicesToggle && mobileServicesPanel) {
      setMobileServicesState(page === "services");

      mobileServicesToggle.addEventListener("click", () => {
        setMobileServicesState(mobileServicesToggle.getAttribute("aria-expanded") !== "true");
      });
    }

    openButtons.forEach((button) => {
      button.addEventListener("click", () => toggleMenu(true));
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", () => toggleMenu(false));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        toggleMenu(false);
      }
    });
  };

  const bindFaqs = () => {
    faqGroups.forEach((group) => {
      const items = Array.from(group.querySelectorAll(".faq-item"));
      const setFaqState = (item, open) => {
        const button = item.querySelector("[data-faq-question]");
        const answer = item.querySelector("[data-faq-answer]");

        if (!button || !answer) {
          return;
        }

        item.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", String(open));
        answer.hidden = false;
        answer.setAttribute("aria-hidden", String(!open));
      };

      items.forEach((item) => {
        const button = item.querySelector("[data-faq-question]");
        const answer = item.querySelector("[data-faq-answer]");

        if (!button || !answer) {
          return;
        }

        setFaqState(item, button.getAttribute("aria-expanded") === "true");

        button.addEventListener("click", () => {
          const shouldOpen = button.getAttribute("aria-expanded") !== "true";

          items.forEach((otherItem) => {
            setFaqState(otherItem, false);
          });

          if (shouldOpen) {
            setFaqState(item, true);
          }
        });
      });
    });
  };

  const bindForms = () => {
    forms.forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        let feedback = form.querySelector(".form-feedback");

        if (!feedback) {
          feedback = document.createElement("p");
          feedback.className = "form-feedback";
          feedback.setAttribute("role", "status");
          form.appendChild(feedback);
        }

        feedback.textContent =
          "Thank you. Your request has been received, and the next step would typically be reviewing local independent contractor options based on your project details.";
        form.reset();
      });
    });
  };

  const bindReveal = () => {
    if (!revealItems.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 40, 220)}ms`;
      observer.observe(item);
    });
  };

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  createIcons();
  updateHeaderState();
  markActiveNav();
  bindMenu();
  bindFaqs();
  bindForms();
  bindReveal();

  window.addEventListener("scroll", updateHeaderState, { passive: true });
})();
