'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeSnippetProps {
  code: string;
  language?: string;
}

export const CodeSnippet = ({ code, language = 'javascript' }: CodeSnippetProps) => {
  const [hasCopied, setHasCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // clipboard write failed silently
    }
  };

  const syntaxStyle = resolvedTheme === 'dark' ? oneDark : oneLight;

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="flex justify-between items-center bg-gray-200 dark:bg-gray-700 px-4 py-2">
        <span className="text-sm font-bold">{language.toUpperCase()}</span>
        <button
          onClick={onCopy}
          className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded transition-colors ${
            hasCopied
              ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
              : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
          aria-label={hasCopied ? 'Copied' : 'Copy code'}
        >
          {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span>{hasCopied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={syntaxStyle}
          customStyle={{ padding: '1rem', margin: 0 }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
