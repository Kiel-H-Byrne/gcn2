/**
 * Google Analytics 4 (GA4) Integration & Event Flow Curation
 * The Caddie's Compass
 *
 * Core Flow Events:
 * 1. landing_view      - Did Reddit traffic arrive?
 * 2. bag_started       - Did they understand the product?
 * 3. club_added        - Did they actually configure something?
 * 4. bag_completed     - Did they finish setup?
 * 5. calculator_used   - Did they perform the core action?
 * 6. shot_calculated   - Did they use it for an actual shot? (North Star)
 * 7. fullscreen_opened - Did they discover the gameplay mode?
 * 8. widget_opened     - Is the compact mode useful?
 * 9. print_chart       - Is the printable chart valuable?
 * 10. pwa_install      - Is this becoming a persistent tool?
 * 11. bag_shared       - Are users distributing it? (Growth metric)
 * 12. return_visit     - Did it become part of their routine?
 */

// Retrieve measurement ID from environment variable or window config
const MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ||
  (typeof window !== "undefined" ? window.__GA_MEASUREMENT_ID__ : undefined);

const isDev = Boolean(import.meta.env.DEV);
let isInitialized = false;
let hasBagStartedFired = false;
let lastBagCompletedCount = 0;
let lastCalcInteraction = 0;
let pwaTracked = false;

/**
 * Initialize Google Analytics 4
 * Injects the gtag.js script and sets up dataLayer if a measurement ID is available.
 */
export function initGA(customMeasurementId) {
  if (typeof window === "undefined") return;

  const id = customMeasurementId || MEASUREMENT_ID;

  if (isDev) {
    console.info(
      `%c[GA4]%c Analytics initialized in dev mode. Measurement ID: ${id || "(None - logging only)"}`,
      "background: #2563eb; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: inherit;",
    );
  }

  if (!id) {
    return;
  }

  if (isInitialized) return;

  try {
    // Initialize dataLayer and gtag wrapper
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = window.gtag || gtag;

    gtag("js", new Date());

    // Configure GA4 stream
    gtag("config", id, {
      send_page_view: false, // We curate manual virtual page views
      debug_mode: isDev,
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
    });

    // Check if script tag is already in DOM
    const existingScript = document.querySelector(
      `script[src*="googletagmanager.com/gtag/js"]`,
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      script.onerror = () => {
        if (isDev) {
          console.warn(
            "[GA4] gtag.js failed to load (likely ad-blocker or offline). Continuing gracefully.",
          );
        }
      };
      document.head.appendChild(script);
    }

    isInitialized = true;
  } catch (error) {
    if (isDev) {
      console.warn("[GA4] Error during gtag initialization:", error);
    }
  }
}

/**
 * Track custom event with GA4
 * @param {string} eventName - snake_case event name
 * @param {Record<string, any>} params - event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined") return;

  if (isDev) {
    console.debug(
      `%c[GA4 Event]%c ${eventName}`,
      "background: #059669; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: inherit;",
      params,
    );
  }

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  } catch (err) {
    if (isDev) {
      console.warn(`[GA4] Failed to send event ${eventName}:`, err);
    }
  }
}

/**
 * Set persistent user properties in GA4
 * @param {Record<string, any>} properties
 */
export function setUserProperties(properties = {}) {
  if (typeof window === "undefined" || !properties) return;

  if (isDev) {
    console.debug(
      "%c[GA4 User Props]",
      "background: #8b5cf6; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      properties,
    );
  }

  try {
    if (typeof window.gtag === "function") {
      window.gtag("set", "user_properties", properties);
    }
  } catch (err) {
    if (isDev) {
      console.warn("[GA4] Failed to set user properties:", err);
    }
  }
}

/**
 * Track a curated page view or virtual screen
 * @param {string} path - URL pathname
 * @param {string} title - Page or view title
 */
export function trackPageView(
  path = typeof window !== "undefined" ? window.location.pathname : "/",
  title = typeof document !== "undefined" ? document.title : "",
) {
  trackEvent("page_view", {
    page_path: path,
    page_title: title,
    page_location: typeof window !== "undefined" ? window.location.href : "",
  });
}

