const problemsetSubstring = 'leetcode.com/problemset';

/* eslint-disable no-undef */
const changeExtensionIcon = (path) => { chrome.browserAction.setIcon({ path }); };
/* eslint-disable no-unused-vars */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'updateIcon') {
    const { value } = msg;
    if (value === 'rotate') {
      const { rotatePosition } = msg;
      changeExtensionIcon(`./assets/loadingIcons/${rotatePosition}.png`);
    } else if (value === 'ready') {
      changeExtensionIcon('./assets/readyIcon.png');
    }
  }
});


// Background script
const tabToUrl = {};
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Note: this event is fired twice:
  // Once with `changeInfo.status` = "loading" and another time with "complete"
  tabToUrl[tabId] = tab.url;
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // Remove information for non-existent tab
  const url = tabToUrl[tabId];
  delete tabToUrl[tabId];

  let hasLeetcodeTab = false;
  Object.keys(tabToUrl).forEach((key) => {
    if (tabToUrl[key].includes(problemsetSubstring)) {
      hasLeetcodeTab = true;
    }
  });

  if (url && url.includes(problemsetSubstring) && !hasLeetcodeTab) {
    changeExtensionIcon('./assets/defaultIcon.png');
  }
});
