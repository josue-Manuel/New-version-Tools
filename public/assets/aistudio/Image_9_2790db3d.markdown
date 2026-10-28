---
name: Equatorial Academic Core
colors:
  surface: '#f9f9ff'
  surface-dim: '#cbdaff'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d8e2ff'
  on-surface: '#071b3b'
  on-surface-variant: '#434652'
  inverse-surface: '#1f3051'
  inverse-on-surface: '#edf0ff'
  outline: '#747783'
  outline-variant: '#c3c6d4'
  surface-tint: '#305ab4'
  primary: '#00307a'
  on-primary: '#ffffff'
  primary-container: '#1446a0'
  on-primary-container: '#a1baff'
  inverse-primary: '#b1c5ff'
  secondary: '#0060a8'
  on-secondary: '#ffffff'
  secondary-container: '#47a1ff'
  on-secondary-container: '#003663'
  tertiary: '#00394e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00516d'
  on-tertiary-container: '#45c8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001947'
  on-primary-fixed-variant: '#0a419b'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#a2c9ff'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#004881'
  tertiary-fixed: '#c2e8ff'
  tertiary-fixed-dim: '#75d1ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d67'
  background: '#f9f9ff'
  on-background: '#071b3b'
  surface-variant: '#d8e2ff'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.06em
  data-tabular-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
  data-tabular-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  data-tabular-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-compact: 0.5rem
  margin: 1.25rem
  margin-panel: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system delivers an institutional, high-reliability desktop application environment engineered specifically for educational directors, registrars, and faculty in Pointe-Noire, Republic of the Congo. The operational reality demands an interface optimized for prolonged visual comfort, dense bureaucratic record-keeping, and resilient local-first workflows where connectivity fluctuatates between high-speed broadband and intermittent offline states.

The aesthetic philosophy is **Institutional Desktop Modernism**:
- **Sober & Authoritative:** Prioritizes utilitarian clarity over visual decoration. It borrows the gravitas of formal national administrative ledgers and fuses it with high-precision SaaS data architecture.
- **Robust & Reassuring:** Every interaction reinforces architectural permanence, predictable state saves, and explicit confirmation of mathematical accuracy (averages, coefficients, student standings).
- **High-Information Density:** Screen real estate is engineered for maximum simultaneous visibility of student rosters, multi-term grade matrices, fee collection logs, and ministerial report generation without excessive pagination or wasteful white space.
- **Strictly Non-Frivolous:** Strictly rejects playful illustrations, fluid decorative gradients, floaty Neumorphism, and consumer-grade oversized tap targets. Every pixel serves legibility, speed of entry, and keyboard-first navigational momentum.

## Colors

The palette establishes an unmistakable operational hierarchy by pairing an authoritative institutional deep frame with high-legibility light work surfaces.

### Surface and Structure Architecture
- **Navigation Chrome & Master Shell:** `Midnight Navy (#0A1D3D)` anchors the primary navigation rails, top identity headers, and modal backdrops, projecting structural stability.
- **Primary Canvas:** `Off-White (#F8FAFC)` serves as the primary window canvas, mitigating eye fatigue under standard desktop backlights.
- **Structural Sub-Surfaces & Table Headers:** `Slate Neutral (#F1F5F9)` demarcates data grids, nested panels, read-only calculation sidebars, and segmented tab tracks.
- **Structural Dividing Rules:** Precision divider borders use `#E2E8F0` at 1px solid thickness to keep tabular bounds razor-sharp without clutter.

### Interactive States & Accents
- **Primary Accent (`#1446A0`):** Directs commitment actions (publishing report cards, finalizing enrollments, committing database backups).
- **Secondary Action (`#1E88E5`):** Denotes non-destructive interactions, active tab borders, filter chips, and interactive table sorting headers.
- **Terminal Focus & Progress Accent (`#00C2FF`):** Reserved for linear progress meters, upload/sync track heads, and critical selection callouts.

### Functional Status System
- **Online / Synced:** `#059669` (Dark Green base) and `#10B981` (Surface Indicator) verify active ministerial cloud replication.
- **Sync Pending / Warning / Missing Data:** `#D97706` (Amber) highlights uncalculated coefficients, empty trimester grades, or pending offline synchronization buffers.
- **System Error / Invalid Mark:** `#DC2626` (Red) triggers immediately upon out-of-scale inputs (e.g., marks exceeding `/20` under the Congolese baccalaureate standard) and critical hardware/database disconnects.

### Typography Hierarchy Contrast
- Primary Text: `#0F172A` (98% contrast against white data fields).
- Secondary Supporting Data: `#334155`.
- Metadata, Column Headers, and Captions: `#64748B`.

## Typography

The design system standardizes exclusively on **Inter** across all interface layers to ensure uniform visual metrics, universal symbol coverage, and instant legibility at dense administrative scales.

### Numeric Data Rules
All numeric grades, coefficients, student ID roll codes (Matricule), currency amounts (XAF/FCFA), and term percentages must systematically invoke OpenType tabular features: `font-feature-settings: "tnum" 1, "cv05" 1, "zero" 1;`. This enforces monospaced numeric widths within proportional text, guaranteeing that decimal places and grade columns align vertically down continuous ledger rows.

### Usage Hierarchy
- **Header Layers (`headline-xl`, `headline-lg`, `headline-md`):** Reserved for school dashboard modules, administrative cohort registries, and active examination session headings.
- **Standard Body (`body-md`):** The operational backbone for student dossiers, observations, and system dialogue text.
- **Labels & Micro-Data (`label-md`, `label-sm`):** Rendered with slight uppercase tracking (`0.04em`–`0.06em`) for table headers, metadata caps, ministerial exam classification tags, and status ribbons.
- **Tabular Layers (`data-tabular-*`):** Applied to grade book grids, balance sheets, and coefficient matrices.

