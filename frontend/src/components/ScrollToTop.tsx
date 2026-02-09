import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from 'lenis/react';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();
    const lenis = useLenis();

    useEffect(() => {
        // If there is a hash, let normal anchor logic or manual handling take over
        if (hash) return;

        // Immediate native scroll for basics
        window.scrollTo(0, 0);

        // If using Lenis, force it to top as well
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        }
    }, [pathname, hash, lenis]);

    return null;
}
