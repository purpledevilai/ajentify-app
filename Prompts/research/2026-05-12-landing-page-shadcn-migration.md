---
date: 2026-05-12
topic: "Landing page Chakra UI usage — pre-migration documentation for shadcn/ui migration"
repos_touched: [ajentify-app]
tags: [research, landing-page, chakra-ui, shadcn, migration, theming]
status: complete
last_updated: 2026-05-12
---

# Landing Page Chakra UI Usage — Pre-Migration Documentation

## Summary

The landing page is composed of six section components plus a header and footer, all rendered from a single server-side page component. Every section component is a client component (`'use client'`) that imports Chakra UI layout and typography primitives. Dark mode is handled uniformly across all components using `useColorModeValue` to resolve light/dark token pairs at render time. One component (`Header`) additionally uses `useColorMode` to drive the sun/moon toggle icon. The `ChakraProvider` wraps only the public route group via a thin `PublicProviders` client component. The root layout has no Chakra UI involvement.

A shared `CodeSnippet` component (in `src/app/components/`) is consumed by two landing page sections — it is also a Chakra UI client component and provides clipboard + syntax highlighting behavior. It is in scope for migration.

The theme extends Chakra's default with a custom `brand` color palette (purple-ish, 50–900), overrides for `gray`, `green`, `red`, and `yellow`, custom `Button` variants (`solid`, `outline`) tied to `brand.*` colors, a custom `Input` variant, and sets `Inter` as the heading and body font.

---

## File-by-File Analysis

---

### `src/app/layout.tsx` — Root Layout

**`'use client'`:** No — server component.

**Chakra UI imports:** None.

**Purpose:** Renders the `<html>` and `<body>` tags, sets `<Metadata>`, imports `globals.css`. Has no knowledge of Chakra UI at all. The `ChakraProvider` is scoped to the `(public)` route group only, not the root.

**Component tree:**
```
RootLayout
  <html lang="en">
    <body>
      {children}
```

**Interactive behavior:** None.

**Code reference:** `src/app/layout.tsx:1–15`

---

### `src/app/(public)/layout.tsx` — Public Layout

**`'use client'`:** No — server component.

**Chakra UI imports:** None directly; delegates entirely to `PublicProviders`.

**Purpose:** Wraps all `(public)` routes (including the landing page) with `PublicProviders`. The layout is a pass-through with no markup of its own.

**Component tree:**
```
PublicLayout
  <PublicProviders>
    {children}
```

**Interactive behavior:** None.

**Code reference:** `src/app/(public)/layout.tsx:1–5`

---

### `src/app/(public)/providers.tsx` — PublicProviders

**`'use client'`:** Yes.

**Chakra UI imports:**
- `ChakraProvider` from `@chakra-ui/react`

**Purpose:** Instantiates Chakra's context (color mode, theme tokens, style injection) for the entire public route group. Passes the custom `theme` object imported from `@/theme/theme`.

**Component tree:**
```
PublicProviders
  <ChakraProvider theme={theme}>
    {children}
```

**Interactive behavior:** None beyond what `ChakraProvider` provides internally (color mode persistence via `localStorage`, CSS variable injection).

**Code reference:** `src/app/(public)/providers.tsx:1–8`

**Key note:** No `colorModeManager` is configured explicitly; Chakra defaults to `localStorageManager` for color mode persistence. No `initialColorMode` or `useSystemColorMode` options are set in the theme config, so Chakra defaults to `light` as the initial mode.

---

### `src/theme/theme.ts` — Theme Configuration

**`'use client'`:** No — module, not a component.

**Chakra UI imports:**
- `extendTheme` from `@chakra-ui/react`

**Customizations:**

#### Colors
| Palette | Overrides |
|---------|-----------|
| `brand` | Full 50–900 scale; primary purple family. `500` = `#7a15e6`, `600` = `#6712c1`, `300` = `#c18af7` |
| `gray` | Full 50–900 scale; neutral gray family aligned to Tailwind's gray-* values |
| `green` | 50–700 partial scale; teal-green family |
| `red` | `500` only: `#e53e3e` |
| `yellow` | `500` only: `#ecc94b` |

#### Component: `Button`
- `baseStyle.fontWeight`: `'bold'` (all variants)
- `variants.solid`: `bg: brand.500` (both modes), `_hover.bg: brand.400` (both modes), `color: white`
- `variants.outline`: `borderColor/color: brand.500` (light) / `brand.300` (dark), `_hover.bg: brand.100` (light) / `brand.700` (dark)
- `defaultProps`: `variant: 'solid'`, `colorScheme: 'brand'`

#### Component: `Input`
- `variants.filled.field`: `borderColor: gray.300`, `_hover: { borderColor: gray.400 }`, `_focus: { borderColor: gray.500, boxShadow: '0 0 0 1px grey.500' }` *(note: typo — `grey.500` should be `gray.500`)*
- `defaultProps`: `variant: 'filled'`

#### Fonts
- `heading`: `'Inter', sans-serif`
- `body`: `'Inter', sans-serif`

**No spacing, radii, shadows, breakpoints, or typography scale overrides are defined.** All those values fall back to Chakra's built-in defaults.

**Code reference:** `src/theme/theme.ts:1–98`

---

### `src/app/(public)/landing/page.tsx` — Landing Page Root

**`'use client'`:** No — server component.

**Chakra UI imports:**
- `Box` from `@chakra-ui/react`

**Chakra UI props used:**
- `<Box>` — no styling props; used purely as a wrapper `<div>`

**Component tree:**
```
LandingPage (server)
  <Box>
    <Header />
    <HeroSection />
    <SixPrimitivesSection />
    <ForCodingAgentsSection />
    <WhyAjentifySection />
    <Footer />
```

**Interactive behavior:** None.

**Code reference:** `src/app/(public)/landing/page.tsx:1–20`

---

### `src/app/(public)/landing/components/Header.tsx`

**`'use client'`:** Yes.

