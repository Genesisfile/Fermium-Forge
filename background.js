// This service worker can be used for background tasks if needed.
// For now, it's used to satisfy Manifest V3 requirements.
// The primary logic for opening the app in a new tab is in popup.js.

// Example of a minimal listener if direct opening was desired from background script:
// chrome.action.onClicked.addListener((tab) => {
//   chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
// });
