# Actwise style guide

The app uses the CodeFast style (neo-brutalist): flat colors, 1px dark borders,
hard offset shadows with no blur, pill buttons, and large rounded cards.
Green is the brand color. Orange and pink are accent colors, taken from the CodeFast
accent palette. The app has a light theme and a dark theme.

All values live as CSS variables in `src/styles/tokens.css`.
Do not hard-code a color in a component. Use a token.

## 1. Colors

### Light theme (`[data-theme="light"]`, default)

| Token                 | Value     | Use                                            |
|-----------------------|-----------|------------------------------------------------|
| `--bg`                | `#ffffff` | Page background, card background               |
| `--bg-soft`           | `#f3f8f5` | Section background, subtle fills               |
| `--text`              | `#14211b` | Body text, headings                            |
| `--text-muted`        | `#44514b` | Secondary text, helper text                    |
| `--ink`               | `#14211b` | Dark button fill, borders, hard shadows        |
| `--ink-text`          | `#ffffff` | Text on `--ink`                                |
| `--green`             | `#abe2cb` | Brand fill: primary button, badges, highlights |
| `--green-hover`       | `#abe2cb` | Primary button fill on hover (no change)       |
| `--green-text`        | `#14211b` | Text on `--green`                              |
| `--green-strong`      | `#1f7a55` | Links, focus ring, icons on white              |
| `--green-soft`        | `#e3f5ec` | Tinted backgrounds, selected rows              |
| `--orange`            | `#ffe4cc` | Accent: markers, tile fills, tags              |
| `--pink`              | `#f9dcf8` | Accent: markers, tile fills, tags              |
| `--border`            | `#14211b` | Card and button borders                        |
| `--input-border`      | `rgba(20,33,27,.2)` | Input border at rest                 |
| `--shadow`            | `#14211b` | Hard offset shadows                            |
| `--error-bg`          | `#fde2e1` | Error message fill                             |
| `--error-text`        | `#9b1c1c` | Error message text                             |

### Dark theme (`[data-theme="dark"]`)

| Token                 | Value     | Use                                            |
|-----------------------|-----------|------------------------------------------------|
| `--bg`                | `#111613` | Page background, card background               |
| `--bg-soft`           | `#18201b` | Section background, subtle fills               |
| `--text`              | `#e5e5e5` | Body text, headings                            |
| `--text-muted`        | `#bbbbbb` | Secondary text, helper text                    |
| `--ink`               | `#f7f7f7` | Light button fill, borders, hard shadows       |
| `--ink-text`          | `#14211b` | Text on `--ink`                                |
| `--green`             | `#2f4f3f` | Brand fill: primary button, badges, highlights |
| `--green-hover`       | `#3a6650` | Primary button fill on hover                   |
| `--green-text`        | `#f2f2f2` | Text on `--green`                              |
| `--green-strong`      | `#6fd3a5` | Links, focus ring, icons on dark               |
| `--green-soft`        | `#1c2a22` | Tinted backgrounds, selected rows              |
| `--orange`            | `#503830` | Accent: markers, tile fills, tags              |
| `--pink`              | `#503048` | Accent: markers, tile fills, tags              |
| `--border`            | `#eeeeee` | Card and button borders                        |
| `--input-border`      | `rgba(229,229,229,.2)` | Input border at rest              |
| `--shadow`            | `#eeeeee` | Hard offset shadows                            |
| `--error-bg`          | `#503030` | Error message fill                             |
| `--error-text`        | `#ffd6d6` | Error message text                             |

Rules:
- Green is for the one main action on a screen and for brand marks. Do not use it for body text.
- Use `--ink` for second-level actions.
- Use `--orange` and `--pink` only for markers, tile fills, badges and tags. Do not use them for buttons or text.
- Text on `--green`, `--orange` and `--pink` is always `--text` (or `--green-text` on green).
- Use green, orange and pink in turn when a row of tiles needs color.
- Do not use purple, blue, or visible gradients. The marker uses a hard-stop gradient only to draw a flat bar.

## 2. Fonts

| Role     | Font                         | Size / line height | Weight | Notes                    |
|----------|------------------------------|--------------------|--------|--------------------------|
| Display  | Bebas Neue                   | 3.5rem / 1         | 400    | Hero titles only         |
| H1       | Bebas Neue                   | 2.75rem / 1        | 400    | Card and page titles     |
| H2       | Bebas Neue                   | 2rem / 1.1         | 400    | Section titles           |
| Body     | Noto Sans                    | 1rem / 1.5         | 400    | Default text             |
| Label    | Noto Sans                    | 0.875rem / 1.25    | 600    | Form labels              |
| Small    | Noto Sans                    | 0.875rem / 1.25    | 400    | Helper text, footnotes   |
| Button   | Noto Sans                    | 1rem / 1.5         | 600    | All buttons              |
| Mono     | ui-monospace, SF Mono, Menlo | 0.875rem           | 400    | Code, IDs                |

