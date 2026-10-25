document.addEventListener('DOMContentLoaded', async () => {
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const exportBtn = document.getElementById('export-btn');

  let activeTab = null;
  let pageType = null; // 'character' or 'monster'
  let pageName = '';

  // Helper to update status UI
  function updateStatus(state, htmlText, disableButton = false) {
    statusIndicator.className = 'status-indicator';
    if (state) statusIndicator.classList.add(state);
    statusText.innerHTML = htmlText;
    
    if (disableButton) {
      exportBtn.classList.add('disabled');
      exportBtn.disabled = true;
    } else {
      exportBtn.classList.remove('disabled');
      exportBtn.disabled = false;
    }
  }

  function getDndBeyondEntity(rawUrl) {
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

  // 1. Get current active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;
    
    if (!tab || !tab.url) {
      updateStatus('error', 'Cannot access current page tab.', true);
      return;
    }

    const entity = getDndBeyondEntity(tab.url);
    if (!entity) {
      updateStatus('error', 'Please navigate to an individual D&D Beyond Character, Monster, Item, Spell, or Source Chapter page to export.', true);
      return;
    }

    pageType = entity.type;
    if (entity.type === 'character') {
      updateStatus('ready', `Found D&D Beyond <strong>Character Sheet</strong> (ID: ${entity.idOrSlug}). Ready to export.`);
    } else if (entity.type === 'monster') {
      const nameFormatted = entity.idOrSlug.replace(/^\d+-/, '').replace(/-/g, ' ');
      const monsterName = nameFormatted.replace(/\b\w/g, c => c.toUpperCase());
      updateStatus('ready', `Found D&D Beyond <strong>Monster Stat Block</strong> (${monsterName}). Ready to export.`);
    } else if (entity.type === 'item') {
      const nameFormatted = entity.idOrSlug.replace(/^\d+-/, '').replace(/-/g, ' ');
      const itemName = nameFormatted.replace(/\b\w/g, c => c.toUpperCase());
      updateStatus('ready', `Found D&D Beyond <strong>Item</strong> (${itemName}). Ready to export.`);
    } else if (entity.type === 'spell') {
      const nameFormatted = entity.idOrSlug.replace(/^\d+-/, '').replace(/-/g, ' ');
      const spellName = nameFormatted.replace(/\b\w/g, c => c.toUpperCase());
      updateStatus('ready', `Found D&D Beyond <strong>Spell</strong> (${spellName}). Ready to export.`);
    } else if (entity.type === 'source') {
      const nameFormatted = entity.idOrSlug.replace(/^\d+-/, '').replace(/-/g, ' ');
      const chapterName = nameFormatted.replace(/\b\w/g, c => c.toUpperCase());
      updateStatus('ready', `Found D&D Beyond <strong>Content Chapter</strong> (${chapterName}). Ready to export.`);
    }
  } catch (err) {
    console.error("Popup initialization error:", err);
    updateStatus('error', 'Failed to read page state.', true);
  }

  // 2. Handle button click
  exportBtn.addEventListener('click', async () => {
    if (!activeTab || !pageType) return;

    // Show loading UI
    exportBtn.classList.add('loading');
    exportBtn.disabled = true;
    const label = pageType === 'character' ? 'Character' : pageType === 'monster' ? 'Monster' : pageType === 'item' ? 'Item' : pageType === 'spell' ? 'Spell' : 'Chapter';
    updateStatus('loading', `Exporting <strong>${label}</strong>... Please wait.`);

    // Set up message listener for status updates
    const statusListener = (message, sender, sendResponse) => {
      if (message.type === 'EXPORT_STATUS') {
        exportBtn.classList.remove('loading');
        
        if (message.status === 'success') {
          updateStatus('ready', `Successfully exported <strong>${message.name}</strong> as Markdown!`);
          
          // Briefly highlight status card as success
          const card = document.getElementById('status-card');
          card.style.borderColor = '#10b981';
          card.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.2)';
          setTimeout(() => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
          }, 3000);
          
          exportBtn.disabled = false;
        } else {
          updateStatus('error', `Failed to export: ${message.error}`);
          exportBtn.disabled = false;
        }
        
        chrome.runtime.onMessage.removeListener(statusListener);
      }
    };
    chrome.runtime.onMessage.addListener(statusListener);

    // Try messaging existing content script first
    try {
      const res = await chrome.tabs.sendMessage(activeTab.id, { action: 'EXPORT_MARKDOWN' });
      if (res && res.success) {
        exportBtn.classList.remove('loading');
        updateStatus('ready', `Successfully exported <strong>${res.name}</strong> as Markdown!`);
        exportBtn.disabled = false;
        chrome.runtime.onMessage.removeListener(statusListener);
        return;
      }
    } catch {
      // Content script not yet active on page, fall back to executeScript
    }

    // Inject content script to perform the export
    try {
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['scripts/content.js']
      });
    } catch (err) {
      console.error("Failed to inject script:", err);
      updateStatus('error', `Inject script failed. Reload page and try again.`, false);
      exportBtn.classList.remove('loading');
      exportBtn.disabled = false;
      chrome.runtime.onMessage.removeListener(statusListener);
    }
  });
});
