'use client';

import Link from 'next/link';

const FOOTER_LINKS = {
    product: [
        { label: 'Docs', href: 'https://api.ajentify.com/docs', external: true },
        { label: 'Sign up', href: '/signup', external: false },
        { label: 'Log in', href: '/signin', external: false },
    ],
    follow: [
        { label: 'YouTube', href: 'https://www.youtube.com/@Ajentify', external: true },
    ],
    legal: [
        { label: 'Data Usage Policy', href: '/privacy', external: false },
    ],
};

export default function Footer() {
    const renderLink = (link: { label: string; href: string; external: boolean }) => {
        const className =
            'text-sm text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-300 no-underline transition-colors';

        if (link.external) {
            return (
                <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                >
                    {link.label}
                </a>
            );
        }

        return (
            <Link key={link.label} href={link.href} className={className}>
                {link.label}
            </Link>
        );
    };

    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-10 md:py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-8">
                    <div className="flex flex-col gap-3 max-w-sm">
                        <p className="text-lg font-extrabold tracking-[-0.01em]">
                            Ajentify
                        </p>
                        <p className="text-sm text-gray-500 leading-[1.6]">
                            Agents, memory, tools, and chat — as infrastructure, over plain HTTP.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 md:gap-16">
                        <div className="flex flex-col gap-3 min-w-32">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Product
                            </p>
                            {FOOTER_LINKS.product.map(renderLink)}
                        </div>
                        <div className="flex flex-col gap-3 min-w-32">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Follow
                            </p>
                            {FOOTER_LINKS.follow.map(renderLink)}
                        </div>
                        <div className="flex flex-col gap-3 min-w-32">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Legal
                            </p>
                            {FOOTER_LINKS.legal.map(renderLink)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-10 md:mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex-wrap">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Ajentify
                    </p>
                </div>
            </div>
        </footer>
    );
}