/* =========================================================================
 * 12-Event User Flow & Funnel Helpers
 * ========================================================================= */

/**
 * 1. landing_view: "Did Reddit traffic arrive?"
 * Captures initial entry, detecting Reddit referrers and UTM campaigns.
 */
export function trackLandingView() {
  if (typeof window === "undefined") return;

  const referrer = document.referrer || "";
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source") || "";
  const utmMedium = params.get("utm_medium") || "";
  const utmCampaign = params.get("utm_campaign") || "";
  const sharedBag = params.get("bag") || "";

  const isReddit = Boolean(
    /reddit\.com|redd\.it|android-app:\/\/com\.reddit\.frontpage/i.test(referrer) ||
    /reddit/i.test(utmSource) ||
    /reddit/i.test(utmMedium),
  );

  let referrerDomain = "direct";
  if (referrer) {
    try {
      referrerDomain = new URL(referrer).hostname.replace(/^www\./, "");
    } catch {
      referrerDomain = referrer.slice(0, 50);
    }
  }

  const payload = {
    is_reddit: isReddit,
    referrer: referrer || "direct",
    referrer_domain: referrerDomain,
    has_shared_bag: Boolean(sharedBag),
    page_path: window.location.pathname,
    page_title: document.title,
  };
  if (utmSource) payload.utm_source = utmSource;
  if (utmMedium) payload.utm_medium = utmMedium;
  if (utmCampaign) payload.utm_campaign = utmCampaign;

  trackEvent("landing_view", payload);

  setUserProperties({
    is_reddit_traffic: isReddit,
    acquisition_channel: isReddit
      ? "reddit"
      : referrerDomain !== "direct"
        ? "referral"
        : "direct",
  });
}

/**
 * 2. return_visit: "Did it become part of their routine?"
 * Evaluates session history in localStorage and tracks return frequency.
 */
export function checkAndTrackReturnVisit() {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    const VISIT_COUNT_KEY = "gcwind.visit_count";
    const LAST_VISIT_KEY = "gcwind.last_visit_time";
    const FIRST_VISIT_KEY = "gcwind.first_visit_time";
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes standard session inactivity

    const now = Date.now();
    const storedFirstVisit = localStorage.getItem(FIRST_VISIT_KEY);
    const storedLastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const storedCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);

    if (!storedLastVisit) {
      // First visit
      localStorage.setItem(FIRST_VISIT_KEY, String(now));
      localStorage.setItem(LAST_VISIT_KEY, String(now));
      localStorage.setItem(VISIT_COUNT_KEY, "1");
      setUserProperties({
        user_type: "new_visitor",
        visit_count: 1,
        is_routine: false,
      });
      return;
    }

    const firstVisitTime = parseInt(storedFirstVisit || String(now), 10);
    const lastVisitTime = parseInt(storedLastVisit, 10);
    const timeDiff = now - lastVisitTime;

    if (timeDiff > SESSION_TIMEOUT_MS) {
      const newCount = storedCount + 1;
      localStorage.setItem(VISIT_COUNT_KEY, String(newCount));
      localStorage.setItem(LAST_VISIT_KEY, String(now));

      const daysSinceFirst = Math.max(0, Math.round((now - firstVisitTime) / 86400000));
      const daysSinceLast = Number((timeDiff / 86400000).toFixed(1));
      const isRoutine = newCount >= 3;

      trackEvent("return_visit", {
        visit_count: newCount,
        days_since_first_visit: daysSinceFirst,
        days_since_last_visit: daysSinceLast,
        is_routine: isRoutine,
      });

      setUserProperties({
        user_type: "returning_visitor",
        visit_count: newCount,
        is_routine: isRoutine,
      });
    } else {
      // Update activity timestamp quietly within same session
      localStorage.setItem(LAST_VISIT_KEY, String(now));
    }
  } catch (err) {
    if (isDev) console.warn("[GA4] Return visit error:", err);
  }
}

/**
 * 3. pwa_install: "Is this becoming a persistent tool?"
 * Captures PWA installation and setup lifecycle.
 */
