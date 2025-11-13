"use client";

import {useEffect, useState} from "react";
import {apiFetch} from "./api";

export function useAuthStatus() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const res = await apiFetch("/auth/me", {method: "GET"});
                if (!res.ok) {
                    if (active) {
                        setUser(null);
                        setLoading(false);
                    }
                    return;
                }

                const data = await res.json();
                if (active) {
                    setUser(data.ok ? data.user : null);
                    setLoading(false);
                }
            } catch (err) {
                if (active) {
                    setUser(null);
                    setLoading(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    return {user, loading};
}
