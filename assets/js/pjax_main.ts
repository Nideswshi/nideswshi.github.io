var getRealPath = (pathname = window.location.pathname, desc = false) => {
  const names = pathname.split("/").filter((name) => {
    name = name.trim();
    return name.length > 0 && name !== "/" && name !== "index.html";
  });
  if (desc) {
    return names[0] || "/";
  } else {
    return names[names.length - 1] || "/";
  }
};

const CARD_LANDING_STORAGE_KEY = "apple-card-landing";

try {
  const landingRaw = window.sessionStorage.getItem(CARD_LANDING_STORAGE_KEY);
  if (landingRaw) {
    const landing = JSON.parse(landingRaw) as { pathname?: string; time?: number };
    const isFresh = landing.time && Date.now() - landing.time < 5000;
    if (landing.pathname === window.location.pathname && isFresh) {
      document.body.classList.add("is-detail-landing");
      window.setTimeout(() => {
        document.body.classList.remove("is-detail-landing");
      }, 1800);
    }
    window.sessionStorage.removeItem(CARD_LANDING_STORAGE_KEY);
  }
} catch {}

var scrollIntoViewAndWait = (element: HTMLElement) => {
  return new Promise<void>((resolve) => {
    if ("onscrollend" in window) {
      document.addEventListener("scrollend", resolve as any, { once: true });
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    } else {
      element.scrollIntoView({ block: "center", inline: "center" });
      resolve();
    }
  });
};

// anchor
_$$(
  ".article-entry h1>a.header-anchor, .article-entry h2>a.header-anchor, .article-entry h3>a.header-anchor, .article-entry h4>a.header-anchor, .article-entry h5>a.header-anchor, .article-entry h6>a.header-anchor",
).forEach((element) => {
  if (window.siteConfig.icon_font) {
    element.innerHTML = window.siteConfig.anchor_icon
      ? `&#x${window.siteConfig.anchor_icon};`
      : window.siteConfig.anchor_icon === false
        ? ""
        : "&#xe635;";
  } else {
    element.innerHTML = window.siteConfig.anchor_icon
      ? `&#x${window.siteConfig.anchor_icon};`
      : window.siteConfig.anchor_icon === false
        ? ""
        : "&#xf292;";
  }
});

// lightbox
(_$$(".article-entry img") as unknown as HTMLImageElement[]).forEach(
  (element) => {
    if (
      element.parentElement?.classList.contains("friend-icon") ||
      element.parentElement?.tagName === "A" ||
      element.classList.contains("no-lightbox")
    )
      return;
    const a = document.createElement("a");
    a.href ? (a.href = element.src) : a.setAttribute("href", element.src);
    a.dataset.pswpWidth = element.naturalWidth as any;
    a.dataset.pswpHeight = element.naturalHeight as any;
    a.target = "_blank";
    a.classList.add("article-gallery-item");
    element.parentNode?.insertBefore(a, element);
    element.parentNode?.removeChild(element);
    a.appendChild(element);
  },
);

// table wrap
_$$(".article-entry table").forEach((element) => {
  if (element.closest("div.highlight")) return;
  const wrapper = document.createElement("div");
  wrapper.classList.add("table-wrapper");
  element.parentNode?.insertBefore(wrapper, element);
  element.parentNode?.removeChild(element);
  wrapper.appendChild(element);
});

// Mobile nav
var isMobileNavAnim = false;
const mobileNavOpenClass = "mobile-nav-on";
const mobileNavMotionDuration = 280;

const setMobileNavState = (isOpen: boolean) => {
  window.requestAnimationFrame(() => {
    document.body.classList.toggle(mobileNavOpenClass, isOpen);
    _$("#mask")?.classList.toggle("hide", !isOpen);
  });
};

_$("#main-nav-toggle")
  ?.off("click")
  .on("click", () => {
    if (isMobileNavAnim) return;
    isMobileNavAnim = true;
    setMobileNavState(!document.body.classList.contains(mobileNavOpenClass));
    setTimeout(() => {
      isMobileNavAnim = false;
    }, mobileNavMotionDuration);
  });

_$("#mask")
  ?.off("click")
  .on("click", () => {
    if (isMobileNavAnim || !document.body.classList.contains(mobileNavOpenClass))
      return;
    setMobileNavState(false);
  });

_$$(".sidebar-toc-btn").forEach((element) => {
  element.off("click").on("click", function () {
    if (this.classList.contains("current")) return;
    _$$(".sidebar-toc-btn").forEach((element) =>
      element.classList.add("current"),
    );
    _$$(".sidebar-common-btn").forEach((element) =>
      element.classList.remove("current"),
    );
    _$$(".sidebar-toc-sidebar").forEach((element) =>
      element.classList.remove("hidden"),
    );
    _$$(".sidebar-common-sidebar").forEach((element) =>
      element.classList.add("hidden"),
    );
  });
});

_$$(".sidebar-common-btn").forEach((element) => {
  element.off("click").on("click", function () {
    if (this.classList.contains("current")) return;
    _$$(".sidebar-common-btn").forEach((element) =>
      element.classList.add("current"),
    );
    _$$(".sidebar-toc-btn").forEach((element) =>
      element.classList.remove("current"),
    );
    _$$(".sidebar-common-sidebar").forEach((element) =>
      element.classList.remove("hidden"),
    );
    _$$(".sidebar-toc-sidebar").forEach((element) =>
      element.classList.add("hidden"),
    );
  });
});

var __sidebarDrawerResizeHandler;

