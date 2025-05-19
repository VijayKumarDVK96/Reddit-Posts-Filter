// popup.js
console.log('🧹 Reddit Filter popup.js loaded');

const keywordInput = document.getElementById('keywordInput');
const addBtn = document.getElementById('addBtn');
const blacklistEl = document.getElementById('blacklist');
const blacklistPlaceholder = document.getElementById('blacklist_placeholder');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');
const alphabetFilter = document.getElementById('alphabet-filter');
const alphaBtns = document.querySelectorAll('.alpha-btn');

let currentLetter = 'all';
let currentKeywords = [];

function renderList(keywords) {
  blacklistEl.innerHTML = '';

  let filtered = keywords;
  if (currentLetter !== 'all') {
    filtered = keywords.filter(word => word[0] && word[0].toUpperCase() === currentLetter);
  }

  if (filtered.length > 1) {
    blacklistPlaceholder.style.display = 'none';
    blacklistEl.classList.add('blacklist');
  } else {
    blacklistPlaceholder.style.display = '';
    blacklistEl.classList.remove('blacklist');
  }

  filtered.sort((a, b) => a.localeCompare(b));
  
  filtered.forEach((word, i) => {
    const li = document.createElement('li');
    li.textContent = word.toLowerCase();
    const del = document.createElement('button');
    del.textContent = '❌';
    del.style.marginLeft = '8px';
    del.onclick = () => {
      // Remove from the main list, not just filtered
      const idx = currentKeywords.indexOf(word);
      if (idx > -1) {
        currentKeywords.splice(idx, 1);
        chrome.storage.local.set({ blacklist: currentKeywords }, () => renderList(currentKeywords));
      }
    };
    li.appendChild(del);
    blacklistEl.appendChild(li);
  });
}

function loadAndRender() {
  chrome.storage.local.get(['blacklist'], result => {
    currentKeywords = Array.isArray(result.blacklist) ? result.blacklist : [];
    console.log('Loaded blacklist:', currentKeywords);
    renderList(currentKeywords);
  });
}

// Add new keyword
addBtn.onclick = () => {
  const word = keywordInput.value.trim();
  if (!word) return;
  chrome.storage.local.get(['blacklist'], result => {
    const list = result.blacklist || [];
    if (!list.includes(word)) {
      list.push(word);
      chrome.storage.local.set({ blacklist: list }, () => {
        currentKeywords = list;
        renderList(list);
        keywordInput.value = '';
      });
    }
  });
};

// Export JSON
exportBtn.onclick = () => {
  chrome.storage.local.get(['blacklist'], result => {
    const data = JSON.stringify(result.blacklist || []);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blacklist.json';
    a.click();
    URL.revokeObjectURL(url);
  });
};

// Trigger file chooser
importBtn.onclick = () => importInput.click();

// Import JSON
importInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const data = JSON.parse(event.target.result);
      if (!Array.isArray(data)) {
        throw new Error('JSON is not an array');
      }
      chrome.storage.local.set({ blacklist: data }, () => {
        currentKeywords = data;
        console.log('Imported list:', data);
        renderList(data);
      });
    } catch (err) {
      console.error('Import error:', err);
    }
  };
  reader.readAsText(file);
};

// Alphabet filter event listeners
alphaBtns.forEach(btn => {
  btn.onclick = () => {
    currentLetter = btn.dataset.letter === 'all' ? 'all' : btn.dataset.letter.toUpperCase();
    // Optionally, highlight the selected button
    alphaBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderList(currentKeywords);
  };
});

// initial load
loadAndRender();
