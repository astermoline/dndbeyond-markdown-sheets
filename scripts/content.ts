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
  fetchSpellTooltipJson,
  extractSpellId,
  parseSpellDom,
  spellToMarkdown,
  parseSourceDom,
  sourceToMarkdown,
} from '@astermoe/dndbeyond-parser';

(() => {
  if ((window as any).__DOWN_BEYOND_CONTENT_LOADED__) return;
  (window as any).__DOWN_BEYOND_CONTENT_LOADED__ = true;

  const ICON_URL = chrome.runtime.getURL('icons/icon48.png');

  // 1. Inject Styles
  function injectStyles() {
    if (document.getElementById('down-beyond-styles')) return;
    const style = document.createElement('style');
    style.id = 'down-beyond-styles';
    style.textContent = `
      /* --- Action Buttons --- */
      .down-beyond-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 20px;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none !important;
        box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        white-space: nowrap;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .down-beyond-btn:hover {
        filter: brightness(1.15);
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(234, 88, 12, 0.55);
      }
      .down-beyond-btn:active {
        transform: translateY(0);
      }
      .down-beyond-btn.loading {
        opacity: 0.8;
        pointer-events: none;
      }
      .down-beyond-btn-icon {
        width: 18px;
        height: 18px;
        object-fit: contain;
        filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.4));
      }

      /* --- Inline Header Container --- */
      .down-beyond-inline-container {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-left: 8px;
        vertical-align: middle;
      }

      /* --- Toast System --- */
      #down-beyond-toast-container {
        position: fixed;
        bottom: 84px;
        right: 24px;
        z-index: 1000000;
        display: flex;
        flex-direction: column-reverse;
        gap: 10px;
        pointer-events: none;
      }
      .down-beyond-toast {
        background: #1c1917;
        color: #f8fafc;
        border: 1px solid #ea580c;
        border-radius: 12px;
        padding: 12px 18px;
        font-size: 13px;
        font-weight: 500;
        font-family: 'Outfit', sans-serif, system-ui;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 14px rgba(234, 88, 12, 0.4);
        pointer-events: auto;
        animation: dbSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        transition: opacity 0.3s ease, transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
      }
      .down-beyond-toast.success {
        border-color: #10b981;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 14px rgba(16, 185, 129, 0.4);
      }
      .down-beyond-toast.error {
        border-color: #ef4444;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 14px rgba(239, 68, 68, 0.4);
      }
      .down-beyond-toast-fade {
        opacity: 0;
        transform: translateY(12px);
      }
      @keyframes dbSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // 2. Toast System
  function showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
    let container = document.getElementById('down-beyond-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'down-beyond-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `down-beyond-toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('down-beyond-toast-fade');
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  }

  // 3. Download Helper
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

  // 4. Exporter Engine
  function getDndBeyondEntity(rawUrl: string = window.location.href): { type: 'character' | 'monster' | 'item' | 'spell' | 'source'; idOrSlug: string } | null {
    try {
      const parsed = new URL(rawUrl);
      if (!parsed.hostname.includes('dndbeyond.com')) return null;

      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length < 2) return null;

      const section = segments[0].toLowerCase();
      const subpath = segments[1];

      if (section === 'characters') {
        if (/^\d+$/.test(subpath)) return { type: 'character', idOrSlug: subpath };
        return null;
      }

      if (section === 'monsters') {
        if (subpath) return { type: 'monster', idOrSlug: subpath };
        return null;
      }

      if (section === 'magic-items' || section === 'equipment') {
        if (subpath) return { type: 'item', idOrSlug: subpath };
        return null;
      }

      if (section === 'spells') {
        if (subpath) return { type: 'spell', idOrSlug: subpath };
        return null;
      }

      if (section === 'sources') {
        if (segments.length === 2 && segments[1].toLowerCase() === 'dnd') return null;
        if (segments.length >= 2) {
          const slug = segments[segments.length - 1];
          return { type: 'source', idOrSlug: slug };
        }
        return null;
      }

      return null;
    } catch {
      return null;
    }
  }

  // 4. Exporter Engine
  async function performExport(): Promise<{ name: string; entityType: string }> {
    const url = window.location.href;
    const entity = getDndBeyondEntity(url);
    if (!entity) {
      throw new Error('Please navigate to an individual D&D Beyond Character, Monster, Item, Spell, or Source Chapter page.');
    }

    // Character Sheet
    if (entity.type === 'character') {
      const charId = extractCharacterId(entity.idOrSlug) || parseInt(entity.idOrSlug, 10);
      const char = await fetchCharacterById(charId);
      const md = characterToMarkdown(char);
      const filename = `${sanitizeFilename(char.name)}.md`;
      downloadMarkdown(filename, md);
      return { name: char.name, entityType: 'character' };
    }

    // Monster Stat Block
    if (entity.type === 'monster') {
      const monsterId = extractMonsterId(url);
      let monster;
      if (monsterId) {
        try {
          monster = await fetchMonsterById(monsterId);
        } catch {
          monster = parseMonsterDom(document);
        }
      } else {
        monster = parseMonsterDom(document);
      }

      const md = monsterToMarkdown(monster);
      const filename = `${sanitizeFilename(monster.name)}.md`;
      downloadMarkdown(filename, md);
      return { name: monster.name, entityType: 'monster' };
    }

    // Magic Item or Equipment
    if (entity.type === 'item') {
      const itemId = extractItemId(url);
      let item;
      try {
        item = parseItemDom(document);
      } catch {
        if (itemId) {
          item = await fetchItemTooltipJson(itemId, { isMagicItem: url.includes('magic-items') });
        } else {
          item = parseItemDom(document);
        }
      }

      const md = itemToMarkdown(item);
      const filename = `${sanitizeFilename(item.name)}.md`;
      downloadMarkdown(filename, md);
      return { name: item.name, entityType: 'item' };
    }

    // Spell
    if (entity.type === 'spell') {
      const spellId = extractSpellId(url);
      let spell;
      try {
        spell = parseSpellDom(document);
      } catch {
        if (spellId) {
          spell = await fetchSpellTooltipJson(spellId);
        } else {
          spell = parseSpellDom(document);
        }
      }

      const md = spellToMarkdown(spell);
      const filename = `${sanitizeFilename(spell.name)}.md`;
      downloadMarkdown(filename, md);
      return { name: spell.name, entityType: 'spell' };
    }

    // Content Chapter / Sourcebook page
    if (entity.type === 'source') {
      const chapter = parseSourceDom(document, url);
      const md = sourceToMarkdown(chapter);
      const filename = `${sanitizeFilename(chapter.title)}.md`;
      downloadMarkdown(filename, md);
      return { name: chapter.title, entityType: 'source' };
    }

    throw new Error('Please navigate to an individual D&D Beyond Character, Monster, Item, Spell, or Source Chapter page.');
  }

  async function handleExportAction(button: HTMLButtonElement) {
    const originalText = button.innerHTML;
    button.classList.add('loading');
    button.disabled = true;
    button.innerHTML = `
      <img src="${ICON_URL}" class="down-beyond-btn-icon" />
      <span>Exporting...</span>
    `;

    try {
      showToast('📄 Generating Markdown...', 'info');
      const result = await performExport();
      showToast(`✅ Exported "${result.name}" as Markdown!`, 'success');
      chrome.runtime.sendMessage({
        type: 'EXPORT_STATUS',
        status: 'success',
        name: result.name,
        entityType: result.entityType,
      }).catch(() => {});
    } catch (err: any) {
      console.error('Down Beyond export error:', err);
      showToast(`❌ Export failed: ${err.message}`, 'error');
      chrome.runtime.sendMessage({
        type: 'EXPORT_STATUS',
        status: 'error',
        error: err.message,
      }).catch(() => {});
    } finally {
      button.innerHTML = originalText;
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  // 5. Shared Floating Actions Dock Support
  function getOrCreateFloatingDock(): HTMLElement {
    let dock = document.getElementById('dndbeyond-quick-actions-bar');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'dndbeyond-quick-actions-bar';
      dock.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(15, 17, 28, 0.94);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 30px;
        padding: 5px 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(234, 88, 12, 0.25);
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      `;

      const minIcon = document.createElement('img');
      minIcon.src = ICON_URL;
      minIcon.className = 'down-beyond-btn-icon dock-min-icon';
      minIcon.style.display = 'none';
      dock.appendChild(minIcon);

      const content = document.createElement('div');
      content.className = 'bar-content';
      content.style.cssText = 'display: flex; align-items: center; gap: 8px;';
      dock.appendChild(content);

      const minBtn = document.createElement('button');
      minBtn.innerHTML = '&minus;';
      minBtn.title = 'Minimize quick actions';
      minBtn.style.cssText = 'background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; line-height: 1; padding: 2px 4px;';
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dock!.classList.toggle('minimized');
        const isMin = dock!.classList.contains('minimized');
        minIcon.style.display = isMin ? 'block' : 'none';
      });
      dock.appendChild(minBtn);

      dock.addEventListener('click', () => {
        if (dock!.classList.contains('minimized')) {
          dock!.classList.remove('minimized');
          minIcon.style.display = 'none';
        }
      });

      document.body.appendChild(dock);
    }
    return dock.querySelector('.bar-content') || dock;
  }

  function cleanUpDockIfEmpty() {
    const dock = document.getElementById('dndbeyond-quick-actions-bar');
    if (dock) {
      const barContent = dock.querySelector('.bar-content');
      if (!barContent || barContent.children.length === 0) {
        dock.remove();
      }
    }
  }

  function removeInjectedButtons() {
    const dockBtn = document.getElementById('down-beyond-dock-btn');
    if (dockBtn) dockBtn.remove();

    const inlineBtn = document.getElementById('down-beyond-inline-btn');
    if (inlineBtn) {
      const container = inlineBtn.closest('.down-beyond-inline-container');
      if (container) container.remove();
      else inlineBtn.remove();
    }

    cleanUpDockIfEmpty();
  }

  // 6. Inject Floating Button for Down Beyond
  function injectFloatingAction() {
    const entity = getDndBeyondEntity();
    if (!entity) return;

    if (document.getElementById('down-beyond-dock-btn')) return;

    const dockContent = getOrCreateFloatingDock();

    const btn = document.createElement('button');
    btn.id = 'down-beyond-dock-btn';
    btn.className = 'down-beyond-btn';
    btn.innerHTML = `
      <img src="${ICON_URL}" class="down-beyond-btn-icon" alt="Down Beyond" />
      <span>Export .md</span>
    `;
    btn.title = 'Export Markdown sheet via Down Beyond';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleExportAction(btn);
    });

    dockContent.appendChild(btn);
  }

  // 7. Inject Inline Header Buttons
  function injectInlineHeader() {
    const entity = getDndBeyondEntity();
    if (!entity) return;

    if (document.getElementById('down-beyond-inline-btn')) return;

    let targetContainer: Element | null = null;
    if (entity.type === 'character') {
      targetContainer =
        document.querySelector('.ct-character-header-desktop__actions') ||
        document.querySelector('.ct-character-tidbits__name') ||
        document.querySelector('.ct-character-sheet-desktop__header');
    } else if (entity.type === 'monster') {
      targetContainer =
        document.querySelector('.page-heading__content') ||
        document.querySelector('.mon-stat-block__name') ||
        document.querySelector('.page-heading');
    } else if (entity.type === 'item') {
      targetContainer =
        document.querySelector('.page-heading__content') ||
        document.querySelector('.page-heading') ||
        document.querySelector('.item-details');
    } else if (entity.type === 'spell') {
      targetContainer =
        document.querySelector('.page-heading__content') ||
        document.querySelector('.spell-details') ||
        document.querySelector('.page-heading');
    } else if (entity.type === 'source') {
      targetContainer =
        document.querySelector('.page-heading__content') ||
        document.querySelector('.page-heading') ||
        document.querySelector('.p-article-header') ||
        document.querySelector('.compendium-page-header') ||
        document.querySelector('h1.compendium-hr')?.parentElement ||
        document.querySelector('.p-article-title')?.parentElement;
    }

    if (!targetContainer) return;

    const container = document.createElement('div');
    container.className = 'down-beyond-inline-container';

    const btn = document.createElement('button');
    btn.id = 'down-beyond-inline-btn';
    btn.className = 'down-beyond-btn';
    btn.innerHTML = `
      <img src="${ICON_URL}" class="down-beyond-btn-icon" alt="Down Beyond" />
      <span>Export .md</span>
    `;
    btn.title = 'Export to Markdown';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleExportAction(btn);
    });
    container.appendChild(btn);

    targetContainer.appendChild(container);
  }

  // 8. Message Listener (from Popup)
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'EXPORT_MARKDOWN' || message.type === 'START_EXPORT') {
      performExport()
        .then((result) => {
          showToast(`✅ Exported "${result.name}" as Markdown!`, 'success');
          sendResponse({ success: true, name: result.name, entityType: result.entityType });
        })
        .catch((err) => {
          showToast(`❌ Export failed: ${err.message}`, 'error');
          sendResponse({ success: false, error: err.message });
        });
      return true; // Keep async response channel open
    }
  });

  // 9. Lifecycle & Observer
  function checkAndInjectAll() {
    const entity = getDndBeyondEntity();
    if (!entity) {
      removeInjectedButtons();
      return;
    }
    injectFloatingAction();
    injectInlineHeader();
  }

  injectStyles();
  checkAndInjectAll();

  // SPA navigation support
  window.addEventListener('popstate', checkAndInjectAll);
  const origPushState = history.pushState;
  history.pushState = function (...args) {
    const res = origPushState.apply(this, args);
    checkAndInjectAll();
    return res;
  };
  const origReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    const res = origReplaceState.apply(this, args);
    checkAndInjectAll();
    return res;
  };

  const observer = new MutationObserver(() => {
    checkAndInjectAll();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
