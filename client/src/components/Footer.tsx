import {GithubIcon, LinkedinIcon, LucideLinkedin, Mail} from 'lucide-react';
import React, {JSX} from "react";


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
];
const socialLinks: {
    label: string;
    href: string;
    Icon: React.ElementType;
}[] = [
    {
        label: `linkedin`,
        href: `https://linkedin.com/in/aryankumarofficial`,
        Icon: LinkedinIcon
    },
    {
        label: `Github`,
        href: `https://github.com/aryankumarofficial`,
        Icon: GithubIcon
    },
]

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-white text-2xl font-bold mb-4">Traceworks</h3>
                        <p className="text-gray-400 mb-4 max-w-md">
                            Building amazing digital experiences for the modern web.
                            Your trusted partner in innovation and excellence.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((link, idx) => (
                                <a key={idx} href={link.href}
                                   className="text-gray-400 hover:text-white transition-colors"
                                   aria-label={link.label}
                                   target={"_blank"}
                                >
                                    <link.Icon size={20}/>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        {navLinks.map((link, idx) => (
                            <ul className="space-y-2" key={idx}>
                                <li>
                                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </a>
                                </li>

                            </ul>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <Mail size={16} className="mt-1 mr-2 flex-shrink-0"/>
                                <a href="mailto:aryanak9163@gmail.com"
                                   className="text-gray-400 hover:text-white transition-colors">
                                    aryanak9163@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Traceworks. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