export function setupPWAInstallTracking() {
  if (typeof window === "undefined") return;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    setUserProperties({ pwa_installed: true, display_mode: "standalone" });
  }

  window.addEventListener("appinstalled", () => {
    if (pwaTracked) return;
    pwaTracked = true;
    trackEvent("pwa_install", {
      outcome: "installed",
      platform: navigator.platform || "unknown",
      display_mode: "standalone",
    });
    setUserProperties({ pwa_installed: true });
  });

  window.addEventListener("beforeinstallprompt", (e) => {
    if (typeof e.userChoice?.then === "function") {
      e.userChoice.then((choiceResult) => {
        if (choiceResult?.outcome === "accepted" && !pwaTracked) {
          pwaTracked = true;
          trackEvent("pwa_install", {
            outcome: "accepted",
            platform: navigator.platform || "unknown",
            display_mode: "browser_prompt",
          });
          setUserProperties({ pwa_installed: true });
        }
      });
    }
  });
}

export function trackPWAInstall(outcome = "installed") {
  trackEvent("pwa_install", {
    outcome,
    platform: typeof navigator !== "undefined" ? navigator.platform || "unknown" : "unknown",
    display_mode:
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true)
        ? "standalone"
        : "browser",
  });
  setUserProperties({ pwa_installed: true });
}

/**
 * 4. bag_started: "Did they understand the product?"
 * Fires when user begins configuring or interacting with bag setup.
 */
export function trackBagStarted({ source = "editor_open", category, clubId } = {}) {
  if (hasBagStartedFired) return;
  hasBagStartedFired = true;

  trackEvent("bag_started", {
    source,
    category: category || "unknown",
    club_id: clubId || "none",
  });

  setUserProperties({ has_started_bag: true });
}

/**
 * 5. club_added: "Did they actually configure something?"
 * Fires when a club is added or selected into the bag.
 */
export function trackClubAdded({
  category,
  clubId,
  clubName,
  level,
  bagCount = 1,
  categoriesFilled = 1,
}) {
  trackEvent("club_added", {
    club_category: category,
    club_id: clubId,
    club_name: clubName || clubId,
    club_level: level,
    club_count: bagCount,
    categories_filled: categoriesFilled,
  });

  // Backward-compatible alias
  trackEvent("club_selected", {
    club_category: category,
    club_id: clubId,
    club_name: clubName || clubId,
    club_level: level,
  });

  setUserProperties({ has_configured_bag: true, club_count: bagCount });
}

// Preserve existing export for any external calls
export const trackClubSelect = trackClubAdded;

/**
 * 6. bag_completed: "Did they finish setup?"
 * Fires when bag setup is completed (e.g. 7 club categories filled or modal confirmed).
 */
export function trackBagCompleted({
  clubCount = 0,
  categoriesFilled = 0,
  source = "full_bag",
} = {}) {
  if (lastBagCompletedCount === clubCount && clubCount > 0) return;
  lastBagCompletedCount = clubCount;

  trackEvent("bag_completed", {
    club_count: clubCount,
    categories_filled: categoriesFilled,
    is_full_bag: clubCount >= 7,
    source,
  });

  setUserProperties({
    has_completed_bag: true,
    is_full_bag: clubCount >= 7,
  });
}

/**
 * 7. calculator_used: "Did they perform the core action?"
 * Fires when the user engages with calculator controls (compass, dials, club, ball).
 */
export function trackCalculatorUsed({
  interactionType = "compass_drag",
  clubName,
  windSpeed,
  elevation,
} = {}) {
  const now = Date.now();
  // Throttle to at most once per 2.5s during continuous adjustment gestures
  if (now - lastCalcInteraction < 2500) return;
  lastCalcInteraction = now;

  trackEvent("calculator_used", {
    interaction_type: interactionType,
    club_name: clubName || "unknown",
    wind_speed: windSpeed !== undefined ? Number(windSpeed) : undefined,
    elevation: elevation !== undefined ? Number(elevation) : undefined,
  });
}

/**
 * 8. shot_calculated: "Did they use it for an actual shot?"
 * North-Star Event: A user successfully calculates a shot after configuring a bag.
 */