**Chakra UI imports:**
- Layout: `Box`, `Container`, `Flex`, `Spacer`
- Interactive: `Button`, `IconButton`
- Hooks: `useColorMode`, `useColorModeValue`
- Icons: `SunIcon`, `MoonIcon` (from `@chakra-ui/icons`)

**Dark mode usage:**
- `useColorMode()` → `colorMode` (drives icon: sun vs moon), `toggleColorMode` (button `onClick`)
- `useColorModeValue(light, dark)` for:
  - `bg`: `whiteAlpha.800` / `blackAlpha.700`
  - `borderColor`: `gray.200` / `gray.800`
  - `docsColor` (Docs button text): `brand.600` / `brand.300`
  - `docsHoverBg` (Docs button hover): `brand.50` / `whiteAlpha.100`

**Custom theme tokens referenced:**
- `brand.600`, `brand.300`, `brand.50`

**Styling props used:**
| Prop | Value |
|------|-------|
| `as` | `"header"` |
| `position` | `"sticky"` |
| `top` | `"0"` |
| `zIndex` | `"sticky"` |
| `bg` | dynamic via `useColorModeValue` |
| `backdropFilter` | `"saturate(180%) blur(8px)"` |
| `borderBottom` | `"1px solid"` |
| `borderColor` | dynamic |
| `px` | `{ base: 4, md: 6 }` |
| `py` | `"3"` |
| `maxW` (Container) | `"6xl"` |
| `px` (Container) | `"0"` |
| `align` (Flex) | `"center"` |
| `fontSize` (brand Box) | `"lg"` |
| `fontWeight` (brand Box) | `"extrabold"` |
| `letterSpacing` (brand Box) | `"-0.01em"` |
| `align` (inner Flex) | `"center"` |
| `gap` (inner Flex) | `{ base: 2, md: 3 }` |
| `variant` (Docs Button) | `"ghost"` |
| `color` (Docs Button) | dynamic |
| `fontWeight` (Docs Button) | `"semibold"` |
| `_hover.bg` (Docs Button) | dynamic |
| `aria-label` (IconButton) | `"Toggle color mode"` |
| `variant` (IconButton) | `"ghost"` |
| `size` (IconButton) | `"sm"` |
| `display` (Log in Button) | `{ base: 'none', sm: 'inline-flex' }` |
| `variant` (Log in Button) | `"ghost"` |
| `variant` (Sign up Button) | `"solid"` |

**Component tree:**
```
Header
  <Box as="header" sticky bg backdropFilter ...>
    <Container maxW="6xl">
      <Flex align="center">
        <Box> Ajentify (brand text) </Box>
        <Spacer />
        <Flex gap>
          <Button as="a" href=docs variant="ghost"> Docs </Button>
          <IconButton onClick=toggleColorMode> sun/moon icon </IconButton>
          <Link href="/signin">
            <Button variant="ghost"> Log in </Button>
          </Link>
          <Link href="/signup">
            <Button variant="solid"> Sign up </Button>
          </Link>
```

**Interactive behavior:**
- Reads/toggles Chakra color mode with `useColorMode`
- `IconButton` fires `toggleColorMode` on click

**Code reference:** `src/app/(public)/landing/components/Header.tsx:1–76`

---

### `src/app/(public)/landing/components/HeroSection.tsx`

**`'use client'`:** Yes.

**Chakra UI imports:**
- Layout: `Box`, `Container`, `Flex`, `HStack`, `Stack`
- Typography: `Heading`, `Text`
- Interactive: `Button`
- Hooks: `useClipboard`, `useColorModeValue`
- Icons: `CheckIcon`, `CopyIcon` (from `@chakra-ui/icons`)

**External component used:** `<CodeSnippet>` from `@/app/components/CodeSnippet` (see separate analysis below)

**Dark mode usage (`useColorModeValue`):**
- `subheadColor`: `gray.700` / `gray.300`
- `eyebrowColor`: `brand.600` / `brand.300`
- `secondaryBtnColor`: `gray.700` / `gray.200`

**Custom theme tokens referenced:**
- `brand.600`, `brand.300`

**Styling props used:**
| Prop | Value |
|------|-------|
| `as` | `"section"` |
| `position` | `"relative"` |
| `overflow` | `"hidden"` |
| `py` | `{ base: 16, md: 24 }` |
| `px` | `"6"` |
| `maxW` (Container) | `"6xl"` |
| `spacing` (Stack) | `{ base: 8, md: 10 }` |
| `align` (Stack) | `"flex-start"` |
| `fontSize` (eyebrow Text) | `"sm"` |
| `fontWeight` (eyebrow Text) | `"semibold"` |
| `letterSpacing` (eyebrow Text) | `"wider"` |
| `textTransform` (eyebrow Text) | `"uppercase"` |
| `color` (eyebrow Text) | dynamic |
| `as` (Heading) | `"h1"` |
| `size` (Heading) | `{ base: '2xl', md: '4xl' }` |
| `fontWeight` (Heading) | `"extrabold"` |
| `letterSpacing` (Heading) | `"-0.02em"` |
| `lineHeight` (Heading) | `"1.05"` |
| `fontSize` (subhead Text) | `{ base: 'lg', md: 'xl' }` |
| `color` (subhead Text) | dynamic |
| `maxW` (subhead Text) | `"3xl"` |
| `lineHeight` (subhead Text) | `"1.5"` |
| `direction` (Flex) | `{ base: 'column', sm: 'row' }` |
| `gap` (Flex) | `"3"` |
| `w` (Flex) | `{ base: 'full', sm: 'auto' }` |
| `size` (primary Button) | `"lg"` |
| `variant` (primary Button) | `"solid"` |
| `px` (primary Button) | `"7"` |
| `size` (secondary Button) | `"lg"` |
| `variant` (secondary Button) | `"ghost"` |
| `color` (secondary Button) | dynamic |
| `px` (secondary Button) | `"6"` |
| `w` (CodeSnippet wrapper Box) | `"full"` |
| `pt` (CodeSnippet wrapper Box) | `{ base: 2, md: 4 }` |
| `mb` (HStack) | `"2"` |
| `spacing` (HStack) | `"2"` |
| `color` (HStack) | dynamic |
| `fontSize` (terminal label Text) | `"sm"` |

