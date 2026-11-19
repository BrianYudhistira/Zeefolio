import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "zeefolio-admin-theme";
const THEME_EVENT = "admin:theme-change";
const TRANSITION_DURATION_MS = 420;

function readStoredTheme() {
    if (typeof window === "undefined") return "dark";
    try {
        return window.localStorage.getItem(STORAGE_KEY) === "light"
            ? "light"
            : "dark";
    } catch {
        return "dark";
    }
}

export function useAdminTheme() {
    const [theme, setTheme] = useState(readStoredTheme);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionTimerRef = useRef(null);

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.dataset.adminTheme = theme;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Ignore storage write errors (e.g. private browsing)
        }
    }, [theme]);

    useEffect(() => {
        const handleExternalThemeChange = (e) => {
            const nextTheme = e?.detail;
            if (nextTheme === "light" || nextTheme === "dark") {
                setTheme((prev) => (prev === nextTheme ? prev : nextTheme));
            }
        };

        window.addEventListener(THEME_EVENT, handleExternalThemeChange);
        return () => {
            window.removeEventListener(THEME_EVENT, handleExternalThemeChange);
            if (transitionTimerRef.current) {
                clearTimeout(transitionTimerRef.current);
            }
        };
    }, []);

    const toggleTheme = useCallback(() => {
        if (transitionTimerRef.current) {
            clearTimeout(transitionTimerRef.current);
        }

        setIsTransitioning(true);
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
            return next;
        });

        transitionTimerRef.current = setTimeout(() => {
            setIsTransitioning(false);
            transitionTimerRef.current = null;
        }, TRANSITION_DURATION_MS);
    }, []);

    return {
        theme,
        isLight: theme === "light",
        isTransitioning,
        toggleTheme,
    };
}
