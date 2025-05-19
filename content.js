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

// Observe for new posts being loaded dynamically
const observer = new MutationObserver(() => {
  chrome.storage.local.get(['blacklist'], result => {
    const blacklist = result.blacklist || [];
    hideMatchingPosts(blacklist);
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial load
chrome.storage.local.get(['blacklist'], result => {
  const blacklist = result.blacklist || [];
  hideMatchingPosts(blacklist);
});


if (typeof browser !== 'undefined') {
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.blacklist) {
      blacklist = (changes.blacklist.newValue || []).map(k => k.toLowerCase().trim()).sort();
      console.log('Blacklist updated:', blacklist);
      hideMatchingPosts();
    }
  });
} else {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.blacklist) {
      blacklist = (changes.blacklist.newValue || []).map(k => k.toLowerCase().trim()).sort();
      console.log('Blacklist updated:', blacklist);
      hideMatchingPosts();
    }
  });
}