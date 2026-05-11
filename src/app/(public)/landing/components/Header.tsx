'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/[0.64] backdrop-saturate-[180%] backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center">
                    <div className="text-lg font-extrabold tracking-[-0.01em]">
                        Ajentify
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 md:gap-3">
                        <Button
                            asChild
                            variant="ghost"
                            className="text-brand-600 dark:text-brand-300 font-semibold hover:bg-brand-50 dark:hover:bg-white/[0.06]"
                        >
                            <a
                                href="https://api.ajentify.com/docs"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Docs
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Toggle color mode"
                            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                            className="h-8 w-8"
                        >
                            {mounted ? (
                                resolvedTheme === 'dark' ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="hidden sm:inline-flex"
                        >
                            <Link href="/signin">Log in</Link>
                        </Button>
                        <Button asChild variant="default">
                            <Link href="/signup">Sign up</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