## Layout & Spacing

The layout is built for 1080p and higher desktop displays with support down to compact 1280×720 institutional work terminals.

### Shell Layout Model
The layout utilizes a structural three-tier fixed/fluid grid:
1. **Primary Static Navigation Rail:** Fixed at `240px` (collapsible to `64px` icon-only mode for constrained laptop displays).
2. **Contextual Master-Detail Pane (Optional):** Fixed at `320px` for class roster selections, department listings, or student searches.
3. **Fluid Dynamic Canvas:** Consumes 100% of remaining viewport width with horizontal overflow scrolling locked strictly to data table modules.

### Grid Rhythm & Spacing Tokens
- Spacing follows a compact 4px baseline matrix (`space-xs: 4px`, `space-sm: 8px`, `space-md: 12px`, `space-lg: 16px`, `space-xl: 24px`).
- Table cell padding adheres to a strict default density: `8px` vertical by `12px` horizontal, reducing to `4px` vertical in high-density grade entry modes.
- Margins between master cards, action bars, and summary metric boards strictly utilize `margin-panel` (`16px`).

## Elevation & Depth

This system avoids ambient diffuse shadows, blurred multi-tier drops, and semi-transparent glass layers. In their place, it uses **structural tonal layering** and **crisp 1px boundary rules**.

### Depth Layers
- **Floor (Canvas):** `#F8FAFC` — Base workspace background.
- **Tier 1 (Surface Panels & Cards):** `#FFFFFF` bordered by `1px solid #E2E8F0`. Depth is conveyed by contrasting pure white data surfaces against the slate canvas.
- **Tier 2 (Sticky Headers, Frozen Grid Columns, Toolbars):** `#F1F5F9` bordered by `1px solid #CBD5E1`.
- **Tier 3 (Floating Popovers, Dropdowns, Datepickers):** `#FFFFFF` with a single functional containment shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)` enclosed by `1px solid #CBD5E1`.
- **Tier 4 (Modal Dialogs & Critical Grade Confirmation Overlays):** Centered `#FFFFFF` surface framed by an institutional backdrop curtain of `rgba(10, 29, 61, 0.70)`.

## Shapes

The application uses an institutional, disciplined shape profile with a roundedness setting of `1` (Soft):
- Standard inputs, buttons, table rows, and alert banners use `rounded: 4px` (`0.25rem`).
- Master containers, modal bodies, and primary cards use `rounded-lg: 8px` (`0.5rem`).
- Operational status indicators, sync state pips, and ministerial crest badges use sharp boundaries or strict geometric circles (`rounded-full`) exclusively when representing circular emblems or live connection dots.

## Components

### 1. Data Tables (Dense Grade & Roster Grids)
- **Header:** Height `32px`, background `#F1F5F9`, border bottom `2px solid #CBD5E1`. Text formatted in `label-md` `#475569`, text uppercase.
- **Rows:** Alternating striping is prohibited; subtle hover state on row background `#F8FAFC`. Active selected row uses `#EFF6FF` with a left indicator of `3px solid #1446A0`.
- **Grade Input Cells:** In-grid editing utilizes cell-filling inputs without border until active. On keyboard focus, apply an internal ring of `2px solid #1446A0` with background `#FFFFFF`. Out-of-bounds numbers immediately tint background `#FEF2F2` with border `1px solid #DC2626`.
- **Freeze Panes:** Student Name and Matricule ID remain persistently fixed on the horizontal axis during horizontal evaluation scrolling.

### 2. Form Inputs & Keyboard Navigation
- **Default State:** Height `34px`, background `#FFFFFF`, border `1px solid #CBD5E1`, text `body-md` `#0F172A`.
- **Focus State:** Explicit `2px solid #1446A0` with an outer halo of `1px solid #93C5FD`. Standard outline is eliminated.
- **Navigation Mandate:** Tab, Enter, and Arrow keys navigate through grid coordinates sequentially without requiring mouse interaction.

### 3. Buttons
- **Primary:** Background `#1446A0`, hover `#0F357D`, active `#0A2558`, text `#FFFFFF`, font `label-lg`, radius `4px`.
- **Secondary:** Background `#FFFFFF`, border `1px solid #CBD5E1`, hover background `#F8FAFC`, text `#334155`.
- **Critical / Destructive:** Background `#DC2626`, hover `#B91C1C`, text `#FFFFFF`.
- **Focus:** Highlighted with a visible `2px` offset ring in `#00C2FF`.

### 4. Network & Sync State Badge
- **Container:** Border `1px solid #CBD5E1`, background `#FFFFFF`, padding `4px 8px`, corner radius `4px`.
- **Online:** Emits a solid `8px` circle in `#10B981` paired with `label-md` reading "CONNECTÉ — SYNCHRONISÉ".
- **Offline Working Mode:** Solid `8px` circle in `#D97706` reading "HORS-LIGNE — LOCAL (X MODIFICATIONS)".

### 5. Institutional Badges & Crests
- Badges display national coefficient weights, school crests, and semester ranks.
- Style: Solid fill `#F1F5F9`, text `#334155`, border `1px solid #E2E8F0`, padding `2px 6px`, font `label-sm`.

### 6. Breadcrumbs
- Placed on the top application chrome. Rendered in `body-sm`. Delimiters use forward slashes `/` in `#94A3B8`. Active terminal page is weighted `600` in `#0F172A`.

### 7. Modal Dialogs
- Headers use `#0A1D3D` background with white header typography for critical destructive confirmations, or standard white background with bottom border `1px solid #E2E8F0` for general record additions.
- Footers feature right-aligned actions with the Primary Action strictly positioned on the far right.