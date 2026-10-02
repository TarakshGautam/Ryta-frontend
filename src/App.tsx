import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SignedIn, SignedOut, UserProfile } from "@clerk/clerk-react";
import "./index.css";

import Navbar from "./components/Navbar";
import { Hero } from "./components/Hero";
import Story from "./components/Story";
import Timeline from "./components/TImeline";
import ChatPage from "./pages/Chat";
import GuestPage from "./pages/Guest";
import NotFoundPage from "./components/NotFound";
import { useDocumentTitle } from "./hooks/useDocumenttitle";

const TABS = ["home", "story", "timeline"];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const getSubdomain = (hostname: string): string | null => {
  if (!hostname) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return null;
  const parts = hostname.split(".");
  if (hostname.includes("localhost")) {
    return parts.length > 1 && parts[0] !== "localhost"
      ? parts[0].toLowerCase()
      : null;
  }
  return parts.length > 2 ? parts[0].toLowerCase() : null;
};

// ─────────────────────────────────────────────────────────────
// PWA INSTALL HOOK
// ─────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(
        (navigator as unknown as { standalone?: boolean }).standalone
      );
    setIsInstalled(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const isInstallable = isIOS || Boolean(deferredPrompt);

  return { isInstallable, isInstalled, isIOS, install };
}