const initSidebarDrawer = () => {
  if (__sidebarDrawerResizeHandler) {
    window.off("resize", __sidebarDrawerResizeHandler);
  }

  const content = _$("#content.sidebar-right") as HTMLElement | null;
  const sidebar = content?.querySelector<HTMLElement>("#sidebar");

  if (!content || !sidebar) {
    return;
  }

  let collapseTimer = 0;
  let drawerStateRaf = 0;
  let drawerExpanded = content.classList.contains("sidebar-is-expanded");
  let pendingDrawerExpanded: boolean | null = null;
  const desktopSidebarMedia = window.matchMedia("(min-width: 1200px)");

  const clearCollapseTimer = () => {
    if (!collapseTimer) return;
    window.clearTimeout(collapseTimer);
    collapseTimer = 0;
  };

  const commitDrawerState = (expanded: boolean) => {
    if (pendingDrawerExpanded === expanded) {
      return;
    }
    if (!drawerStateRaf && drawerExpanded === expanded) {
      return;
    }
    if (drawerStateRaf) {
      window.cancelAnimationFrame(drawerStateRaf);
    }

    pendingDrawerExpanded = expanded;
    drawerStateRaf = window.requestAnimationFrame(() => {
      drawerStateRaf = 0;
      pendingDrawerExpanded = null;
      if (drawerExpanded === expanded) {
        return;
      }
      drawerExpanded = expanded;
      content.classList.toggle("sidebar-is-expanded", expanded);
    });
  };

  const expandDrawer = () => {
    if (!desktopSidebarMedia.matches) {
      commitDrawerState(false);
      return;
    }
    clearCollapseTimer();
    commitDrawerState(true);
  };

  const collapseDrawer = () => {
    clearCollapseTimer();
    collapseTimer = window.setTimeout(() => {
      if (
        sidebar.matches(":hover") ||
        sidebar.contains(document.activeElement)
      ) {
        return;
      }
      commitDrawerState(false);
    }, 90);
  };

  sidebar.off("pointerenter").on("pointerenter", () => {
    expandDrawer();
  });

  sidebar.off("pointerleave").on("pointerleave", (event: PointerEvent) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && sidebar.contains(nextTarget)) return;
    collapseDrawer();
  });

  sidebar.off("focusin").on("focusin", () => {
    expandDrawer();
  });

  sidebar.off("focusout").on("focusout", (event: FocusEvent) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && sidebar.contains(nextTarget)) return;
    collapseDrawer();
  });

  __sidebarDrawerResizeHandler = () => {
    if (!desktopSidebarMedia.matches) {
      clearCollapseTimer();
      commitDrawerState(false);
    }
  };

  window.on("resize", __sidebarDrawerResizeHandler);
  __sidebarDrawerResizeHandler();
};

initSidebarDrawer();

const motionCardSelector = [
  ".project-card",
  ".note-card",
  ".apple-showcase",
  ".apple-tile",
  ".apple-project-tile",
  ".about-proof-card",
  ".archive-feature",
  ".resume-hero",
  ".project-detail__hero--apple",
  ".info-card",
  ".skill-category-card",
  ".timeline-item__content",
  ".home-spec-card",
].join(", ");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const canUseFinePointerInteractions = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;
const useSubtleTouchFeedback = window.matchMedia(
  "(hover: none), (pointer: coarse)",
).matches;
const allowCardMotion = !prefersReducedMotion;
const allowCardParallax = !prefersReducedMotion;
const allowTiltMotion = !prefersReducedMotion && canUseFinePointerInteractions;
const allowCardOpenTransition = !prefersReducedMotion;
const cardOpenDelay = useSubtleTouchFeedback ? 360 : 440;

const cardNavigationCandidateSelector = [
  ".project-card",
  ".note-card",
  ".apple-showcase",
  ".apple-tile",
  ".apple-project-tile",
  ".about-proof-card",
  ".archive-feature",
  ".info-card",
  ".skill-category-card",
  ".timeline-item__content",
  ".home-spec-card",
].join(", ");

type CardNavigation = {
  url: string;
  target: "_self" | "_blank";
  useTransition: boolean;
};

const preferredCardNavigationSelectors = [
  ".project-card__readmore[href]",
  ".section-link[href]",
  ".apple-card-action[href]",
  ".apple-link[href]",
  ".career-button[href]",
  ".home-hero-button[href]",
  ".note-card__title a[href]",
  ".project-card__title a[href]",
  "h2 a[href]",
  "h3 a[href]",
  "h4 a[href]",
];

const isNavigableCardHref = (href?: string | null) => {
  if (!href) return false;
  const value = href.trim();
  return (
    value.length > 0 &&
    !value.startsWith("#") &&
    !value.toLowerCase().startsWith("javascript:")
  );
};

const normalizeCardNavigation = (
  href?: string | null,
  target?: string | null,
): CardNavigation | null => {
  if (!isNavigableCardHref(href)) {
    return null;
  }

  try {
    const resolved = new URL(href, window.location.href);
    const isSpecialProtocol =
      resolved.protocol === "mailto:" || resolved.protocol === "tel:";
    const isSameOrigin = resolved.origin === window.location.origin;
    const normalizedTarget =
      target === "_blank" || isSpecialProtocol ? "_blank" : "_self";

    return {
      url: resolved.toString(),
      target: normalizedTarget,
      useTransition:
        normalizedTarget === "_self" && isSameOrigin && !isSpecialProtocol,
    };
  } catch {
    return null;
  }
};

const getPreferredCardLink = (card: HTMLElement) => {
  for (const selector of preferredCardNavigationSelectors) {
    const link = card.querySelector<HTMLAnchorElement>(selector);
    if (link && isNavigableCardHref(link.getAttribute("href"))) {
      return link;
    }
  }

  return Array.from(card.querySelectorAll<HTMLAnchorElement>("a[href]")).find(
    (link) => isNavigableCardHref(link.getAttribute("href")),
  );
};

const resolveCardNavigation = (card: HTMLElement): CardNavigation | null => {
  const explicitNavigation = normalizeCardNavigation(
    card.dataset.cardUrl,
    card.dataset.cardTarget,
  );
  if (explicitNavigation) {
    return explicitNavigation;
  }

  const link = getPreferredCardLink(card);
  if (!link) {
    return null;
  }

  return normalizeCardNavigation(link.getAttribute("href"), link.target);
};

