'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeSnippet } from '@/app/components/CodeSnippet';

const DOCS_URL = 'https://api.ajentify.com/docs';

const ONBOARDING_PROMPT = `Add an AI chat feature to my app using Ajentify.

Read the docs at ${DOCS_URL} — every endpoint, schema, and example is in there. Then:

1. Create an Agent and a Context for the current user.
2. Wire up a /chat call from my frontend, streaming responses.
3. Show me the exact code changes and where to put them.`;

export default function ForCodingAgentsSection() {
    return (
        <section className="py-16 md:py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col gap-3 md:gap-4 mb-10 md:mb-14 max-w-3xl">
                    <p className="text-sm font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-300">
                        Docs-first, agent-native
                    </p>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-[-0.02em]">
                        Built to be read by AI.
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                        The API is plain HTTP — easy to call directly, easy to wrap in your own SDK.
                        The docs are structured so a coding agent can crawl them, understand the
                        full surface, and implement an integration end-to-end.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 md:p-8 mb-8 md:mb-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-6">
                        <div className="flex flex-col gap-1 flex-1">
                            <p className="text-xs font-semibold text-brand-600 dark:text-brand-300 uppercase tracking-wider">
                                The one URL your coding agent needs
                            </p>
                            <p className="font-mono text-base md:text-xl font-bold text-gray-900 dark:text-white break-all">
                                {DOCS_URL}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-[1.6] pt-1">
                                Every endpoint, request and response schema, and runnable example —
                                in one crawlable surface.
                            </p>
                        </div>
                        <Button
                            asChild
                            size="lg"
                            variant="default"
                            className="shrink-0"
                        >
                            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
                                View docs
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 max-w-3xl">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        The onboarding prompt (copy, paste, ship):
                    </p>
                    <CodeSnippet language="markdown" code={ONBOARDING_PROMPT} />
                </div>
            </div>
        </section>
    );
}