**Component tree:**
```
HeroSection
  <Box as="section" relative overflow-hidden py px>
    <Container maxW="6xl">
      <Stack spacing align="flex-start">
        <Text> eyebrow: "AI agents, as infrastructure" </Text>
        <Heading as="h1"> "The Stripe of AI agents." </Heading>
        <Text> subheadline </Text>
        <Flex direction gap>
          <Button solid onClick=onCopy leftIcon=CopyIcon/CheckIcon>
            Copy prompt CTA
          </Button>
          <Link href="/signup">
            <Button ghost color> Sign up </Button>
          </Link>
        </Flex>
        <Box pt>
          <HStack mb>
            <Text> "Or, from a terminal:" </Text>
          </HStack>
          <CodeSnippet language="bash" code={CURL_EXAMPLE} />
        </Box>
```

**Interactive behavior:**
- `useClipboard(CODING_AGENT_PROMPT)` → `hasCopied`, `onCopy`
- Primary button fires `onCopy` and toggles icon + label on copy success

**Code reference:** `src/app/(public)/landing/components/HeroSection.tsx:1–119`

---

### `src/app/(public)/landing/components/SixPrimitivesSection.tsx`

**`'use client'`:** Yes.

**Chakra UI imports:**
- Layout: `Box`, `Container`, `SimpleGrid`, `Stack`
- Typography: `Heading`, `Text`
- Hooks: `useColorModeValue`

**Dark mode usage (`useColorModeValue`):**
- `sectionBg`: `gray.50` / `gray.900`
- `cardBg`: `white` / `gray.800`
- `cardBorder`: `gray.200` / `gray.700`
- `descColor`: `gray.600` / `gray.400`
- `accentColor`: `brand.600` / `brand.300`

**Custom theme tokens referenced:**
- `brand.600`, `brand.300`

**Data:** `PRIMITIVES` array (6 items) defined as a module-level constant — not fetched.

**Styling props used:**
| Prop | Value |
|------|-------|
| `as` | `"section"` |
| `bg` | dynamic |
| `py` | `{ base: 16, md: 24 }` |
| `px` | `"6"` |
| `maxW` (Container) | `"6xl"` |
| `spacing` (header Stack) | `{ base: 3, md: 4 }` |
| `mb` (header Stack) | `{ base: 10, md: 14 }` |
| `maxW` (header Stack) | `"3xl"` |
| `as` (Heading) | `"h2"` |
| `size` (Heading) | `{ base: 'xl', md: '2xl' }` |
| `fontWeight` (Heading) | `"extrabold"` |
| `letterSpacing` (Heading) | `"-0.02em"` |
| `fontSize` (desc Text) | `{ base: 'md', md: 'lg' }` |
| `color` (desc Text) | dynamic |
| `columns` (SimpleGrid) | `{ base: 1, md: 2, lg: 3 }` |
| `spacing` (SimpleGrid) | `{ base: 4, md: 6 }` |
| `bg` (card Box) | dynamic |
| `border` (card Box) | `"1px solid"` |
| `borderColor` (card Box) | dynamic |
| `borderRadius` (card Box) | `"lg"` |
| `p` (card Box) | `{ base: 5, md: 6 }` |
| `position` (card Box) | `"relative"` |
| `transition` (card Box) | `"border-color 150ms ease"` |
| `_hover.borderColor` (card Box) | dynamic `accentColor` |
| `fontSize` (index Text) | `"xs"` |
| `fontWeight` (index Text) | `"semibold"` |
| `color` (index Text) | dynamic |
| `mb` (index Text) | `"3"` |
| `fontFamily` (index Text) | `"mono"` |
| `as` (card Heading) | `"h3"` |
| `size` (card Heading) | `"md"` |
| `fontWeight` (card Heading) | `"bold"` |
| `mb` (card Heading) | `"2"` |
| `letterSpacing` (card Heading) | `"-0.01em"` |
| `color` (card desc Text) | dynamic |
| `fontSize` (card desc Text) | `"sm"` |
| `lineHeight` (card desc Text) | `"1.6"` |

**Component tree:**
```
SixPrimitivesSection
  <Box as="section" bg py px>
    <Container maxW="6xl">
      <Stack mb maxW> (section header)
        <Heading as="h2"> "The Primitives." </Heading>
        <Text> subtitle </Text>
      </Stack>
      <SimpleGrid columns={1/2/3} spacing>
        [× 6 PRIMITIVES]
        <Box bg border borderRadius p hover> (card)
          <Text> 01–06 index </Text>
          <Heading as="h3"> primitive name </Heading>
          <Text> description </Text>
```

**Interactive behavior:** None — purely presentational.

**Code reference:** `src/app/(public)/landing/components/SixPrimitivesSection.tsx:1–105`

---

### `src/app/(public)/landing/components/ForCodingAgentsSection.tsx`

**`'use client'`:** Yes.

**Chakra UI imports:**
- Layout: `Box`, `Container`, `Flex`, `Stack`
- Typography: `Heading`, `Text`
- Interactive: `Button`
- Hooks: `useColorModeValue`
- Icons: `ExternalLinkIcon` (from `@chakra-ui/icons`)

**External component used:** `<CodeSnippet>` from `@/app/components/CodeSnippet`

**Dark mode usage (`useColorModeValue`):**
- `descColor`: `gray.600` / `gray.400`
- `cardBg`: `white` / `gray.800`
- `cardBorder`: `gray.200` / `gray.700`
- `accentColor`: `brand.600` / `brand.300`
- `eyebrowColor`: `brand.600` / `brand.300`
- `urlColor`: `gray.900` / `white`

