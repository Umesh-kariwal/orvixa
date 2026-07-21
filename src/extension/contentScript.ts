// Chrome Extension Content Script
// Injects Orvixa Shadow DOM Host into host website cleanly.

(() => {
  if (document.getElementById('orvixa-extension-root')) {
    return; // Prevent duplicate injection
  }

  const hostDiv = document.createElement('div');
  hostDiv.id = 'orvixa-extension-root';
  document.body.appendChild(hostDiv);

  console.log('[Orvixa Extension] Shadow DOM Host successfully mounted.');
})();
