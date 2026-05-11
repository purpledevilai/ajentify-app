'use client';

const COMPARISONS = [
    {
        name: 'LangChain',
        positioning:
            'A good wrapper around LLMs — handy for prototyping and stitching calls together. But it is not the infrastructure you need when you are putting AI into a production app: you still run the servers, manage memory, and build the chat surface yourself. Ajentify handles all of that for you (and happily wraps LangChain underneath).',
    },
    {
        name: 'OpenAI Assistants / Responses API',
        positioning:
            'OpenAI keeps rotating its agent API — Assistants is being deprecated, replaced by Responses + Conversations, with more churn to come. Every shift is your migration. And the moment you want Claude or Gemini, you rebuild. Ajentify wraps any model behind a stable API that does not shift under you.',
    },
    {
        name: 'Vercel AI SDK',
        positioning:
            'A TypeScript library for streaming AI into your Next.js or React app — great for the UI layer. It is not a backend: you still build persistent contexts, tool execution, memory, and eval yourself. Ajentify is a hosted backend you can call from it — the SDK handles the browser, Ajentify handles the rest.',
    },
    {
        name: 'Mastra / CrewAI',
        positioning:
            'Frameworks you install, import into your own codebase, and deploy yourself — on your EC2, your Kubernetes, your uptime. You own the infrastructure. Ajentify is a service: no deploys to babysit, no scaling to figure out, no version drift. HTTP in, HTTP out.',
    },
];

export default function WhyAjentifySection() {
    return (
        <section className="bg-gray-50 dark:bg-gray-900 py-16 md:py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col gap-3 md:gap-4 mb-10 md:mb-14 max-w-3xl">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-[-0.02em]">
                        Where Ajentify fits.
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                        There are a lot of tools in this space. Here&apos;s an honest take on where
                        Ajentify sits next to the ones you&apos;ve probably already looked at.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {COMPARISONS.map((item) => (
                        <div
                            key={item.name}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-7"
                        >
                            <p className="text-xs font-semibold text-brand-600 dark:text-brand-300 uppercase tracking-wider mb-2">
                                vs {item.name}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-[1.7]">
                                {item.positioning}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