**Custom theme tokens referenced:**
- `brand.600`, `brand.300`

**Styling props used:**
| Prop | Value |
|------|-------|
| `as` | `"section"` |
| `py` | `{ base: 16, md: 24 }` |
| `px` | `"6"` |
| `maxW` (Container) | `"6xl"` |
| `spacing` (header Stack) | `{ base: 3, md: 4 }` |
| `mb` (header Stack) | `{ base: 10, md: 14 }` |
| `maxW` (header Stack) | `"3xl"` |
| `fontSize` (eyebrow Text) | `"sm"` |
| `fontWeight` (eyebrow Text) | `"semibold"` |
| `letterSpacing` (eyebrow Text) | `"wider"` |
| `textTransform` (eyebrow Text) | `"uppercase"` |
| `color` (eyebrow Text) | dynamic |
| `as` (Heading) | `"h2"` |
| `size` (Heading) | `{ base: 'xl', md: '2xl' }` |
| `fontWeight` (Heading) | `"extrabold"` |
| `letterSpacing` (Heading) | `"-0.02em"` |
| `fontSize` (desc Text) | `{ base: 'md', md: 'lg' }` |
| `color` (desc Text) | dynamic |
| `bg` (card Box) | dynamic |
| `border` (card Box) | `"1px solid"` |
| `borderColor` (card Box) | dynamic |
| `borderRadius` (card Box) | `"xl"` |
| `p` (card Box) | `{ base: 6, md: 8 }` |
| `mb` (card Box) | `{ base: 8, md: 10 }` |
| `direction` (inner Flex) | `{ base: 'column', md: 'row' }` |
| `align` (inner Flex) | `{ base: 'flex-start', md: 'center' }` |
| `justify` (inner Flex) | `"space-between"` |
| `gap` (inner Flex) | `{ base: 5, md: 6 }` |
| `spacing` (text Stack) | `"1"` |
| `flex` (text Stack) | `"1"` |
| `fontSize` (accent label Text) | `"xs"` |
| `fontWeight` (accent label Text) | `"semibold"` |
| `color` (accent label Text) | dynamic |
| `textTransform` (accent label Text) | `"uppercase"` |
| `letterSpacing` (accent label Text) | `"wider"` |
| `fontFamily` (URL Text) | `"mono"` |
| `fontSize` (URL Text) | `{ base: 'md', md: 'xl' }` |
| `fontWeight` (URL Text) | `"bold"` |
| `color` (URL Text) | dynamic |
| `wordBreak` (URL Text) | `"break-all"` |
| `color` (desc Text small) | dynamic |
| `fontSize` (desc Text small) | `"sm"` |
| `lineHeight` (desc Text small) | `"1.6"` |
| `pt` (desc Text small) | `"1"` |
| `size` (View docs Button) | `"lg"` |
| `variant` (View docs Button) | `"solid"` |
| `flexShrink` (View docs Button) | `0` |
| `spacing` (prompt Stack) | `"3"` |
| `maxW` (prompt Stack) | `"3xl"` |
| `fontSize` (prompt label Text) | `"sm"` |
| `fontWeight` (prompt label Text) | `"semibold"` |
| `color` (prompt label Text) | dynamic |

**Component tree:**
```
ForCodingAgentsSection
  <Box as="section" py px>
    <Container maxW="6xl">
      <Stack mb maxW> (section header)
        <Text> eyebrow: "Docs-first, agent-native" </Text>
        <Heading as="h2"> "Built to be read by AI." </Heading>
        <Text> description </Text>
      </Stack>
      <Box bg border borderRadius p mb> (URL card)
        <Flex direction align justify gap>
          <Stack flex>
            <Text> "The one URL your coding agent needs" (accent label) </Text>
            <Text fontFamily="mono"> https://api.ajentify.com/docs </Text>
            <Text> "Every endpoint..." </Text>
          </Stack>
          <Button as="a" href=DOCS_URL solid rightIcon=ExternalLinkIcon>
            View docs
          </Button>
        </Flex>
      </Box>
      <Stack maxW> (onboarding prompt section)
        <Text> "The onboarding prompt..." </Text>
        <CodeSnippet language="markdown" code={ONBOARDING_PROMPT} />
      </Stack>
```

**Interactive behavior:** None beyond clipboard in the nested `<CodeSnippet>`.

**Code reference:** `src/app/(public)/landing/components/ForCodingAgentsSection.tsx:1–124`

---

### `src/app/(public)/landing/components/WhyAjentifySection.tsx`

**`'use client'`:** Yes.

**Chakra UI imports:**
- Layout: `Box`, `Container`, `SimpleGrid`, `Stack`
- Typography: `Heading`, `Text`
- Hooks: `useColorModeValue`

**Dark mode usage (`useColorModeValue`):**
- `sectionBg`: `gray.50` / `gray.900`
- `cardBg`: `white` / `gray.800`
- `cardBorder`: `gray.200` / `gray.700`
- `descColor`: `gray.600` / `gray.400`
- `accentColor`: `brand.600` / `brand.300`

**Custom theme tokens referenced:**
- `brand.600`, `brand.300`

**Data:** `COMPARISONS` array (4 items) — module-level constant.

