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

_$("#main-nav-toggle")
  ?.off("click")
  .on("click", () => {
    if (isMobileNavAnim) return;
    isMobileNavAnim = true;
    document.body.classList.toggle("mobile-nav-on");
    _$("#mask").classList.remove("hide");
    setTimeout(() => {
      isMobileNavAnim = false;
    }, 300);
  });

_$("#mask")
  ?.off("click")
  .on("click", () => {
    if (isMobileNavAnim || !document.body.classList.contains("mobile-nav-on"))
      return;
    document.body.classList.remove("mobile-nav-on");
    _$("#mask").classList.add("hide");
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

const navigableCardSelector = [
  ".project-card[data-card-url]",
  ".note-card[data-card-url]",
  ".apple-showcase[data-card-url]",
  ".apple-tile[data-card-url]",
  ".apple-project-tile[data-card-url]",
  ".about-proof-card[data-card-url]",
  ".archive-feature[data-card-url]",
].join(", ");

const cardTimers = new WeakMap<
  HTMLElement,
  {
    navigate?: number;
    cleanup?: number;
    hold?: number;
    easter?: number;
  }
>();

const ensureCardTimers = (card: HTMLElement) => {
  const timers = cardTimers.get(card) || {};
  cardTimers.set(card, timers);
  return timers;
};

const clearCardTimeout = (
  card: HTMLElement,
  key: "navigate" | "cleanup" | "hold" | "easter",
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
};

const getCardLabel = (card: HTMLElement) => {
  return (
    card.dataset.cardTitle ||
    card.querySelector("h1, h2, h3, h4, strong")?.textContent?.trim() ||
    card.getAttribute("aria-label") ||
    "this card"
  );
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

const showCardEasterEgg = (card: HTMLElement) => {
  let easter = card.querySelector<HTMLElement>(".card-easter-egg");
  if (!easter) {
    easter = document.createElement("div");
    easter.className = "card-easter-egg";
    card.appendChild(easter);
  }
  easter.textContent = `One more thing · ${getCardLabel(card)} is designed to feel lighter, faster, and more deliberate.`;
  card.classList.add("is-easter-visible");
  clearCardTimeout(card, "easter");
  ensureCardTimers(card).easter = window.setTimeout(() => {
    card.classList.remove("is-easter-visible");
  }, 2400);
};

const toggleCardFavorite = (card: HTMLElement) => {
  ensureFavoriteBadge(card);
  card.classList.toggle("is-favorited");
};

const clearCardOpenState = (card: HTMLElement, clone?: HTMLElement | null) => {
  card.classList.remove("is-source-opening");
  card.classList.remove("is-card-opening");
  card.classList.remove("is-card-transitioning");
  document.body.classList.remove("is-card-opening");
  document.body.classList.remove("is-card-transitioning");
  clone?.remove();
};

const playCardOpenTransition = (card: HTMLElement, url: string) => {
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

  clone.classList.add("card-transition-clone");
  clone.style.top = `${rect.top}px`;
  clone.style.left = `${rect.left}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.borderRadius = computed.borderRadius;
  document.body.appendChild(clone);

  card.classList.add("is-source-opening");
  card.classList.add("is-card-transitioning");

  window.requestAnimationFrame(() => {
    document.body.classList.add("is-card-transitioning");
    document.body.classList.add("is-card-opening");
    clone.classList.add("is-opening");
    clone.style.top = `${targetTop}px`;
    clone.style.left = `${targetLeft}px`;
    clone.style.width = `${targetWidth}px`;
    clone.style.height = `${targetHeight}px`;
    clone.style.borderRadius = "28px";
  });

  ensureCardTimers(card).navigate = window.setTimeout(() => {
    window.location.href = url;
  }, 520);

  ensureCardTimers(card).cleanup = window.setTimeout(() => {
    clearCardOpenState(card, clone);
  }, 1200);
};

const scheduleCardOpen = (card: HTMLElement, url: string, delay = 240) => {
  clearCardTimeout(card, "navigate");
  ensureCardTimers(card).navigate = window.setTimeout(() => {
    playCardOpenTransition(card, url);
  }, delay);
};

const motionCards = _$$<HTMLElement>(motionCardSelector);

motionCards.forEach((card, index) => {
  card.style.setProperty("--card-enter-delay", `${Math.min((index % 8) * 0.1, 0.7)}s`);
});

motionCards
  .filter((card) => !card.matches(navigableCardSelector))
  .forEach((card) => {
    let pointerStartX = 0;
    let pointerStartY = 0;

    card.off("dblclick").on("dblclick", (event: MouseEvent) => {
      event.preventDefault();
      toggleCardFavorite(card);
    });

    card.off("pointerdown").on("pointerdown", (event: PointerEvent) => {
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
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

if ("IntersectionObserver" in window) {
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

  motionCards.forEach((card) => revealObserver.observe(card));
} else {
  motionCards.forEach((card) => card.classList.add("is-card-visible"));
}

let __cardParallaxRaf = 0;
var __cardParallaxScrollHandler;
var __cardParallaxResizeHandler;

const updateCardParallax = () => {
  motionCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > window.innerHeight + 120) {
      card.style.setProperty("--scroll-media-parallax-y", "0px");
      return;
    }
    const distance = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    const mediaOffset = Math.max(-14, Math.min(14, -distance * 18));
    card.style.setProperty("--scroll-media-parallax-y", `${mediaOffset.toFixed(2)}px`);
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

__cardParallaxScrollHandler = requestCardParallax;
__cardParallaxResizeHandler = requestCardParallax;
window.on("scroll", __cardParallaxScrollHandler);
window.on("resize", __cardParallaxResizeHandler);
requestCardParallax();

_$$<HTMLElement>(navigableCardSelector).forEach((card) => {
  const url = card.dataset.cardUrl;
  if (!url) return;

  card.style.cursor = "pointer";
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "link");

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

    if (event.metaKey || event.ctrlKey) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    event.preventDefault();
    scheduleCardOpen(card, url);
  });

  card.off("keydown").on("keydown", (event: KeyboardEvent) => {
    if ((event.key === "Enter" || event.key === " ") && !card.classList.contains("is-card-transitioning")) {
      event.preventDefault();
      scheduleCardOpen(card, url, 0);
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
    scheduleCardOpen(card, link.href, 240);
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
  const maxRotate = element.matches(
    ".home-hero-button, .career-button, .apple-link, .project-card__links a, .section-link, .project-card__readmore",
  )
    ? 4
    : 7;
  const maxTranslate = element.matches(
    ".home-hero-button, .career-button, .apple-link, .project-card__links a, .section-link, .project-card__readmore",
  )
    ? 4
    : 10;

  const resetTransform = () => {
    element.style.removeProperty("--tilt-rotate-x");
    element.style.removeProperty("--tilt-rotate-y");
    element.style.removeProperty("--tilt-translate-x");
    element.style.removeProperty("--tilt-translate-y");
    element.style.removeProperty("--pointer-x");
    element.style.removeProperty("--pointer-y");
    element.classList.remove("is-pointer-down");
  };

  element.off("mousemove").on("mousemove", (event: Event) => {
    const mouseEvent = event as MouseEvent;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (mouseEvent.clientX - centerX) / (rect.width / 2 || 1);
    const percentY = (mouseEvent.clientY - centerY) / (rect.height / 2 || 1);

    element.style.setProperty("--tilt-rotate-x", `${(-percentY * maxRotate).toFixed(2)}deg`);
    element.style.setProperty("--tilt-rotate-y", `${(percentX * maxRotate).toFixed(2)}deg`);
    element.style.setProperty("--tilt-translate-x", `${(percentX * maxTranslate).toFixed(2)}px`);
    element.style.setProperty("--tilt-translate-y", `${(percentY * maxTranslate).toFixed(2)}px`);
    element.style.setProperty("--pointer-x", `${(((mouseEvent.clientX - rect.left) / (rect.width || 1)) * 100).toFixed(2)}%`);
    element.style.setProperty("--pointer-y", `${(((mouseEvent.clientY - rect.top) / (rect.height || 1)) * 100).toFixed(2)}%`);
  });

  element.off("mousedown").on("mousedown", () => {
    element.classList.add("is-pointer-down");
  });
  element.off("mouseup").on("mouseup", () => {
    element.classList.remove("is-pointer-down");
  });
  element.off("mouseleave").on("mouseleave", resetTransform);
  element.off("blur").on("blur", resetTransform);
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

if (__sidebarTopScrollHandler) {
  window.off("scroll", __sidebarTopScrollHandler);
}

__sidebarTopScrollHandler = () => {
  const sidebarTop = _$(".sidebar-top")!;
  if (document.documentElement.scrollTop < 10) {
    sidebarTop.style.opacity = "0";
  } else {
    sidebarTop.style.opacity = "1";
  }
};

window.on("scroll", __sidebarTopScrollHandler);

// toc
_$$("#mobile-nav #TableOfContents li").forEach((element) => {
  element.off("click").on("click", () => {
    if (isMobileNavAnim || !document.body.classList.contains("mobile-nav-on"))
      return;
    document.body.classList.remove("mobile-nav-on");
    _$("#mask").classList.add("hide");
  });
});

_$$("#mobile-nav .sidebar-menu-link-dummy").forEach((element) => {
  element.off("click").on("click", () => {
    if (isMobileNavAnim || !document.body.classList.contains("mobile-nav-on"))
      return;
    setTimeout(() => {
      document.body.classList.remove("mobile-nav-on");
      _$("#mask").classList.add("hide");
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
