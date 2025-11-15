// app/signin/page.jsx
'use client';

import {ChangeEvent, FormEvent, useState} from 'react';
import {useRouter} from 'next/navigation';
import {apiFetch} from '@/lib/api';

export default function SignInPage() {
    const router = useRouter();
    const [form, setForm] = useState({email: '', password: ''});
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => setForm({...form, [e.target.name]: e.target.value});

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErr(null);

        try {
            const res = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            const j = await res.json();
            console.log(`response: `, res.ok && j.ok);
            if (res.ok && j.ok) {
                router.push('/me');
            } else {
                setErr(j.err || 'Invalid credentials');
            }
        } catch (e) {
            setErr('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-container">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Sign in</h2>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={onChange}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg shadow hover:bg-black/90 disabled:opacity-60"
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                        <a className="text-sm text-gray-500 hover:text-brand" href="/sign-up">Create account</a>
                    </div>

                    {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
                </form>
            </div>
        </div>
    );
}
