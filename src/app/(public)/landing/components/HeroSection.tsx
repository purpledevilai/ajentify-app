'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeSnippet } from '@/app/components/CodeSnippet';

const CODING_AGENT_PROMPT = `Add AI chat to my app using Ajentify. Read the docs at https://api.ajentify.com/docs and implement it end-to-end.`;

const CURL_EXAMPLE = `# 1) Create an agent
curl -X POST https://api.ajentify.com/agent \\
  -H "Authorization: $AJENTIFY_API_KEY" \\
  -d '{"name":"Support","prompt":"You help customers with their orders."}'

# 2) Give it a tool (your own code, running in your stack)
curl -X POST https://api.ajentify.com/tool \\
  -H "Authorization: $AJENTIFY_API_KEY" \\
  -d '{"name":"lookup_order","description":"Get an order by ID","schema":{...}}'

# 3) Start a conversation
curl -X POST https://api.ajentify.com/context \\
  -H "Authorization: $AJENTIFY_API_KEY" \\
  -d '{"agent_id":"agt_..."}'

# 4) Chat
curl -X POST https://api.ajentify.com/chat \\
  -H "Authorization: $AJENTIFY_API_KEY" \\
  -d '{"context_id":"ctx_...","message":"Where is order #4821?"}'`;

export default function HeroSection() {
    const [hasCopied, setHasCopied] = useState(false);

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(CODING_AGENT_PROMPT);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        } catch {
            // clipboard write failed silently
        }
    };

    return (
        <section className="relative overflow-hidden py-16 md:py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-start gap-8 md:gap-10">
                    <p className="text-sm font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-300">
                        AI agents, as infrastructure
                    </p>

                    <h1 className="text-2xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.02em] leading-[1.05]">
                        The Stripe of AI agents.
                    </h1>

                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl leading-[1.5]">
                        The HTTP API for adding agents, memory, tools, and chat to any app — with
                        docs built to be read and implemented directly by coding agents like Cursor
                        and Claude Code.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Button
                            size="lg"
                            variant="default"
                            onClick={onCopy}
                            className="px-7"
                        >
                            {hasCopied ? (
                                <Check className="mr-2 h-4 w-4" />
                            ) : (
                                <Copy className="mr-2 h-4 w-4" />
                            )}
                            {hasCopied ? 'Prompt copied — paste into Cursor' : 'Give this to your coding agent'}
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="ghost"
                            className="text-gray-700 dark:text-gray-200 px-6"
                        >
                            <Link href="/signup">Sign up</Link>
                        </Button>
                    </div>

                    <div className="w-full pt-2 md:pt-4">
                        <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
                            <span className="text-sm">Or, from a terminal:</span>
                        </div>
                        <CodeSnippet language="bash" code={CURL_EXAMPLE} />
                    </div>
                </div>
            </div>
        </section>
    );
}
