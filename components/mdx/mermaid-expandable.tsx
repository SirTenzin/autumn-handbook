'use client';

import { use, useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';

export function MermaidExpandable({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative">
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-none' : 'max-h-[600px]'
        }`}
        onClick={() => !isExpanded && setIsExpanded(true)}
        style={{ cursor: !isExpanded ? 'zoom-in' : 'default' }}
      >
        <MermaidContent chart={chart} />
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          Click to expand full diagram
        </button>
      )}
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="mt-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors text-sm"
        >
          Collapse diagram
        </button>
      )}
    </div>
  );
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(
  key: string,
  setPromise: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(
    cachePromise('mermaid', () => import('mermaid')),
  );

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeCSS: 'margin: 1.5rem auto 0;',
    theme: resolvedTheme === 'dark' ? 'dark' : 'default',
  });

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () => {
      return mermaid.render(id, chart.replaceAll('\\n', '\n'));
    }),
  );

  return (
    <div
      ref={(container) => {
        if (container) bindFunctions?.(container);
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
      className="w-full"
    />
  );
}