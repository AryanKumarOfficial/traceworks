// app/dashboard/page.jsx
'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {apiFetch} from '@/lib/api';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiFetch('/auth/me', {method: 'GET'});
                if (res.ok) {
                    const j = await res.json();
                    console.log(`j`, j, mounted);
                    if (j.ok && mounted) setUser(j.user);
                }
            } catch (err) {
                console.log(`error`, err);
                router.replace('/sign-in');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [router]);

    const logout = async () => {
        const res = await apiFetch('/auth/logout', {method: 'POST'});
        console.log(`logged out`, await res.json());
        router.push('/sign-in');
        router.refresh();
    };

    if (loading) return <div className="mx-auto w-container">
        <div className="bg-card rounded-2xl shadow p-8 text-center">Loading…</div>
    </div>;

    return (
        <div className="mx-auto w-container">
            <div className="bg-card rounded-2xl shadow p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Dashboard</h2>
                    <button onClick={logout} className="text-sm text-red-600 hover:underline">Sign out</button>
                </div>
                <p className="mt-4 text-gray-700">Welcome back — <span
                    className="font-medium">{(user as any)?.user_name}</span></p>
            </div>
        </div>
    );
}
