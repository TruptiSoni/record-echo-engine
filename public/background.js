
// Background script for the Screen Recorder Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Screen Recorder Extension Installed');
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTabId") {
    sendResponse({ tabId: sender.tab?.id });
  }
  return true;
});

