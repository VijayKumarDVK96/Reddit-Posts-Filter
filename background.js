// background.js
const action = (typeof browser !== 'undefined' && browser.browserAction)
    ? browser.browserAction
    : (chrome.action || chrome.browserAction);

action.onClicked.addListener(() => {
    const url = (typeof browser !== 'undefined')
        ? browser.runtime.getURL("popup.html")
        : chrome.runtime.getURL("popup.html");
    if (typeof browser !== 'undefined') {
        browser.tabs.create({ url });
    } else {
        chrome.tabs.create({ url });
    }
});