const ensureCardNavigationIndicator = (card: HTMLElement) => {
  let indicator = card.querySelector<HTMLElement>(".card-nav-indicator");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = "card-nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    card.appendChild(indicator);
  }
  return indicator;
};

const cardTimers = new WeakMap<
  HTMLElement,
  {
    navigate?: number;
    cleanup?: number;
    hold?: number;
    easter?: number;
    launch?: number;
    feedback?: number;
  }
>();

const ensureCardTimers = (card: HTMLElement) => {
  const timers = cardTimers.get(card) || {};
  cardTimers.set(card, timers);
  return timers;
};

const clearCardTimeout = (
  card: HTMLElement,
  key: "navigate" | "cleanup" | "hold" | "easter" | "launch" | "feedback",
) => {
  const timers = ensureCardTimers(card);
  const value = timers[key];
  if (value) {
    window.clearTimeout(value);
    delete timers[key];
  }
};

const clearAllCardTimeouts = (card: HTMLElement) => {
  clearCardTimeout(card, "navigate");
  clearCardTimeout(card, "cleanup");
  clearCardTimeout(card, "hold");
  clearCardTimeout(card, "easter");
  clearCardTimeout(card, "launch");
  clearCardTimeout(card, "feedback");
};

const getCardLabel = (card: HTMLElement) => {
  return (
    card.dataset.cardTitle ||
    card.querySelector("h1, h2, h3, h4, strong")?.textContent?.trim() ||
    card.getAttribute("aria-label") ||
    "this card"
  );
};

const getCardInteractionType = (card: HTMLElement) => {
  if (card.matches(".project-card, .apple-project-tile")) return "project";
  if (card.matches(".note-card, .archive-feature")) return "article";
  if (card.matches(".apple-tile")) return "section";
  if (card.matches(".info-card, .skill-category-card, .home-spec-card")) {
    return "info";
  }
  return "generic";
};

const getCardActionCopy = (
  card: HTMLElement,
  action: "tap" | "open" | "launch" | "favorite_on" | "favorite_off" | "hold",
) => {
  const type = getCardInteractionType(card);
  const copyMap = {
    project: {
      tap: "Preview project",
      open: "Open project",
      launch: "Opening project",
      favorite_on: "Saved project card",
      favorite_off: "Removed project save",
      hold: "Long press unlocked a hidden note",
    },
    article: {
      tap: "Preview article",
      open: "Open article",
      launch: "Opening article",
      favorite_on: "Saved article card",
      favorite_off: "Removed article save",
      hold: "Long press unlocked a hidden note",
    },
    section: {
      tap: "Explore section",
      open: "Open section",
      launch: "Opening section",
      favorite_on: "Saved section card",
      favorite_off: "Removed section save",
      hold: "Long press unlocked a hidden note",
    },
    info: {
      tap: "Inspect details",
      open: "Open details",
      launch: "Opening details",
      favorite_on: "Saved info card",
      favorite_off: "Removed info save",
      hold: "Long press unlocked a hidden note",
    },
    generic: {
      tap: "Preview card",
      open: "Open card",
      launch: "Opening card",
      favorite_on: "Saved card",
      favorite_off: "Removed saved card",
      hold: "Long press unlocked a hidden note",
    },
  } as const;

  return copyMap[type][action];
};

const ensureFavoriteBadge = (card: HTMLElement) => {
  let badge = card.querySelector<HTMLElement>(".card-favorite-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.className = "card-favorite-badge";
    badge.textContent = "★";
    card.appendChild(badge);
  }
  return badge;
};

const ensureCardActionHint = (card: HTMLElement) => {
  let hint = card.querySelector<HTMLElement>(".card-action-hint");
  if (!hint) {
    hint = document.createElement("div");
    hint.className = "card-action-hint";
    hint.setAttribute("aria-hidden", "true");
    card.appendChild(hint);
  }
  return hint;
};

const primeCardTitle = (card: HTMLElement, duration = 420) => {
  card.classList.add("is-title-primed");
  window.setTimeout(() => {
    if (
      !card.classList.contains("is-card-arming") &&
      !card.classList.contains("is-card-launching") &&
      !card.classList.contains("is-card-transitioning")
    ) {
      card.classList.remove("is-title-primed");
    }
  }, duration);
};

const showCardActionHint = (
  card: HTMLElement,
  text: string,
  duration = 1200,
) => {
  const hint = ensureCardActionHint(card);
  hint.textContent = text;
  card.classList.add("is-card-engaged");
  clearCardTimeout(card, "feedback");
  const effectiveDuration = useSubtleTouchFeedback
    ? Math.min(duration, 820)
    : duration;
  ensureCardTimers(card).feedback = window.setTimeout(() => {
    card.classList.remove("is-card-engaged");
  }, effectiveDuration);
};

const spawnCardClickRipple = (
  card: HTMLElement,
  point?: { clientX: number; clientY: number },
) => {
  const rect = card.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "card-click-ripple";
  const x = point ? point.clientX - rect.left : rect.width / 2;
  const y = point ? point.clientY - rect.top : rect.height / 2;
  const size =
    Math.max(rect.width, rect.height) * (useSubtleTouchFeedback ? 0.92 : 1.24);
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  card.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 720);
};

const showCardEasterEgg = (card: HTMLElement) => {
  let easter = card.querySelector<HTMLElement>(".card-easter-egg");
  if (!easter) {
    easter = document.createElement("div");
    easter.className = "card-easter-egg";
    card.appendChild(easter);
  }
  easter.textContent = `One more thing · ${getCardLabel(card)} is designed to feel lighter, faster, and more deliberate.`;
  card.classList.add("is-easter-visible");
  showCardActionHint(card, getCardActionCopy(card, "hold"), 1800);
  clearCardTimeout(card, "easter");
  ensureCardTimers(card).easter = window.setTimeout(() => {
    card.classList.remove("is-easter-visible");
  }, 2400);
};

