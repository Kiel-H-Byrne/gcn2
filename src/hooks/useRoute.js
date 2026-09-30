import { useState, useEffect, useCallback } from "react";
import { LANDING_PAGES } from "../data/landingPages";
import { trackPageView } from "../lib/analytics";

function normalizePath(pathname) {
  if (!pathname || pathname === "/" || pathname === "/index.html") return "/";
  // Remove trailing slashes and file extensions
  let clean = pathname.replace(/\/$/, "").replace(/\.html$/, "");
  return clean || "/";
}

export function useRoute() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === "undefined") return "/";
    return normalizePath(window.location.pathname);
  });

  const navigate = useCallback((targetPath, replace = false) => {
    if (typeof window === "undefined") return;
    const cleanPath = normalizePath(targetPath);

    if (replace) {
      window.history.replaceState(null, "", cleanPath);
    } else {
      window.history.pushState(null, "", cleanPath);
    }

    setCurrentPath(cleanPath);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const config = LANDING_PAGES[cleanPath];
    const pageTitle = config?.title || document.title;
    trackPageView(cleanPath, pageTitle);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = normalizePath(window.location.pathname);
      setCurrentPath(path);
      const config = LANDING_PAGES[path];
      trackPageView(path, config?.title || document.title);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const landingConfig = LANDING_PAGES[currentPath] || null;

  return {
    currentPath,
    navigate,
    landingConfig,
    isLandingPage: Boolean(landingConfig),
  };
}
