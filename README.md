# D&D Beyond Markdown Sheets

Chrome Extension (Manifest V3) that exports D&D Beyond Player Characters, Monster Stat Blocks, and Magic Items / Equipment into Markdown files with YAML frontmatter. The export schema matches the format used by the [Foundry VTT Markdown Sheet Exporter](https://github.com/nickmoline/foundry-markdown-sheets) module, creating uniform notes for [Obsidian](https://obsidian.md), NotebookLM, and [Archivist.AI](https://myarchivist.ai).

---

## Features

- **Character Export**: Complete character sheets (stats, saving throws, skills, inventory with equipped items & weights, features, spells from all sources, spell slots, and backstory) to `<CharacterName>.md`.
- **Monster / NPC Export**: Parses both classic (2014) and modern (2024) monster layouts with accurate AC, HP formulas, ability matrices, saving throws, actions, traits, reactions, legendary actions, and descriptions to `<MonsterName>.md`.
- **Item Export**: Exports equipment and magic items directly from item pages or character sheets to `<ItemName>.md`.
- **Unified Markdown Schema**: Produces Markdown and YAML frontmatter matching the schema of the [`foundry-markdown-sheets`](https://github.com/nickmoline/foundry-markdown-sheets) Foundry VTT module, so your exported sheets from D&D Beyond and Foundry VTT share the exact same format in your Obsidian vault or campaign notebooks.

---

## Development & Building

### Prerequisites

Node.js 18+ and npm.

### Setup & Build

```bash
npm install
npm run build
```

This compiles the extension into the `dist/` directory using Vite.

### Loading in Google Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the `dist/` folder inside this directory (`dndbeyond-markdown-sheets/dist`).
5. Navigate to any D&D Beyond character sheet, monster stat block, or magic item page and click the extension icon to export!

---

## Architecture

This extension consumes [`@astermoe/dndbeyond-parser`](https://github.com/astermoline/dndbeyond-parser) for data extraction and Markdown generation.

---

## License

MIT © [Aster Moline](https://aster.quest) ([@astermoline](https://github.com/astermoline))