const toggleCardFavorite = (card: HTMLElement) => {
  ensureFavoriteBadge(card);
  card.classList.toggle("is-favorited");
  showCardActionHint(
    card,
    card.classList.contains("is-favorited")
      ? getCardActionCopy(card, "favorite_on")
      : getCardActionCopy(card, "favorite_off"),
    1200,
  );
};

const clearCardOpenState = (card: HTMLElement, clone?: HTMLElement | null) => {
  card.classList.remove("is-source-opening");
  card.classList.remove("is-card-opening");
  card.classList.remove("is-card-transitioning");
  card.classList.remove("is-card-flipping");
  card.classList.remove("is-card-pressing");
  card.classList.remove("is-card-launching");
  card.classList.remove("is-card-arming");
  card.classList.remove("is-card-engaged");
  card.classList.remove("is-title-primed");
  document.body.classList.remove("is-card-opening");
  document.body.classList.remove("is-card-transitioning");
  clone?.remove();
};

const playCardOpenTransition = (card: HTMLElement, url: string) => {
  if (!allowCardOpenTransition) {
    window.location.href = url;
    return;
  }

  if (
    card.classList.contains("is-card-transitioning") ||
    document.body.classList.contains("is-card-opening")
  ) {
    return;
  }

  clearAllCardTimeouts(card);
  const rect = card.getBoundingClientRect();
  const computed = window.getComputedStyle(card);
  const clone = card.cloneNode(true) as HTMLElement;
  const margin = Math.max(18, Math.min(window.innerWidth, window.innerHeight) * 0.04);
  const targetWidth = Math.min(window.innerWidth - margin * 2, Math.max(rect.width, window.innerWidth * 0.84));
  const targetHeight = Math.min(window.innerHeight - margin * 2, Math.max(rect.height, window.innerHeight * 0.84));
  const targetLeft = (window.innerWidth - targetWidth) / 2;
  const targetTop = (window.innerHeight - targetHeight) / 2;
  const startScaleX = rect.width / targetWidth;
  const startScaleY = rect.height / targetHeight;
  const startTranslateX = rect.left - targetLeft;
  const startTranslateY = rect.top - targetTop;

  clone.classList.add("card-transition-clone");
  clone.classList.remove(
    "is-card-flipping",
    "is-card-pressing",
    "is-card-launching",
    "is-card-transitioning",
    "is-source-opening",
    "is-favorited",
    "is-easter-visible",
  );
  clone.style.top = `${targetTop}px`;
  clone.style.left = `${targetLeft}px`;
  clone.style.width = `${targetWidth}px`;
  clone.style.height = `${targetHeight}px`;
  clone.style.borderRadius = computed.borderRadius;
  clone.style.transform = `translate3d(${startTranslateX}px, ${startTranslateY}px, 0) scale(${startScaleX}, ${startScaleY})`;
  document.body.appendChild(clone);

  card.classList.add("is-source-opening");
  card.classList.add("is-card-transitioning");

  window.requestAnimationFrame(() => {
    document.body.classList.add("is-card-transitioning");
    document.body.classList.add("is-card-opening");
    clone.classList.add("is-opening");
    clone.style.borderRadius = "28px";
    clone.style.transform = "translate3d(0, 0, 0) scale(1, 1)";
  });

  try {
    const targetUrl = new URL(url, window.location.origin);
    window.sessionStorage.setItem(
      CARD_LANDING_STORAGE_KEY,
      JSON.stringify({
        pathname: targetUrl.pathname,
        time: Date.now(),
      }),
    );
  } catch {}

  ensureCardTimers(card).navigate = window.setTimeout(() => {
    window.location.href = url;
  }, 460);

  ensureCardTimers(card).cleanup = window.setTimeout(() => {
    clearCardOpenState(card, clone);
  }, 900);
};

const scheduleCardOpen = (card: HTMLElement, url: string, delay = cardOpenDelay) => {
  if (!allowCardOpenTransition) {
    window.location.href = url;
    return;
  }

  if (
    card.classList.contains("is-card-transitioning") ||
    document.body.classList.contains("is-card-opening")
  ) {
    return;
  }

  clearCardTimeout(card, "navigate");
  clearCardTimeout(card, "cleanup");
  clearCardTimeout(card, "launch");
  card.classList.remove("is-card-flipping");
  card.classList.remove("is-card-launching");
  card.classList.add("is-card-pressing");
  card.classList.add("is-card-arming");
  card.classList.add("is-title-primed");
  showCardActionHint(card, getCardActionCopy(card, "launch"), Math.max(760, delay));

  ensureCardTimers(card).launch = window.setTimeout(() => {
    card.classList.add("is-card-launching");
  }, 56);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      card.classList.add("is-card-flipping");
    });
  });

  ensureCardTimers(card).navigate = window.setTimeout(() => {
    playCardOpenTransition(card, url);
  }, delay);

  ensureCardTimers(card).cleanup = window.setTimeout(() => {
    if (!card.classList.contains("is-source-opening")) {
      card.classList.remove("is-card-flipping");
      card.classList.remove("is-card-pressing");
      card.classList.remove("is-card-arming");
      card.classList.remove("is-title-primed");
    }
  }, Math.max(delay + 90, 620));
};

const motionCards = Array.from(_$$<HTMLElement>(motionCardSelector));

motionCards.forEach((card, index) => {
  card.style.setProperty(
    "--card-enter-delay",
    `${Math.min((index % 8) * 0.1, 0.7)}s`,
  );
});

