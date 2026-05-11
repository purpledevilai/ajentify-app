---
date: 2026-05-12
topic: "Implementation plan — Chakra UI → shadcn/ui + Tailwind CSS (landing page only)"
repos_touched: [ajentify-app]
tags: [plan, migration, shadcn, tailwind, landing-page, chakra-ui, next-themes]
status: ready
research_doc: Prompts/research/2026-05-12-landing-page-shadcn-migration.md
---

# Implementation Plan: Chakra UI → shadcn/ui + Tailwind CSS (Landing Page)

## Scope Reminder

**In scope:** `src/app/(public)/` landing page tree + `src/app/components/CodeSnippet.tsx` + `src/theme/theme.ts` (read-only for token extraction). Root `src/app/layout.tsx` gets ThemeProvider + Inter font.

**Out of scope:** `src/app/(authenticated)/`, `src/app/(auth)/`, all stores, API routes, `@chakra-ui/react` package removal (Chakra must keep working for the dashboard).

---

## Pre-flight: All Resolved Decisions

All open questions from the research document are answered here before any code changes begin.

### 1. `gray.950` in Footer.tsx

The Footer uses `useColorModeValue('white', 'gray.950')` as `footerBg`. `gray.950` is not defined in the custom Chakra theme (scale stops at 900), meaning Chakra resolves it to `undefined` / transparent — it is a live bug in the current app.

**Decision:** Define `gray.950 = #030712` in `tailwind.config.ts`. This is the value Tailwind CSS v4 uses for `gray-950` (one step darker than `gray-900: #111827`) and is a widely accepted convention. The dark-mode footer background will be near-black (`#030712`), which is what the design intended.

### 2. `CodeSnippet.tsx` missing `'use client'`

The file uses `useClipboard` and `useColorModeValue` (hooks) without the directive. It works today only because parent components are client components.

**Decision:** Add `'use client'` as the first line of the migrated file. This is also a bug fix.

### 3. `react-syntax-highlighter` replacement

**Decision:** Keep `react-syntax-highlighter` (Prism) as-is. It has zero Chakra dependency. Only its wrapper HTML and theme-switching logic change. The `oneDark`/`oneLight` import paths stay unchanged.

### 4. Color mode initial state

Current Chakra config: no `initialColorMode`, no `useSystemColorMode` — defaults to light, ignores OS.

**Decision:** Use `defaultTheme="system"` with next-themes. This respects OS preference out of the box, which is better UX. The FOUT-prevention script is handled automatically by next-themes when combined with `suppressHydrationWarning` on `<html>`.

### 5. Dark mode toggle in Header

**Decision:** Replace `useColorMode()` with `const { resolvedTheme, setTheme } = useTheme()` from next-themes. Use `resolvedTheme` (not `theme`) so the `"system"` case resolves to the actual effective mode. Toggle: `setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')`. Guard icon render behind a `mounted` state to prevent hydration mismatch.

### 6. `Spacer` in Header

**Decision:** Replace with `<div className="flex-1" />`. This is the Tailwind flex-grow idiom.

### 7. `SimpleGrid` with responsive `columns`

