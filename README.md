# Down Beyond

Chrome Extension (Manifest V3) that exports D&D Beyond Player Characters, Monster Stat Blocks, Magic Items / Equipment, and Spells into clean Markdown files with YAML frontmatter, creating uniform notes for [Obsidian](https://obsidian.md), NotebookLM, and [Archivist.AI](https://myarchivist.ai).

---

## Features

- **Character Export**: Complete character sheets (stats, saving throws, skills, inventory with equipped items & weights, features, spells from all sources, spell slots, and backstory) to `<CharacterName>.md`.
- **Monster / NPC Export**: Parses both classic (2014) and modern (2024) monster layouts with accurate AC, HP formulas, ability matrices, saving throws, actions, traits, reactions, legendary actions, and descriptions to `<MonsterName>.md`.
- **Item Export**: Exports equipment and magic items directly from item pages or character sheets to `<ItemName>.md`.
- **Spell Export**: Exports standalone spell pages directly to clean `<SpellName>.md` files with level, school, casting time, range, components (with material notes), duration, concentration/ritual status, attack/save, damage/effect, and class lists.
- **Sourcebook & Content Chapter Export**: Exports any book chapter or rules content page (e.g., Character Origins, Classes, Rules Glossary) directly to clean Markdown with headings, tables, callouts, and images preserved for notebooks and vaults to `<ChapterName>.md`.
- **Universal Markdown Schema**: Produces clean Markdown and structured YAML frontmatter, ensuring your exported sheets, spells, stat blocks, and chapters integrate seamlessly into Obsidian vaults, NotebookLM, Archivist, or any markdown-based campaign repository.

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
5. Navigate to any D&D Beyond character sheet, monster stat block, magic item, spell, or sourcebook chapter page and click the extension icon to export!

---

## Architecture

This extension consumes [`@astermoe/dndbeyond-parser`](https://github.com/astermoline/dndbeyond-parser) for data extraction and Markdown generation.

---

## License

MIT © [Aster Moline](https://aster.quest) ([@astermoline](https://github.com/astermoline))