const revealCardIfInView = (card: HTMLElement) => {
  const rect = card.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const isInInitialViewport =
    rect.top <= viewportHeight * 0.94 && rect.bottom >= -viewportHeight * 0.08;

  if (isInInitialViewport) {
    card.classList.add("is-card-visible");
    return true;
  }

  return false;
};

motionCards.forEach((card) => {
  if (!allowCardMotion) {
    card.classList.add("is-card-visible");
  } else {
    revealCardIfInView(card);
  }
});

document.body.classList.toggle("motion-enhanced", allowCardMotion);
document.body.classList.toggle("motion-compact", !allowCardMotion);
document.body.classList.toggle("touch-feedback-subtle", useSubtleTouchFeedback);

if (!allowCardMotion) {
  motionCards.forEach((card) => card.classList.add("is-card-visible"));
} else if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        if (!entry.isIntersecting) return;
        target.classList.add("is-card-visible");
        observer.unobserve(target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  motionCards.forEach((card) => {
    if (!card.classList.contains("is-card-visible")) {
      revealObserver.observe(card);
    }
  });
} else {
  motionCards.forEach((card) => card.classList.add("is-card-visible"));
}

let __cardParallaxRaf = 0;
var __cardParallaxScrollHandler;
var __cardParallaxResizeHandler;
let __cardParallaxVisibilityObserver: IntersectionObserver | null = null;
const activeParallaxCards = new Set<HTMLElement>();

const updateCardParallax = () => {
  const cards = activeParallaxCards.size
    ? [...activeParallaxCards]
    : motionCards.slice(0, 6);

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > window.innerHeight + 120) {
      card.style.setProperty("--scroll-media-parallax-y", "0px");
      return;
    }
    const distance =
      (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    const mediaOffset = Math.max(-14, Math.min(14, -distance * 18));
    card.style.setProperty(
      "--scroll-media-parallax-y",
      `${mediaOffset.toFixed(2)}px`,
    );
  });
  __cardParallaxRaf = 0;
};

const requestCardParallax = () => {
  if (__cardParallaxRaf) return;
  __cardParallaxRaf = window.requestAnimationFrame(updateCardParallax);
};

if (__cardParallaxScrollHandler) {
  window.off("scroll", __cardParallaxScrollHandler);
}
if (__cardParallaxResizeHandler) {
  window.off("resize", __cardParallaxResizeHandler);
}

__cardParallaxVisibilityObserver?.disconnect();
activeParallaxCards.clear();

if (allowCardParallax) {
  if ("IntersectionObserver" in window) {
    __cardParallaxVisibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            activeParallaxCards.add(card);
          } else {
            activeParallaxCards.delete(card);
            card.style.setProperty("--scroll-media-parallax-y", "0px");
          }
        });
        requestCardParallax();
      },
      {
        rootMargin: "20% 0px 20% 0px",
        threshold: 0,
      },
    );

    motionCards.forEach((card) => {
      __cardParallaxVisibilityObserver?.observe(card);
    });
  } else {
    motionCards.forEach((card) => activeParallaxCards.add(card));
  }

  __cardParallaxScrollHandler = requestCardParallax;
  __cardParallaxResizeHandler = requestCardParallax;
  window.on("scroll", __cardParallaxScrollHandler, { passive: true });
  window.on("resize", __cardParallaxResizeHandler);
  requestCardParallax();
} else {
  motionCards.forEach((card) =>
    card.style.setProperty("--scroll-media-parallax-y", "0px"),
  );
}

const navigationCards = motionCards.filter((card) => {
  if (!card.matches(cardNavigationCandidateSelector)) {
    return false;
  }

  const navigation = resolveCardNavigation(card);
  if (!navigation) {
    return false;
  }

  card.classList.add("is-card-navigable");
  card.dataset.cardResolvedUrl = navigation.url;
  card.dataset.cardTarget = navigation.target;
  card.dataset.cardUseTransition = navigation.useTransition ? "true" : "false";
  ensureCardNavigationIndicator(card);
  return true;
});

const nonNavigableMotionCards = motionCards.filter(
  (card) => !navigationCards.includes(card),
);

nonNavigableMotionCards.forEach((card) => {
  let pointerStartX = 0;
  let pointerStartY = 0;

  card.off("dblclick").on("dblclick", (event: MouseEvent) => {
    event.preventDefault();
    toggleCardFavorite(card);
  });

  card.off("pointerdown").on("pointerdown", (event: PointerEvent) => {
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    spawnCardClickRipple(card, event);
    clearCardTimeout(card, "hold");
    ensureCardTimers(card).hold = window.setTimeout(() => {
      showCardEasterEgg(card);
    }, 1000);
  });

  card.off("pointermove").on("pointermove", (event: PointerEvent) => {
    if (
      Math.abs(event.clientX - pointerStartX) > 12 ||
      Math.abs(event.clientY - pointerStartY) > 12
    ) {
      clearCardTimeout(card, "hold");
    }
  });

  card.off("pointerup").on("pointerup", () => {
    clearCardTimeout(card, "hold");
  });
  card.off("pointerleave").on("pointerleave", () => {
    clearCardTimeout(card, "hold");
  });
});

