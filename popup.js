chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
window.close(); // Close the popup immediately