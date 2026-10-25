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

  // 1. Get current active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;
    
    if (!tab || !tab.url) {
      updateStatus('error', 'Cannot access current page tab.', true);
      return;
    }

    const url = tab.url;
    
    if (url.includes('dndbeyond.com/characters/')) {
      pageType = 'character';
      // Try to parse character ID
      const match = url.match(/\/characters\/(\d+)/);
      const charId = match ? match[1] : 'Unknown ID';
      updateStatus('ready', `Found D&D Beyond <strong>Character Sheet</strong> (ID: ${charId}). Ready to export.`);
    } else if (url.includes('dndbeyond.com/monsters/')) {
      pageType = 'monster';
      // Parse monster slug
      const parts = url.split('/');
      const slug = parts[parts.length - 1] || parts[parts.length - 2];
      const nameFormatted = slug.replace(/\d+-/, '').replace(/-/g, ' ');
      const monsterName = nameFormatted.replace(/\b\w/g, c => c.toUpperCase());
      updateStatus('ready', `Found D&D Beyond <strong>Monster Stat Block</strong> (${monsterName}). Ready to export.`);
    } else if (url.includes('dndbeyond.com/magic-items/') || url.includes('dndbeyond.com/equipment/')) {
      pageType = 'item';
      const parts = url.split('/');
      const slug = parts[parts.length - 1] || parts[parts.length - 2];
      const nameFormatted = slug.replace(/\d+-/, '').replace(/-/g, ' ');
      const itemName = nameFormatted.replace(/\b\w/g, c => c.toUpperCase());
      updateStatus('ready', `Found D&D Beyond <strong>Item</strong> (${itemName}). Ready to export.`);
    } else {
      updateStatus('error', 'Please navigate to a D&D Beyond Character, Monster, or Item page to use this exporter.', true);
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
    const label = pageType === 'character' ? 'Character' : pageType === 'monster' ? 'Monster' : 'Item';
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
        
        // Remove listener after receive response
        chrome.runtime.onMessage.removeListener(statusListener);
      }
    };
    chrome.runtime.onMessage.addListener(statusListener);

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