navigationCards.forEach((card) => {
  const url = card.dataset.cardResolvedUrl;
  const targetMode = (card.dataset.cardTarget || "_self") as
    | "_self"
    | "_blank";
  const useTransition = card.dataset.cardUseTransition === "true";

  if (!url) return;

  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "link");

  const openCardNavigation = (openInNewTab = false) => {
    if (openInNewTab || targetMode === "_blank") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    if (useTransition && allowCardOpenTransition) {
      scheduleCardOpen(card, url);
      return;
    }

    window.location.href = url;
  };

  card.off("click").on("click", (event: MouseEvent) => {
    if (card.dataset.longPressTriggered === "true") {
      event.preventDefault();
      card.dataset.longPressTriggered = "false";
      return;
    }

    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        "a, button, input, textarea, select, summary, .project-card__links, .project-card__footer",
      )
    ) {
      return;
    }

    event.preventDefault();
    primeCardTitle(card, useSubtleTouchFeedback ? 300 : 420);
    showCardActionHint(
      card,
      event.metaKey || event.ctrlKey
        ? "Open in new tab"
        : getCardActionCopy(card, "open"),
      760,
    );
    openCardNavigation(event.metaKey || event.ctrlKey);
  });

  card.off("keydown").on("keydown", (event: KeyboardEvent) => {
    if (
      (event.key === "Enter" || event.key === " ") &&
      !card.classList.contains("is-card-transitioning")
    ) {
      event.preventDefault();
      primeCardTitle(card, 420);
      showCardActionHint(card, getCardActionCopy(card, "open"), 760);
      spawnCardClickRipple(card);
      openCardNavigation();
    }
  });

  card.off("dblclick").on("dblclick", (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearAllCardTimeouts(card);
    clearCardOpenState(card);
    toggleCardFavorite(card);
  });

  let pointerStartX = 0;
  let pointerStartY = 0;

  card.off("pointerdown").on("pointerdown", (event: PointerEvent) => {
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    card.dataset.longPressTriggered = "false";
    spawnCardClickRipple(card, event);
    primeCardTitle(card, useSubtleTouchFeedback ? 260 : 360);
    showCardActionHint(card, getCardActionCopy(card, "tap"), 700);
    clearCardTimeout(card, "hold");
    ensureCardTimers(card).hold = window.setTimeout(() => {
      card.dataset.longPressTriggered = "true";
      showCardEasterEgg(card);
    }, 1000);
  });

  card.off("pointermove").on("pointermove", (event: PointerEvent) => {
    if (
      Math.abs(event.clientX - pointerStartX) > 12 ||
      Math.abs(event.clientY - pointerStartY) > 12
    ) {
      clearCardTimeout(card, "hold");
    }
  });

  card.off("pointerup").on("pointerup", () => {
    clearCardTimeout(card, "hold");
  });
  card.off("pointerleave").on("pointerleave", () => {
    clearCardTimeout(card, "hold");
  });
});

_$$<HTMLAnchorElement>(
  [
    ".apple-link",
    ".home-hero-button",
    ".career-button",
    ".project-card__readmore",
    ".section-link",
    ".project-card__links a",
    ".archive-feature .career-button",
  ].join(", "),
).forEach((link) => {
  link.off("click").on("click", (event: MouseEvent) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || link.target === "_blank") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const card = link.closest<HTMLElement>(
      ".apple-showcase, .apple-tile, .project-card, .note-card, .apple-project-tile, .about-proof-card, .archive-feature",
    );
    if (!card) return;
    event.preventDefault();
    scheduleCardOpen(card, link.href, cardOpenDelay);
  });
});

_$$<HTMLElement>(
  [
    ".project-card",
    ".note-card",
    ".apple-showcase",
    ".apple-tile",
    ".apple-project-tile",
    ".about-proof-card",
    ".archive-feature",
    ".resume-hero",
    ".project-detail__hero--apple",
    ".info-card",
    ".skill-category-card",
    ".timeline-item__content",
    ".home-spec-card",
    ".home-hero-button",
    ".career-button",
    ".apple-link",
    ".about-link-item",
    ".project-card__links a",
    ".section-link",
    ".project-card__readmore",
  ].join(", "),
).forEach((element) => {
  const resetTransform = () => {
    element.style.removeProperty("--tilt-rotate-x");
    element.style.removeProperty("--tilt-rotate-y");
    element.style.removeProperty("--tilt-translate-x");
    element.style.removeProperty("--tilt-translate-y");
    element.style.removeProperty("--pointer-x");
    element.style.removeProperty("--pointer-y");
    element.classList.remove("is-pointer-down");
    element.classList.remove("is-tilt-active");
  };

  if (!allowTiltMotion) {
    resetTransform();
    return;
  }

  const maxRotate = element.matches(
    ".home-hero-button, .career-button, .apple-link, .project-card__links a, .section-link, .project-card__readmore",
  )
    ? 8
    : 14;
  const maxTranslate = element.matches(
    ".home-hero-button, .career-button, .apple-link, .project-card__links a, .section-link, .project-card__readmore",
  )
    ? 10
    : 20;

  let pointerRaf = 0;
  let elementRect: DOMRect | null = null;
  let isPointerHovering = false;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let targetTranslateX = 0;
  let targetTranslateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let currentTranslateX = 0;
  let currentTranslateY = 0;
  let targetPointerX = 50;
  let targetPointerY = 50;
  let currentPointerX = 50;
  let currentPointerY = 50;

  const applyTiltMotion = () => {
    currentRotateX += (targetRotateX - currentRotateX) * 0.18;
    currentRotateY += (targetRotateY - currentRotateY) * 0.18;
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.18;
    currentTranslateY += (targetTranslateY - currentTranslateY) * 0.18;
    currentPointerX += (targetPointerX - currentPointerX) * 0.18;
    currentPointerY += (targetPointerY - currentPointerY) * 0.18;

    element.style.setProperty(
      "--tilt-rotate-x",
      `${currentRotateX.toFixed(2)}deg`,
    );
    element.style.setProperty(
      "--tilt-rotate-y",
      `${currentRotateY.toFixed(2)}deg`,
    );
    element.style.setProperty(
      "--tilt-translate-x",
      `${currentTranslateX.toFixed(2)}px`,
    );
    element.style.setProperty(
      "--tilt-translate-y",
      `${currentTranslateY.toFixed(2)}px`,
    );
    element.style.setProperty(
      "--pointer-x",
      `${currentPointerX.toFixed(2)}%`,
    );
    element.style.setProperty(
      "--pointer-y",
      `${currentPointerY.toFixed(2)}%`,
    );

    const stillAnimating =
      Math.abs(targetRotateX - currentRotateX) > 0.06 ||
      Math.abs(targetRotateY - currentRotateY) > 0.06 ||
      Math.abs(targetTranslateX - currentTranslateX) > 0.06 ||
      Math.abs(targetTranslateY - currentTranslateY) > 0.06 ||
      Math.abs(targetPointerX - currentPointerX) > 0.08 ||
      Math.abs(targetPointerY - currentPointerY) > 0.08;

    if (!stillAnimating && !isPointerHovering) {
      pointerRaf = 0;
      resetTransform();
      return;
    }

    pointerRaf = window.requestAnimationFrame(applyTiltMotion);
  };

  const ensureTiltFrame = () => {
    if (pointerRaf) return;
    pointerRaf = window.requestAnimationFrame(applyTiltMotion);
  };

  element.off("pointerenter").on("pointerenter", () => {
    isPointerHovering = true;
    elementRect = element.getBoundingClientRect();
    element.classList.add("is-tilt-active");
    ensureTiltFrame();
  });

  element.off("pointermove").on("pointermove", (event: Event) => {
    const mouseEvent = event as PointerEvent;
    const rect = elementRect || element.getBoundingClientRect();
    elementRect = rect;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (mouseEvent.clientX - centerX) / (rect.width / 2 || 1);
    const percentY = (mouseEvent.clientY - centerY) / (rect.height / 2 || 1);

    targetRotateX = -percentY * maxRotate;
    targetRotateY = percentX * maxRotate;
    targetTranslateX = percentX * maxTranslate;
    targetTranslateY = percentY * maxTranslate;
    targetPointerX = ((mouseEvent.clientX - rect.left) / (rect.width || 1)) * 100;
    targetPointerY =
      ((mouseEvent.clientY - rect.top) / (rect.height || 1)) * 100;
    ensureTiltFrame();
  });

  element.off("pointerdown").on("pointerdown", () => {
    element.classList.add("is-pointer-down");
    elementRect = element.getBoundingClientRect();
  });
  element.off("pointerup").on("pointerup", () => {
    element.classList.remove("is-pointer-down");
  });
  element.off("pointerleave").on("pointerleave", () => {
    isPointerHovering = false;
    elementRect = null;
    targetRotateX = 0;
    targetRotateY = 0;
    targetTranslateX = 0;
    targetTranslateY = 0;
    targetPointerX = 50;
    targetPointerY = 50;
    ensureTiltFrame();
  });
  element.off("blur").on("blur", () => {
    isPointerHovering = false;
    targetRotateX = 0;
    targetRotateY = 0;
    targetTranslateX = 0;
    targetTranslateY = 0;
    targetPointerX = 50;
    targetPointerY = 50;
    ensureTiltFrame();
  });
});

