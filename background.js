// background.js

// Use Firefox-compatible API
const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;

// Default blacklist
let blacklist = [];

// Helper: Load blacklist from storage
function loadBlacklist() {
    return new Promise(resolve => {
        storage.local.get(['blacklist'], result => {
            blacklist = (result.blacklist || []).map(k => k.toLowerCase().trim());
            resolve(blacklist);
        });
    });
}

// Check if a string contains a blacklisted keyword
function isBlacklisted(text) {
    return blacklist.some(keyword => text.toLowerCase().includes(keyword));
}

// Hide post if it matches the blacklist
function hideMatchingPosts() {
    const posts = document.querySelectorAll('div[data-testid="post-container"]');
    posts.forEach(post => {
        if (!post.dataset.checked) {
            post.dataset.checked = 'true'; // Prevent duplicate processing

            const titleEl = post.querySelector('h3');
            if (titleEl && isBlacklisted(titleEl.textContent)) {
                post.style.display = 'none';
                console.log(`Hide post: "${titleEl.textContent}"`);
            }
        }
    });
}

// Set up a MutationObserver to monitor new posts loading
function observePostChanges() {
    const observer = new MutationObserver(() => {
        hideMatchingPosts();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('Reddit Post Filter: MutationObserver active.');
}

// Initialize script
async function init() {
    console.log('Reddit Post Filter: Initializing...');
    await loadBlacklist();
    hideMatchingPosts();
    observePostChanges();
}

// Respond to storage changes in real-time
if (typeof browser !== 'undefined') {
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.blacklist) {
            blacklist = (changes.blacklist.newValue || []).map(k => k.toLowerCase().trim());
            console.log('Blacklist updated:', blacklist);
            hideMatchingPosts();
        }
    });
} else {
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.blacklist) {
            blacklist = (changes.blacklist.newValue || []).map(k => k.toLowerCase().trim());
            console.log('Blacklist updated:', blacklist);
            hideMatchingPosts();
        }
    });
}

// Start
init();

browser.browserAction.onClicked.addListener(() => {
    browser.tabs.create({
        url: browser.runtime.getURL("popup.html")
    });
});