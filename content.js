function getPostTitle(postElement) {
  const faceplateContent = postElement.querySelector('faceplate-screen-reader-content');
  return faceplateContent?.textContent?.toLowerCase() || '';
}

function hideMatchingPosts(blacklist) {
  const posts = document.querySelectorAll('shreddit-post');

  posts.forEach(post => {
    const title = getPostTitle(post);
    if (blacklist.some(keyword => title.includes(keyword.toLowerCase()))) {
      post.style.display = 'none';
    }
  });
}

function loadAndApplyBlacklist() {
  chrome.storage.local.get(['blacklist'], result => {
    const blacklist = result.blacklist || [];
    hideMatchingPosts(blacklist);
  });
}

// Observe for new posts being loaded dynamically
const observer = new MutationObserver(() => {
  loadAndApplyBlacklist();
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial run
loadAndApplyBlacklist();

// Listen for changes to the blacklist and apply them
function handleStorageChange(changes, area) {
  if (area === 'local' && changes.blacklist) {
    const updatedBlacklist = (changes.blacklist.newValue || []).map(k => k.toLowerCase().trim());
    hideMatchingPosts(updatedBlacklist);
  }
}

if (typeof browser !== 'undefined') {
  browser.storage.onChanged.addListener(handleStorageChange);
} else {
  chrome.storage.onChanged.addListener(handleStorageChange);
}