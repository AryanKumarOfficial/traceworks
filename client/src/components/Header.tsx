"use client";
import {JSX, useState} from 'react';
import {Menu, X} from 'lucide-react';
import Link from "next/link";
import {useAuthStatus} from "@/lib/useAuthStatus";

interface User {
    id: string;
    name: string;
    email: string;
}

const navLinks: {
    label: string;
    href: string;
}[] = [
    {
        label: `Home`,
        href: `/`,
    },
    {
        label: `Contact`,
        href: `/contact`,
    },
    {
        label: `About`,
        href: `/about`,
    }
]
export default function Header(): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const {user, loading} = useAuthStatus();


    return (
        <nav className="bg-white/80 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            Traceworks
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map((navKLink, id) => (
                            <Link key={id} href={navKLink.href}
                                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                                {navKLink.label}
                            </Link>
                        ))}

                        {/* AUTH BUTTON */}
                        <AuthButton user={user} loading={loading}/>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-gray-900 p-2"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24}/> : <Menu size={24}/>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1">

                        {navLinks.map((link, id) => (
                            <Link
                                key={id}
                                href={link.href}
                                className="block text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <AuthButton user={user} loading={loading}/>
                    </div>
                </div>
            )}
        </nav>
    );
}

function AuthButton({loading, user}: { loading: boolean, user: User | null }) {
    if (loading) {
        return (
            <div className="px-3 py-2">
                <span className="text-gray-500">Loading...</span>
            </div>
        );
    }

    return (
        <>
            {user ? (
                <Link
                    href="/me"
                    className="block text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                >
                    Profile
                </Link>
            ) : (
                <Link
                    href="/sign-in"
                    className="block bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium text-center"
                >
                    Sign In
                </Link>
            )}
        </>
    );
}