// ─────────────────────────────────────────────────────────────
// MAIN LANDING LAYOUT
// ─────────────────────────────────────────────────────────────
const MainLandingLayout: React.FC<{ hasBanner: boolean }> = ({
  hasBanner,
}) => {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [direction, setDirection] = useState<number>(0);

  const tabTitleMap: Record<string, string> = useMemo(
    () => ({ home: "Home", story: "Our Story", timeline: "Timeline" }),
    []
  );
  useDocumentTitle(tabTitleMap[activeTab] || "Home");

  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab((prevTab) => {
      if (newTab === prevTab) return prevTab;
      const currentIndex = TABS.indexOf(prevTab);
      const newIndex = TABS.indexOf(newTab);
      setDirection(newIndex > currentIndex ? 1 : -1);
      return newTab;
    });
  }, []);

  return (
    <div className="ryta-landing-page h-screen w-screen overflow-hidden flex flex-col justify-between relative">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-rose-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-pink-300/20 blur-[120px] pointer-events-none" />

      <div
        className={`transition-all duration-300 ${hasBanner ? "pt-14 sm:pt-12" : "pt-0"
          }`}
      >
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      <main className="flex-1 w-full relative overflow-hidden min-h-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 280, damping: 28 },
              opacity: { duration: 0.18 },
            }}
            className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden ryta-scroll"
          >
            <div className="min-h-full w-full flex flex-col items-center justify-center">
              {activeTab === "home" && <Hero />}
              {activeTab === "story" && <Story />}
              {activeTab === "timeline" && <Timeline />}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="pointer-events-auto backdrop-blur-md bg-white/80 border border-rose-200/60 shadow-xs rounded-full px-3.5 py-1 flex items-center gap-2 text-[11px] text-slate-600">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <svg
            className="w-3.5 h-3.5 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="font-medium tracking-wide">
            100% End-to-End Private & Zero Data Mining
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// INSTALL BANNER
// ─────────────────────────────────────────────────────────────
const InstallBanner: React.FC<{
  isIOS: boolean;
  install: () => Promise<void>;
  onDismiss: () => void;
}> = ({ isIOS, install, onDismiss }) => {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await install();
    } catch (e) {
      console.warn("Install failed:", e);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-[380px] px-3"
    >
      <div className="bg-white/95 backdrop-blur-md border border-rose-200/80 rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center gap-3">
        <img
          src="/logo.png"
          alt="RyTa"
          className="w-9 h-9 rounded-xl object-contain shrink-0"
        />

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate">
            Install RyTa AI
          </p>
          <p className="text-[11px] text-slate-500 leading-tight truncate">
            {isIOS
              ? "Tap Share → 'Add to Home Screen'"
              : "Faster, smoother, always available"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isIOS && (
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors text-[11px] cursor-pointer"
            >
              {isInstalling ? "..." : "Install"}
            </button>
          )}
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────
// USER PROFILE PAGE (Clerk)
// ─────────────────────────────────────────────────────────────
const UserProfilePage: React.FC = () => (
  <div className="min-h-screen w-full bg-[var(--ryta-bg)] flex justify-center py-8 px-4">
    <div className="w-full max-w-[880px]">
      <UserProfile
        routing="path"
        path="/user-profile"
        appearance={{
          variables: {
            colorPrimary: "var(--ryta-primary)",
            colorBackground: "var(--ryta-bg)",
            colorText: "var(--ryta-text)",
            colorTextSecondary: "var(--ryta-text-muted)",
            colorInputBackground: "var(--ryta-surface)",
            colorInputText: "var(--ryta-text)",
            borderRadius: "0.75rem",
            fontFamily: "inherit",
          },
          elements: {
            rootBox: "w-full",
            card: "w-full shadow-none border border-[var(--ryta-border)] bg-[var(--ryta-bg)]",
            navbar: "hidden",
            navbarMobileMenuButton: "hidden",
            headerTitle: "font-serif text-[var(--ryta-text)]",
            headerSubtitle: "text-[var(--ryta-text-muted)]",
            profileSectionTitleText: "text-[var(--ryta-text)]",
            profileSectionContent: "text-[var(--ryta-text)]",
            formButtonPrimary:
              "bg-[var(--ryta-primary)] hover:bg-[var(--ryta-primary-hover)] text-[var(--ryta-primary-fg)]",
          },
        }}
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const hostname = useMemo(
    () => (typeof window !== "undefined" ? window.location.hostname : ""),
    []
  );
  const subdomain = useMemo(() => getSubdomain(hostname), [hostname]);

  const { isInstallable, isInstalled, isIOS, install } = useInstallPrompt();

  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    if (isInstalled) return;

    const dismissed = localStorage.getItem("ryta_install_dismissed");
    if (dismissed) {
      const dismissedAt = new Date(dismissed).getTime();
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      const cooldownDays = import.meta.env.PROD ? 7 : 0;
      if (daysSince < cooldownDays) return;
    }

    const timer = setTimeout(() => setShowInstallBanner(true), 5000);
    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = useCallback(() => {
    setShowInstallBanner(false);
    localStorage.setItem("ryta_install_dismissed", new Date().toISOString());
  }, []);

  return (
    <div className="ryta-shell text-[var(--ryta-text)] overflow-hidden relative font-['Inter'] select-none">
      <AnimatePresence>
        {showInstallBanner && isInstallable && !isInstalled && (
          <InstallBanner
            isIOS={isIOS}
            install={install}
            onDismiss={handleDismiss}
          />
        )}
      </AnimatePresence>

      <Router>
        <Routes>
          {/* ─── Subdomain routing ─── */}
          {subdomain === "chat" ? (
            <Route
              path="*"
              element={
                <>
                  <SignedIn>
                    <ChatPage />
                  </SignedIn>
                  <SignedOut>
                    <GuestPage />
                  </SignedOut>
                </>
              }
            />
          ) : subdomain === "guest" ? (
            <Route path="*" element={<GuestPage />} />
          ) : (
            <>
              {/* ─── Landing ─── */}
              <Route
                path="/"
                element={<MainLandingLayout hasBanner={showInstallBanner} />}
              />

              {/* ─── Guest ─── */}
              <Route path="/guest" element={<GuestPage />} />

              {/* ─── Chat (signed in only) ─── */}
              <Route
                path="/chat"
                element={
                  <>
                    <SignedIn>
                      <ChatPage />
                    </SignedIn>
                    <SignedOut>
                      <Navigate to="/guest" replace />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/chat/:conversationId"
                element={
                  <>
                    <SignedIn>
                      <ChatPage />
                    </SignedIn>
                    <SignedOut>
                      <Navigate to="/guest" replace />
                    </SignedOut>
                  </>
                }
              />

              {/* ─── User Profile (Clerk account page) ─── */}
              <Route
                path="/user-profile"
                element={
                  <>
                    <SignedIn>
                      <UserProfilePage />
                    </SignedIn>
                    <SignedOut>
                      <Navigate to="/" replace />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/user-profile/*"
                element={
                  <>
                    <SignedIn>
                      <UserProfilePage />
                    </SignedIn>
                    <SignedOut>
                      <Navigate to="/" replace />
                    </SignedOut>
                  </>
                }
              />

              {/* ─── 404 ─── */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
};

export default App;