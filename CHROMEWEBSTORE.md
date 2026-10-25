# Chrome Web Store Metadata: D&D Beyond Markdown Sheets

**Last Updated:** 2026-06-15
**Extension Name:** D&D Beyond Markdown Sheets
**Version:** 1.0.0

## Store Listing Metadata

### Short Description
Export character sheets, monster stat blocks, and items from D&D Beyond to Markdown formatted for the Foundry VTT Markdown Sheets module and Obsidian.

### Detailed Description
Easily export your D&D Beyond player characters, monster stat blocks, and magic items as clean Markdown files! 

This extension integrates directly with your browser to generate markdown files with YAML frontmatter formatted specifically for the [Foundry VTT Markdown Sheets](https://github.com/nickmoline/foundry-markdown-sheets) module (since Foundry does not natively speak markdown), as well as Obsidian and other campaign notebooks.

**Features:**
- **One-Click Export**: Click the extension icon and select "Export Markdown" on any D&D Beyond character sheet, monster stat block, or magic item page.
- **Player Character Export**: Automatically fetches your character data from the D&D Beyond character service, computes final ability scores, resolves equipped inventory, skills, saving throws, active class features, racial traits, feats, and spell lists from all sources.
- **NPC & Monster Export**: Parses both 2014 and 2024 monster layout elements directly from D&D Beyond, capturing challenge ratings, AC, HP formulas, speeds, ability matrices, senses, traits, actions, legendary actions, and description blocks.
- **Magic Items & Equipment**: Exports equipment and magic item pages with rarity, attunement, properties, and full descriptions.
- **Formatted for `foundry-markdown-sheets`**: Generates markdown with YAML frontmatter specifically structured for the `foundry-markdown-sheets` Foundry VTT module, enabling Foundry to load and render character sheets from Markdown.

### Category
Productivity

## Permissions Justification

Every permission listed in `manifest.json` is justified below for the Web Store review team:

| Permission / Host | Type | Justification / Purpose |
|-------------------|------|-------------------------|
| `activeTab` | Permission | Needed to query the current active tab's URL to verify if the user is on a D&D Beyond page and inject the exporter script upon user gesture. |
| `scripting` | Permission | Needed to programmatically inject the exporter content script (`content.js`) into the active tab when the user clicks the "Export Markdown" button. |
| `https://www.dndbeyond.com/characters/*` | Host Permission | Needed to run the content script and scrape/interact with the character sheet pages. |
| `https://www.dndbeyond.com/monsters/*` | Host Permission | Needed to run the content script and scrape the monster stat block DOM. |
| `https://character-service.dndbeyond.com/*` | Host Permission | Needed to perform fetches to the public D&D Beyond character service API, allowing the content script to load the complete structured character JSON. |

## Privacy & Data Use

- **Data Collected**: This extension does not collect, transmit, or store any personal data.
- **Data Usage**: Character sheets and monster pages are parsed entirely locally within your browser context. The resulting markdown file is downloaded directly to your local downloads folder. No data is sent to external servers or third-party services.
- **Authentication**: The extension relies on your active browser session on dndbeyond.com and does not collect or see your login credentials.

## Version History

### v1.0.0 (2026-06-15)
- Initial release.
- Added popup action UI.
- Implemented PC JSON exporter parsing skills, stats, inventory, feats, features, and spells.
- Implemented NPC scraper for the D&D Beyond 2024 monster layout.