export function trackShotCalculate({
  clubName,
  windSpeed,
  elevation,
  ballPower,
  ringsResult,
  bagConfigured = true,
  clubCount = 0,
}) {
  const isNorthStar = Boolean(bagConfigured && clubCount > 0 && ringsResult > 0);

  trackEvent("shot_calculated", {
    club_name: clubName,
    wind_speed: windSpeed,
    elevation: elevation,
    ball_power: ballPower,
    rings: ringsResult,
    bag_configured: bagConfigured,
    club_count: clubCount,
    is_north_star: isNorthStar,
  });

  // Dedicated North Star conversion event:
  if (isNorthStar) {
    trackEvent("north_star_shot_calculated", {
      club_name: clubName,
      wind_speed: windSpeed,
      elevation: elevation,
      ball_power: ballPower,
      rings: ringsResult,
      club_count: clubCount,
    });
    setUserProperties({ north_star_achieved: true });
  }
}

/**
 * 9. fullscreen_opened: "Did they discover the gameplay mode?"
 */
export function trackFullscreenOpened({ bagSize = 0, source = "chart_controls" } = {}) {
  trackEvent("fullscreen_opened", {
    bag_size: bagSize,
    source,
  });
}

/**
 * 10. widget_opened: "Is the compact mode useful?"
 */
export function trackWidgetOpened({ bagSize = 0, source = "header" } = {}) {
  trackEvent("widget_opened", {
    bag_size: bagSize,
    source,
  });
}

/**
 * 11. print_chart: "Is the printable chart valuable?"
 */
export function trackPrintChart({
  bagSize = 0,
  ballName = "Basic",
  variant = "ring",
  source = "chart_controls",
} = {}) {
  trackEvent("print_chart", {
    bag_size: bagSize,
    ball_name: ballName,
    variant: variant,
    source,
  });

  // Backward-compatible alias
  trackEvent("sheet_printed", {
    bag_size: bagSize,
    ball_name: ballName,
    variant: variant,
  });
}

// Preserve existing export for backward compatibility
export const trackPrintSheet = trackPrintChart;

/**
 * 12. bag_shared: "Are users distributing it?"
 * Key growth metric: Shared bags / active users.
 */
export function trackBagShare(method = "clipboard", clubCount = 0, bagTitle = "") {
  trackEvent("bag_shared", {
    share_method: method,
    club_count: clubCount,
    bag_title: bagTitle || "Untitled",
    is_growth_action: true,
  });

  setUserProperties({ has_shared_bag: true });
}

/* =========================================================================
 * Additional Auxiliary Interaction Helpers
 * ========================================================================= */

export function trackClubLevelChange({ category, clubId, clubName, level }) {
  trackEvent("club_level_changed", {
    club_category: category,
    club_id: clubId,
    club_name: clubName || clubId,
    club_level: level,
  });
}

export function trackClubRemove({ category, clubId, clubName }) {
  trackEvent("club_removed", {
    club_category: category,
    club_id: clubId,
    club_name: clubName || clubId,
  });
}

export function trackBagClear(previousCount = 0) {
  trackEvent("bag_cleared", {
    previous_club_count: previousCount,
  });
}

export function trackProfileSave(profileName, clubCount = 0) {
  trackEvent("profile_saved", {
    profile_name: profileName,
    club_count: clubCount,
  });
}

export function trackProfileLoad(profileName) {
  trackEvent("profile_loaded", {
    profile_name: profileName,
  });
}

export function trackProfileDelete(profileName) {
  trackEvent("profile_deleted", {
    profile_name: profileName,
  });
}

export function trackViewModeChange(mode) {
  trackEvent("view_mode_changed", {
    view_mode: mode, // 'standard' | 'widget' | 'fullscreen'
  });
}

export function trackChartVariantChange(variant) {
  trackEvent("chart_variant_changed", {
    variant: variant, // 'ring' | 'wind'
  });
}

export function trackReferenceToggle(isOpen) {
  trackEvent("reference_graph_toggled", {
    state: isOpen ? "opened" : "closed",
  });
}

export function trackGuideToggle(isOpen) {
  trackEvent("ring_guide_toggled", {
    state: isOpen ? "opened" : "closed",
  });
}

export function trackThemeChange(theme) {
  trackEvent("theme_changed", {
    theme: theme,
  });
}