**Styling props used:**
| Prop | Value |
|------|-------|
| `as` | `"section"` |
| `bg` | dynamic |
| `py` | `{ base: 16, md: 24 }` |
| `px` | `"6"` |
| `maxW` (Container) | `"6xl"` |
| `spacing` (header Stack) | `{ base: 3, md: 4 }` |
| `mb` (header Stack) | `{ base: 10, md: 14 }` |
| `maxW` (header Stack) | `"3xl"` |
| `as` (Heading) | `"h2"` |
| `size` (Heading) | `{ base: 'xl', md: '2xl' }` |
| `fontWeight` (Heading) | `"extrabold"` |
| `letterSpacing` (Heading) | `"-0.02em"` |
| `fontSize` (desc Text) | `{ base: 'md', md: 'lg' }` |
| `color` (desc Text) | dynamic |
| `columns` (SimpleGrid) | `{ base: 1, md: 2 }` |
| `spacing` (SimpleGrid) | `{ base: 4, md: 6 }` |
| `bg` (card Box) | dynamic |
| `border` (card Box) | `"1px solid"` |
| `borderColor` (card Box) | dynamic |
| `borderRadius` (card Box) | `"lg"` |
| `p` (card Box) | `{ base: 6, md: 7 }` |
| `fontSize` (vs label Text) | `"xs"` |
| `fontWeight` (vs label Text) | `"semibold"` |
| `color` (vs label Text) | dynamic |
| `textTransform` (vs label Text) | `"uppercase"` |
| `letterSpacing` (vs label Text) | `"wider"` |
| `mb` (vs label Text) | `"2"` |
| `color` (body Text) | dynamic |
| `fontSize` (body Text) | `{ base: 'sm', md: 'md' }` |
| `lineHeight` (body Text) | `"1.7"` |

**Component tree:**
```
WhyAjentifySection
  <Box as="section" bg py px>
    <Container maxW="6xl">
      <Stack mb maxW> (section header)
        <Heading as="h2"> "Where Ajentify fits." </Heading>
        <Text> intro copy </Text>
      </Stack>
      <SimpleGrid columns={1/2} spacing>
        [× 4 COMPARISONS]
        <Box bg border borderRadius p> (card)
          <Text> "vs LangChain" / etc. (accent label) </Text>
          <Text> positioning paragraph </Text>
```

**Interactive behavior:** None — purely presentational.

**Code reference:** `src/app/(public)/landing/components/WhyAjentifySection.tsx:1–90`

---

### `src/app/(public)/landing/components/Footer.tsx`

**`'use client'`:** Yes.

**Chakra UI imports:**
- Layout: `Box`, `Container`, `Flex`, `HStack`, `Stack`
- Typography: `Text`
- Navigation: `Link as ChakraLink`
- Hooks: `useColorModeValue`

**Dark mode usage (`useColorModeValue`):**
- `borderColor`: `gray.200` / `gray.800`
- `labelColor`: `gray.500` / `gray.500` *(identical in both modes)*
- `linkColor`: `gray.700` / `gray.300`
- `linkHoverColor`: `brand.600` / `brand.300`
- `footerBg`: `white` / `gray.950`

