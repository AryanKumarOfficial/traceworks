"use client";
import {JSX, useState} from 'react';
import {Menu, X} from 'lucide-react';
import Link from "next/link";

export default function Header(): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);

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
        }, {
            label: `Sign In`,
            href: `/sign-in`,
        }
    ]

    return (
        <nav className="bg-white shadow-sm">
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
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                        <Link href="/"
                              className="block text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                            Home
                        </Link>
                        <a href="/about"
                           className="block text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                            About
                        </a>
                        <a href="/services"
                           className="block text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                            Services
                        </a>
                        <a href="/contact"
                           className="block text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                            Contact
                        </a>
                        <a href="/login"
                           className="block bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium text-center">
                            Sign In
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
