'use client';

import {ChangeEvent, FormEvent, useState} from 'react';
import {useRouter} from 'next/navigation';
import {apiFetch} from '@/lib/api';

interface FormErrors {
    user_name?: string;
    email?: string;
    password?: string;
}

export default function SignUpPage() {
    const router = useRouter();
    const [form, setForm] = useState({user_name: '', email: '', password: ''});
    const [errors, setErrors] = useState<FormErrors>({});
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
        // Clear error for this field when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors({...errors, [name]: undefined});
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation
        if (!form.user_name.trim()) {
            newErrors.user_name = 'Name is required';
        } else if (form.user_name.trim().length < 2) {
            newErrors.user_name = 'Name must be at least 2 characters';
        }

        // Email validation
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Password validation
        if (!form.password) {
            newErrors.password = 'Password is required';
        } else if (form.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMsg(null);

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            const res = await apiFetch('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            const j = await res.json();
            console.log(`response: `,j);
            if (res.ok && j.ok) {
                setMsg('Account created — redirecting to sign in...');
                setTimeout(() => router.push('/sign-in'), 800);
            } else {
                setMsg(j.err || 'Signup failed');
            }
        } catch (err) {
            setMsg('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-container py-8">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Create account</h2>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            name="user_name"
                            value={form.user_name}
                            onChange={onChange}
                            className={`mt-1 block w-full rounded-lg border ${
                                errors.user_name ? 'border-red-500' : 'border-gray-200'
                            } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 ${
                                errors.user_name ? 'focus:ring-red-300' : 'focus:ring-indigo-300'
                            }`}
                            placeholder="Your name"
                        />
                        {errors.user_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.user_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            className={`mt-1 block w-full rounded-lg border ${
                                errors.email ? 'border-red-500' : 'border-gray-200'
                            } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 ${
                                errors.email ? 'focus:ring-red-300' : 'focus:ring-indigo-300'
                            }`}
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={onChange}
                            className={`mt-1 block w-full rounded-lg border ${
                                errors.password ? 'border-red-500' : 'border-gray-200'
                            } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 ${
                                errors.password ? 'focus:ring-red-300' : 'focus:ring-indigo-300'
                            }`}
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            At least 8 characters with uppercase, lowercase, and number
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg shadow hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Creating…' : 'Sign up'}
                        </button>
                        <a className="text-sm text-gray-500 hover:text-brand transition-colors" href="/sign-in">
                            Have an account?
                        </a>
                    </div>

                    {msg && (
                        <p className={`text-sm mt-2 ${msg.includes('created') ? 'text-green-600' : 'text-red-600'}`}>
                            {msg}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}