(() => {
  const rootRealPath = getRealPath(window.location.pathname);
  _$$(".sidebar-menu-link-wrap").forEach((link) => {
    let linkPath = link.querySelector("a")?.getAttribute("href");
    if (linkPath && getRealPath(linkPath) === rootRealPath) {
      link.classList.add("link-active");
    }
  });
})();

// lazyload
(_$$(".article-entry img") as unknown as HTMLImageElement[]).forEach(
  (element) => {
    if (element.classList.contains("lazyload")) return;
    element.classList.add("lazyload");
    element.setAttribute("data-src", element.src);
    element.setAttribute("data-sizes", "auto");
    element.removeAttribute("src");
  },
);

// to top
var sidebarTop = _$(".sidebar-top");
if (sidebarTop) {
  sidebarTop.style.transition = "opacity 1s";
  sidebarTop.off("click").on("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
  if (document.documentElement.scrollTop < 10) {
    sidebarTop.style.opacity = "0";
  }
}

var __sidebarTopScrollHandler;
let __sidebarTopScrollRaf = 0;

if (__sidebarTopScrollHandler) {
  window.off("scroll", __sidebarTopScrollHandler);
}

__sidebarTopScrollHandler = () => {
  if (__sidebarTopScrollRaf) return;
  __sidebarTopScrollRaf = window.requestAnimationFrame(() => {
    __sidebarTopScrollRaf = 0;
    const sidebarTop = _$(".sidebar-top")!;
    if (document.documentElement.scrollTop < 10) {
      sidebarTop.style.opacity = "0";
    } else {
      sidebarTop.style.opacity = "1";
    }
  });
};

window.on("scroll", __sidebarTopScrollHandler, { passive: true });

// toc
_$$("#mobile-nav #TableOfContents li").forEach((element) => {
  element.off("click").on("click", () => {
    if (isMobileNavAnim || !document.body.classList.contains(mobileNavOpenClass))
      return;
    setMobileNavState(false);
  });
});

_$$("#mobile-nav .sidebar-menu-link-dummy").forEach((element) => {
  element.off("click").on("click", () => {
    if (isMobileNavAnim || !document.body.classList.contains(mobileNavOpenClass))
      return;
    setTimeout(() => {
      setMobileNavState(false);
    }, 200);
  });
});

function tocInit() {
  if (!_$("#sidebar")) return;
  const navItems =
    getComputedStyle(_$("#sidebar")!).display === "block"
      ? _$$("#sidebar .sidebar-toc-wrapper li")
      : _$$("#mobile-nav .sidebar-toc-wrapper li");
  if (!navItems.length) return;

  let activeLock = null;

  const anchorScroll = (event, index) => {
    event.preventDefault();
    const target = document.getElementById(
      decodeURI(event.currentTarget.getAttribute("href")).slice(1),
    );
    activeLock = index;
    scrollIntoViewAndWait(target!).then(() => {
      activateNavByIndex(index);
      activeLock = null;
    });
  };

  const sections = [...navItems].map((element, index) => {
    const link = element.querySelector("a");
    link!.off("click").on("click", (e) => anchorScroll(e, index));
    const anchor = document.getElementById(
      decodeURI(link.getAttribute("href")).slice(1),
    );
    if (!anchor) return null;
    const alink = anchor.querySelector("a");
    alink?.off("click").on("click", (e) => anchorScroll(e, index));
    return anchor;
  });

  const activateNavByIndex = (index) => {
    const target = navItems[index];

    if (!target || target.classList.contains("current")) return;

    _$$(".sidebar-toc-wrapper .active").forEach((element) => {
      element.classList.remove("active", "current");
    });

    sections.forEach((element) => {
      element?.classList.remove("active");
    });

    target.classList.add("active", "current");
    sections[index]?.classList.add("active");

    let parent = target.parentNode as HTMLElement;

    while (!parent.matches(".sidebar-toc-sidebar")) {
      if (parent.matches("li")) {
        parent.classList.add("active");
        const t = document.getElementById(
          decodeURI(parent.querySelector("a").getAttribute("href").slice(1)),
        );
        if (t) {
          t.classList.add("active");
        }
      }
      parent = parent.parentNode as HTMLElement;
    }
    // Scrolling to center active TOC element if TOC content is taller than viewport.
    if (_$(".sidebar-toc-sidebar").classList.contains("hidden")) {
      const tocWrapper = _$(".sidebar-toc-wrapper");
      tocWrapper.scrollTo({
        top:
          tocWrapper.scrollTop + target.offsetTop - tocWrapper.offsetHeight / 2,
        behavior: "smooth",
      });
    }
  };

  const findIndex = (entries) => {
    let index = 0;
    let entry = entries[index];

    if (entry.boundingClientRect.top > 0) {
      index = sections.indexOf(entry.target);
      return index === 0 ? 0 : index - 1;
    }
    for (; index < entries.length; index++) {
      if (entries[index].boundingClientRect.top <= 0) {
        entry = entries[index];
      } else {
        return sections.indexOf(entry.target);
      }
    }
    return sections.indexOf(entry.target);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const index = findIndex(entries) + (window.diffY > 0 ? 1 : 0);
      if (activeLock === null) {
        activateNavByIndex(index);
      }
    },
    {
      rootMargin: "0px 0px -100% 0px",
      threshold: 0,
    },
  );

  sections.forEach((element) => {
    element && observer.observe(element);
  });
}