**Custom theme tokens referenced:**
- `brand.600`, `brand.300`, `gray.950` *(note: `gray.950` is not in the custom theme — this will resolve to Chakra's default or undefined)*

**Data:** `FOOTER_LINKS` object with `product`, `follow`, `legal` arrays — module-level constant.

**Styling props used:**
| Prop | Value |
|------|-------|
| `as` | `"footer"` |
| `bg` | dynamic |
| `borderTop` | `"1px solid"` |
| `borderColor` | dynamic |
| `py` | `{ base: 10, md: 12 }` |
| `px` | `"6"` |
| `maxW` (Container) | `"6xl"` |
| `direction` (main Flex) | `{ base: 'column', md: 'row' }` |
| `justify` (main Flex) | `"space-between"` |
| `gap` (main Flex) | `{ base: 10, md: 8 }` |
| `spacing` (brand Stack) | `"3"` |
| `maxW` (brand Stack) | `"sm"` |
| `fontSize` (brand Text) | `"lg"` |
| `fontWeight` (brand Text) | `"extrabold"` |
| `letterSpacing` (brand Text) | `"-0.01em"` |
| `fontSize` (tagline Text) | `"sm"` |
| `color` (tagline Text) | dynamic |
| `lineHeight` (tagline Text) | `"1.6"` |
| `direction` (links Flex) | `{ base: 'column', sm: 'row' }` |
| `gap` (links Flex) | `{ base: 8, md: 16 }` |
| `spacing` (column Stacks) | `"3"` |
| `minW` (column Stacks) | `"32"` |
| `fontSize` (column header Text) | `"xs"` |
| `fontWeight` (column header Text) | `"semibold"` |
| `color` (column header Text) | dynamic |
| `textTransform` (column header Text) | `"uppercase"` |
| `letterSpacing` (column header Text) | `"wider"` |
| `color` (ChakraLink) | dynamic |
| `fontSize` (ChakraLink) | `"sm"` |
| `_hover` (ChakraLink) | `{ color: dynamic, textDecoration: 'none' }` |
| `isExternal` (ChakraLink) | boolean |
| `justify` (HStack bottom) | `"space-between"` |
| `mt` (HStack bottom) | `{ base: 10, md: 12 }` |
| `pt` (HStack bottom) | `"6"` |
| `borderTop` (HStack bottom) | `"1px solid"` |
| `borderColor` (HStack bottom) | dynamic |
| `flexWrap` (HStack bottom) | `"wrap"` |
| `fontSize` (copyright Text) | `"xs"` |
| `color` (copyright Text) | dynamic |

**Component tree:**
```
Footer
  <Box as="footer" bg border py px>
    <Container maxW="6xl">
      <Flex direction justify gap>
        <Stack> (brand column)
          <Text> "Ajentify" </Text>
          <Text> tagline </Text>
        </Stack>
        <Flex direction gap> (link columns)
          <Stack minW> (Product)
            <Text> "Product" (label) </Text>
            renderLink() × 3
          </Stack>
          <Stack minW> (Follow)
            <Text> "Follow" (label) </Text>
            renderLink() × 1
          </Stack>
          <Stack minW> (Legal)
            <Text> "Legal" (label) </Text>
            renderLink() × 1
          </Stack>
        </Flex>
      </Flex>
      <HStack justify borderTop mt pt>
        <Text> © 2026 Ajentify </Text>
      </HStack>
```

**Rendering detail:** `renderLink()` returns either a bare `<ChakraLink isExternal>` for external URLs, or a Next.js `<Link legacyBehavior passHref>` wrapping a `<ChakraLink>` for internal routes.

**Interactive behavior:** None (link navigation only).

**Code reference:** `src/app/(public)/landing/components/Footer.tsx:1–143`

---

### `src/app/components/CodeSnippet.tsx` — Shared Code Display Component

**`'use client'`:** Effectively yes (uses hooks); the file has no explicit directive, but imports hooks (`useClipboard`, `useColorModeValue`) that require client context.

> **Note:** This file is missing `'use client'` at the top. It works because it is always imported by components that are already client components, so React's client context propagates. However, this is a subtle omission.

**Chakra UI imports:**
- Layout: `Box`, `Flex`
- Typography: `Text`
- Interactive: `Button`
- Hooks: `useClipboard`, `useColorModeValue`
- Icons: `CheckIcon`, `CopyIcon` (from `@chakra-ui/icons`)

**External dependency:** `react-syntax-highlighter` (Prism), with `oneDark` / `oneLight` themes.

**Dark mode usage (`useColorModeValue`):**
- `syntaxStyle`: `oneLight` / `oneDark` (switches entire syntax highlighter theme)
- Header bar `bg`: `gray.200` / `gray.700` (inline `useColorModeValue` call)

**Styling props used:**
| Prop | Value |
|------|-------|
| `border` (outer Box) | `"1px solid"` |
| `borderColor` (outer Box) | `gray.300` |
| `borderRadius` (outer Box) | `"md"` |
| `overflow` (outer Box) | `"hidden"` |
| `justify` (header Flex) | `"space-between"` |
| `align` (header Flex) | `"center"` |
| `bg` (header Flex) | dynamic inline |
| `px` (header Flex) | `4` |
| `py` (header Flex) | `2` |
| `fontSize` (lang label Text) | `"sm"` |
| `fontWeight` (lang label Text) | `"bold"` |
| `size` (copy Button) | `"sm"` |
| `colorScheme` (copy Button) | `hasCopied ? 'green' : 'blue'` |
| `variant` (copy Button) | `"ghost"` |
| `overflowX` (code wrapper Box) | `"auto"` |

**Component tree:**
```
CodeSnippet
  <Box border borderColor borderRadius overflow>
    <Flex justify align bg px py> (header bar)
      <Text> LANGUAGE label </Text>
      <Button ghost onClick=onCopy leftIcon=CopyIcon/CheckIcon>
        Copy / Copied
      </Button>
    </Flex>
    <Box overflowX>
      <SyntaxHighlighter language style={syntaxStyle} customStyle>
        {code}
      </SyntaxHighlighter>
    </Box>
```

**Interactive behavior:**
- `useClipboard(code)` → `hasCopied`, `onCopy`
- Button fires `onCopy`, switches `colorScheme` and icon on success

**Code reference:** `src/app/components/CodeSnippet.tsx:1–36`

---

## Chakra UI Component Inventory

Master list of every unique Chakra UI component used across all files in scope (including `CodeSnippet`):

### Layout & Structure
| Component | Files Used In |
|-----------|--------------|
| `Box` | page.tsx, Header, HeroSection, SixPrimitivesSection, ForCodingAgentsSection, WhyAjentifySection, Footer, CodeSnippet |
| `Container` | Header, HeroSection, SixPrimitivesSection, ForCodingAgentsSection, WhyAjentifySection, Footer |
| `Flex` | Header, HeroSection, ForCodingAgentsSection, Footer, CodeSnippet |
| `Stack` | HeroSection, SixPrimitivesSection, ForCodingAgentsSection, WhyAjentifySection, Footer |
| `HStack` | HeroSection, Footer |
| `SimpleGrid` | SixPrimitivesSection, WhyAjentifySection |
| `Spacer` | Header |

### Typography
| Component | Files Used In |
|-----------|--------------|
| `Heading` | HeroSection, SixPrimitivesSection, ForCodingAgentsSection, WhyAjentifySection |
| `Text` | Header (inline), HeroSection, SixPrimitivesSection, ForCodingAgentsSection, WhyAjentifySection, Footer, CodeSnippet |

### Interactive
| Component | Files Used In |
|-----------|--------------|
| `Button` | Header, HeroSection, ForCodingAgentsSection, CodeSnippet |
| `IconButton` | Header |
| `Link` (ChakraLink) | Footer |

### Provider
| Component | Files Used In |
|-----------|--------------|
| `ChakraProvider` | providers.tsx |

### Hooks
| Hook | Files Used In |
|------|--------------|
| `useColorMode` | Header |
| `useColorModeValue` | Header, HeroSection, SixPrimitivesSection, ForCodingAgentsSection, WhyAjentifySection, Footer, CodeSnippet |
| `useClipboard` | HeroSection, CodeSnippet |

### Icons (`@chakra-ui/icons`)
| Icon | Files Used In |
|------|--------------|
| `SunIcon` | Header |
| `MoonIcon` | Header |
| `CopyIcon` | HeroSection, CodeSnippet |
| `CheckIcon` | HeroSection, CodeSnippet |
| `ExternalLinkIcon` | ForCodingAgentsSection |

---

## Theme Configuration

The theme is defined in `src/theme/theme.ts` using `extendTheme`. Below is the full structured summary:

### Color Overrides

#### `brand` (purple family — primary brand color)
```
50:  #f3e9fd
100: #e1c8fb
200: #d1a9f9
300: #c18af7   ← dark mode accent
400: #a95cf3   ← hover states
500: #7a15e6   ← primary
600: #6712c1   ← light mode accent
700: #550e9e
800: #430a7a
900: #320758
```

#### `gray` (neutral — overrides Chakra default)
```
50:  #f9fafb
100: #f2f4f6
200: #e5e7eb
300: #d1d5db
400: #9ca3af
500: #6b7280
600: #4b5563
700: #374151
800: #1f2937
900: #111827
```
*(Matches Tailwind CSS gray-* exactly — intentional or coincidental, useful for migration)*

#### `green` (partial — 50–700)
```
50:  #e6f9f1
100: #c7f2df
200: #8ce4bf
300: #61d4a1
400: #38c78d
500: #28a974
600: #1f865d
700: #176747
```

#### `red` (partial — 500 only): `#e53e3e`
#### `yellow` (partial — 500 only): `#ecc94b`

**`gray.950` is referenced in `Footer.tsx` (`footerBg` dark value) but is NOT defined in the theme.** Chakra will resolve this to `undefined`/transparent in dark mode.

### Component Overrides

#### `Button`
- `baseStyle`: `fontWeight: 'bold'`
- `variants.solid`: bg `brand.500`, color `white`, hover bg `brand.400` — same in both color modes (the function receives `props.colorMode` but returns identical values for both)
- `variants.outline`: `borderColor`/`color` = `brand.500` (light) / `brand.300` (dark), hover bg = `brand.100` (light) / `brand.700` (dark)
- `defaultProps`: `variant: 'solid'`, `colorScheme: 'brand'`

#### `Input`
- `variants.filled.field`: `borderColor: gray.300`, hover `gray.400`, focus `gray.500` with box shadow
- `defaultProps`: `variant: 'filled'`
- *(Note: typo in focus shadow — `grey.500` instead of `gray.500`)*

### Font Configuration
```
heading: 'Inter', sans-serif
body:    'Inter', sans-serif
```
Inter is not loaded via `next/font` or a `<link>` in the theme file itself — it must be loaded elsewhere (likely `globals.css` or root layout).

### What is NOT customized
- `config` (no `initialColorMode`, no `useSystemColorMode`)
- `space` / `sizes`
- `radii`
- `shadows`
- `breakpoints`
- `zIndices`
- `typography` scale (`fontSizes`, `lineHeights`, `fontWeights`)

---

## Dark Mode Handling

### Mechanism
Dark mode is implemented entirely through Chakra UI's built-in color mode system:

1. **Provider:** `ChakraProvider` in `providers.tsx` wraps the public route group.
2. **Persistence:** Chakra defaults to `localStorageManager` — color mode preference is stored in `localStorage` under the key `chakra-ui-color-mode`.
3. **Initial mode:** No `config.initialColorMode` is set in `theme.ts`, so Chakra defaults to `"light"`.
4. **System preference:** No `config.useSystemColorMode` is set, so OS-level dark mode preference is ignored.
5. **Toggle:** `Header.tsx` exposes a manual toggle via `useColorMode().toggleColorMode()` wired to an `IconButton`.

### Pattern Used in All Components
Every component (except `page.tsx` and `layout.tsx`) uses `useColorModeValue(lightValue, darkValue)` to resolve color tokens at render time. Values are assigned to named variables at the top of each component function and then applied as Chakra props:

```tsx
const bg = useColorModeValue('gray.50', 'gray.900');
// then used as: <Box bg={bg}>
```

No components use `_dark` pseudo-prop syntax. No components use CSS variables directly.

### Color Token Pairs Used (all `useColorModeValue` calls)

| Semantic Role | Light | Dark |
|---------------|-------|------|
| Header bg | `whiteAlpha.800` | `blackAlpha.700` |
| Header border | `gray.200` | `gray.800` |
| Docs button text | `brand.600` | `brand.300` |
| Docs hover bg | `brand.50` | `whiteAlpha.100` |
| Eyebrow/accent text | `brand.600` | `brand.300` |
| Sub-heading text | `gray.700` | `gray.300` |
| Secondary button color | `gray.700` | `gray.200` |
| Section bg (alternate) | `gray.50` | `gray.900` |
| Card bg | `white` | `gray.800` |
| Card border | `gray.200` | `gray.700` |
| Description text | `gray.600` | `gray.400` |
| Accent/index text | `brand.600` | `brand.300` |
| URL text | `gray.900` | `white` |
| Footer bg | `white` | `gray.950` *(undefined — bug)* |
| Footer border | `gray.200` | `gray.800` |
| Footer label text | `gray.500` | `gray.500` *(same both modes)* |
| Footer link text | `gray.700` | `gray.300` |
| Footer link hover | `brand.600` | `brand.300` |
| CodeSnippet header bg | `gray.200` | `gray.700` |
| CodeSnippet syntax theme | `oneLight` | `oneDark` |

---

## Server vs Client Boundary

| File | `'use client'` | Component Type |
|------|---------------|----------------|
| `src/app/layout.tsx` | No | Server Component |
| `src/app/(public)/layout.tsx` | No | Server Component |
| `src/app/(public)/providers.tsx` | Yes | Client Component |
| `src/app/(public)/landing/page.tsx` | No | Server Component |
| `src/app/(public)/landing/components/Header.tsx` | Yes | Client Component |
| `src/app/(public)/landing/components/HeroSection.tsx` | Yes | Client Component |
| `src/app/(public)/landing/components/SixPrimitivesSection.tsx` | Yes | Client Component |
| `src/app/(public)/landing/components/ForCodingAgentsSection.tsx` | Yes | Client Component |
| `src/app/(public)/landing/components/WhyAjentifySection.tsx` | Yes | Client Component |
| `src/app/(public)/landing/components/Footer.tsx` | Yes | Client Component |
| `src/app/components/CodeSnippet.tsx` | **Missing** | Effectively Client (uses hooks) |

**Important observations:**
- `page.tsx` is a server component but all its direct children are client components. Chakra's `Box` in `page.tsx` forces a client boundary anyway since Chakra components are client-only. This effectively means the entire landing page tree executes on the client.
- All six section components use `useColorModeValue` and therefore must be client components.
- `SixPrimitivesSection` and `WhyAjentifySection` are stateless and only use `useColorModeValue` — they could theoretically be server components using CSS variables, but currently are not.
- After migration to shadcn/Tailwind, all purely presentational components (Primitives, WhyAjentify) could become server components.

---

## Code References

| Finding | Location |
|---------|----------|
| Root layout — no Chakra | `src/app/layout.tsx:1–15` |
| Public layout wraps with PublicProviders | `src/app/(public)/layout.tsx:1–5` |
| ChakraProvider with custom theme | `src/app/(public)/providers.tsx:6–8` |
| Full theme definition | `src/theme/theme.ts:1–98` |
| Brand color scale | `src/theme/theme.ts:5–16` |
| Gray color scale | `src/theme/theme.ts:17–28` |
| Button solid variant | `src/theme/theme.ts:52–58` |
| Button outline variant | `src/theme/theme.ts:59–65` |
| Font override (Inter) | `src/theme/theme.ts:93–96` |
| Landing page root (server, Box wrapper) | `src/app/(public)/landing/page.tsx:1–20` |
| Header — useColorMode + toggleColorMode | `src/app/(public)/landing/components/Header.tsx:17` |
| Header — all useColorModeValue calls | `src/app/(public)/landing/components/Header.tsx:19–22` |
| Header — sticky + backdrop filter | `src/app/(public)/landing/components/Header.tsx:25–36` |
| Header — IconButton toggle | `src/app/(public)/landing/components/Header.tsx:56–62` |
| HeroSection — useClipboard | `src/app/(public)/landing/components/HeroSection.tsx:42` |
| HeroSection — copy CTA button | `src/app/(public)/landing/components/HeroSection.tsx:88–96` |
| HeroSection — CodeSnippet (bash) | `src/app/(public)/landing/components/HeroSection.tsx:113` |
| SixPrimitivesSection — card hover | `src/app/(public)/landing/components/SixPrimitivesSection.tsx:77` |
| ForCodingAgentsSection — CodeSnippet (markdown) | `src/app/(public)/landing/components/ForCodingAgentsSection.tsx:119` |
| Footer — gray.950 (undefined token) | `src/app/(public)/landing/components/Footer.tsx:34` |
| Footer — legacyBehavior Link pattern | `src/app/(public)/landing/components/Footer.tsx:55–58` |
| CodeSnippet — missing 'use client' | `src/app/components/CodeSnippet.tsx:1` |
| CodeSnippet — syntax theme switching | `src/app/components/CodeSnippet.tsx:13` |
| Input variant typo (grey vs gray) | `src/theme/theme.ts:84` |

---

## Open Questions

1. **`gray.950` in Footer:** `useColorModeValue('white', 'gray.950')` — `gray.950` is not in the custom theme (scale stops at 900). What should the dark-mode footer background be? Options: `gray.900`, `gray.950` added to theme, or a direct hex value.

2. **`CodeSnippet.tsx` missing `'use client'`:** The file uses `useClipboard` and `useColorModeValue` but has no `'use client'` directive. It works today only because its parent components are all client components. This needs a directive added, or the component needs restructuring.

3. **`react-syntax-highlighter` replacement:** `CodeSnippet` uses `react-syntax-highlighter` (Prism). During migration, this is independent of Chakra UI. Will it be kept as-is, replaced with a different highlighter (e.g., `shiki`, `highlight.js`), or styled differently?

4. **Color mode initial state:** No `initialColorMode` or `useSystemColorMode` is configured. Should the migrated implementation default to system preference, force light, or keep the current localStorage-based manual toggle?

5. **Color mode toggle in `Header`:** Shadcn/ui uses a different color mode system (next-themes). The current `useColorMode` + `useColorModeValue` pattern needs to be replaced entirely with `useTheme` / `next-themes`. All `useColorModeValue` calls across every component need to be converted to CSS classes or Tailwind `dark:` variants.

6. **`Spacer` in Header:** Chakra's `<Spacer>` is a flex grow utility. In Tailwind this is simply `flex-1` or `ml-auto`. Straightforward but needs explicit handling.

7. **`SimpleGrid` with responsive `columns`:** Chakra's `<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }}>` maps to Tailwind `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Straightforward.

8. **`Container maxW="6xl"`:** Chakra's `6xl` container = `72rem` (1152px). Tailwind's `max-w-6xl` = `72rem`. These match exactly — no value conversion needed.

9. **`useClipboard` replacement:** Chakra's `useClipboard` can be replaced with the browser `navigator.clipboard.writeText` API directly, or a small custom hook. No shadcn equivalent exists.

10. **`backdropFilter` on Header:** `backdropFilter="saturate(180%) blur(8px)"` is a raw CSS string passed as a Chakra prop. In Tailwind, this maps to `backdrop-saturate-[180%] backdrop-blur-sm` (or a custom class). The exact values need to be matched.

11. **`zIndex="sticky"`:** Chakra maps `"sticky"` to `z-index: 1020`. In Tailwind, the closest is `z-[1020]` or a custom value. Needs confirmation of desired stacking behavior.

12. **`ChakraLink` with `legacyBehavior`:** The Footer uses `legacyBehavior` on Next.js `<Link>` combined with `<ChakraLink>`. In the migration, this pattern should be replaced with Next.js `<Link>` styled directly or with shadcn's link utilities.

13. **`@chakra-ui/icons` removal:** Five icons are used (`SunIcon`, `MoonIcon`, `CopyIcon`, `CheckIcon`, `ExternalLinkIcon`). The migration will need replacements — likely `lucide-react` (already included with shadcn) has all these equivalents (`Sun`, `Moon`, `Copy`, `Check`, `ExternalLink`).

14. **`Inter` font loading:** The theme sets `Inter` as the font family, but the actual font loading mechanism is not visible in any of these files — it must be in `globals.css` or somewhere in `root layout`. This needs to be verified to ensure font continuity after removing Chakra's theme.

15. **Server component opportunity:** After migration, `SixPrimitivesSection`, `WhyAjentifySection`, and potentially `ForCodingAgentsSection` (which has no interactivity of its own) could become server components, improving initial page load. This is a post-migration optimization opportunity.