Load both fonts from Google Fonts (`index.html`). Bebas Neue has only capital letters, so write headings in normal case.

## 3. Shape, shadow, motion

| Token             | Value                          | Use                                 |
|-------------------|--------------------------------|-------------------------------------|
| `--radius-box`    | `2rem`                         | Cards, dialogs                      |
| `--radius-btn`    | `9999px`                       | Buttons, inputs                     |
| `--radius-badge`  | `1.9rem`                       | Badges                              |
| `--radius-field`  | `1rem`                         | Messages, small panels              |
| `--shadow-sm`     | `3px 3px 0 0 var(--shadow)`    | Button hover, badges                |
| `--shadow-xl`     | `6px 6px 0 0 var(--shadow)`    | Cards                               |
| `--ease`          | `cubic-bezier(0, 0, .2, 1)`    | All transitions                     |
| `--duration`      | `.2s`                          | Color, shadow, transform changes    |

## 4. Buttons

These rules match the CodeFast buttons (daisyUI `btn` with CodeFast changes).

**Base (`.btn`), all variants**
- Pill shape (`9999px`), height fits the content, padding `1rem 2rem`.
- Font Noto Sans, `1rem`, weight 600, normal case.
- Border 1px.
- At rest, a faint shadow `0 1px 2px rgba(0,0,0,.05)`.
- On first render, the button "pops": scale .98 → 1.02 → 1 in .25s.

**Hover, all variants (the CodeFast signature)**
- The button moves up and left by 3px (`translate(-3px, -3px)`).
- A hard shadow shows below and to the right: `3px 3px 0 0 var(--shadow)`.
- The transition is `.2s cubic-bezier(0,0,.2,1)`.

**Press:** the button scales to `.95`.
**Keyboard focus:** a 2px outline in `--green-strong`, offset 2px.
**Disabled:** opacity .5, no hover move, no shadow, `cursor: not-allowed`.

| Variant           | Rest                                                   | Hover (in addition to move + shadow)        |
|-------------------|--------------------------------------------------------|---------------------------------------------|
| `.btn-primary`    | Fill `--green`, text `--green-text`, border `--border` | Fill `--green-hover`                        |
| `.btn-ink`        | Fill `--ink`, text `--ink-text`, border `--ink`        | Fill `--green`, text `--green-text`         |
| `.btn-outline`    | No fill, text `--text`, border `--text`, no shadow     | Fill `--text`, text `--bg` (colors invert)  |
| `.btn-ghost`      | No fill, no border, no shadow                          | Fill `--green-soft`, no move, no shadow     |

Sizes: `.btn-sm` (padding `.5rem 1rem`, `.875rem`), default, `.btn-lg` (padding `1rem 2rem`, `1.125rem`).
Width: `.btn-block` (full width), `.btn-wide` (`18rem`).

Rules:
- Use one `.btn-primary` per screen.
- Text links use `--green-strong` with an underline. They do not move on hover.

## 5. Inputs

- Pill shape, height `3rem`, padding `0 1.25rem`, border 1px `--input-border`, fill `--bg`.
- Focus: border `--border` and a 2px ring in `--green-strong`.
- Error: border `--error-text`.

## 6. Cards, badges, messages

- **Card:** fill `--bg`, 1px `--border`, radius `--radius-box`, shadow `--shadow-xl`, padding `2rem`.
- **Badge:** fill `--green`, text `--green-text`, 1px `--border`, radius `--radius-badge`, `.875rem` / 600.
- **Accent badge:** `.badge-orange` or `.badge-pink`. Same shape as the badge.
- **Marker:** `.mark` (green), `.mark-orange`, `.mark-pink`. A flat bar behind the lower half of one or two words in a heading, as on CodeFast. Use one marker per heading.
- **Error message:** fill `--error-bg`, text `--error-text`, 1px `--border`, radius `--radius-field`.

## 7. Themes

- The theme is set by `data-theme="light" | "dark"` on `<html>`.
- On the first visit, the app uses the system setting (`prefers-color-scheme`).
- The theme toggle saves the choice in `localStorage` (`theme`).
- A small script in `index.html` sets the theme before the page draws. This stops a flash of the wrong theme.

## 8. Living style guide

Open `/style-guide` in the running app. It shows every token and component in the current theme.

## 9. Modals

- Use a modal (`ConfirmDialog`, class `.modal`) for every confirmation.
- Do not use `window.confirm`, `window.alert`, or `window.prompt`.
- The modal is a card on a dark backdrop. Esc, the backdrop, and "Cancel" close it.
- Put "Cancel" (`.btn-outline`) first and the action (`.btn-ink`) last. "Cancel" gets the focus.