**Decision:**
- `columns={{ base: 1, md: 2, lg: 3 }}` → `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `columns={{ base: 1, md: 2 }}` → `grid grid-cols-1 md:grid-cols-2`
- `spacing={{ base: 4, md: 6 }}` → `gap-4 md:gap-6`

### 8. `Container maxW="6xl"`

**Decision:** `max-w-6xl mx-auto`. Chakra's `6xl` size = 72rem = Tailwind's `max-w-6xl` = 72rem. Exact match, zero conversion needed.

### 9. `useClipboard` replacement

**Decision:** Replace with `React.useState<boolean>` + `navigator.clipboard.writeText` + `setTimeout` reset. Pattern used in both `HeroSection.tsx` and `CodeSnippet.tsx`:

```tsx
const [hasCopied, setHasCopied] = useState(false);
const onCopy = async () => {
  try {
    await navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  } catch {
    // clipboard write failed silently
  }
};
```

### 10. `backdropFilter` on Header

`backdropFilter="saturate(180%) blur(8px)"` → Tailwind: `backdrop-saturate-[180%] backdrop-blur`.

Tailwind's `backdrop-blur` (no suffix) = `backdrop-filter: blur(8px)` — exact match. `backdrop-saturate-[180%]` uses an arbitrary value since Tailwind v3 has no built-in `180%` saturate step.

### 11. `zIndex="sticky"` (Chakra = z-index 1020)

**Decision:** Use `z-40` (z-index: 40). The landing page has no modals, drawers, or overlays that require stacking above the header. `z-40` is the Tailwind convention for sticky navigation.

### 12. `ChakraLink` with `legacyBehavior`

**Decision:** Replace all `<Link legacyBehavior passHref><ChakraLink>` patterns with:
- Internal routes: Next.js `<Link>` directly (App Router Link renders an `<a>` natively)
- External URLs: plain `<a target="_blank" rel="noopener noreferrer">`
- Apply hover styles via Tailwind `hover:` classes directly on the element

### 13. `@chakra-ui/icons` → lucide-react

`lucide-react` is not currently in `package.json` and must be installed. All five icons have direct equivalents:

| Chakra icon | Lucide equivalent | Import |
|-------------|------------------|--------|
| `SunIcon` | `Sun` | `import { Sun } from 'lucide-react'` |
| `MoonIcon` | `Moon` | `import { Moon } from 'lucide-react'` |
| `CopyIcon` | `Copy` | `import { Copy } from 'lucide-react'` |
| `CheckIcon` | `Check` | `import { Check } from 'lucide-react'` |
| `ExternalLinkIcon` | `ExternalLink` | `import { ExternalLink } from 'lucide-react'` |

### 14. `Inter` font loading

The Chakra theme sets `Inter` as the font family, but this is never actually loaded — there is no `next/font` call, no `<link>` tag, and `globals.css` currently sets `font-family: Arial`. The landing page has been rendering with system fonts in practice.

**Decision:** Load Inter via `next/font/google` in `src/app/layout.tsx`. Use the CSS variable approach (`variable: '--font-inter'`). Set `tailwind.config.ts` `fontFamily.sans` to reference this variable. Apply `inter.variable` to `<html>`. The `globals.css` `body { @apply font-sans }` then picks it up.

### 15. Server component opportunity

`SixPrimitivesSection`, `WhyAjentifySection`, and `ForCodingAgentsSection` have no interactivity of their own. After migration they could become server components (removing `'use client'`).

**Decision:** Out of scope for this plan. They will be migrated as client components. A follow-up task should convert them to server components.

### 16. `shadcn` components to install

After analyzing all component files, only the `button` component from shadcn is needed. All layout (flex, grid, padding) is pure Tailwind. No `Card`, `Badge`, `Container`, `Heading`, or other shadcn primitives are required.

### 17. Existing Tailwind setup

`tailwind.config.ts`, `postcss.config.mjs`, and `@tailwind` directives in `globals.css` already exist. **Tailwind v3 is already installed.** Phase 1 extends the existing setup rather than starting from scratch. `autoprefixer` is missing from `postcss.config.mjs` and must be added (required by shadcn).

---

## Complete Token Mapping Reference

### Chakra `useColorModeValue` pairs → Tailwind `dark:` classes

Every `useColorModeValue(light, dark)` call across all files, with the exact Tailwind replacement:

| Semantic role | Chakra light | Chakra dark | Light class | Dark class |
|--------------|-------------|------------|-------------|------------|
| Header bg | `whiteAlpha.800` | `blackAlpha.700` | `bg-white/80` | `dark:bg-black/[0.64]` |
| Header border | `gray.200` | `gray.800` | `border-gray-200` | `dark:border-gray-800` |
| Docs button text | `brand.600` | `brand.300` | `text-brand-600` | `dark:text-brand-300` |
| Docs button hover bg | `brand.50` | `whiteAlpha.100` | `hover:bg-brand-50` | `dark:hover:bg-white/[0.06]` |
| Eyebrow / accent text | `brand.600` | `brand.300` | `text-brand-600` | `dark:text-brand-300` |
| Subheading text | `gray.700` | `gray.300` | `text-gray-700` | `dark:text-gray-300` |
| Secondary button color | `gray.700` | `gray.200` | `text-gray-700` | `dark:text-gray-200` |
| Alternate section bg | `gray.50` | `gray.900` | `bg-gray-50` | `dark:bg-gray-900` |
| Card bg | `white` | `gray.800` | `bg-white` | `dark:bg-gray-800` |
| Card border | `gray.200` | `gray.700` | `border-gray-200` | `dark:border-gray-700` |
| Description text | `gray.600` | `gray.400` | `text-gray-600` | `dark:text-gray-400` |
| URL text | `gray.900` | `white` | `text-gray-900` | `dark:text-white` |
| Footer bg | `white` | `gray.950` | `bg-white` | `dark:bg-gray-950` |
| Footer border | `gray.200` | `gray.800` | `border-gray-200` | `dark:border-gray-800` |
| Footer label text | `gray.500` | `gray.500` | `text-gray-500` | *(same — no dark: variant)* |
| Footer link text | `gray.700` | `gray.300` | `text-gray-700` | `dark:text-gray-300` |
| Footer link hover | `brand.600` | `brand.300` | `hover:text-brand-600` | `dark:hover:text-brand-300` |
| CodeSnippet header bg | `gray.200` | `gray.700` | `bg-gray-200` | `dark:bg-gray-700` |
| CodeSnippet syntax theme | `oneLight` | `oneDark` | `resolvedTheme === 'dark' ? oneDark : oneLight` |

> **Note on `whiteAlpha` / `blackAlpha`:** Chakra's alpha scale: `100`=6%, `200`=8%, `300`=16%, `400`=24%, `500`=36%, `600`=48%, `700`=64%, `800`=80%, `900`=92%. So `whiteAlpha.800` = `rgba(255,255,255,0.80)` → `bg-white/80`; `blackAlpha.700` = `rgba(0,0,0,0.64)` → `bg-black/[0.64]`; `whiteAlpha.100` = `rgba(255,255,255,0.06)` → `bg-white/[0.06]`.

### Chakra spacing → Tailwind (1:1 match — both use 0.25rem per step)

| Chakra N | px | Tailwind suffix |
|---------|-----|----------------|
| `2` | 8px | `-2` |
| `3` | 12px | `-3` |
| `4` | 16px | `-4` |
| `5` | 20px | `-5` |
| `6` | 24px | `-6` |
| `7` | 28px | `-7` |
| `8` | 32px | `-8` |
| `10` | 40px | `-10` |
| `12` | 48px | `-12` |
| `14` | 56px | `-14` |
| `16` | 64px | `-16` |
| `24` | 96px | `-24` |
| `32` | 128px | `-32` |

### Chakra `fontSize` → Tailwind (1:1 match)

| Chakra | rem | Tailwind |
|--------|-----|---------|
| `"xs"` | 0.75rem | `text-xs` |
| `"sm"` | 0.875rem | `text-sm` |
| `"md"` | 1rem | `text-base` |
| `"lg"` | 1.125rem | `text-lg` |
| `"xl"` | 1.25rem | `text-xl` |
| `"2xl"` | 1.5rem | `text-2xl` |
| `"3xl"` | 1.875rem | `text-3xl` |

### Chakra `Heading size` → Tailwind

**Important:** Chakra's `Heading size` prop is NOT a direct pass-through to `fontSize`. The Heading component has its own internal size definitions where each named size maps to a responsive fontSize pair `[base, lg]`. When a responsive `size={{ base: 'A', md: 'B' }}` is used, the base fontSize from each size definition takes effect at the corresponding breakpoint.

| Heading `size` | Base `fontSize` | `lg+` fontSize | Tailwind class |
|---------------|----------------|---------------|---------------|
| `"xs"` | `sm` (0.875rem) | `sm` | `text-sm` |
| `"sm"` | `md` (1rem) | `md` | `text-base` |
| `"md"` | `xl` (1.25rem) | `xl` | `text-xl` |
| `"lg"` | `md` (1rem) | `lg` (1.125rem) | `text-base lg:text-lg` |
| `"xl"` | `xl` (1.25rem) | `2xl` (1.5rem) | `text-xl lg:text-2xl` |
| `"2xl"` | `2xl` (1.5rem) | `3xl` (1.875rem) | `text-2xl lg:text-3xl` |
| `"3xl"` | `4xl` (2.25rem) | `5xl` (3rem) | `text-4xl lg:text-5xl` |
| `"4xl"` | `6xl` (3.75rem) | `7xl` (4.5rem) | `text-6xl lg:text-7xl` |

**Responsive heading size used in these components:**

| Chakra prop | Tailwind result |
|------------|----------------|
| `size={{ base: '2xl', md: '4xl' }}` | `text-2xl md:text-6xl lg:text-7xl` |
| `size={{ base: 'xl', md: '2xl' }}` | `text-xl md:text-2xl lg:text-3xl` |
| `size="md"` | `text-xl` |

### Chakra `maxW` named values → Tailwind (1:1 match)

| Chakra `maxW` | rem | Tailwind |
|--------------|-----|---------|
| `"sm"` | 24rem | `max-w-sm` |
| `"3xl"` | 48rem | `max-w-3xl` |
| `"6xl"` | 72rem | `max-w-6xl` |

### Chakra misc props → Tailwind

| Chakra prop | Tailwind |
|------------|---------|
| `fontWeight="semibold"` | `font-semibold` |
| `fontWeight="bold"` | `font-bold` |
| `fontWeight="extrabold"` | `font-extrabold` |
| `letterSpacing="wider"` | `tracking-wider` |
| `letterSpacing="-0.01em"` | `tracking-[-0.01em]` |
| `letterSpacing="-0.02em"` | `tracking-[-0.02em]` |
| `textTransform="uppercase"` | `uppercase` |
| `lineHeight="1.05"` | `leading-[1.05]` |
| `lineHeight="1.5"` | `leading-[1.5]` |
| `lineHeight="1.6"` | `leading-[1.6]` |
| `lineHeight="1.7"` | `leading-[1.7]` |
| `fontFamily="mono"` | `font-mono` |
| `wordBreak="break-all"` | `break-all` |
| `flexShrink={0}` | `shrink-0` |
| `flex="1"` | `flex-1` |
| `flexWrap="wrap"` | `flex-wrap` |
| `position="relative"` | `relative` |
| `position="sticky"` | `sticky` |
| `overflow="hidden"` | `overflow-hidden` |
| `overflowX="auto"` | `overflow-x-auto` |
| `top="0"` | `top-0` |
| `transition="border-color 150ms ease"` | `transition-colors duration-150` |
| `borderRadius="md"` | `rounded-md` |
| `borderRadius="lg"` | `rounded-lg` |
| `borderRadius="xl"` | `rounded-xl` |
| `align="center"` (Flex) | `items-center` |
| `align="flex-start"` (Stack) | `items-start` |
| `justify="space-between"` | `justify-between` |
| `direction={{ base: 'column', sm: 'row' }}` | `flex-col sm:flex-row` |
| `direction={{ base: 'column', md: 'row' }}` | `flex-col md:flex-row` |
| `align={{ base: 'flex-start', md: 'center' }}` | `items-start md:items-center` |
| `w={{ base: 'full', sm: 'auto' }}` | `w-full sm:w-auto` |
| `display={{ base: 'none', sm: 'inline-flex' }}` | `hidden sm:inline-flex` |
| `border="1px solid"` | `border` (Tailwind border = 1px solid) |
| `minW="32"` | `min-w-32` |

### Chakra `Stack` → Tailwind

Chakra `Stack` = vertical flex (`flex flex-col`) with a gap. Chakra `HStack` = horizontal flex with gap.

| Chakra | Tailwind |
|--------|---------|
| `<Stack spacing={3}>` | `<div className="flex flex-col gap-3">` |
| `<Stack spacing={{ base: 3, md: 4 }}>` | `<div className="flex flex-col gap-3 md:gap-4">` |
| `<Stack spacing={{ base: 8, md: 10 }} align="flex-start">` | `<div className="flex flex-col items-start gap-8 md:gap-10">` |
| `<HStack spacing="2" mb="2">` | `<div className="flex items-center gap-2 mb-2">` |
| `<HStack justify="space-between" mt={10} pt="6" borderTop="1px solid" borderColor={x} flexWrap="wrap">` | `<div className="flex items-center justify-between mt-10 md:mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex-wrap">` |

### shadcn `Button` variant mapping

| Chakra `Button` props | shadcn equivalent |
|--------------------|------------------|
| `variant="solid"` | `variant="default"` |
| `variant="ghost"` | `variant="ghost"` |
| `variant="outline"` | `variant="outline"` |
| `size="lg"` | `size="lg"` |
| `size="sm"` | `size="sm"` |
| `<IconButton size="sm">` | `<Button size="icon" className="h-8 w-8">` |
| `leftIcon={<Icon />}` | Icon placed as inline child before text: `<Icon className="mr-2 h-4 w-4" />text` |
| `rightIcon={<Icon />}` | Icon placed as inline child after text: `text<Icon className="ml-2 h-4 w-4" />` |
| `as="a" href={x}` | `asChild` + `<a href={x}>` as child |

---

## Phase 1: Install & Configure

**Goal:** Install all new dependencies, configure Tailwind with custom tokens, set up shadcn/ui infrastructure, add ThemeProvider + Inter font to root layout. **Zero UI changes** — the landing page must look identical (still Chakra-powered) before and after this phase.

---

### Step 1.1 — Install new npm packages

```bash
cd /Users/keanuinterone/Projects/Ajentify/ajentify-app
npm install next-themes lucide-react
npm install -D autoprefixer tailwindcss-animate
```

**Package rationale:**
- `next-themes` — dark mode provider (replaces Chakra's color mode system)
- `lucide-react` — icon library (replaces `@chakra-ui/icons` in migrated components)
- `autoprefixer` — required by shadcn's PostCSS pipeline; currently absent from `postcss.config.mjs`
- `tailwindcss-animate` — required by shadcn's Button `cva` definitions (hover/focus animations)

---

### Step 1.2 — Run shadcn init

```bash
npx shadcn@latest init
```

When prompted, answer:
| Prompt | Answer |
|--------|--------|
| Which style would you like to use? | **Default** |
| Which color would you like to use as base color? | **Slate** |
| Would you like to use CSS variables for colors? | **Yes** |

This command will:
1. Create `components.json` at the project root
2. Update `tailwind.config.ts` (adds `darkMode: ["class"]`, CSS variable color entries, `tailwindcss-animate` plugin)
3. Update `src/app/globals.css` (adds CSS variable definitions in `@layer base`)
4. Create `src/lib/utils.ts` (exports the `cn` utility via `clsx` + `tailwind-merge`)
5. Install peer dependencies: `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`

---

### Step 1.3 — Install shadcn Button component

```bash
npx shadcn@latest add button
```

Creates `src/components/ui/button.tsx`.

---

### Step 1.4 — Update `postcss.config.mjs`

**File:** `postcss.config.mjs`

**Before:**
```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};
export default config;
```

**After:**
```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
```

---

### Step 1.5 — Rewrite `tailwind.config.ts`

Replace the entire file. This merges shadcn's generated config with our custom brand + gray tokens and `gray.950` fix.

**File:** `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand (purple family — primary) ──────────────────────────
        brand: {
          50:  "#f3e9fd",
          100: "#e1c8fb",
          200: "#d1a9f9",
          300: "#c18af7",
          400: "#a95cf3",
          500: "#7a15e6",
          600: "#6712c1",
          700: "#550e9e",
          800: "#430a7a",
          900: "#320758",
        },
        // ── Gray (matches Tailwind defaults exactly + adds 950) ───────
        // gray.950 (#030712) fixes the undefined gray.950 bug in Footer.tsx
        gray: {
          50:  "#f9fafb",
          100: "#f2f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
        // ── shadcn CSS variable color system ─────────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
      },
      fontFamily: {
        // References the CSS variable injected by next/font/google in layout.tsx
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

### Step 1.6 — Rewrite `src/app/globals.css`

Replace the entire file. Merges the existing `@tailwind` directives with shadcn's CSS variables, overriding `--primary` to brand-500.

**File:** `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;
    /* Brand-500 (#7a15e6) in HSL — overrides shadcn default blue primary */
    --primary: 269 83% 49%;
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 269 83% 49%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    /* Brand-500 is identical in dark mode (per Chakra theme analysis) */
    --primary: 269 83% 49%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 269 83% 49%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans;
  }
}
```

**Key delta from shadcn default:** `--primary` is `269 83% 49%` (brand-500 in HSL) and `--primary-foreground` is `0 0% 100%` (white). This ensures shadcn `Button variant="default"` renders with the brand purple.

---

### Step 1.7 — Edit `src/components/ui/button.tsx` (generated file)

After shadcn generates the file, make exactly two changes:

**Change A** — Replace `font-medium` with `font-bold` in the base `cva` string (matches Chakra's `Button.baseStyle.fontWeight: 'bold'`):

Find:
```
"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background
```
Replace with:
```
"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background
```

**Change B** — Replace `hover:bg-primary/90` with `hover:bg-brand-400` in the `default` variant (matches Chakra's `_hover.bg: brand.400`):

Find:
```ts
default: "bg-primary text-primary-foreground hover:bg-primary/90",
```
Replace with:
```ts
default: "bg-primary text-primary-foreground hover:bg-brand-400",
```

> **Rationale:** `hover:bg-primary/90` = 90% opacity of brand-500 = `rgba(122,21,230,0.9)` which looks visually different from brand-400 `#a95cf3`. The Chakra theme explicitly uses `brand.400` for button hover, so we replicate that exactly.

---

### Step 1.8 — Create `src/components/theme-provider.tsx`

**New file** — thin wrapper required because `next-themes ThemeProvider` is a client component but `src/app/layout.tsx` is a server component.

```tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

---

### Step 1.9 — Update `src/app/layout.tsx`

**File:** `src/app/layout.tsx`

**Before:**
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ajentify',
  description: 'Ajentify — AI agent management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**After:**
```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Ajentify',
  description: 'Ajentify — AI agent management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Change notes:**
- `inter.variable` on `<html>` injects the CSS variable `--font-inter` which `tailwind.config.ts` references in `fontFamily.sans`.
- `suppressHydrationWarning` on `<html>` is required by next-themes to suppress the React hydration warning that occurs when next-themes injects the `dark` class server-side.
- `ThemeProvider` wraps all children (public + authenticated). This is safe — next-themes only manages a CSS class and does not conflict with Chakra's internal context.
- `disableTransitionOnChange` prevents CSS `transition` rules from animating during theme switching.
- `defaultTheme="system"` uses the OS preference as initial mode.

---

### Phase 1 Verification

**Automated (run from project root):**
```bash
npm run typecheck    # Zero errors
npm run lint         # Zero errors/warnings
npm run build        # Builds successfully
```

**Manual:**
1. `npm run dev` → navigate to the landing page
2. Landing page renders visually **identical** to before this phase (still Chakra-powered)
3. Dark mode toggle in the Header (Chakra's) still works
4. Navigate to the authenticated dashboard — fully functional, no regressions
5. DevTools Console → zero errors
6. DevTools → `<html>` element has class `dark` in OS dark mode, none in light mode
7. DevTools → `<html>` element has class `__variable-*` from Inter font variable

> **⏸ PAUSE: Human must confirm Phase 1 is stable before proceeding to Phase 2.**

---

## Phase 2: Public Layout Migration

**Goal:** Remove `ChakraProvider` from the public route group entirely. After this phase, the landing page will be **temporarily unstyled** (Chakra components render without their styles). This is expected and intentional. Phases 3 and 4 restore the visual.

> **Tip:** If you want to avoid the broken intermediate state, run Phases 2, 3, and 4 back-to-back in a single session without stopping the dev server or reviewing between phases.

---

### Step 2.1 — Simplify `src/app/(public)/layout.tsx`

**Before:**
```tsx
import { PublicProviders } from './providers';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicProviders>{children}</PublicProviders>;
}
```

**After:**
```tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

---

### Step 2.2 — Delete `src/app/(public)/providers.tsx`

This file's sole purpose was to wrap `ChakraProvider` for the public route group. It is no longer needed.

```bash
rm src/app/(public)/providers.tsx
```

---

### Phase 2 Verification

**Automated:**
```bash
npm run typecheck    # Must pass (no remaining imports of the deleted file)
```

**Manual:**
1. `npm run dev` → landing page renders — it will look unstyled/broken (expected)
2. No "ChakraProvider not found" or missing context errors in the console
3. Navigate to `/signin` and `/signup` (auth pages) — still render correctly
4. Navigate to the authenticated dashboard — still fully functional, Chakra works there

> **⏸ PAUSE: Human must confirm Phase 2 is stable before proceeding to Phase 3.**

---

## Phase 3: Shared Utilities Migration

**Goal:** Migrate `src/app/components/CodeSnippet.tsx` from Chakra UI to plain HTML + Tailwind. This component is used by `HeroSection` and `ForCodingAgentsSection`, so it must be migrated before those components.

---

### Step 3.1 — Migrate `src/app/components/CodeSnippet.tsx`

**Before:**
```tsx
import { Box, Button, Flex, Text, useClipboard, useColorModeValue } from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeSnippetProps {
  code: string;
  language?: string;
}

export const CodeSnippet = ({ code, language = "javascript" }: CodeSnippetProps) => {
  const { hasCopied, onCopy } = useClipboard(code);
  const syntaxStyle = useColorModeValue(oneLight, oneDark);

  return (
    <Box border="1px solid" borderColor="gray.300" borderRadius="md" overflow="hidden">
      <Flex justify="space-between" align="center" bg={useColorModeValue('gray.200', 'gray.700')} px={4} py={2}>
        <Text fontSize="sm" fontWeight="bold">{language.toUpperCase()}</Text>
        <Button
          size="sm"
          onClick={onCopy}
          leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
          colorScheme={hasCopied ? 'green' : 'blue'}
          variant="ghost"
        >
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </Flex>
      <Box overflowX="auto">
        <SyntaxHighlighter language={language} style={syntaxStyle} customStyle={{ padding: '1rem' }}>
          {code}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
};
```

**After:**
```tsx
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
```

**Chakra → Tailwind mapping for this file:**

| Chakra | Tailwind |
|--------|---------|
| `<Box border="1px solid" borderColor="gray.300" borderRadius="md" overflow="hidden">` | `<div className="border border-gray-300 rounded-md overflow-hidden">` |
| `<Flex justify="space-between" align="center" bg={useColorModeValue('gray.200', 'gray.700')} px={4} py={2}>` | `<div className="flex justify-between items-center bg-gray-200 dark:bg-gray-700 px-4 py-2">` |
| `<Text fontSize="sm" fontWeight="bold">` | `<span className="text-sm font-bold">` |
| `<Button size="sm" variant="ghost" colorScheme="green/blue">` | native `<button>` with conditional color classes |
| `leftIcon={<CopyIcon />}` | `<Copy className="h-3 w-3" />` inline before text |
| `<Box overflowX="auto">` | `<div className="overflow-x-auto">` |
| `useClipboard(code)` | `useState(false)` + `navigator.clipboard.writeText` + `setTimeout` |
| `useColorModeValue(oneLight, oneDark)` | `resolvedTheme === 'dark' ? oneDark : oneLight` |

**Bug fix included:** `'use client'` directive added (was missing). `margin: 0` added to `customStyle` to remove default margin from SyntaxHighlighter container.

---

### Phase 3 Verification

**Automated:**
```bash
npm run typecheck    # Must pass
npm run lint         # Must pass
```

**Manual:**
1. The CodeSnippet is used by HeroSection and ForCodingAgentsSection — both are still unmigrated (Chakra), so visual testing is deferred to Phase 4 step 4.3 and 4.5.
2. Confirm no TypeScript errors in `CodeSnippet.tsx` itself.

> **No separate human pause here — proceed directly to Phase 4.**

---

## Phase 4: Landing Component Migration

**Goal:** Replace every Chakra UI import in every landing page component. Migrate one file at a time in render order. After the last file in this phase, the landing page is fully functional with Tailwind + dark mode via next-themes.

---

### Step 4.1 — Migrate `src/app/(public)/landing/page.tsx`

**Before:**
```tsx
import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SixPrimitivesSection from './components/SixPrimitivesSection';
import ForCodingAgentsSection from './components/ForCodingAgentsSection';
import WhyAjentifySection from './components/WhyAjentifySection';
import Footer from './components/Footer';

export default function LandingPage() {
    return (
        <Box>
            <Header />
            <HeroSection />
            <SixPrimitivesSection />
            <ForCodingAgentsSection />
            <WhyAjentifySection />
            <Footer />
        </Box>
    );
}
```

**After:**
```tsx
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SixPrimitivesSection from './components/SixPrimitivesSection';
import ForCodingAgentsSection from './components/ForCodingAgentsSection';
import WhyAjentifySection from './components/WhyAjentifySection';
import Footer from './components/Footer';

export default function LandingPage() {
    return (
        <div>
            <Header />
            <HeroSection />
            <SixPrimitivesSection />
            <ForCodingAgentsSection />
            <WhyAjentifySection />
            <Footer />
        </div>
    );
}
```

**Change:** `<Box>` (no styling props) → `<div>`. Remove `@chakra-ui/react` import. File stays as a server component — no `'use client'` needed.

---

### Step 4.2 — Migrate `src/app/(public)/landing/components/Header.tsx`

**Before:**
```tsx
'use client';

import {
    Box,
    Button,
    Container,
    Flex,
    IconButton,
    Spacer,
    useColorMode,
    useColorModeValue,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import Link from 'next/link';

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode();
    const bg = useColorModeValue('whiteAlpha.800', 'blackAlpha.700');
    const borderColor = useColorModeValue('gray.200', 'gray.800');
    const docsColor = useColorModeValue('brand.600', 'brand.300');
    const docsHoverBg = useColorModeValue('brand.50', 'whiteAlpha.100');

    return (
        <Box
            as="header"
            position="sticky"
            top="0"
            zIndex="sticky"
            bg={bg}
            backdropFilter="saturate(180%) blur(8px)"
            borderBottom="1px solid"
            borderColor={borderColor}
            px={{ base: 4, md: 6 }}
            py="3"
        >
            <Container maxW="6xl" px="0">
                <Flex align="center">
                    <Box fontSize="lg" fontWeight="extrabold" letterSpacing="-0.01em">
                        Ajentify
                    </Box>
                    <Spacer />
                    <Flex align="center" gap={{ base: 2, md: 3 }}>
                        <Button
                            as="a"
                            href="https://api.ajentify.com/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="ghost"
                            color={docsColor}
                            fontWeight="semibold"
                            _hover={{ bg: docsHoverBg }}
                        >
                            Docs
                        </Button>
                        <IconButton
                            aria-label="Toggle color mode"
                            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            onClick={toggleColorMode}
                            variant="ghost"
                            size="sm"
                        />
                        <Link href="/signin" passHref>
                            <Button variant="ghost" display={{ base: 'none', sm: 'inline-flex' }}>
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup" passHref>
                            <Button variant="solid">Sign up</Button>
                        </Link>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
}
```

**After:**
```tsx
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
```

**Chakra → Tailwind mapping:**

| Chakra | Tailwind |
|--------|---------|
| `<Box as="header" position="sticky" top="0" zIndex="sticky"` | `<header className="sticky top-0 z-40"` |
| `bg={whiteAlpha.800 / blackAlpha.700}` | `bg-white/80 dark:bg-black/[0.64]` |
| `backdropFilter="saturate(180%) blur(8px)"` | `backdrop-saturate-[180%] backdrop-blur` |
| `borderBottom="1px solid" borderColor={gray.200 / gray.800}` | `border-b border-gray-200 dark:border-gray-800` |
| `px={{ base: 4, md: 6 }} py="3"` | `px-4 md:px-6 py-3` |
| `<Container maxW="6xl" px="0">` | `<div className="max-w-6xl mx-auto">` |
| `<Flex align="center">` | `<div className="flex items-center">` |
| `<Box fontSize="lg" fontWeight="extrabold" letterSpacing="-0.01em">` | `<div className="text-lg font-extrabold tracking-[-0.01em]">` |
| `<Spacer />` | `<div className="flex-1" />` |
| `<Flex align="center" gap={{ base: 2, md: 3 }}>` | `<div className="flex items-center gap-2 md:gap-3">` |
| `<Button as="a" variant="ghost" color={brand.600/brand.300} _hover={{bg: brand.50/whiteAlpha.100}}>` | `<Button asChild variant="ghost" className="text-brand-600 dark:text-brand-300 ... hover:bg-brand-50 dark:hover:bg-white/[0.06]">` |
| `<IconButton variant="ghost" size="sm" onClick={toggleColorMode}>` | `<Button variant="ghost" size="icon" className="h-8 w-8" onClick={...}>` |
| `colorMode === 'light' ? <MoonIcon /> : <SunIcon />` | `resolvedTheme === 'dark' ? <Sun /> : <Moon />` (guarded by `mounted`) |
| `useColorMode().toggleColorMode` | `setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')` |
| `<Button variant="ghost" display={{ base: 'none', sm: 'inline-flex' }}>` | `<Button asChild variant="ghost" className="hidden sm:inline-flex">` |
| `<Button variant="solid">` | `<Button asChild variant="default">` |
| `passHref` on Link | Removed — not needed with shadcn `asChild` pattern |

**Note on `asChild`:** The shadcn `Button` component supports `asChild` via Radix UI's `Slot`. When `asChild` is set, the Button renders as its child element (here a Next.js `<Link>` which renders as `<a>`), merging all className props. This avoids nesting a `<button>` inside an `<a>` (invalid HTML).

**Note on `mounted` guard:** next-themes' `resolvedTheme` is `undefined` on the initial server render. Rendering `Moon` as the default (before mount) prevents layout shift and hydration mismatch.

---

### Step 4.3 — Migrate `src/app/(public)/landing/components/HeroSection.tsx`

**Before:**
```tsx
'use client';

import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Stack,
    Text,
    useClipboard,
    useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { CodeSnippet } from '@/app/components/CodeSnippet';

const CODING_AGENT_PROMPT = `...`;
const CURL_EXAMPLE = `...`;

export default function HeroSection() {
    const { hasCopied, onCopy } = useClipboard(CODING_AGENT_PROMPT);
    const subheadColor = useColorModeValue('gray.700', 'gray.300');
    const eyebrowColor = useColorModeValue('brand.600', 'brand.300');
    const secondaryBtnColor = useColorModeValue('gray.700', 'gray.200');
    // ... (full component below)
```

**After:**
```tsx
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
```

**Chakra → Tailwind mapping:**

| Chakra | Tailwind |
|--------|---------|
| `<Box as="section" position="relative" overflow="hidden" py={{ base: 16, md: 24 }} px="6">` | `<section className="relative overflow-hidden py-16 md:py-24 px-6">` |
| `<Container maxW="6xl">` | `<div className="max-w-6xl mx-auto">` |
| `<Stack spacing={{ base: 8, md: 10 }} align="flex-start">` | `<div className="flex flex-col items-start gap-8 md:gap-10">` |
| `<Text fontSize="sm" fontWeight="semibold" letterSpacing="wider" textTransform="uppercase" color={eyebrowColor}>` | `<p className="text-sm font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-300">` |
| `<Heading as="h1" size={{ base: '2xl', md: '4xl' }} fontWeight="extrabold" letterSpacing="-0.02em" lineHeight="1.05">` | `<h1 className="text-2xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.02em] leading-[1.05]">` |
| `<Text fontSize={{ base: 'lg', md: 'xl' }} color={subheadColor} maxW="3xl" lineHeight="1.5">` | `<p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl leading-[1.5]">` |
| `<Flex direction={{ base: 'column', sm: 'row' }} gap="3" w={{ base: 'full', sm: 'auto' }}>` | `<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">` |
| `<Button size="lg" variant="solid" onClick={onCopy} leftIcon={...} px="7">` | `<Button size="lg" variant="default" onClick={onCopy} className="px-7">` + inline icon child |
| `<Button size="lg" variant="ghost" color={secondaryBtnColor} px="6">` | `<Button asChild size="lg" variant="ghost" className="text-gray-700 dark:text-gray-200 px-6">` |
| `<Box w="full" pt={{ base: 2, md: 4 }}>` | `<div className="w-full pt-2 md:pt-4">` |
| `<HStack mb="2" spacing="2" color={subheadColor}>` | `<div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">` |
| `<Text fontSize="sm">` | `<span className="text-sm">` |
| `useClipboard(CODING_AGENT_PROMPT)` | `useState(false)` + `navigator.clipboard.writeText` + `setTimeout` |
| `<CopyIcon />` / `<CheckIcon />` | `<Copy className="mr-2 h-4 w-4" />` / `<Check className="mr-2 h-4 w-4" />` |

**Note on heading size:** `Heading size={{ base: '2xl', md: '4xl' }}` — at base, Chakra Heading `2xl` renders at 1.5rem (text-2xl); at md, Heading `4xl` renders at 3.75rem (text-6xl); at lg, Heading `4xl` internal responsive steps to 4.5rem (text-7xl). Classes: `text-2xl md:text-6xl lg:text-7xl`.

---

### Step 4.4 — Migrate `src/app/(public)/landing/components/SixPrimitivesSection.tsx`

**Before:**
```tsx
'use client';

import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';

const PRIMITIVES = [...]; // unchanged — module-level constant, keep as-is

export default function SixPrimitivesSection() {
    const sectionBg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const cardBorder = useColorModeValue('gray.200', 'gray.700');
    const descColor = useColorModeValue('gray.600', 'gray.400');
    const accentColor = useColorModeValue('brand.600', 'brand.300');
    // ... JSX
```

**After:**
```tsx
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
```

**Chakra → Tailwind mapping:**

| Chakra | Tailwind |
|--------|---------|
| `<Box as="section" bg={sectionBg} py={{ base: 16, md: 24 }} px="6">` | `<section className="bg-gray-50 dark:bg-gray-900 py-16 md:py-24 px-6">` |
| `<Container maxW="6xl">` | `<div className="max-w-6xl mx-auto">` |
| `<Stack spacing={{ base: 3, md: 4 }} mb={{ base: 10, md: 14 }} maxW="3xl">` | `<div className="flex flex-col gap-3 md:gap-4 mb-10 md:mb-14 max-w-3xl">` |
| `<Heading as="h2" size={{ base: 'xl', md: '2xl' }} fontWeight="extrabold" letterSpacing="-0.02em">` | `<h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-[-0.02em]">` |
| `<Text fontSize={{ base: 'md', md: 'lg' }} color={descColor}>` | `<p className="text-base md:text-lg text-gray-600 dark:text-gray-400">` |
| `<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>` | `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">` |
| `<Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="lg" p={{ base: 5, md: 6 }} position="relative" transition="border-color 150ms ease" _hover={{ borderColor: accentColor }}>` | `<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 md:p-6 relative transition-colors duration-150 hover:border-brand-600 dark:hover:border-brand-300">` |
| `<Text fontSize="xs" fontWeight="semibold" color={accentColor} mb="3" fontFamily="mono">` | `<p className="text-xs font-semibold text-brand-600 dark:text-brand-300 mb-3 font-mono">` |
| `<Heading as="h3" size="md" fontWeight="bold" mb="2" letterSpacing="-0.01em">` | `<h3 className="text-xl font-bold mb-2 tracking-[-0.01em]">` |
| `<Text color={descColor} fontSize="sm" lineHeight="1.6">` | `<p className="text-gray-600 dark:text-gray-400 text-sm leading-[1.6]">` |
| `useColorModeValue(...)` calls | Replaced entirely with `dark:` class variants |

**Note:** `'use client'` is kept because this is a client component in the current codebase. Removing it (making it a server component) is a post-migration optimization — out of scope here.

---

### Step 4.5 — Migrate `src/app/(public)/landing/components/ForCodingAgentsSection.tsx`

**Before:**
```tsx
'use client';

import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { CodeSnippet } from '@/app/components/CodeSnippet';
// ...
```

**After:**
```tsx
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
```

**Chakra → Tailwind mapping:**

| Chakra | Tailwind |
|--------|---------|
| `<Box as="section" py={{ base: 16, md: 24 }} px="6">` | `<section className="py-16 md:py-24 px-6">` |
| `<Container maxW="6xl">` | `<div className="max-w-6xl mx-auto">` |
| `<Stack spacing={{ base: 3, md: 4 }} mb={{ base: 10, md: 14 }} maxW="3xl">` | `<div className="flex flex-col gap-3 md:gap-4 mb-10 md:mb-14 max-w-3xl">` |
| `<Text fontSize="sm" fontWeight="semibold" letterSpacing="wider" textTransform="uppercase" color={eyebrowColor}>` | `<p className="text-sm font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-300">` |
| `<Heading as="h2" size={{ base: 'xl', md: '2xl' }} fontWeight="extrabold" letterSpacing="-0.02em">` | `<h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-[-0.02em]">` |
| `<Text fontSize={{ base: 'md', md: 'lg' }} color={descColor}>` | `<p className="text-base md:text-lg text-gray-600 dark:text-gray-400">` |
| `<Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={{ base: 6, md: 8 }} mb={{ base: 8, md: 10 }}>` | `<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 md:p-8 mb-8 md:mb-10">` |
| `<Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap={{ base: 5, md: 6 }}>` | `<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-6">` |
| `<Stack spacing="1" flex="1">` | `<div className="flex flex-col gap-1 flex-1">` |
| `<Text fontSize="xs" fontWeight="semibold" color={accentColor} textTransform="uppercase" letterSpacing="wider">` | `<p className="text-xs font-semibold text-brand-600 dark:text-brand-300 uppercase tracking-wider">` |
| `<Text fontFamily="mono" fontSize={{ base: 'md', md: 'xl' }} fontWeight="bold" color={urlColor} wordBreak="break-all">` | `<p className="font-mono text-base md:text-xl font-bold text-gray-900 dark:text-white break-all">` |
| `<Text color={descColor} fontSize="sm" lineHeight="1.6" pt="1">` | `<p className="text-gray-600 dark:text-gray-400 text-sm leading-[1.6] pt-1">` |
| `<Button as="a" size="lg" variant="solid" rightIcon={<ExternalLinkIcon />} flexShrink={0}>` | `<Button asChild size="lg" variant="default" className="shrink-0">` + `<a>` child with `<ExternalLink>` inline |
| `<Stack spacing="3" maxW="3xl">` | `<div className="flex flex-col gap-3 max-w-3xl">` |
| `<Text fontSize="sm" fontWeight="semibold" color={descColor}>` | `<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">` |
| `<ExternalLinkIcon />` | `<ExternalLink className="ml-2 h-4 w-4" />` (lucide-react) |
| All `useColorModeValue(...)` | Replaced with `dark:` class variants |

---

### Step 4.6 — Migrate `src/app/(public)/landing/components/WhyAjentifySection.tsx`

**Before:**
```tsx
'use client';

import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';

const COMPARISONS = [...]; // unchanged
// ...
```

**After:**
```tsx
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
```

**Chakra → Tailwind mapping:**

| Chakra | Tailwind |
|--------|---------|
| `<Box as="section" bg={sectionBg} py={{ base: 16, md: 24 }} px="6">` | `<section className="bg-gray-50 dark:bg-gray-900 py-16 md:py-24 px-6">` |
| `<Container maxW="6xl">` | `<div className="max-w-6xl mx-auto">` |
| `<Stack spacing={{ base: 3, md: 4 }} mb={{ base: 10, md: 14 }} maxW="3xl">` | `<div className="flex flex-col gap-3 md:gap-4 mb-10 md:mb-14 max-w-3xl">` |
| `<Heading as="h2" size={{ base: 'xl', md: '2xl' }} fontWeight="extrabold" letterSpacing="-0.02em">` | `<h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-[-0.02em]">` |
| `<Text fontSize={{ base: 'md', md: 'lg' }} color={descColor}>` | `<p className="text-base md:text-lg text-gray-600 dark:text-gray-400">` |
| `<SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>` | `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">` |
| `<Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="lg" p={{ base: 6, md: 7 }}>` | `<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-7">` |
| `<Text fontSize="xs" fontWeight="semibold" color={accentColor} textTransform="uppercase" letterSpacing="wider" mb="2">` | `<p className="text-xs font-semibold text-brand-600 dark:text-brand-300 uppercase tracking-wider mb-2">` |
| `<Text color={descColor} fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.7">` | `<p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-[1.7]">` |

---

### Step 4.7 — Migrate `src/app/(public)/landing/components/Footer.tsx`

**Before:**
```tsx
'use client';

import {
    Box,
    Container,
    Flex,
    HStack,
    Link as ChakraLink,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
// ... (uses legacyBehavior pattern)
```

**After:**
```tsx
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
```

**Chakra → Tailwind mapping:**

| Chakra | Tailwind |
|--------|---------|
| `<Box as="footer" bg={footerBg} borderTop="1px solid" borderColor={borderColor} py={{ base: 10, md: 12 }} px="6">` | `<footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-10 md:py-12 px-6">` |
| `<Container maxW="6xl">` | `<div className="max-w-6xl mx-auto">` |
| `<Flex direction={{ base: 'column', md: 'row' }} justify="space-between" gap={{ base: 10, md: 8 }}>` | `<div className="flex flex-col md:flex-row justify-between gap-10 md:gap-8">` |
| `<Stack spacing="3" maxW="sm">` | `<div className="flex flex-col gap-3 max-w-sm">` |
| `<Text fontSize="lg" fontWeight="extrabold" letterSpacing="-0.01em">` | `<p className="text-lg font-extrabold tracking-[-0.01em]">` |
| `<Text fontSize="sm" color={labelColor} lineHeight="1.6">` | `<p className="text-sm text-gray-500 leading-[1.6]">` |
| `<Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 8, md: 16 }}>` | `<div className="flex flex-col sm:flex-row gap-8 md:gap-16">` |
| `<Stack spacing="3" minW="32">` | `<div className="flex flex-col gap-3 min-w-32">` |
| `<Text fontSize="xs" fontWeight="semibold" color={labelColor} textTransform="uppercase" letterSpacing="wider">` | `<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">` |
| `<ChakraLink color={linkColor} fontSize="sm" _hover={{ color: linkHoverColor, textDecoration: 'none' }}>` | `<a className="text-sm text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-300 no-underline transition-colors">` |
| `<Link legacyBehavior passHref><ChakraLink>` | `<Link href={x} className={...}>` (App Router Link renders as `<a>` natively) |
| `isExternal` prop | `target="_blank" rel="noopener noreferrer"` on plain `<a>` |
| `<HStack justify="space-between" mt={{ base: 10, md: 12 }} pt="6" borderTop="1px solid" borderColor={borderColor} flexWrap="wrap">` | `<div className="flex items-center justify-between mt-10 md:mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex-wrap">` |
| `<Text fontSize="xs" color={labelColor}>` | `<p className="text-xs text-gray-500">` |
| `gray.950` footer bg (was undefined/bug) | `dark:bg-gray-950` = `#030712` (explicitly defined in Tailwind config) |

---

### Phase 4 Verification

**After each individual component migration:**
```bash
npm run typecheck    # Run after each file — must stay clean
```

**After all components are migrated:**
```bash
npm run typecheck    # Must pass with zero errors
npm run lint         # Must pass
npm run build        # Production build must succeed
```

**Manual (visual QA checklist):**
1. Navigate to the landing page in a browser
2. **Light mode checks:**
   - Header: white/translucent bg, purple brand text for Docs button, "Ajentify" brand text
   - Hero: large heading, purple primary CTA button, secondary ghost button
   - SixPrimitives section: light gray `#f9fafb` background, white cards
   - ForCodingAgents section: white card with URL, View docs button
   - WhyAjentify section: light gray background, white cards
   - Footer: white background, gray link columns
3. **Dark mode checks (click sun/moon toggle in Header):**
   - Header: dark translucent bg, purple brand text preserved
   - Hero: `gray.300` subheading text
   - SixPrimitives: `gray.900` section bg, `gray.800` card bg
   - ForCodingAgents: `gray.800` card bg
   - WhyAjentify: `gray.900` section bg, `gray.800` card bg
   - Footer: `gray.950` (#030712) background — near-black (bug fix)
4. **CodeSnippet checks:**
   - `oneDark` syntax theme in dark mode, `oneLight` in light mode
   - Copy button copies text to clipboard
   - Copy icon changes to Check icon for 2 seconds after click
5. **Interactive checks:**
   - Dark mode toggle works without page reload
   - Dark mode preference persists after page refresh (localStorage)
   - OS dark mode preference respected on fresh load (system theme)
   - "Give this to your coding agent" button in Hero copies to clipboard
   - All buttons navigate to correct routes
   - External links (Docs, YouTube) open in new tab
6. **Responsive checks:** Resize to mobile (< 640px) and tablet (640–768px) — layout stacks properly
7. **Authenticated dashboard still works** — navigate to any dashboard route, confirm Chakra styles intact

> **⏸ PAUSE: Human must confirm Phase 4 is visually identical to the original before proceeding to Phase 5.**

---

## Phase 5: Cleanup & Verification

**Goal:** Final validation that both the migrated landing page and the untouched Chakra sections are fully healthy. No code changes in this phase — verification only, plus one optional cleanup item.

---

### Step 5.1 — Verify Chakra sections are unaffected

```bash
npm run dev
```

Navigate to and interact with each of the following, confirming zero regressions:

| Route | Expected state |
|-------|---------------|
| `/signin` | Renders with Chakra UI styles |
| `/signup` | Renders with Chakra UI styles |
| `/agents` (any dashboard route) | Chakra UI layout, sidebar, header all functional |
| Any authenticated page with modals/drawers | Chakra modal/drawer z-index stacks correctly above the `z-40` landing header |

The authenticated dashboard (`src/app/(authenticated)/providers.tsx`) still wraps `ChakraProvider theme={theme}` — this is untouched and must remain working.

---

### Step 5.2 — Run full automated verification suite

```bash
cd /Users/keanuinterone/Projects/Ajentify/ajentify-app

# TypeScript type check
npm run typecheck

# Lint
npm run lint

# Production build
npm run build

# Unit tests (if any exist that test landing components)
npm run test
```

All must pass with zero errors. Fix any type errors before considering the migration complete.

---

### Step 5.3 — Bundle size check (optional but recommended)

```bash
ANALYZE=true npm run build
```

This opens the bundle analyzer. Verify:
- `@chakra-ui/react` and `@emotion/react` are **not** included in the public landing page bundle
- `lucide-react` is included in the landing page bundle (expected)
- `next-themes` is in the root bundle (expected — it wraps all children)
- `react-syntax-highlighter` is in the landing page bundle (expected — unchanged)

---

### Step 5.4 — Optional cleanup items (post-migration, not blocking)

These are improvements identified during migration that are safe to defer:

1. **Remove `'use client'` from `SixPrimitivesSection.tsx`:** The component has no hooks or interactivity after migration. Removing `'use client'` makes it a server component, improving SSR performance.

2. **Remove `'use client'` from `WhyAjentifySection.tsx`:** Same — purely presentational after migration.

3. **Remove `'use client'` from `ForCodingAgentsSection.tsx`:** Same — the only interaction is inside `<CodeSnippet>` which is its own client component boundary.

4. **`src/theme/theme.ts`:** After the landing page migration, this file is still imported by `src/app/(authenticated)/providers.tsx`. It is not safe to delete. Leave it in place.

5. **`@chakra-ui/icons` package:** This package is now only used by the authenticated dashboard (if at all — it was only used in landing components, all of which have been migrated). Run a codebase search to confirm before removing:
   ```bash
   rg "@chakra-ui/icons" src/
   ```
   If no results, it is safe to `npm uninstall @chakra-ui/icons`.

---

### Phase 5 Verification

```bash
npm run typecheck    # Must pass
npm run lint         # Must pass
npm run build        # Must pass
```

**Final manual check:**
1. Landing page in light mode — visually identical to pre-migration screenshots
2. Landing page in dark mode — visually identical to pre-migration screenshots (with `gray.950` bug now fixed: dark footer is `#030712` instead of transparent)
3. Authenticated dashboard — fully functional
4. Auth pages — fully functional

> **⏸ PAUSE: Migration complete. Human confirms and closes the plan.**

---

## Appendix A: Files Changed Summary

| File | Action | Phase |
|------|--------|-------|
| `package.json` | Add `next-themes`, `lucide-react`, `autoprefixer`, `tailwindcss-animate` | 1 |
| `postcss.config.mjs` | Add `autoprefixer: {}` | 1 |
| `tailwind.config.ts` | Rewrite — add `darkMode`, brand, gray-950, shadcn vars, fontFamily | 1 |
| `src/app/globals.css` | Rewrite — add shadcn CSS vars with brand-500 primary | 1 |
| `src/lib/utils.ts` | **New** (shadcn generated — `cn` utility) | 1 |
| `components.json` | **New** (shadcn generated — config) | 1 |
| `src/components/ui/button.tsx` | **New** (shadcn generated) then edit `font-medium→font-bold`, `hover:bg-primary/90→hover:bg-brand-400` | 1 |
| `src/components/theme-provider.tsx` | **New** — ThemeProvider client wrapper | 1 |
| `src/app/layout.tsx` | Add Inter font, ThemeProvider, `suppressHydrationWarning` | 1 |
| `src/app/(public)/layout.tsx` | Remove PublicProviders wrapper | 2 |
| `src/app/(public)/providers.tsx` | **Delete** | 2 |
| `src/app/components/CodeSnippet.tsx` | Full migration + add `'use client'` bug fix | 3 |
| `src/app/(public)/landing/page.tsx` | `<Box>` → `<div>` | 4 |
| `src/app/(public)/landing/components/Header.tsx` | Full migration — most complex | 4 |
| `src/app/(public)/landing/components/HeroSection.tsx` | Full migration | 4 |
| `src/app/(public)/landing/components/SixPrimitivesSection.tsx` | Full migration | 4 |
| `src/app/(public)/landing/components/ForCodingAgentsSection.tsx` | Full migration | 4 |
| `src/app/(public)/landing/components/WhyAjentifySection.tsx` | Full migration | 4 |
| `src/app/(public)/landing/components/Footer.tsx` | Full migration + gray.950 bug fix | 4 |

## Appendix B: Files NOT Changed

| File | Reason |
|------|--------|
| `src/app/(authenticated)/**` | Out of scope — still Chakra |
| `src/app/(auth)/**` | Out of scope — still Chakra |
| `src/app/(authenticated)/providers.tsx` | Untouched — still wraps ChakraProvider |
| `src/theme/theme.ts` | Untouched — still used by authenticated providers |
| `src/app/components/AmplifyConfig.tsx` | Out of scope |
| `src/app/components/DashboardBoot.tsx` | Out of scope |
| `next.config.ts` | No changes needed |
| `tsconfig.json` | No changes needed — `@/*` alias already works for new paths |
```
