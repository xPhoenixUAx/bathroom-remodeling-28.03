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
  const cookieConsentStorageKey = "bathscope-cookie-consent";
  let formConfirmationModal = null;
  let lastModalFocusedElement = null;
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
        form.reset();
        openFormConfirmationModal();
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

  const getCookieConsent = () => {
    try {
      return window.localStorage.getItem(cookieConsentStorageKey);
    } catch {
      return null;
    }
  };

  const setCookieConsent = (value) => {
    body.dataset.cookieConsent = value;

    try {
      window.localStorage.setItem(cookieConsentStorageKey, value);
    } catch {
      // Ignore storage failures and keep consent only in-memory for this visit.
    }
  };

  const mountCookieBanner = () => {
    const storedConsent = getCookieConsent();

    if (storedConsent) {
      body.dataset.cookieConsent = storedConsent;
      return;
    }

    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie notice");
    banner.innerHTML = `
      <div class="cookie-banner__panel">
        <div class="cookie-banner__copy">
          <span>Cookie Notice</span>
          <p>
            BathScope Guide uses cookies and similar technologies to support core site
            functionality, understand traffic patterns, and improve the website experience.
            You can accept all cookies or decline non-essential cookies.
          </p>
        </div>
        <div class="cookie-banner__actions">
          <a class="text-link" href="cookie.html">Cookie Policy</a>
          <button class="button button--light" type="button" data-cookie-action="decline">
            Decline Non-Essential
          </button>
          <button class="button button--dark" type="button" data-cookie-action="accept">
            Accept Cookies
          </button>
        </div>
      </div>
    `;

    const closeBanner = (choice) => {
      setCookieConsent(choice);
      banner.classList.remove("is-visible");

      window.setTimeout(() => {
        banner.remove();
      }, 420);
    };

    banner.querySelector('[data-cookie-action="decline"]')?.addEventListener("click", () => {
      closeBanner("rejected");
    });

    banner.querySelector('[data-cookie-action="accept"]')?.addEventListener("click", () => {
      closeBanner("accepted");
    });

    document.body.appendChild(banner);

    window.requestAnimationFrame(() => {
      banner.classList.add("is-visible");
    });
  };

  const closeFormConfirmationModal = () => {
    if (!formConfirmationModal) {
      return;
    }

    formConfirmationModal.classList.remove("is-open");
    formConfirmationModal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");

    window.setTimeout(() => {
      formConfirmationModal?.setAttribute("hidden", "");
    }, 280);

    if (lastModalFocusedElement instanceof HTMLElement) {
      lastModalFocusedElement.focus();
    }
  };

  const mountFormConfirmationModal = () => {
    if (formConfirmationModal) {
      return formConfirmationModal;
    }

    const modal = document.createElement("div");
    modal.className = "confirmation-modal";
    modal.setAttribute("hidden", "");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="confirmation-modal__backdrop" data-modal-close></div>
      <div class="confirmation-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="form-confirmation-title">
        <div class="confirmation-modal__panel">
          <button class="confirmation-modal__close" type="button" aria-label="Close confirmation" data-modal-close>
            <i data-lucide="x"></i>
          </button>
          <div class="confirmation-modal__icon" aria-hidden="true">
            <i data-lucide="check"></i>
          </div>
          <div class="confirmation-modal__copy">
            <span>Request Received</span>
            <h2 id="form-confirmation-title">Thank you.</h2>
            <p>
              Your project details have been received. The next step would typically
              be reviewing the remodeling paths and local independent contractor
              categories that best align with your request.
            </p>
          </div>
          <div class="confirmation-modal__actions">
            <button class="button button--dark" type="button" data-modal-close>
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    modal.querySelectorAll("[data-modal-close]").forEach((button) => {
      button.addEventListener("click", closeFormConfirmationModal);
    });

    document.body.appendChild(modal);
    formConfirmationModal = modal;
    createIcons();
    return modal;
  };

  const openFormConfirmationModal = () => {
    const modal = mountFormConfirmationModal();

    lastModalFocusedElement = document.activeElement;
    modal.removeAttribute("hidden");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");

    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      modal.querySelector(".confirmation-modal__close")?.focus();
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
  mountCookieBanner();

  window.addEventListener("scroll", updateHeaderState, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && formConfirmationModal?.classList.contains("is-open")) {
      closeFormConfirmationModal();
    }
  });
})();
