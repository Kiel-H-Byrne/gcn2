/**
 * Google Analytics 4 (GA4) Integration & Event Curation
 * The Caddie's Compass
 */

// Retrieve measurement ID from environment variable or window config
const MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ||
  (typeof window !== "undefined" ? window.__GA_MEASUREMENT_ID__ : undefined);

const isDev = Boolean(import.meta.env.DEV);
let isInitialized = false;

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
    // If no ID is provided, we can still record/log events gracefully
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
 * Track a curated page view or virtual screen
 * @param {string} path - URL pathname
 * @param {string} title - Page or view title
 */
export function trackPageView(
  path = window.location.pathname,
  title = document.title,
) {
  trackEvent("page_view", {
    page_path: path,
    page_title: title,
    page_location: typeof window !== "undefined" ? window.location.href : "",
  });
}

/**
 * Curated Event Helpers
 */

// 1. Bag club selection & modifications
export function trackClubSelect({ category, clubId, clubName, level }) {
  trackEvent("club_selected", {
    club_category: category,
    club_id: clubId,
    club_name: clubName || clubId,
    club_level: level,
  });
}

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

export function trackBagShare(method = "clipboard", clubCount = 0) {
  trackEvent("bag_shared", {
    share_method: method,
    club_count: clubCount,
  });
}

// 2. Profile management
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

// 3. Calculator interaction
export function trackShotCalculate({
  clubName,
  windSpeed,
  elevation,
  ballPower,
  ringsResult,
}) {
  trackEvent("shot_calculated", {
    club_name: clubName,
    wind_speed: windSpeed,
    elevation: elevation,
    ball_power: ballPower,
    rings: ringsResult,
  });
}

// 4. View mode & UI toggles
export function trackViewModeChange(mode) {
  trackEvent("view_mode_changed", {
    view_mode: mode, // 'standard' | 'widget' | 'fullscreen'
  });
}

export function trackChartVariantChange(variant) {
  trackEvent("chart_variant_changed", {
    variant: variant, // 'ring' (wind per ring) | 'wind' (rings per wind)
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

export function trackPrintSheet({
  bagSize = 0,
  ballName = "Basic",
  variant = "ring",
} = {}) {
  trackEvent("sheet_printed", {
    bag_size: bagSize,
    ball_name: ballName,
    variant: variant,
  });
}

export function trackThemeChange(theme) {
  trackEvent("theme_changed", {
    theme: theme,
  });
}
