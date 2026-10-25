import {
  fetchCharacterById,
  extractCharacterId,
  characterToMarkdown,
  fetchMonsterById,
  extractMonsterId,
  parseMonsterDom,
  monsterToMarkdown,
  fetchItemTooltipJson,
  extractItemId,
  parseItemDom,
  itemToMarkdown,
} from '@astermoe/dndbeyond-parser';

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '').trim() || 'export';
}

async function runExporter() {
  const url = window.location.href;

  try {
    // 1. Character Sheet
    if (url.includes('dndbeyond.com/characters/')) {
      const charId = extractCharacterId(url);
      const char = await fetchCharacterById(charId);
      const md = characterToMarkdown(char);
      const filename = `${sanitizeFilename(char.name)}.md`;
      downloadMarkdown(filename, md);
      chrome.runtime.sendMessage({ type: 'EXPORT_STATUS', status: 'success', name: char.name, entityType: 'character' });
      return;
    }

    // 2. Monster Stat Block
    if (url.includes('dndbeyond.com/monsters/')) {
      const monsterId = extractMonsterId(url);
      let monster;
      if (monsterId) {
        try {
          monster = await fetchMonsterById(monsterId);
        } catch {
          // Fall back to DOM parsing if API fails (e.g. unlisted/homebrew)
          monster = parseMonsterDom(document);
        }
      } else {
        monster = parseMonsterDom(document);
      }

      const md = monsterToMarkdown(monster);
      const filename = `${sanitizeFilename(monster.name)}.md`;
      downloadMarkdown(filename, md);
      chrome.runtime.sendMessage({ type: 'EXPORT_STATUS', status: 'success', name: monster.name, entityType: 'monster' });
      return;
    }

    // 3. Magic Items & Equipment
    if (url.includes('dndbeyond.com/magic-items/') || url.includes('dndbeyond.com/equipment/')) {
      const itemId = extractItemId(url);
      let item;
      if (itemId) {
        try {
          item = await fetchItemTooltipJson(itemId, { isMagicItem: url.includes('magic-items') });
        } catch {
          item = parseItemDom(document);
        }
      } else {
        item = parseItemDom(document);
      }

      const md = itemToMarkdown(item);
      const filename = `${sanitizeFilename(item.name)}.md`;
      downloadMarkdown(filename, md);
      chrome.runtime.sendMessage({ type: 'EXPORT_STATUS', status: 'success', name: item.name, entityType: 'item' });
      return;
    }

    chrome.runtime.sendMessage({
      type: 'EXPORT_STATUS',
      status: 'error',
      error: 'Please navigate to a D&D Beyond Character, Monster, or Item page.',
    });
  } catch (err: any) {
    console.error('Export failed:', err);
    chrome.runtime.sendMessage({
      type: 'EXPORT_STATUS',
      status: 'error',
      error: err.message || 'Unknown export error occurred.',
    });
  }
}

// Execute export
runExporter();
