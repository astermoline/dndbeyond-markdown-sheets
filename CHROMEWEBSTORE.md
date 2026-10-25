# Chrome Web Store Metadata: Down Beyond

**Last Updated:** 2026-10-24
**Extension Name:** Down Beyond
**Version:** 1.0.0

## Store Listing Metadata

### Short Description
Export character sheets, monster stat blocks, items, spells, and sourcebook chapters from D&D Beyond to clean Markdown with YAML frontmatter.

### Detailed Description
Easily export your D&D Beyond player characters, monster stat blocks, magic items, spells, and book chapters as clean Markdown files! 

This extension exports your D&D Beyond content to Markdown with structured YAML frontmatter, creating uniform notes for your Obsidian vault, NotebookLM, or Archivist.AI campaign.

**Features:**
- **One-Click Export**: Click the extension icon and select "Export Markdown" or use the in-page quick-action button on any D&D Beyond character sheet, monster stat block, magic item, spell, or sourcebook chapter page.
- **Player Character Export**: Automatically fetches your character data from the D&D Beyond character service, computes final ability scores, resolves equipped inventory, skills, saving throws, active class features, racial traits, feats, and spell lists from all sources.
- **NPC & Monster Export**: Parses both 2014 and 2024 monster layout elements directly from D&D Beyond, capturing challenge ratings, AC, HP formulas, speeds, ability matrices, senses, traits, actions, legendary actions, and description blocks.
- **Magic Items & Equipment**: Exports equipment and magic item pages with rarity, attunement, properties, and full descriptions.
- **Spells**: Exports spell pages with level, school, casting time, range, components (with material notes), duration, concentration/ritual flags, attack/save, damage/effect, and casting classes.
- **Sourcebook & Rules Content Chapters**: Exports complete book chapters and compendium articles with preserved headings, tables, callouts, and images, ideal for notebook references.
- **Universal Markdown Schema**: Generates clean markdown with structured YAML frontmatter, keeping all your campaign notes, spells, chapters, and stat blocks consistent.

### Category
Productivity

## Permissions Justification

Every permission listed in `manifest.json` is justified below for the Web Store review team:

| Permission / Host | Type | Justification / Purpose |
|-------------------|------|-------------------------|
| `activeTab` | Permission | Needed to query the current active tab's URL to verify if the user is on a D&D Beyond page and inject the exporter script upon user gesture. |
| `scripting` | Permission | Needed to programmatically inject the exporter content script into the active tab when the user clicks the "Export Markdown" button. |
| `https://www.dndbeyond.com/characters/*` | Host Permission | Needed to run the content script and interact with character sheet pages. |
| `https://www.dndbeyond.com/monsters/*` | Host Permission | Needed to run the content script and scrape monster stat blocks. |
| `https://www.dndbeyond.com/magic-items/*` | Host Permission | Needed to run the content script and extract magic item details. |
| `https://www.dndbeyond.com/spells/*` | Host Permission | Needed to run the content script and scrape spell details. |
| `https://www.dndbeyond.com/sources/*` | Host Permission | Needed to run the content script and extract book chapters and compendium articles. |
| `https://character-service.dndbeyond.com/*` | Host Permission | Needed to load structured character JSON from D&D Beyond's character service. |
| `https://monster-service.dndbeyond.com/*` | Host Permission | Needed to load structured monster JSON from D&D Beyond's monster service. |

## Privacy & Data Use

- **Data Collected**: This extension does not collect, transmit, or store any personal data.
- **Data Usage**: Character sheets, monster pages, item pages, spell pages, and source chapters are parsed entirely locally within your browser context. The resulting markdown file is downloaded directly to your local downloads folder. No data is sent to external servers or third-party services.
- **Authentication**: The extension relies on your active browser session on dndbeyond.com and does not collect or see your login credentials.

## Version History

### v1.0.0 (2026-10-24)
- Rewritten with Vite and modern TypeScript architecture.
- Modularized parser using `@astermoe/dndbeyond-parser`.
- Added support for 2024 and 2014 D&D Beyond monster stat blocks.
- Added Magic Items & Equipment export.
- Added Spells export.
- Added Sourcebook Chapter & Content page export.
- Generates clean Markdown with structured YAML frontmatter.