tocInit();

_$(".sponsor-button")
  ?.off("click")
  .on("click", () => {
    _$(".sponsor-button")?.classList.toggle("active");
    _$(".sponsor-tip")?.classList.toggle("active");
    _$(".sponsor-qr")?.classList.toggle("active");
  });

var shareWeixinHandler: (e: any) => void;
if (shareWeixinHandler) {
  document.off("click", shareWeixinHandler);
}
shareWeixinHandler = (e) => {
  if (e.target.closest(".share-icon.icon-weixin")) return;
  const sw = _$("#share-weixin") as HTMLElement | null;
  if (sw && sw.classList.contains("active")) {
    sw.classList.remove("active");
    sw.addEventListener(
      "transitionend",
      function handler() {
        sw.style.display = "none";
        sw.removeEventListener("transitionend", handler);
      },
      { once: true },
    );
  }
};
document.on("click", shareWeixinHandler);

_$(".share-icon.icon-weixin")
  ?.off("click")
  .on("click", function (e) {
    const iconPosition = this.getBoundingClientRect();
    const shareWeixin = this.querySelector("#share-weixin");

    if (iconPosition.x - 148 < 0) {
      shareWeixin.style.left = `-${iconPosition.x - 10}px`;
    } else if (iconPosition.x + 172 > window.innerWidth) {
      shareWeixin.style.left = `-${310 - window.innerWidth + iconPosition.x}px`;
    } else {
      shareWeixin.style.left = "-138px";
    }
    if (e.target === this) {
      const el = shareWeixin as HTMLElement;
      if (!el) return;
      if (!el.classList.contains("active")) {
        el.style.display = "block";
        requestAnimationFrame(() => {
          el.classList.add("active");
        });
      } else {
        el.classList.remove("active");
        const onEnd = (ev: TransitionEvent) => {
          if (ev.propertyName === "opacity") {
            el.style.display = "none";
            el.removeEventListener("transitionend", onEnd as any);
          }
        };
        el.addEventListener("transitionend", onEnd as any);
      }
    }
    // if contains img return
    if (_$(".share-weixin-canvas").children.length) {
      return;
    }
    const { cover, description, title, author } = window.REIMU_POST;
    (_$("#share-weixin-banner") as HTMLImageElement).src = cover;
    _$("#share-weixin-title").innerText = title;
    _$("#share-weixin-desc").innerText = description.replace(/\s/g, " ");
    _$("#share-weixin-author").innerText = "By: " + author;
    QRCode.toDataURL(window.REIMU_POST.url, function (error, dataUrl) {
      if (error) {
        console.error(error);
        return;
      }
      (_$("#share-weixin-qr") as HTMLImageElement).src = dataUrl;
      snapdom
        .toPng(_$(".share-weixin-dom"))
        .then((img) => {
          _$(".share-weixin-canvas").appendChild(img);
        })
        .catch(() => {
          // we assume that the error is caused by the browser's security policy
          // so we will remove the banner and try again
          _$("#share-weixin-banner").remove();
          snapdom
            .toPng(_$(".share-weixin-dom"))
            .then((img) => {
              _$(".share-weixin-canvas").appendChild(img);
            })
            .catch(() => {
              console.error("Failed to generate weixin share image.");
            });
        });
    });
  });

const imgElement = _$("#header > img") as HTMLImageElement;
if (imgElement.src || imgElement.style.background) {
  window.bannerElement = imgElement;
} else {
  window.bannerElement = _$("#header > picture img") as HTMLImageElement;
}

window.generateSchemeHandler?.();
