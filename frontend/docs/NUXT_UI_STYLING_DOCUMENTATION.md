# UI Styling Documentation - Nuxt UI Design System Alignment

## Daftar Isi

1. [Global Design Tokens](#1-global-design-tokens-nuxt-ui-style)
2. [Global Layout Styling](#2-global-layout-styling)
3. [Component Styling Specification](#3-component-styling-specification-mandatory)
4. [Light Mode & Dark Mode Rules](#4-light-mode--dark-mode-rules)
5. [Tailwind Mapping Guideline](#5-tailwind-mapping-guideline-non-destructive)
6. [UI Consistency Rules](#6-ui-consistency-rules-nuxt-style)
7. [Final Checklist](#7-final-checklist)

---

## 1. Global Design Tokens (Nuxt UI–Style)

### 1.1 Background Tokens

| Token Name    | Light Mode       | Dark Mode           | Usage                             |
| ------------- | ---------------- | ------------------- | --------------------------------- |
| `bg-base`     | `bg-neutral-50`  | `bg-neutral-950`    | Root application background       |
| `bg-elevated` | `bg-white`       | `bg-neutral-900`    | Elevated surfaces (cards, modals) |
| `bg-muted`    | `bg-neutral-100` | `bg-neutral-900/50` | Subtle background differentiation |
| `bg-overlay`  | `bg-black/40`    | `bg-black/60`       | Modal/overlay backdrop            |

**Semantic Meaning:**

- `bg-base`: Foundation layer, lowest visual hierarchy
- `bg-elevated`: Content surfaces that sit above base
- `bg-muted`: Subtle differentiation without strong contrast
- `bg-overlay`: Semi-transparent layer for focus management

### 1.2 Surface Tokens

| Token Name      | Light Mode                                        | Dark Mode                                               | Usage                               |
| --------------- | ------------------------------------------------- | ------------------------------------------------------- | ----------------------------------- |
| `surface-base`  | `bg-transparent`                                  | `bg-transparent`                                        | Transparent surface (no background) |
| `surface-card`  | `bg-white` + `border-neutral-200` + `shadow-soft` | `bg-neutral-900` + `border-neutral-800` + `shadow-soft` | Card components                     |
| `surface-muted` | `bg-neutral-100` + `border-neutral-200/60`        | `bg-neutral-900/50` + `border-neutral-800/60`           | Subtle card variant                 |

**Semantic Meaning:**

- `surface-base`: No visual elevation, pure content
- `surface-card`: Standard elevated content container
- `surface-muted`: Softer elevation for secondary content

### 1.3 Text Tokens

| Token Name       | Light Mode         | Dark Mode          | Usage                       |
| ---------------- | ------------------ | ------------------ | --------------------------- |
| `text-primary`   | `text-neutral-900` | `text-neutral-100` | Primary content text        |
| `text-secondary` | `text-neutral-700` | `text-neutral-300` | Secondary content text      |
| `text-muted`     | `text-neutral-500` | `text-neutral-400` | Tertiary/muted text         |
| `text-disabled`  | `text-neutral-400` | `text-neutral-600` | Disabled state text         |
| `text-inverse`   | `text-white`       | `text-white`       | Text on colored backgrounds |

**Semantic Meaning:**

- `text-primary`: Highest contrast, main content
- `text-secondary`: Medium contrast, supporting content
- `text-muted`: Low contrast, metadata/helper text
- `text-disabled`: Lowest contrast, inactive content

### 1.4 Border & Ring Tokens

| Token Name       | Light Mode              | Dark Mode               | Usage                      |
| ---------------- | ----------------------- | ----------------------- | -------------------------- |
| `border-default` | `border-neutral-200`    | `border-neutral-800`    | Standard borders           |
| `border-muted`   | `border-neutral-200/60` | `border-neutral-800/60` | Subtle borders             |
| `border-focus`   | `border-primary-500`    | `border-primary-500`    | Focus state borders        |
| `ring-focus`     | `ring-primary-500`      | `ring-primary-500`      | Focus ring (accessibility) |

**Semantic Meaning:**

- `border-default`: Standard separation between elements
- `border-muted`: Subtle separation, less visual weight
- `border-focus`: Interactive element focus indicator
- `ring-focus`: Accessibility focus ring (2px offset)

### 1.5 Primary & Status Colors

#### Primary Color Scale (Indigo-based, Nuxt UI style)

| Token         | Light Mode | Dark Mode | Usage                    |
| ------------- | ---------- | --------- | ------------------------ |
| `primary-50`  | `#eef2ff`  | `#eef2ff` | Lightest tint            |
| `primary-100` | `#e0e7ff`  | `#e0e7ff` | Light tint               |
| `primary-200` | `#c7d2fe`  | `#c7d2fe` | Lighter tint             |
| `primary-300` | `#a5b4fc`  | `#a5b4fc` | Light shade              |
| `primary-400` | `#818cf8`  | `#818cf8` | Medium-light             |
| `primary-500` | `#6366f1`  | `#6366f1` | Base primary             |
| `primary-600` | `#4f46e5`  | `#4f46e5` | Default action (buttons) |
| `primary-700` | `#4338ca`  | `#4338ca` | Hover state              |
| `primary-800` | `#3730a3`  | `#3730a3` | Dark shade               |
| `primary-900` | `#312e81`  | `#312e81` | Darkest shade            |

**Usage Guidelines:**

- `primary-600`: Default button background, active links
- `primary-700`: Button hover state
- `primary-500`: Focus rings, selection highlights
- `primary-100` (light) / `primary-900/30` (dark): Active navigation backgrounds

#### Status Colors (Semantic)

| Token     | Light Mode | Dark Mode | Usage                             |
| --------- | ---------- | --------- | --------------------------------- |
| `success` | `#22c55e`  | `#22c55e` | Success states, positive actions  |
| `warning` | `#f59e0b`  | `#f59e0b` | Warning states, caution           |
| `error`   | `#ef4444`  | `#ef4444` | Error states, destructive actions |
| `info`    | `#3b82f6`  | `#3b82f6` | Informational states              |

**Status Color Variants (with opacity):**

For background tints and borders, use Tailwind opacity modifiers:

| Variant | Background (Light)                 | Background (Dark)                      | Border (Light)       | Border (Dark)        |
| ------- | ---------------------------------- | -------------------------------------- | -------------------- | -------------------- |
| Success | `bg-success/10` or `bg-success-50` | `bg-success/20` or `bg-success-900/20` | `border-success-200` | `border-success-800` |
| Warning | `bg-warning/10` or `bg-warning-50` | `bg-warning/20` or `bg-warning-900/20` | `border-warning-200` | `border-warning-800` |
| Error   | `bg-error/10` or `bg-error-50`     | `bg-error/20` or `bg-error-900/20`     | `border-error-200`   | `border-error-800`   |
| Info    | `bg-info/10` or `bg-info-50`       | `bg-info/20` or `bg-info-900/20`       | `border-info-200`    | `border-info-800`    |

**Usage Guidelines:**

- Use solid colors for badges and status indicators
- Use with white text for maximum contrast
- Maintain consistent meaning across all components
- Use opacity variants for subtle backgrounds in info cards
- Use darker shades (200/800) for borders in themed components

#### Accent Color (Success/Green-based)

| Token        | Light Mode | Dark Mode | Usage                       |
| ------------ | ---------- | --------- | --------------------------- |
| `accent-50`  | `#ecfdf5`  | `#ecfdf5` | Lightest tint (backgrounds) |
| `accent-100` | `#d1fae5`  | `#d1fae5` | Light tint                  |
| `accent-200` | `#a7f3d0`  | `#a7f3d0` | Lighter tint                |
| `accent-300` | `#6ee7b7`  | `#6ee7b7` | Light shade                 |
| `accent-400` | `#34d399`  | `#34d399` | Medium-light                |
| `accent-500` | `#10b981`  | `#10b981` | Base accent                 |
| `accent-600` | `#059669`  | `#059669` | Secondary button default    |
| `accent-700` | `#047857`  | `#047857` | Secondary button hover      |
| `accent-800` | `#065f46`  | `#065f46` | Dark shade (borders)        |
| `accent-900` | `#064e3b`  | `#064e3b` | Darkest shade               |

**Usage Guidelines:**

- Used for secondary actions (alternative to primary)
- Maintains visual hierarchy below primary actions
- `accent-50` / `accent-900/20`: Light background tints for info cards
- `accent-200` / `accent-800`: Border colors for accent-themed components

### 1.6 Spacing Scale

| Token      | Value            | Usage               |
| ---------- | ---------------- | ------------------- |
| `space-0`  | `0`              | No spacing          |
| `space-1`  | `0.25rem` (4px)  | Tight spacing       |
| `space-2`  | `0.5rem` (8px)   | Compact spacing     |
| `space-3`  | `0.75rem` (12px) | Small spacing       |
| `space-4`  | `1rem` (16px)    | Base spacing        |
| `space-6`  | `1.5rem` (24px)  | Medium spacing      |
| `space-8`  | `2rem` (32px)    | Large spacing       |
| `space-12` | `3rem` (48px)    | Extra large spacing |
| `space-16` | `4rem` (64px)    | Section spacing     |

**Nuxt UI Pattern:**

- Use `p-4` or `p-6` for card padding
- Use `gap-2` or `gap-3` for flex/grid spacing
- Use `space-y-4` or `space-y-6` for vertical stacking

### 1.7 Typography Scale

| Token       | Font Size         | Line Height | Usage                       |
| ----------- | ----------------- | ----------- | --------------------------- |
| `text-xs`   | `0.75rem` (12px)  | `1rem`      | Labels, captions            |
| `text-sm`   | `0.875rem` (14px) | `1.25rem`   | Secondary text, helper text |
| `text-base` | `1rem` (16px)     | `1.5rem`    | Body text (default)         |
| `text-lg`   | `1.125rem` (18px) | `1.75rem`   | Large body text             |
| `text-xl`   | `1.25rem` (20px)  | `1.75rem`   | Section headings            |
| `text-2xl`  | `1.5rem` (24px)   | `2rem`      | Page headings               |
| `text-3xl`  | `1.875rem` (30px) | `2.25rem`   | Large headings              |
| `text-4xl`  | `2.25rem` (36px)  | `2.5rem`    | Hero headings               |

**Font Family:**

- Primary: `Inter` (sans-serif)
- Font features: `'cv02', 'cv03', 'cv04', 'cv11'` (OpenType features)

**Font Weights:**

- `300`: Light
- `400`: Regular (body text)
- `500`: Medium (labels)
- `600`: Semibold (headings)
- `700`: Bold (emphasis)

### 1.8 Border Radius Scale

| Token          | Value            | Usage                                  |
| -------------- | ---------------- | -------------------------------------- |
| `rounded`      | `0.25rem` (4px)  | Small elements (badges, small buttons) |
| `rounded-lg`   | `0.5rem` (8px)   | Standard elements (buttons, inputs)    |
| `rounded-xl`   | `0.75rem` (12px) | Cards, modals                          |
| `rounded-2xl`  | `1rem` (16px)    | Large cards, hero sections             |
| `rounded-full` | `9999px`         | Pills, avatars, circular elements      |

**Nuxt UI Pattern:**

- Cards: `rounded-xl`
- Buttons: `rounded-lg`
- Badges: `rounded-full`
- Inputs: `rounded-lg`

### 1.9 Shadow Tokens

| Token            | Value                               | Usage                    |
| ---------------- | ----------------------------------- | ------------------------ |
| `shadow-soft`    | `0 1px 2px rgba(0,0,0,0.04)`        | Subtle elevation (cards) |
| `shadow-card`    | `0 4px 12px rgba(0,0,0,0.05)`       | Standard card elevation  |
| `shadow-soft-lg` | `0 10px 40px -10px rgba(0,0,0,0.1)` | Elevated cards, modals   |
| `shadow-none`    | `none`                              | No elevation             |

**Nuxt UI Pattern:**

- Avoid harsh shadows
- Use soft, subtle shadows for depth
- Shadows should be barely perceptible
- Dark mode: Shadows remain subtle (not inverted)

---

## 2. Global Layout Styling

### 2.1 App Background

**Root Container:**

```css
body {
  background: bg-base (neutral-50 / neutral-950)
  color: text-primary (neutral-900 / neutral-100)
  font-family: Inter
  antialiasing: enabled
}
```

**Visual Characteristics:**

- Soft, non-white background in light mode
- Very dark, non-black background in dark mode
- No harsh contrast between background and content

### 2.2 Page Container

**Container Pattern:**

- Class: `container-custom`
- Max width: `max-w-7xl` (1280px)
- Horizontal padding: `px-4 sm:px-6 lg:px-8`
- Center alignment: `mx-auto`

**Usage:**

- Wrap main page content
- Provides consistent horizontal spacing
- Responsive padding adjustments

### 2.3 Section Spacing

**Vertical Spacing Pattern:**

- Between sections: `space-y-6` or `space-y-8`
- Section padding: `py-12` or `py-16`
- Internal spacing: `space-y-4`

**Horizontal Spacing Pattern:**

- Between columns: `gap-6` or `gap-8`
- Card grid: `gap-4` or `gap-6`

### 2.4 Grid & Flex Layout

**Grid System:**

- Use CSS Grid for complex layouts
- Responsive columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Gap: `gap-4` to `gap-8` depending on content density

**Flex System:**

- Use Flexbox for component-level layouts
- Gap: `gap-2` to `gap-4` for tight spacing
- Alignment: `items-center`, `justify-between` for common patterns

### 2.5 Responsive Breakpoints

| Breakpoint | Value    | Usage                       |
| ---------- | -------- | --------------------------- |
| `sm`       | `640px`  | Small tablets, large phones |
| `md`       | `768px`  | Tablets                     |
| `lg`       | `1024px` | Small desktops              |
| `xl`       | `1280px` | Desktops                    |
| `2xl`      | `1536px` | Large desktops              |

**Nuxt UI Pattern:**

- Mobile-first approach
- Progressive enhancement
- Breakpoints align with Tailwind defaults

### 2.6 Scroll Behavior

**Scrollbar Styling:**

- Width: `2px` (thin, modern)
- Track: Matches `bg-base`
- Thumb: `neutral-300` (light) / `neutral-700` (dark)
- Hover: Slightly darker thumb
- Border radius: `rounded-full`

**Scroll Container:**

- Smooth scrolling: `scroll-smooth`
- Overflow handling: `overflow-y-auto` for scrollable areas
- Custom scrollbar visible but unobtrusive

---

## 3. Component Styling Specification (Mandatory)

### 3.1 Navbar / Header

**Visual Purpose:**

- Top navigation bar
- Sticky positioning for persistent access
- Glass morphism effect (backdrop blur)

**Styling Specification:**

| Property   | Light Mode                    | Dark Mode                     |
| ---------- | ----------------------------- | ----------------------------- |
| Background | `bg-white/80`                 | `bg-neutral-900/80`           |
| Backdrop   | `backdrop-blur-lg`            | `backdrop-blur-lg`            |
| Border     | `border-b border-neutral-200` | `border-b border-neutral-800` |
| Shadow     | `shadow-soft`                 | `shadow-soft`                 |
| Height     | `h-16` (64px)                 | `h-16` (64px)                 |
| Z-index    | `z-40`                        | `z-40`                        |
| Position   | `sticky top-0`                | `sticky top-0`                |

**Internal Elements:**

- Logo: Primary color with hover scale effect (`group-hover:scale-110 transition-transform`)
- Logo container: `w-8 h-8 rounded-lg bg-primary flex items-center justify-center`
- Logo text: `text-white font-bold text-lg`
- Brand text: `text-xl font-bold text-primary dark:text-primary`
- Navigation links: `text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors`
- Buttons: Follow button component spec
- Mobile menu: Slide-down animation, same styling as desktop
- Container: `container-custom` class for consistent padding

**States:**

- Default: Transparent background with blur
- Sticky: Maintains same appearance
- Mobile: Full-width dropdown with same styling
- Hover: Smooth color transitions on interactive elements

### 3.2 Sidebar / Navigation

**Visual Purpose:**

- Vertical navigation panel
- Collapsible for space efficiency
- Role-based navigation items

**Styling Specification:**

| Property          | Light Mode                                | Dark Mode                     |
| ----------------- | ----------------------------------------- | ----------------------------- |
| Background        | `bg-white`                                | `bg-neutral-900`              |
| Border            | `border-r border-neutral-200`             | `border-r border-neutral-800` |
| Shadow            | `shadow-soft`                             | `shadow-soft`                 |
| Width (expanded)  | `w-64` (256px)                            | `w-64` (256px)                |
| Width (collapsed) | `w-16` (64px)                             | `w-16` (64px)                 |
| Z-index           | `z-40`                                    | `z-40`                        |
| Position          | `fixed left-0 top-0 h-screen`             | Same                          |
| Layout            | `flex flex-col`                           | Same                          |
| Transition        | `transition-all duration-300 ease-in-out` | Same                          |

**Navigation Items:**

- Default: `text-neutral-700` / `text-neutral-300`
- Hover: `bg-primary-50` / `bg-primary-900/20`
- Active: `bg-primary-100` / `bg-primary-900/30` + `text-primary-700` / `text-primary-400`
- Padding: `px-3 py-2.5`
- Border radius: `rounded-lg`
- Icon size: `w-5 h-5`
- Layout: `flex items-center gap-3`
- Transition: `transition-colors`

**Navigation Container:**

- Layout: `flex-1 overflow-y-auto`
- Scrollbar: Custom styled (see global styles)

**Brand Section:**

- Height: `h-16` (matches header)
- Border: `border-b border-neutral-200` / `border-neutral-800`
- Layout: `flex items-center justify-center flex-shrink-0`
- Padding: `px-4` (expanded) / `px-0` (collapsed)
- Logo: Primary color square with letter (`w-8 h-8` or `w-10 h-10` when collapsed)
- Logo hover: `group-hover:scale-110 transition-transform`
- Brand text: `text-xl font-bold text-primary dark:text-primary` (hidden when collapsed)

**User Section:**

- Border: `border-t border-neutral-200` / `border-neutral-800`
- Layout: `flex-shrink-0`
- Padding: `p-4` (expanded) / `p-2` (collapsed)
- Avatar: Circular, primary background, white text (`w-10 h-10 rounded-full`)
- User info: Truncated text with role badge (hidden when collapsed)
- User name: `text-sm font-medium text-neutral-900 dark:text-white truncate`
- User role: `text-xs text-neutral-500 dark:text-neutral-400 capitalize`

### 3.3 Footer

**Visual Purpose:**

- Site footer with links and metadata
- Lower visual hierarchy than main content

**Styling Specification:**

| Property   | Light Mode                    | Dark Mode                     |
| ---------- | ----------------------------- | ----------------------------- |
| Background | `bg-neutral-50`               | `bg-neutral-900`              |
| Border     | `border-t border-neutral-200` | `border-t border-neutral-800` |
| Padding    | `py-12`                       | `py-12`                       |
| Container  | `container-custom`            | Same                          |

**Internal Structure:**

- Grid layout: `grid grid-cols-1 md:grid-cols-4 gap-8`
- Brand section: Logo + description
- Link sections: Product, Company, Legal
- Link color: `text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors`
- Heading: `font-semibold text-neutral-900 dark:text-white mb-3`
- Link list: `space-y-2`
- Description: `text-sm text-neutral-600 dark:text-neutral-400`

**Bottom Bar:**

- Border: `border-t border-neutral-200 dark:border-neutral-800`
- Padding: `mt-12 pt-8`
- Layout: `flex flex-col sm:flex-row justify-between items-center gap-4`
- Copyright: `text-sm text-neutral-600 dark:text-neutral-400`
- Social icons: `flex items-center gap-6`
- Icon size: `w-5 h-5`
- Icon color: `text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors`

### 3.4 Card

**Visual Purpose:**

- Content container with elevation
- Primary content grouping mechanism

**Styling Specification:**

| Property      | Light Mode                    | Dark Mode                     |
| ------------- | ----------------------------- | ----------------------------- |
| Background    | `bg-white`                    | `bg-neutral-900`              |
| Border        | `border border-neutral-200`   | `border border-neutral-800`   |
| Shadow        | `shadow-soft`                 | `shadow-soft`                 |
| Border radius | `rounded-xl`                  | `rounded-xl`                  |
| Padding       | `p-4 md:p-6`                  | `p-4 md:p-6`                  |
| Transition    | `transition-all duration-200` | `transition-all duration-200` |

**Hover Variant (card-hover):**

- Shadow: `shadow-soft-lg`
- Transform: `-translate-y-0.5` (subtle lift)
- Cursor: `cursor-pointer`

**Usage Guidelines:**

- Use for grouping related content
- Avoid nesting cards within cards
- Maintain consistent padding across cards
- Use `card-hover` class for interactive cards
- Responsive padding: `p-4` on mobile, `p-6` on desktop

**Card Variants:**

- Standard: `card` class
- Hoverable: `card card-hover`
- Muted: `surface-muted` class
- Full height: Add `h-full flex flex-col` for equal height cards in grids

### 3.5 Button

**Visual Purpose:**

- Primary interaction element
- Multiple variants for different action types

**Base Styles:**

- Display: `inline-flex`
- Alignment: `items-center justify-center`
- Font: `font-medium`
- Border radius: `rounded-lg`
- Transition: `transition-all duration-200`
- Focus: `focus-visible:ring-2 focus-visible:ring-primary-500`
- Disabled: `opacity-60 cursor-not-allowed`
- Gap: `gap-2` (icon spacing)

**Button Variants:**

#### Primary Button

| Property   | Light Mode       | Dark Mode        |
| ---------- | ---------------- | ---------------- |
| Background | `bg-primary-600` | `bg-primary-600` |
| Hover      | `bg-primary-700` | `bg-primary-700` |
| Text       | `text-white`     | `text-white`     |
| Shadow     | `shadow-soft`    | `shadow-soft`    |

#### Secondary Button

| Property   | Light Mode      | Dark Mode       |
| ---------- | --------------- | --------------- |
| Background | `bg-accent-600` | `bg-accent-600` |
| Hover      | `bg-accent-700` | `bg-accent-700` |
| Text       | `text-white`    | `text-white`    |
| Shadow     | `shadow-soft`   | `shadow-soft`   |

#### Outline Button

| Property   | Light Mode                  | Dark Mode                   |
| ---------- | --------------------------- | --------------------------- |
| Background | `bg-transparent`            | `bg-transparent`            |
| Border     | `border border-neutral-300` | `border border-neutral-700` |
| Text       | `text-neutral-800`          | `text-neutral-100`          |
| Hover      | `bg-neutral-50`             | `bg-neutral-900`            |

#### Ghost Button

| Property   | Light Mode         | Dark Mode          |
| ---------- | ------------------ | ------------------ |
| Background | `bg-transparent`   | `bg-transparent`   |
| Text       | `text-neutral-700` | `text-neutral-200` |
| Hover      | `bg-neutral-100`   | `bg-neutral-800`   |

#### Danger Button

| Property   | Light Mode    | Dark Mode     |
| ---------- | ------------- | ------------- |
| Background | `bg-error`    | `bg-error`    |
| Hover      | `bg-error/90` | `bg-error/90` |
| Text       | `text-white`  | `text-white`  |
| Shadow     | `shadow-soft` | `shadow-soft` |

**Button Sizes:**

| Size | Padding       | Font Size   |
| ---- | ------------- | ----------- |
| `sm` | `px-3 py-1.5` | `text-sm`   |
| `md` | `px-4 py-2.5` | `text-base` |
| `lg` | `px-6 py-3`   | `text-lg`   |

**Loading State:**

- Opacity: `opacity-70`
- Cursor: `cursor-wait`
- Loading indicator: Spinner or text "Loading..."
- Disabled: `disabled:opacity-60 disabled:cursor-not-allowed`

**Full Width:**

- Add `w-full` class for full-width buttons
- Common in forms and modals

### 3.6 Input

**Visual Purpose:**

- Text input fields
- Form data collection

**Styling Specification:**

| Property      | Light Mode                    | Dark Mode                     |
| ------------- | ----------------------------- | ----------------------------- |
| Background    | `bg-white`                    | `bg-neutral-900`              |
| Border        | `border border-neutral-300`   | `border border-neutral-700`   |
| Border radius | `rounded-lg`                  | `rounded-lg`                  |
| Padding       | `px-3 py-2`                   | `px-3 py-2`                   |
| Font size     | `text-sm`                     | `text-sm`                     |
| Text color    | `text-neutral-900`            | `text-neutral-100`            |
| Placeholder   | `text-neutral-400`            | `text-neutral-500`            |
| Focus border  | `border-primary-500`          | `border-primary-500`          |
| Focus ring    | `ring-2 ring-primary-500`     | `ring-2 ring-primary-500`     |
| Transition    | `transition-all duration-200` | `transition-all duration-200` |

**Error State:**

- Border: `border-error`
- Focus ring: `ring-error`
- Error text: `text-error` (below input)

**Label:**

- Font: `text-sm font-medium`
- Color: `text-neutral-700` / `text-neutral-300`
- Spacing: `mb-1.5` (below label)

**Helper Text:**

- Font: `text-sm`
- Color: `text-neutral-500` / `text-neutral-400`

### 3.7 Select

**Visual Purpose:**

- Dropdown selection
- Single or multiple choice

**Styling Specification:**

- Follows same base styling as Input
- Additional: Dropdown arrow icon
- Dropdown menu: Same as Input background/border
- Options: Hover state with `bg-neutral-50` / `bg-neutral-800`

### 3.8 Textarea

**Visual Purpose:**

- Multi-line text input
- Longer content entry

**Styling Specification:**

- Follows same base styling as Input
- Additional: `resize-y` (vertical resize only)
- Min height: `min-h-[100px]`

### 3.9 Checkbox

**Visual Purpose:**

- Binary selection
- Multiple selections in forms

**Styling Specification:**

| Property               | Light Mode                | Dark Mode                 |
| ---------------------- | ------------------------- | ------------------------- |
| Size                   | `w-4 h-4`                 | `w-4 h-4`                 |
| Border                 | `border-neutral-300`      | `border-neutral-700`      |
| Border radius          | `rounded`                 | `rounded`                 |
| Background (unchecked) | `bg-white`                | `bg-neutral-900`          |
| Background (checked)   | `bg-primary-600`          | `bg-primary-600`          |
| Border (checked)       | `border-primary-600`      | `border-primary-600`      |
| Focus ring             | `ring-2 ring-primary-500` | `ring-2 ring-primary-500` |

**Label:**

- Spacing: `ml-2`
- Font: `text-sm`
- Color: `text-neutral-700` / `text-neutral-300`

### 3.10 Radio

**Visual Purpose:**

- Single selection from group
- Mutually exclusive options

**Styling Specification:**

- Same as Checkbox, but circular (`rounded-full`)
- Size: `w-4 h-4`
- Inner dot: `w-2 h-2` when checked

### 3.11 Toggle / Switch

**Visual Purpose:**

- Binary on/off state
- Settings and preferences

**Styling Specification:**

| Property         | Light Mode                    | Dark Mode                     |
| ---------------- | ----------------------------- | ----------------------------- |
| Width            | `w-11` (44px)                 | `w-11` (44px)                 |
| Height           | `h-6` (24px)                  | `h-6` (24px)                  |
| Background (off) | `bg-neutral-300`              | `bg-neutral-700`              |
| Background (on)  | `bg-primary-600`              | `bg-primary-600`              |
| Border radius    | `rounded-full`                | `rounded-full`                |
| Toggle dot       | `w-4 h-4`                     | `w-4 h-4`                     |
| Toggle dot (on)  | `translate-x-5`               | `translate-x-5`               |
| Transition       | `transition-all duration-200` | `transition-all duration-200` |

### 3.12 Table

**Visual Purpose:**

- Tabular data display
- Structured information presentation

**Styling Specification:**

**Container:**

- Wrapper: Card component
- Overflow: `overflow-x-auto` for responsive tables

**Table Head:**
| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `bg-neutral-50` | `bg-neutral-800` |
| Border | `border-b border-neutral-200` | `border-b border-neutral-700` |
| Padding | `px-6 py-4` | `px-6 py-4` |
| Font | `font-semibold text-sm` | `font-semibold text-sm` |
| Text color | `text-neutral-900` | `text-white` |

**Table Body:**
| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Border | `divide-y divide-neutral-200` | `divide-y divide-neutral-700` |
| Padding | `px-6 py-4` | `px-6 py-4` |
| Font | `text-sm` | `text-sm` |
| Text color | `text-neutral-700` | `text-neutral-300` |

**Row States:**

- Hover: `hover:bg-neutral-50` / `hover:bg-neutral-800/50`
- Selected: `bg-primary-50` / `bg-primary-900/20`

### 3.13 Pagination

**Visual Purpose:**

- Navigate through paginated content
- Page number and navigation controls

**Styling Specification:**

**Container:**

- Display: `flex items-center gap-2`
- Alignment: Center or right-aligned

**Page Button:**

- Size: `w-10 h-10`
- Border radius: `rounded-lg`
- Background: `bg-white` / `bg-neutral-900`
- Border: `border border-neutral-300` / `border-neutral-700`
- Text: `text-neutral-700` / `text-neutral-300`
- Hover: `hover:bg-neutral-50` / `hover:bg-neutral-800`

**Active Page:**

- Background: `bg-primary-600`
- Text: `text-white`
- Border: `border-primary-600`

**Disabled:**

- Opacity: `opacity-50`
- Cursor: `cursor-not-allowed`

### 3.14 Badge / Chip

**Visual Purpose:**

- Status indicators
- Labels and tags

**Styling Specification:**

**Base:**

- Display: `inline-flex items-center`
- Padding: `px-2.5 py-0.5`
- Font: `text-xs font-medium`
- Border radius: `rounded-full`

**Variants:**

| Variant | Light Mode                        | Dark Mode                         |
| ------- | --------------------------------- | --------------------------------- |
| Default | `bg-neutral-100 text-neutral-700` | `bg-neutral-800 text-neutral-200` |
| Primary | `bg-primary-600 text-white`       | `bg-primary-500 text-white`       |
| Success | `bg-success text-white`           | `bg-success text-white`           |
| Warning | `bg-warning text-white`           | `bg-warning text-white`           |
| Error   | `bg-error text-white`             | `bg-error text-white`             |
| Info    | `bg-info text-white`              | `bg-info text-white`              |

### 3.15 Alert

**Visual Purpose:**

- Important messages
- Status notifications

**Styling Specification:**

**Base:**

- Background: `bg-white` / `bg-neutral-900`
- Border: `border border-neutral-200` / `border-neutral-800`
- Border radius: `rounded-xl`
- Padding: `p-4`
- Shadow: `shadow-soft`

**Variants (Left Border Accent):**

| Variant | Border Color                | Icon Color     |
| ------- | --------------------------- | -------------- |
| Success | `border-l-4 border-success` | `text-success` |
| Error   | `border-l-4 border-error`   | `text-error`   |
| Warning | `border-l-4 border-warning` | `text-warning` |
| Info    | `border-l-4 border-info`    | `text-info`    |

**Content:**

- Icon: `w-5 h-5`, left side
- Text: `text-sm font-medium`
- Color: `text-neutral-900` / `text-neutral-100`

### 3.16 Modal / Dialog

**Visual Purpose:**

- Focused content overlay
- User attention capture

**Styling Specification:**

**Backdrop:**
| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `bg-black/40` | `bg-black/60` |
| Backdrop blur | `backdrop-blur-sm` | `backdrop-blur-sm` |
| Position | `fixed inset-0` | `fixed inset-0` |
| Z-index | `z-50` | `z-50` |

**Modal Content:**
| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `bg-white` | `bg-neutral-900` |
| Border | `border border-neutral-200` | `border border-neutral-800` |
| Border radius | `rounded-xl` | `rounded-xl` |
| Shadow | `shadow-soft-lg` | `shadow-soft-lg` |
| Max width | `max-w-md` to `max-w-4xl` | `max-w-md` to `max-w-4xl` |
| Animation | `animate-scale-in` | `animate-scale-in` |

**Header:**

- Border: `border-b border-neutral-200` / `border-neutral-800`
- Padding: `p-6`
- Title: `text-xl font-semibold`
- Close button: `text-neutral-500` → `text-neutral-700` on hover

**Body:**

- Padding: `p-6`

**Sizes:**

- `sm`: `max-w-md` (448px)
- `md`: `max-w-lg` (512px)
- `lg`: `max-w-2xl` (672px)
- `xl`: `max-w-4xl` (896px)

### 3.17 Tooltip

**Visual Purpose:**

- Contextual information
- Hover-triggered hints

**Styling Specification:**

| Property      | Light Mode          | Dark Mode           |
| ------------- | ------------------- | ------------------- |
| Background    | `bg-neutral-900`    | `bg-neutral-100`    |
| Text          | `text-white`        | `text-neutral-900`  |
| Font          | `text-xs`           | `text-xs`           |
| Padding       | `px-2 py-1`         | `px-2 py-1`         |
| Border radius | `rounded-lg`        | `rounded-lg`        |
| Shadow        | `shadow-soft-lg`    | `shadow-soft-lg`    |
| Arrow         | Matching background | Matching background |

**Positioning:**

- Z-index: `z-50`
- Offset: `8px` from trigger element

### 3.18 Dropdown

**Visual Purpose:**

- Context menu
- Action selection

**Styling Specification:**

**Container:**
| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `bg-white` | `bg-neutral-900` |
| Border | `border border-neutral-200` | `border border-neutral-800` |
| Border radius | `rounded-lg` | `rounded-lg` |
| Shadow | `shadow-soft-lg` | `shadow-soft-lg` |
| Padding | `p-1` | `p-1` |
| Min width | `min-w-[200px]` | `min-w-[200px]` |

**Items:**

- Padding: `px-3 py-2`
- Font: `text-sm`
- Text: `text-neutral-700` / `text-neutral-300`
- Hover: `bg-neutral-50` / `bg-neutral-800`
- Border radius: `rounded-lg`
- Disabled: `opacity-50 cursor-not-allowed`

**Divider:**

- Border: `border-t border-neutral-200` / `border-neutral-800`
- Margin: `my-1`

### 3.19 Tabs

**Visual Purpose:**

- Content organization
- Section navigation

**Styling Specification:**

**Container:**

- Border: `border-b border-neutral-200` / `border-neutral-800`
- Display: `flex gap-4` or `flex gap-6`

**Tab Button:**
| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Padding | `px-4 py-2` | `px-4 py-2` |
| Font | `text-sm font-medium` | `text-sm font-medium` |
| Text (inactive) | `text-neutral-600` | `text-neutral-400` |
| Text (active) | `text-primary-600` | `text-primary-400` |
| Border (active) | `border-b-2 border-primary-600` | `border-b-2 border-primary-400` |
| Hover | `hover:text-neutral-900` | `hover:text-neutral-200` |

**Tab Panel:**

- Padding: `pt-4` or `pt-6`
- Content follows standard text styling

### 3.20 Progress / Loader

**Visual Purpose:**

- Loading state indication
- Progress tracking

**Styling Specification:**

**Progress Bar:**
| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `bg-neutral-200` | `bg-neutral-800` |
| Fill | `bg-primary-600` | `bg-primary-600` |
| Height | `h-2` or `h-1` | `h-2` or `h-1` |
| Border radius | `rounded-full` | `rounded-full` |
| Transition | `transition-all duration-300` | `transition-all duration-300` |

**Spinner:**

- Size: `w-6 h-6` or `w-8 h-8`
- Color: `text-primary-600` / `text-primary-400`
- Animation: `animate-spin`
- Border: `border-2 border-neutral-200 border-t-primary-600`

**Skeleton:**

- Background: `bg-neutral-200` / `bg-neutral-800`
- Animation: `animate-pulse-soft`
- Border radius: Variant-dependent (see 3.24 Skeleton Loader for details)
- Custom sizing: Supports `width` and `height` props for flexible dimensions

### 3.21 Avatar

**Visual Purpose:**

- User profile representation
- Identity visualization
- Initials fallback when image unavailable

**Styling Specification:**

| Property   | Light Mode                                | Dark Mode                                 |
| ---------- | ----------------------------------------- | ----------------------------------------- |
| Shape      | `rounded-full`                            | `rounded-full`                            |
| Background | `bg-primary-600`                          | `bg-primary-600`                          |
| Text       | `text-white`                              | `text-white`                              |
| Font       | `font-semibold`                           | `font-semibold`                           |
| Display    | `inline-flex items-center justify-center` | `inline-flex items-center justify-center` |
| Overflow   | `overflow-hidden`                         | `overflow-hidden`                         |

**Avatar Sizes:**

| Size | Dimensions         | Font Size   |
| ---- | ------------------ | ----------- |
| `sm` | `w-8 h-8` (32px)   | `text-xs`   |
| `md` | `w-10 h-10` (40px) | `text-sm`   |
| `lg` | `w-12 h-12` (48px) | `text-base` |
| `xl` | `w-16 h-16` (64px) | `text-lg`   |

**Image Handling:**

- Object fit: `object-cover`
- Fallback: Initials from alt text (first 2 letters)
- Error state: Automatically shows initials if image fails

**Usage Guidelines:**

- Use primary color background for consistency
- Always provide alt text for accessibility
- Fallback initials automatically generated from alt text
- Maintains aspect ratio (always circular)

### 3.22 Empty State

**Visual Purpose:**

- No content indication
- Call-to-action placement

**Styling Specification:**

**Container:**

- Padding: `py-12` or `py-16`
- Text alignment: `text-center`
- Max width: `max-w-md mx-auto`

**Icon:**

- Size: `w-12 h-12` or `w-16 h-16`
- Color: `text-neutral-400` / `text-neutral-600`
- Margin: `mb-4`

**Heading:**

- Font: `text-lg font-semibold` or `text-xl font-semibold`
- Color: `text-neutral-900` / `text-white`
- Margin: `mb-2`

**Description:**

- Font: `text-sm` or `text-base`
- Color: `text-neutral-600` / `text-neutral-400`
- Margin: `mb-6`

**Action Button:**

- Follows button component spec
- Primary variant recommended

### 3.23 Toast / Notification

**Visual Purpose:**

- Temporary status messages
- Success, error, warning, and info notifications
- Auto-dismissing feedback

**Styling Specification:**

**Container:**

| Property       | Light Mode                    | Dark Mode                     |
| -------------- | ----------------------------- | ----------------------------- |
| Position       | `fixed top-4 right-4 z-[100]` | `fixed top-4 right-4 z-[100]` |
| Layout         | `flex flex-col gap-2`         | `flex flex-col gap-2`         |
| Max width      | `max-w-md w-full`             | `max-w-md w-full`             |
| Pointer events | `pointer-events-none`         | `pointer-events-none`         |

**Toast Item:**

| Property       | Light Mode                                 | Dark Mode                                  |
| -------------- | ------------------------------------------ | ------------------------------------------ |
| Background     | `bg-white`                                 | `bg-neutral-900`                           |
| Border         | `border border-neutral-200` + `border-l-4` | `border border-neutral-800` + `border-l-4` |
| Border radius  | `rounded-xl`                               | `rounded-xl`                               |
| Padding        | `p-4`                                      | `p-4`                                      |
| Shadow         | `shadow-soft-lg`                           | `shadow-soft-lg`                           |
| Animation      | `animate-slide-up`                         | `animate-slide-up`                         |
| Layout         | `flex items-start gap-3`                   | `flex items-start gap-3`                   |
| Pointer events | `pointer-events-auto`                      | `pointer-events-auto`                      |

**Border Accent Colors:**

- Success: `border-success`
- Error: `border-error`
- Warning: `border-warning`
- Info: `border-info`

**Icon:**

- Size: `w-5 h-5`
- Color: Matches border accent color
- Position: `flex-shrink-0 mt-0.5`

**Message Text:**

- Font: `text-sm font-medium`
- Color: `text-neutral-900` / `text-neutral-100`

**Close Button:**

- Size: `w-4 h-4`
- Color: `text-neutral-400` → `text-neutral-600` on hover (light) / `text-neutral-300` on hover (dark)
- Padding: `p-1`
- Border radius: `rounded-lg`
- Focus: `focus-visible:ring-2 focus-visible:ring-primary-500`

**Auto-dismiss:**

- Duration: 3 seconds
- Smooth fade-out animation

### 3.24 Skeleton Loader

**Visual Purpose:**

- Loading state placeholder
- Content structure indication
- Prevents layout shift

**Styling Specification:**

**Base:**

| Property      | Light Mode           | Dark Mode            |
| ------------- | -------------------- | -------------------- |
| Background    | `bg-neutral-200`     | `bg-neutral-800`     |
| Animation     | `animate-pulse-soft` | `animate-pulse-soft` |
| Border radius | Variant-dependent    | Variant-dependent    |

**Variants:**

| Variant       | Border Radius  | Usage                      |
| ------------- | -------------- | -------------------------- |
| `text`        | `rounded`      | Text lines, paragraphs     |
| `circular`    | `rounded-full` | Avatars, circular elements |
| `rectangular` | `rounded`      | Images, cards, containers  |

**Sizing:**

- Width: Custom via `width` prop or `w-full` for full width
- Height: Custom via `height` prop or `h-4` (text), `h-48` (images), etc.

**Usage Guidelines:**

- Use during data fetching
- Match the shape of content being loaded
- Maintain aspect ratios when possible
- Use appropriate variant for content type

### 3.25 Theme Toggle

**Visual Purpose:**

- Light/dark mode switching
- User preference control
- Accessible theme selection

**Styling Specification:**

| Property      | Light Mode                       | Dark Mode                        |
| ------------- | -------------------------------- | -------------------------------- |
| Base          | `btn btn-ghost`                  | `btn btn-ghost`                  |
| Size          | `w-10 h-10`                      | `w-10 h-10`                      |
| Padding       | `p-2`                            | `p-2`                            |
| Border radius | `rounded-full`                   | `rounded-full`                   |
| Hover         | `hover:bg-neutral-100`           | `hover:bg-neutral-800`           |
| Transition    | `transition-all duration-200`    | `transition-all duration-200`    |
| Focus         | `focus-visible:ring-primary-500` | `focus-visible:ring-primary-500` |

**Icon:**

- Size: `w-5 h-5`
- Color: `text-neutral-700` / `text-neutral-200`
- Transition: `transition-all duration-200`
- Icons: Sun (light mode) / Moon (dark mode)

**Loading State:**

- Disabled state while mounting
- Prevents flash of wrong theme

### 3.26 Lesson Components

#### Video Lesson

**Visual Purpose:**

- Video content playback
- Progress tracking
- Completion requirements

**Styling Specification:**

**Container:**

- Layout: `space-y-4`
- Badge: `Badge variant="primary"` with "Video Lesson" text
- Duration display: `text-sm text-neutral-600` / `text-neutral-400`

**Progress Section:**

| Property                | Light Mode                           | Dark Mode                            |
| ----------------------- | ------------------------------------ | ------------------------------------ |
| Container               | `space-y-2`                          | `space-y-2`                          |
| Label                   | `text-sm text-neutral-600`           | `text-sm text-neutral-400`           |
| Value                   | `font-medium text-neutral-900`       | `font-medium text-white`             |
| Progress bar background | `bg-neutral-200`                     | `bg-neutral-700`                     |
| Progress bar fill       | `bg-primary-600` or `bg-success-600` | `bg-primary-600` or `bg-success-600` |
| Progress bar height     | `h-2`                                | `h-2`                                |
| Border radius           | `rounded-full`                       | `rounded-full`                       |

**Warning Text:**

- Color: `text-warning-600` / `text-warning-400`
- Font: `text-sm`

**Completion Section:**

- Border: `border-t border-neutral-200` / `border-neutral-800`
- Padding: `mt-6 pt-6`
- Success state: `text-success-600` / `text-success-400` with CheckCircle icon

#### Quiz Lesson

**Visual Purpose:**

- Quiz information display
- Navigation to quiz system
- Requirements indication

**Styling Specification:**

**Container:**

- Layout: `space-y-4`
- Badge: `Badge variant="warning"` with "Quiz" text

**Info Card:**

| Property      | Light Mode                  | Dark Mode                   |
| ------------- | --------------------------- | --------------------------- |
| Background    | `bg-warning-50`             | `bg-warning-900/20`         |
| Border        | `border border-warning-200` | `border border-warning-800` |
| Border radius | `rounded-lg`                | `rounded-lg`                |
| Padding       | `p-6`                       | `p-6`                       |

**Heading:**

- Font: `text-lg font-semibold`
- Color: `text-neutral-900` / `text-white`
- Icon: CheckCircle `w-5 h-5`

**Info Items:**

- Layout: `space-y-3`
- Label: `font-medium text-neutral-700` / `text-neutral-300`
- Value: `text-neutral-600` / `text-neutral-400`

**Action Section:**

- Background: `bg-neutral-100` / `bg-neutral-800`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Warning text: `text-warning-600` / `text-warning-400`

#### Assignment Lesson

**Visual Purpose:**

- Assignment instructions
- Submission interface
- Deadline tracking

**Styling Specification:**

**Container:**

- Layout: `space-y-4`
- Badges: Multiple badges for status (default, error for overdue, warning for due soon, success for submitted)

**Instructions Card:**

| Property      | Light Mode                 | Dark Mode                  |
| ------------- | -------------------------- | -------------------------- |
| Background    | `bg-accent-50`             | `bg-accent-900/20`         |
| Border        | `border border-accent-200` | `border border-accent-800` |
| Border radius | `rounded-lg`               | `rounded-lg`               |
| Padding       | `p-6`                      | `p-6`                      |

**Form Fields:**

- Textarea: Standard input styling with `rows={6}`
- Input: Standard input styling for URL
- File input: Standard input styling
- Labels: `text-sm font-medium text-neutral-700` / `text-neutral-300`

**Submission Status:**

- Success: `bg-success-50` / `bg-success-900/20` with `text-success-700` / `text-success-300`
- Overdue: `text-error` / `text-error`

#### Exam Lesson

**Visual Purpose:**

- Exam information display
- Navigation to exam system
- High-stakes assessment indication

**Styling Specification:**

**Container:**

- Layout: `space-y-4`
- Badge: `Badge variant="error"` with "Exam" text

**Info Card:**

| Property      | Light Mode                 | Dark Mode                  |
| ------------- | -------------------------- | -------------------------- |
| Background    | `bg-danger-50`             | `bg-danger-900/20`         |
| Border        | `border border-danger-200` | `border border-danger-800` |
| Border radius | `rounded-lg`               | `rounded-lg`               |
| Padding       | `p-6`                      | `p-6`                      |

**Heading:**

- Icon: Award `w-5 h-5`
- Font: `text-lg font-semibold`
- Color: `text-neutral-900` / `text-white`

#### Material Lesson

**Visual Purpose:**

- PDF and text material display
- Content viewing
- Download capability

**Styling Specification:**

**Container:**

- Layout: `space-y-4`
- Badge: `Badge variant="default"` with "Material" text

**Content Display:**

- PDF Viewer: Full-width component
- Text content: `prose dark:prose-invert max-w-none` with card styling
- Download link: `text-sm text-primary-600` / `text-primary-400` with hover underline

**Empty State:**

- Background: `bg-neutral-100` / `bg-neutral-800`
- Padding: `p-6`
- Border radius: `rounded-lg`
- Text: `text-neutral-600` / `text-neutral-400`

#### Discussion Lesson

**Visual Purpose:**

- Discussion forum interface
- Topic presentation
- Participation tracking

**Styling Specification:**

**Container:**

- Layout: `space-y-4`
- Badge: `Badge variant="info"` with "Discussion" text

**Info Card:**

| Property      | Light Mode               | Dark Mode                |
| ------------- | ------------------------ | ------------------------ |
| Background    | `bg-info-50`             | `bg-info-900/20`         |
| Border        | `border border-info-200` | `border border-info-800` |
| Border radius | `rounded-lg`             | `rounded-lg`             |
| Padding       | `p-6`                    | `p-6`                    |

**Heading:**

- Icon: MessageSquare `w-5 h-5`
- Font: `text-lg font-semibold`
- Color: `text-neutral-900` / `text-white`

**Coming Soon Notice:**

- Background: `bg-neutral-100` / `bg-neutral-800`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Text: `text-sm text-neutral-600` / `text-neutral-400`

#### Live Session Lesson

**Visual Purpose:**

- Live session information
- Meeting link display
- Schedule indication

**Styling Specification:**

**Container:**

- Layout: `space-y-4`
- Badges: Primary for "Live Session", warning for "Upcoming", default for "Past"

**Info Card:**

| Property      | Light Mode                  | Dark Mode                   |
| ------------- | --------------------------- | --------------------------- |
| Background    | `bg-primary-50`             | `bg-primary-900/20`         |
| Border        | `border border-primary-200` | `border border-primary-800` |
| Border radius | `rounded-lg`                | `rounded-lg`                |
| Padding       | `p-6`                       | `p-6`                       |

**Meeting Link:**

- Display: `inline-flex items-center gap-2`
- Color: `text-primary-600` / `text-primary-400`
- Hover: `hover:underline`
- Icon: ExternalLink `w-4 h-4`

**Schedule Info:**

- Icon: Clock `w-4 h-4`
- Label: `text-sm text-neutral-600` / `text-neutral-400`
- Value: `text-neutral-900` / `text-white`

**Warning Notice:**

- Background: `bg-warning-50` / `bg-warning-900/20`
- Text: `text-warning-700` / `text-warning-300`

### 3.27 Course Components

#### Course Card

**Visual Purpose:**

- Course preview display
- Enrollment information
- Quick navigation

**Styling Specification:**

**Container:**

- Base: `card card-hover`
- Layout: `overflow-hidden h-full flex flex-col group`
- Hover: Scale effect on thumbnail

**Thumbnail:**

| Property     | Light Mode                                                | Dark Mode        |
| ------------ | --------------------------------------------------------- | ---------------- |
| Height       | `h-48`                                                    | `h-48`           |
| Background   | `bg-neutral-200`                                          | `bg-neutral-800` |
| Hover effect | `group-hover:scale-105 transition-transform duration-300` | Same             |

**Badges (Overlay):**

- Position: `absolute top-3 left-3` and `top-3 right-3`
- Layout: `flex gap-2` or `flex flex-col gap-1 items-end`
- Type colors: Success/10, Warning/10, Primary/20 backgrounds
- Level colors: Success/10, Primary/20, Error/10 backgrounds

**Content Section:**

- Padding: `p-6`
- Layout: `flex-1 flex flex-col`

**Title:**

- Font: `text-xl font-semibold`
- Color: `text-neutral-900` / `text-white`
- Hover: `group-hover:text-primary-600` / `group-hover:text-primary-400`
- Line clamp: `line-clamp-2`

**Description:**

- Font: `text-sm`
- Color: `text-neutral-600` / `text-neutral-400`
- Line clamp: `line-clamp-2`
- Flex: `flex-1`

**Footer:**

- Border: `border-t border-neutral-200` / `border-neutral-800`
- Padding: `pt-4`
- Layout: `flex items-center justify-between`

**Instructor Avatar:**

- Size: `w-8 h-8`
- Background: `bg-primary`
- Text: `text-white text-sm font-medium`
- Shape: `rounded-full`

**Stats:**

- Font: `text-sm`
- Color: `text-neutral-600` / `text-neutral-400`
- Rating icon: `w-4 h-4 text-warning`

### 3.28 Dashboard Components

#### Dashboard Card

**Visual Purpose:**

- Metric display
- Quick statistics
- Navigation to details

**Styling Specification:**

**Container:**

- Base: `card card-hover`
- Padding: `p-6`

**Icon Container:**

| Property      | Light Mode                                             | Dark Mode     |
| ------------- | ------------------------------------------------------ | ------------- |
| Size          | `w-12 h-12`                                            | `w-12 h-12`   |
| Border radius | `rounded-xl`                                           | `rounded-xl`  |
| Shadow        | `shadow-soft`                                          | `shadow-soft` |
| Background    | Variant color (primary, success, warning, error, info) | Same          |
| Icon color    | `text-white`                                           | `text-white`  |
| Icon size     | `w-6 h-6` or `text-2xl`                                | Same          |

**Value:**

- Font: `text-3xl font-bold`
- Color: `text-text-primary` / `text-[#E5E7EB]`
- Margin: `mb-1`

**Title:**

- Font: `text-sm font-medium`
- Color: `text-text-secondary` / `text-[#94A3B8]`
- Margin: `mb-1`

**Subtitle:**

- Font: `text-xs`
- Color: `text-text-muted` / `text-[#94A3B8]`

**Variant Colors:**

- Primary: `bg-primary`
- Success: `bg-success`
- Warning: `bg-warning`
- Error: `bg-error`
- Info: `bg-info`

### 3.29 Quiz Components

#### Question Card

**Visual Purpose:**

- Question display
- Answer selection
- Progress indication

**Styling Specification:**

**Container:**

- Base: `card`
- Padding: `p-8`

**Header:**

- Layout: `flex items-center justify-between mb-6`
- Question number: `text-sm font-medium text-neutral-600` / `text-neutral-400`
- Points badge: `badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300`

**Question Text:**

- Font: `text-xl font-semibold`
- Color: `text-neutral-900` / `text-white`
- Margin: `mb-6`

**Options:**

- Layout: `space-y-3`
- Option container: `flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors`
- Unselected: `border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700`
- Selected: `border-primary-600 bg-primary-50 dark:bg-primary-900/20`
- Radio input: `w-5 h-5 text-primary-600 focus:ring-primary-500`
- Option text: `ml-3 text-neutral-900 dark:text-white`

### 3.30 Notification Components

#### Notification Bell

**Visual Purpose:**

- Notification access point
- Unread count indicator
- Dropdown trigger

**Styling Specification:**

**Button:**

| Property      | Light Mode             | Dark Mode              |
| ------------- | ---------------------- | ---------------------- |
| Padding       | `p-2`                  | `p-2`                  |
| Border radius | `rounded-lg`           | `rounded-lg`           |
| Hover         | `hover:bg-neutral-100` | `hover:bg-neutral-800` |
| Transition    | `transition-colors`    | `transition-colors`    |

**Icon:**

- Size: `w-5 h-5`
- Color: `text-neutral-700` / `text-neutral-300`

**Badge (Unread Count):**

- Position: `absolute top-0 right-0`
- Size: `w-5 h-5`
- Background: `bg-primary-600`
- Text: `text-white text-xs font-bold`
- Shape: `rounded-full`
- Layout: `flex items-center justify-center`
- Overflow: Shows "9+" if count > 9

#### Notification Dropdown

**Visual Purpose:**

- Notification list display
- Mark as read functionality
- Navigation to related content

**Styling Specification:**

**Container:**

| Property      | Light Mode                  | Dark Mode                   |
| ------------- | --------------------------- | --------------------------- |
| Position      | `absolute right-0 mt-2`     | Same                        |
| Width         | `w-80 md:w-96`              | Same                        |
| Background    | `bg-white`                  | `bg-neutral-900`            |
| Border        | `border border-neutral-200` | `border border-neutral-800` |
| Border radius | `rounded-lg`                | `rounded-lg`                |
| Shadow        | `shadow-lg`                 | `shadow-lg`                 |
| Z-index       | `z-50`                      | `z-50`                      |
| Max height    | `max-h-96`                  | `max-h-96`                  |
| Layout        | `flex flex-col`             | Same                        |
| Overflow      | `overflow-hidden`           | Same                        |

**Header:**

- Padding: `p-4`
- Border: `border-b border-neutral-200` / `border-neutral-800`
- Layout: `flex items-center justify-between`

**Title:**

- Font: `text-sm font-semibold`
- Color: `text-neutral-900` / `text-white`

**Unread Badge:**

- Background: `bg-primary-100` / `bg-primary-900`
- Text: `text-primary-700` / `text-primary-300`
- Font: `text-xs font-medium`
- Shape: `rounded-full`
- Padding: `px-2 py-0.5`

**Action Buttons:**

- Size: `p-1.5`
- Hover: `hover:bg-neutral-100` / `hover:bg-neutral-800`
- Icon size: `w-4 h-4`
- Icon color: `text-neutral-600` / `text-neutral-400`

**Notifications List:**

- Layout: `overflow-y-auto flex-1`
- Dividers: `divide-y divide-neutral-200` / `divide-neutral-800`

**Empty/Loading State:**

- Padding: `p-8`
- Text alignment: `text-center`
- Color: `text-neutral-500` / `text-neutral-400`

---

## 3.31 Layout Patterns

### 3.31.1 Glass Morphism (Header)

**Visual Purpose:**

- Modern translucent header effect
- Backdrop blur for depth
- Maintains readability over content

**Styling Specification:**

| Property      | Light Mode                    | Dark Mode                     |
| ------------- | ----------------------------- | ----------------------------- |
| Background    | `bg-white/80`                 | `bg-neutral-900/80`           |
| Backdrop blur | `backdrop-blur-lg`            | `backdrop-blur-lg`            |
| Border        | `border-b border-neutral-200` | `border-b border-neutral-800` |
| Shadow        | `shadow-soft`                 | `shadow-soft`                 |
| Position      | `sticky top-0 z-40`           | Same                          |

**Usage Guidelines:**

- Use for sticky headers that scroll over content
- Maintains 80% opacity for subtle transparency
- Backdrop blur creates depth without obscuring content
- Border provides clear separation

### 3.31.2 Collapsible Sidebar

**Visual Purpose:**

- Space-efficient navigation
- Expandable/collapsible panel
- Persistent state management

**Styling Specification:**

**Expanded State:**

| Property   | Light Mode                    | Dark Mode                     |
| ---------- | ----------------------------- | ----------------------------- |
| Width      | `w-64` (256px)                | `w-64` (256px)                |
| Background | `bg-white`                    | `bg-neutral-900`              |
| Border     | `border-r border-neutral-200` | `border-r border-neutral-800` |
| Shadow     | `shadow-soft`                 | `shadow-soft`                 |
| Position   | `fixed left-0 top-0 h-screen` | Same                          |
| Z-index    | `z-40`                        | `z-40`                        |

**Collapsed State:**

| Property         | Light Mode       | Dark Mode        |
| ---------------- | ---------------- | ---------------- |
| Width            | `w-16` (64px)    | `w-16` (64px)    |
| Other properties | Same as expanded | Same as expanded |

**Transition:**

- Duration: `duration-300`
- Easing: `ease-in-out`
- Property: `transition-all`

**Brand Section:**

- Height: `h-16` (matches header)
- Border: `border-b border-neutral-200` / `border-neutral-800`
- Padding: `px-4` (expanded) / `px-0` (collapsed)

**Navigation Items:**

- Padding: `px-3 py-2.5`
- Border radius: `rounded-lg`
- Default: `text-neutral-700` / `text-neutral-300`
- Hover: `bg-primary-50` / `bg-primary-900/20`
- Active: `bg-primary-100` / `bg-primary-900/30` + `text-primary-700` / `text-primary-400`

**User Section:**

- Border: `border-t border-neutral-200` / `border-neutral-800`
- Padding: `p-4` (expanded) / `p-2` (collapsed)

### 3.31.3 Sticky Header Pattern

**Visual Purpose:**

- Persistent navigation access
- Context preservation
- Smooth scrolling experience

**Styling Specification:**

**Fixed Header:**

| Property                   | Light Mode                                   | Dark Mode                     |
| -------------------------- | -------------------------------------------- | ----------------------------- |
| Position                   | `fixed top-0 right-0`                        | Same                          |
| Left offset (with sidebar) | `left-64` (expanded) / `left-16` (collapsed) | Same                          |
| Height                     | `h-16`                                       | `h-16`                        |
| Background                 | `bg-white`                                   | `bg-neutral-900`              |
| Border                     | `border-b border-neutral-200`                | `border-b border-neutral-800` |
| Shadow                     | `shadow-soft`                                | `shadow-soft`                 |
| Z-index                    | `z-50`                                       | `z-50`                        |
| Transition                 | `transition-all duration-300 ease-in-out`    | Same                          |

**Content Padding:**

- Add `pt-16` to main content area to account for fixed header
- Adjust when sidebar is collapsed/expanded

### 3.31.4 Tab Navigation Pattern

**Visual Purpose:**

- Content organization
- Section switching
- Clear active state

**Styling Specification:**

**Container:**

| Property | Light Mode                    | Dark Mode                     |
| -------- | ----------------------------- | ----------------------------- |
| Border   | `border-b border-neutral-200` | `border-b border-neutral-800` |
| Layout   | `flex gap-8` or `flex gap-6`  | Same                          |
| Padding  | `px-6 lg:px-8`                | Same                          |

**Tab Button:**

| Property      | Light Mode                      | Dark Mode                       |
| ------------- | ------------------------------- | ------------------------------- |
| Padding       | `pb-4 px-2`                     | `pb-4 px-2`                     |
| Font          | `font-medium`                   | `font-medium`                   |
| Inactive text | `text-neutral-600`              | `text-neutral-400`              |
| Active text   | `text-primary-600`              | `text-primary-400`              |
| Active border | `border-b-2 border-primary-600` | `border-b-2 border-primary-400` |
| Hover         | `hover:text-neutral-900`        | `hover:text-white`              |
| Transition    | `transition-colors`             | `transition-colors`             |

**Tab Panel:**

- Padding: `pt-4` or `pt-6`
- Content follows standard text styling

### 3.31.5 Responsive Navigation Pattern

**Visual Purpose:**

- Mobile-friendly navigation
- Adaptive layout
- Touch-optimized interactions

**Styling Specification:**

**Desktop Navigation:**

- Display: `hidden md:flex`
- Layout: `items-center gap-8`
- Link styling: `text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors`

**Mobile Menu Button:**

- Display: `md:hidden`
- Size: `w-8 h-8`
- Hover: `hover:bg-neutral-100 dark:hover:bg-neutral-800`
- Icon: Menu/X icon `w-6 h-6`

**Mobile Menu:**

- Position: `absolute` or slide-in animation
- Full width on mobile
- Same styling as desktop links
- Backdrop: Optional overlay

---

## 3.32 State Patterns

### 3.32.1 Loading States

**Visual Purpose:**

- Indicate data fetching
- Prevent layout shift
- Provide visual feedback

**Skeleton Loading:**

- Use Skeleton component (see 3.24)
- Match content structure
- Maintain aspect ratios
- Use appropriate variants

**Spinner Loading:**

| Property  | Light Mode                                         | Dark Mode                                          |
| --------- | -------------------------------------------------- | -------------------------------------------------- |
| Size      | `w-6 h-6` or `w-8 h-8`                             | Same                                               |
| Color     | `text-primary-600`                                 | `text-primary-400`                                 |
| Animation | `animate-spin`                                     | Same                                               |
| Border    | `border-2 border-neutral-200 border-t-primary-600` | `border-2 border-neutral-700 border-t-primary-400` |

**Button Loading:**

- Opacity: `opacity-70`
- Cursor: `cursor-wait`
- Disabled state: `disabled:opacity-60 disabled:cursor-not-allowed`
- Loading indicator: Spinner or text "Loading..."

**Page Loading:**

- Full-page skeleton or spinner
- Center alignment
- Minimal layout to prevent shift

### 3.32.2 Error States

**Visual Purpose:**

- Communicate failures
- Provide recovery options
- Clear error messaging

**Error Message:**

| Property      | Light Mode                            | Dark Mode                       |
| ------------- | ------------------------------------- | ------------------------------- |
| Container     | Card component                        | Card component                  |
| Icon          | Error icon (XCircle)                  | Same                            |
| Icon color    | `text-error`                          | `text-error`                    |
| Heading       | `text-2xl font-bold text-neutral-900` | `text-2xl font-bold text-white` |
| Message       | `text-neutral-600`                    | `text-neutral-400`              |
| Action button | Primary button variant                | Same                            |

**Inline Error (Forms):**

- Border: `border-error`
- Focus ring: `ring-error`
- Error text: `text-sm text-error` below input
- Icon: Optional error icon

**Error Toast:**

- Use Toast component with `type="error"`
- Auto-dismiss after 5 seconds (longer than success)
- Left border accent: `border-error`

**Empty Error State:**

- Icon: Large error icon (6xl)
- Heading: Clear error message
- Description: Helpful context
- Action: Retry button or navigation

### 3.32.3 Empty States

**Visual Purpose:**

- Indicate no content
- Guide user actions
- Maintain visual hierarchy

**Empty State Container:**

| Property       | Light Mode     | Dark Mode      |
| -------------- | -------------- | -------------- |
| Container      | Card component | Card component |
| Padding        | `p-12`         | `p-12`         |
| Text alignment | `text-center`  | `text-center`  |

**Empty State Icon:**

- Size: `text-6xl` or `w-16 h-16`
- Color: `text-neutral-400` / `text-neutral-600`
- Margin: `mb-4`

**Empty State Heading:**

- Font: `text-2xl font-bold`
- Color: `text-neutral-900` / `text-white`
- Margin: `mb-2`

**Empty State Description:**

- Font: `text-sm` or `text-base`
- Color: `text-neutral-600` / `text-neutral-400`
- Margin: `mb-6`

**Empty State Action:**

- Primary button variant
- Center alignment
- Clear call-to-action

### 3.32.4 Success States

**Visual Purpose:**

- Confirm completed actions
- Provide positive feedback
- Indicate completion

**Success Message:**

| Property   | Light Mode         | Dark Mode          |
| ---------- | ------------------ | ------------------ |
| Container  | Card or inline     | Same               |
| Icon       | CheckCircle        | Same               |
| Icon color | `text-success-600` | `text-success-400` |
| Text       | `font-medium`      | Same               |
| Color      | `text-success-600` | `text-success-400` |

**Success Badge:**

- Background: `bg-success`
- Text: `text-white`
- Shape: `rounded-full`
- Padding: `px-2.5 py-0.5`

**Success Toast:**

- Use Toast component with `type="success"`
- Auto-dismiss after 3 seconds
- Left border accent: `border-success`

**Completion Indicator:**

- Icon: CheckCircle `w-5 h-5`
- Text: "Completed" or "Success"
- Layout: `flex items-center gap-2`
- Color: `text-success-600` / `text-success-400`

### 3.32.5 Warning States

**Visual Purpose:**

- Alert users to important information
- Indicate caution required
- Highlight pending actions

**Warning Message:**

| Property   | Light Mode                  | Dark Mode                   |
| ---------- | --------------------------- | --------------------------- |
| Background | `bg-warning-50`             | `bg-warning-900/20`         |
| Border     | `border border-warning-200` | `border border-warning-800` |
| Text       | `text-warning-700`          | `text-warning-300`          |
| Icon       | AlertTriangle               | Same                        |
| Icon color | `text-warning`              | `text-warning`              |

**Warning Badge:**

- Background: `bg-warning`
- Text: `text-white`
- Usage: Status indicators, deadline warnings

**Warning Toast:**

- Use Toast component with `type="warning"`
- Auto-dismiss after 4 seconds
- Left border accent: `border-warning`

---

## 4. Light Mode & Dark Mode Rules

### 4.1 Visual Philosophy

**Nuxt UI Dark Mode Approach:**

- NOT a simple color inversion
- Semantic token transitions
- Maintained contrast ratios
- Soft, comfortable viewing

### 4.2 Token Behavior

**Tokens That Change:**

| Token Category      | Light Mode              | Dark Mode                     | Change Type     |
| ------------------- | ----------------------- | ----------------------------- | --------------- |
| Background base     | `neutral-50`            | `neutral-950`                 | Full transition |
| Background elevated | `white`                 | `neutral-900`                 | Full transition |
| Text primary        | `neutral-900`           | `neutral-100`                 | Full transition |
| Text secondary      | `neutral-700`           | `neutral-300`                 | Full transition |
| Border default      | `neutral-200`           | `neutral-800`                 | Full transition |
| Surface card        | `white` + `neutral-200` | `neutral-900` + `neutral-800` | Full transition |

**Tokens That Remain Stable:**

| Token          | Value              | Reason                    |
| -------------- | ------------------ | ------------------------- |
| Primary colors | Same in both modes | Brand consistency         |
| Status colors  | Same in both modes | Semantic meaning          |
| Focus rings    | `primary-500`      | Accessibility consistency |
| Shadows        | Same opacity/color | Depth perception          |

### 4.3 Contrast Ratios

**WCAG AA Compliance:**

- Normal text: Minimum 4.5:1
- Large text: Minimum 3:1
- UI components: Minimum 3:1

**Current Implementation:**

- Primary text: `neutral-900` on `neutral-50` = 15.8:1 (light)
- Primary text: `neutral-100` on `neutral-950` = 15.8:1 (dark)
- Secondary text: `neutral-700` on `neutral-50` = 7.1:1 (light)
- Secondary text: `neutral-300` on `neutral-950` = 12.6:1 (dark)

**Status Colors:**

- All status colors on white/neutral-900 meet AA standards
- Error and warning maintain high visibility in both modes

### 4.4 Accessibility Considerations

**Focus States:**

- Visible focus rings: `ring-2 ring-primary-500`
- Offset: `ring-offset-2` with matching background
- Never remove focus indicators

**Color Independence:**

- Status indicators use icons + color
- Never rely on color alone
- Text labels accompany color coding

**Motion:**

- Respect `prefers-reduced-motion`
- Animations are subtle (200-300ms)
- No jarring transitions

### 4.5 Dark Mode Implementation

**Activation:**

- Class-based: `dark` class on root element
- Toggle: Theme toggle component
- Persistence: localStorage preference

**Transition:**

- Smooth color transitions
- No flash of wrong theme
- Server-side rendering compatible

---

## 5. Tailwind Mapping Guideline (Non-Destructive)

### 5.1 Background Mapping

| Existing Tailwind  | Nuxt UI Semantic                | Notes                 |
| ------------------ | ------------------------------- | --------------------- |
| `bg-white`         | `bg-elevated` or `surface-card` | Use for cards, modals |
| `bg-gray-50`       | `bg-base`                       | Root background       |
| `bg-gray-100`      | `bg-muted`                      | Subtle backgrounds    |
| `dark:bg-gray-900` | `bg-elevated` (dark)            | Cards in dark mode    |
| `dark:bg-gray-950` | `bg-base` (dark)                | Root in dark mode     |
| `bg-slate-900`     | `bg-neutral-900`                | Use neutral scale     |

### 5.2 Text Mapping

| Existing Tailwind    | Nuxt UI Semantic        | Notes              |
| -------------------- | ----------------------- | ------------------ |
| `text-gray-900`      | `text-primary`          | Main content       |
| `text-gray-700`      | `text-secondary`        | Supporting text    |
| `text-gray-500`      | `text-muted`            | Helper text        |
| `text-gray-400`      | `text-disabled`         | Inactive text      |
| `dark:text-gray-100` | `text-primary` (dark)   | Main in dark       |
| `dark:text-gray-300` | `text-secondary` (dark) | Supporting in dark |

### 5.3 Border Mapping

| Existing Tailwind      | Nuxt UI Semantic        | Notes                 |
| ---------------------- | ----------------------- | --------------------- |
| `border-gray-200`      | `border-default`        | Standard borders      |
| `border-gray-300`      | `border-default`        | Input borders (light) |
| `dark:border-gray-700` | `border-default` (dark) | Standard in dark      |
| `dark:border-gray-800` | `border-default` (dark) | Card borders in dark  |

### 5.4 Color Mapping

| Existing Tailwind | Nuxt UI Semantic     | Notes              |
| ----------------- | -------------------- | ------------------ |
| `bg-blue-600`     | `bg-primary-600`     | Use primary scale  |
| `text-blue-600`   | `text-primary-600`   | Primary text color |
| `border-blue-500` | `border-primary-500` | Focus borders      |
| `ring-blue-500`   | `ring-primary-500`   | Focus rings        |
| `bg-green-500`    | `bg-success`         | Status color       |
| `bg-red-500`      | `bg-error`           | Status color       |
| `bg-yellow-500`   | `bg-warning`         | Status color       |

### 5.5 Shadow Mapping

| Existing Tailwind | Nuxt UI Semantic | Notes             |
| ----------------- | ---------------- | ----------------- |
| `shadow-sm`       | `shadow-soft`    | Subtle elevation  |
| `shadow`          | `shadow-card`    | Standard cards    |
| `shadow-lg`       | `shadow-soft-lg` | Elevated elements |
| `shadow-xl`       | `shadow-soft-lg` | Modals, dropdowns |

### 5.6 Spacing Mapping

| Existing Tailwind | Nuxt UI Semantic | Notes                 |
| ----------------- | ---------------- | --------------------- |
| `p-4`             | `p-4`            | Standard card padding |
| `p-6`             | `p-6`            | Large card padding    |
| `gap-2`           | `gap-2`          | Tight spacing         |
| `gap-4`           | `gap-4`          | Standard spacing      |
| `space-y-4`       | `space-y-4`      | Vertical stacking     |
| `space-y-6`       | `space-y-6`      | Section spacing       |

### 5.7 Migration Strategy

**Phase 1: Token Identification**

- Audit existing Tailwind classes
- Map to semantic tokens
- Document current usage

**Phase 2: Gradual Replacement**

- Start with new components
- Update existing components incrementally
- Maintain functionality throughout

**Phase 3: Verification**

- Visual consistency check
- Dark mode parity verification
- Accessibility audit

**Important Notes:**

- This is documentation only, NOT refactor instructions
- Changes should be made incrementally
- Test thoroughly after each update
- Maintain backward compatibility during transition

---

## 6. UI Consistency Rules (Nuxt-Style)

### 6.1 Card Usage Rules

**When to Use Cards:**

- Grouping related content
- Content that needs visual separation
- Data presentation (tables, lists)
- Form sections
- Dashboard widgets

**When NOT to Use Cards:**

- Full-page layouts
- Navigation elements (use borders instead)
- Inline content (use spacing instead)
- Nested within other cards (use borders/backgrounds)

**Card Hierarchy:**

- One level of cards per page section
- Use borders/backgrounds for nested grouping
- Maintain consistent padding across cards

### 6.2 Border Usage Rules

**When to Use Borders:**

- Card containers
- Input fields
- Table cells
- Section separators
- Dropdown menus

**When NOT to Use Borders:**

- Between related content (use spacing)
- Around full-page sections (use background instead)
- On hover-only states (use background change)

**Border Style:**

- Always use `border-default` token
- Thickness: `1px` (default)
- Subtle, not prominent
- Dark mode: Slightly more visible for contrast

### 6.3 Shadow Usage Rules

**Shadow Hierarchy:**

- `shadow-soft`: Standard cards, inputs
- `shadow-card`: Elevated cards
- `shadow-soft-lg`: Modals, dropdowns, hover states

**When to Use Shadows:**

- Cards (elevation from background)
- Modals (elevation from backdrop)
- Dropdowns (elevation from parent)
- Hover states (subtle lift effect)

**When NOT to Use Shadows:**

- Inline elements
- Navigation bars (use borders)
- Full-width sections
- Text elements

**Shadow Philosophy:**

- Subtle and soft
- Barely perceptible
- Creates depth without distraction
- Same in light and dark mode

### 6.4 Spacing Consistency

**Vertical Spacing Scale:**

- `space-y-2`: Tight grouping (form fields)
- `space-y-4`: Standard grouping (card content)
- `space-y-6`: Section spacing (between cards)
- `space-y-8`: Large section spacing

**Horizontal Spacing Scale:**

- `gap-2`: Tight (icon + text)
- `gap-3`: Standard (button groups)
- `gap-4`: Comfortable (card grids)
- `gap-6`: Spacious (section layouts)

**Padding Consistency:**

- Cards: `p-4` (mobile) or `p-6` (desktop)
- Buttons: `px-4 py-2.5` (medium)
- Inputs: `px-3 py-2`
- Modals: `p-6`

### 6.5 Typography Hierarchy

**Heading Levels:**

- `h1`: `text-4xl` or `text-3xl` - Page titles
- `h2`: `text-2xl` - Section headings
- `h3`: `text-xl` - Subsection headings
- `h4`: `text-lg` - Card titles
- `h5`: `text-base font-semibold` - Labels
- `h6`: `text-sm font-semibold` - Small labels

**Body Text:**

- Default: `text-base` (16px)
- Secondary: `text-sm` (14px)
- Small: `text-xs` (12px)

**Font Weight Usage:**

- `400` (regular): Body text
- `500` (medium): Labels, buttons
- `600` (semibold): Headings, emphasis
- `700` (bold): Strong emphasis (sparingly)

**Line Height:**

- Headings: Tighter (1.2-1.5)
- Body: Comfortable (1.5-1.75)
- Small text: Tighter (1.25)

### 6.6 Icon Sizing & Alignment

**Icon Sizes:**

- `w-4 h-4` (16px): Small, inline with text
- `w-5 h-5` (20px): Standard, buttons, lists
- `w-6 h-6` (24px): Large, headers, empty states
- `w-8 h-8` (32px): Extra large, hero sections

**Icon Alignment:**

- Inline with text: `inline` or `inline-flex`
- Buttons: `items-center` with `gap-2`
- Lists: `flex items-start gap-3`
- Headers: `items-center` with text

**Icon Colors:**

- Default: Match text color
- Primary: `text-primary-600`
- Muted: `text-neutral-400` / `text-neutral-600`
- Status: Match status color

### 6.7 Color Usage Rules

**Primary Color:**

- Actions: Buttons, links, focus states
- Branding: Logo, highlights
- Status: Active states, selections
- Never: Body text, backgrounds (except accents)

**Status Colors:**

- Success: Positive actions, confirmations
- Error: Destructive actions, errors
- Warning: Caution, important notices
- Info: Informational messages
- Use consistently across all components

**Neutral Colors:**

- Foundation: Backgrounds, borders
- Text: All text content
- Surfaces: Cards, inputs
- Never: Actions (use primary/status)

### 6.8 Animation & Transition Rules

**Transition Duration:**

- Standard: `duration-200` (200ms)
- Slow: `duration-300` (300ms)
- Fast: `duration-150` (150ms)

**Transition Properties:**

- Colors: `transition-colors`
- All: `transition-all` (for complex changes)
- Transform: `transition-transform`

**Animation Usage:**

- Fade in: `animate-fade-in`
- Slide up: `animate-slide-up`
- Scale in: `animate-scale-in`
- Pulse: `animate-pulse-soft` (loading)

**Animation Philosophy:**

- Subtle and purposeful
- Never distracting
- Respect `prefers-reduced-motion`
- Quick (200-300ms max)

---

## 7. Final Checklist

### 7.1 Visual Alignment with Nuxt UI

- [ ] Soft contrast throughout (no harsh black/white)
- [ ] Card-based layout for content grouping
- [ ] Subtle shadows (barely perceptible)
- [ ] Rounded corners (xl for cards, lg for buttons)
- [ ] Consistent spacing scale
- [ ] Semantic color tokens (not raw colors)
- [ ] Typography hierarchy clearly defined
- [ ] Icon sizing and alignment consistent

### 7.2 Component Functionality

- [ ] All components maintain existing behavior
- [ ] No business logic changes
- [ ] API calls unchanged
- [ ] State management intact
- [ ] Event handlers preserved
- [ ] Props interfaces maintained
- [ ] Accessibility features retained

### 7.3 Dark Mode Parity

- [ ] All components have dark mode styles
- [ ] Contrast ratios meet WCAG AA
- [ ] Status colors visible in both modes
- [ ] Focus states work in both modes
- [ ] Shadows appropriate for both modes
- [ ] No color-only information
- [ ] Smooth theme transitions

### 7.4 Styling Consistency

- [ ] Same component = same styling across app
- [ ] Spacing follows scale consistently
- [ ] Typography hierarchy applied correctly
- [ ] Color tokens used semantically
- [ ] Border usage follows rules
- [ ] Shadow usage follows rules
- [ ] Card usage follows rules

### 7.5 Documentation Completeness

- [ ] All tokens documented
- [ ] All components specified
- [ ] Light/dark mode rules clear
- [ ] Mapping guide complete
- [ ] Consistency rules defined
- [ ] Usage examples provided
- [ ] Migration path outlined

### 7.6 Developer Experience

- [ ] Tokens are discoverable
- [ ] Naming is semantic and intuitive
- [ ] Documentation is searchable
- [ ] Examples are clear
- [ ] Migration path is safe
- [ ] No breaking changes during transition

---

## Appendix: Quick Reference

### Token Quick Lookup

**Backgrounds:**

- `bg-base` → `neutral-50` / `neutral-950`
- `bg-elevated` → `white` / `neutral-900`
- `bg-muted` → `neutral-100` / `neutral-900/50`

**Text:**

- `text-primary` → `neutral-900` / `neutral-100`
- `text-secondary` → `neutral-700` / `neutral-300`
- `text-muted` → `neutral-500` / `neutral-400`

**Borders:**

- `border-default` → `neutral-200` / `neutral-800`
- `border-focus` → `primary-500`

**Shadows:**

- `shadow-soft` → Subtle card shadow
- `shadow-card` → Standard card shadow
- `shadow-soft-lg` → Modal/dropdown shadow

### Component Quick Reference

**Card:**

- Class: `card` or `surface-card`
- Padding: `p-4 md:p-6`
- Hover: Add `card-hover`

**Button:**

- Base: `btn`
- Variants: `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, `btn-danger`
- Sizes: `btn-sm`, `btn-md`, `btn-lg`

**Input:**

- Class: `input`
- Error: Add `border-error`

**Badge:**

- Base: `badge`
- Variants: `bg-primary-600`, `bg-success`, etc.

**Avatar:**

- Shape: `rounded-full`
- Background: `bg-primary-600`
- Sizes: `w-8 h-8` (sm), `w-10 h-10` (md), `w-12 h-12` (lg), `w-16 h-16` (xl)

**Toast:**

- Container: `fixed top-4 right-4 z-[100]`
- Item: `card` with `border-l-4` accent
- Animation: `animate-slide-up`
- Auto-dismiss: 3 seconds

**Skeleton:**

- Base: `skeleton` class
- Variants: `text`, `circular`, `rectangular`
- Animation: `animate-pulse-soft`

**ThemeToggle:**

- Base: `btn btn-ghost rounded-full w-10 h-10`
- Icon: `w-5 h-5` sun/moon icon

**Lesson Components:**

- Video: Progress bar with `bg-primary-600` or `bg-success-600`
- Quiz/Exam: Info cards with warning/error backgrounds
- Assignment: Accent-themed card with form fields
- Material: Prose content with download link
- Discussion: Info-themed card
- Live Session: Primary-themed card with meeting link

**Course Card:**

- Base: `card card-hover`
- Thumbnail: `h-48` with hover scale
- Badges: Overlay positioning with status colors

**Dashboard Card:**

- Base: `card card-hover p-6`
- Icon: `w-12 h-12 rounded-xl` with variant color
- Value: `text-3xl font-bold`

**Question Card:**

- Base: `card p-8`
- Options: `border-2` with hover states
- Selected: `border-primary-600 bg-primary-50`

**Notification Bell:**

- Button: `p-2 rounded-lg hover:bg-neutral-100`
- Badge: `absolute top-0 right-0 w-5 h-5 bg-primary-600 rounded-full`

**Notification Dropdown:**

- Container: `absolute right-0 mt-2 w-80 md:w-96`
- Base: `card` with `max-h-96 overflow-y-auto`

---

## Document Version

- **Version:** 2.0.0
- **Last Updated:** 2024
- **Maintained By:** Frontend Architecture Team
- **Reference:** Nuxt UI Official Design System

## Changelog

### Version 2.0.0

**Added:**

- Toast/Notification component specifications (3.23)
- Skeleton Loader detailed specifications (3.24)
- ThemeToggle component (3.25)
- Complete Lesson Components documentation (3.26):
  - Video Lesson
  - Quiz Lesson
  - Assignment Lesson
  - Exam Lesson
  - Material Lesson
  - Discussion Lesson
  - Live Session Lesson
- Course Components documentation (3.27)
- Dashboard Components documentation (3.28)
- Quiz Components documentation (3.29)
- Notification Components documentation (3.30)
- Layout Patterns section (3.31):
  - Glass Morphism pattern
  - Collapsible Sidebar pattern
  - Sticky Header pattern
  - Tab Navigation pattern
  - Responsive Navigation pattern
- State Patterns section (3.32):
  - Loading States
  - Error States
  - Empty States
  - Success States
  - Warning States

**Enhanced:**

- Global Design Tokens with complete accent color scale
- Status color variants with opacity modifiers
- Navbar/Header with detailed internal elements
- Sidebar/Navigation with expanded specifications
- Footer with complete structure
- Card component with variants
- Button component with loading states
- Progress/Loader with Skeleton details

**Updated:**

- Quick Reference section with all new components
- Component specifications aligned with actual implementation

---

**Note:** This document serves as a styling contract and migration reference. All code changes should be made incrementally with thorough testing. Functionality must never be compromised for styling consistency.
