'use client';

const PRIMITIVES = [
    {
        name: 'Agent',
        description: 'Prompt, model, tools, and behavior — defined once, invoked anywhere.',
    },
    {
        name: 'Context',
        description: 'The conversation window for an agent. Full message history, customizable memory, programmatic control of the loop.',
    },
    {
        name: 'Tool',
        description: 'Custom code an agent can invoke. Server-side, client-side, or async — your choice.',
    },
    {
        name: 'Structured Output',
        description: 'A typed JSON response endpoint. One prompt in, a predictable schema out.',
    },
    {
        name: 'Document',
        description: 'Durable, structured memory agents can read from and write to.',
    },
    {
        name: 'Data Window',
        description: 'Real-time cached context injected into an agent at runtime. Always fresh.',
    },
];

export default function SixPrimitivesSection() {
    return (
        <section className="bg-gray-50 dark:bg-gray-900 py-16 md:py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col gap-3 md:gap-4 mb-10 md:mb-14 max-w-3xl">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-[-0.02em]">
                        The Primitives.
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                        Agent · Context · Tool · Structured Output · Document · Data Window.
                        Compose them, ship anything.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {PRIMITIVES.map((primitive, idx) => (
                        <div
                            key={primitive.name}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 md:p-6 relative transition-colors duration-150 hover:border-brand-600 dark:hover:border-brand-300"
                        >
                            <p className="text-xs font-semibold text-brand-600 dark:text-brand-300 mb-3 font-mono">
                                {String(idx + 1).padStart(2, '0')}
                            </p>
                            <h3 className="text-xl font-bold mb-2 tracking-[-0.01em]">
                                {primitive.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-[1.6]">
                                {primitive.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
