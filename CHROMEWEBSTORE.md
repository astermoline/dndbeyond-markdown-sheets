# Chrome Web Store Metadata: D&D Beyond Markdown Sheets

**Last Updated:** 2026-06-15
**Extension Name:** D&D Beyond Markdown Sheets
**Version:** 1.0.0

## Store Listing Metadata

### Short Description
Export character sheets and monster stat blocks from D&D Beyond to Foundry-compatible Markdown.

### Detailed Description
Easily export your D&D Beyond player characters and monster stat blocks as clean Markdown files! 

This extension integrates directly with your browser to generate markdown files formatted exactly like those used in the Foundry VTT Markdown Sheets module.

**Features:**
- **One-Click Export**: Click the extension icon and select "Export Markdown" on any D&D Beyond character sheet or monster stat block page.
- **Player Character Export**: Automatically fetches your character data from the D&D Beyond character service, computes final ability scores, resolves equipped inventory, skills, saving throws, active class features, racial traits, feats, and spell lists.
- **NPC & Monster Export**: Parsers the new 2024 monster layout elements directly from the D&D Beyond page, capturing challenge ratings, AC, HP formulas, speeds, ability matrices, senses, traits, actions, legendary actions, and description blocks.
- **Foundry VTT Compatible**: Generates markdown with YAML frontmatter structure matching the `foundry-markdown-sheets` format for seamless import.

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
