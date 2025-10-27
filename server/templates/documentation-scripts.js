/* ============================================
   ENTERPRISE DOCUMENTATION INTERACTIVE SCRIPTS
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // INITIALIZATION
  // ============================================
  
  document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
    initMobileMenu();
    initTableOfContents();
    initScrollSpy();
    initSmoothScroll();
    initCopyButtons();
    initAnchorLinks();
    initSearch();
  });

  // ============================================
  // THEME TOGGLE
  // ============================================
  
  function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.className = currentTheme;
    
    themeToggle.addEventListener('click', function() {
      const newTheme = document.body.classList.contains('light') ? 'dark' : 'light';
      document.body.className = newTheme;
      localStorage.setItem('theme', newTheme);
    });
  }

  // ============================================
  // MOBILE MENU
  // ============================================
  
  function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (!menuToggle || !sidebar || !overlay) return;
    
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
    
    // Close on navigation click (mobile)
    const navLinks = sidebar.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        }
      });
    });
  }

  // ============================================
  // TABLE OF CONTENTS GENERATION
  // ============================================
  
  function initTableOfContents() {
    const tocList = document.getElementById('toc-list');
    const content = document.querySelector('.main-content');
    
    if (!tocList || !content) return;
    
    const headings = content.querySelectorAll('h2, h3');
    
    if (headings.length === 0) {
      // Hide TOC if no headings
      const tocElement = document.getElementById('toc');
      if (tocElement) tocElement.style.display = 'none';
      return;
    }
    
    headings.forEach((heading, index) => {
      // Generate ID if not present
      if (!heading.id) {
        heading.id = `section-${index}`;
      }
      
      const li = document.createElement('li');
      li.className = heading.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
      
      const a = document.createElement('a');
      a.href = `#${heading.id}`;
      a.textContent = heading.textContent.replace('#', '').trim();
      a.dataset.target = heading.id;
      
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  // ============================================
  // SCROLL SPY (Active Section Highlighting)
  // ============================================
  
  function initScrollSpy() {
    const sections = document.querySelectorAll('.main-content h2, .main-content h3');
    const navLinks = document.querySelectorAll('.nav-link');
    const tocLinks = document.querySelectorAll('.toc-nav a');
    
    if (sections.length === 0) return;
    
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          
          // Update sidebar navigation
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === id) {
              link.classList.add('active');
            }
          });
          
          // Update table of contents
          tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
  }

  // ============================================
  // SMOOTH SCROLLING
  // ============================================
  
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip empty anchors
        if (href === '#') return;
        
        e.preventDefault();
        
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without jumping
          history.pushState(null, null, href);
        }
      });
    });
  }

  // ============================================
  // COPY BUTTONS FOR CODE BLOCKS
  // ============================================
  
  function initCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(codeBlock => {
      const pre = codeBlock.parentElement;
      
      // Wrap in container if not already wrapped
      if (!pre.parentElement.classList.contains('code-block-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }
      
      // Create copy button
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      
      button.addEventListener('click', async function() {
        const code = codeBlock.textContent;
        
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = 'Copied!';
          button.classList.add('copied');
          
          setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
          button.textContent = 'Failed';
          
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        }
      });
      
      pre.parentElement.appendChild(button);
    });
  }

  // ============================================
  // ANCHOR LINKS FOR HEADINGS
  // ============================================
  
  function initAnchorLinks() {
    const headings = document.querySelectorAll('.main-content h2, .main-content h3');
    
    headings.forEach(heading => {
      if (!heading.id) return;
      
      const anchor = document.createElement('a');
      anchor.className = 'anchor-link';
      anchor.href = `#${heading.id}`;
      anchor.textContent = '#';
      anchor.setAttribute('aria-label', `Link to ${heading.textContent}`);
      
      heading.appendChild(anchor);
    });
  }

  // ============================================
  // SEARCH MODAL
  // ============================================
  
  let searchState = {
    isOpen: false,
    results: [],
    selectedIndex: -1,
    debounceTimer: null,
  };

  function initSearch() {
    const modal = document.getElementById('searchModal');
    const trigger = document.querySelector('.search-trigger');
    const overlay = document.getElementById('searchOverlay');
    const closeBtn = document.querySelector('.search-close');
    const input = document.getElementById('searchInput');

    if (!modal || !trigger || !overlay || !closeBtn || !input) return;

    // Open search modal
    trigger.addEventListener('click', openSearchModal);
    
    // Close on overlay click
    overlay.addEventListener('click', closeSearchModal);
    
    // Close on close button click
    closeBtn.addEventListener('click', closeSearchModal);
    
    // Handle search input with debouncing
    input.addEventListener('input', handleSearchInput);
    
    // Handle keyboard navigation in search
    input.addEventListener('keydown', handleSearchKeydown);
  }

  function openSearchModal() {
    const modal = document.getElementById('searchModal');
    const input = document.getElementById('searchInput');
    
    if (!modal || !input) return;
    
    searchState.isOpen = true;
    modal.classList.add('active');
    
    // Focus input after animation
    setTimeout(() => {
      input.focus();
    }, 100);
  }

  function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    const input = document.getElementById('searchInput');
    
    if (!modal) return;
    
    searchState.isOpen = false;
    searchState.selectedIndex = -1;
    modal.classList.remove('active');
    
    // Clear input
    if (input) {
      input.value = '';
    }
    
    // Clear results
    showEmptyState();
  }

  function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    // Clear previous timer
    if (searchState.debounceTimer) {
      clearTimeout(searchState.debounceTimer);
    }
    
    // If query is empty, show empty state
    if (!query) {
      showEmptyState();
      return;
    }
    
    // Show loading state immediately
    showLoadingState();
    
    // Debounce search (wait 300ms after user stops typing)
    searchState.debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);
  }

  function handleSearchKeydown(e) {
    const items = document.querySelectorAll('.search-result-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchState.selectedIndex < items.length - 1) {
        searchState.selectedIndex++;
        updateSelectedItem(items);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchState.selectedIndex > 0) {
        searchState.selectedIndex--;
        updateSelectedItem(items);
      }
    } else if (e.key === 'Enter' && searchState.selectedIndex >= 0) {
      e.preventDefault();
      const selectedItem = items[searchState.selectedIndex];
      if (selectedItem) {
        selectedItem.click();
      }
    }
  }

  function updateSelectedItem(items) {
    items.forEach((item, index) => {
      if (index === searchState.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  function showEmptyState() {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
      <div class="search-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p>Type to search across all documentation</p>
      </div>
    `;
  }

  function showLoadingState() {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
      <div class="search-loading">
        <p>Searching...</p>
      </div>
    `;
  }

  function showNoResults(query) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
      <div class="search-no-results">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p>No results found for "<strong>${escapeHtml(query)}</strong>"</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Try different keywords or check spelling</p>
      </div>
    `;
  }

  async function performSearch(query) {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      if (data.success && data.results) {
        displaySearchResults(data.results, query);
      } else {
        showNoResults(query);
      }
    } catch (error) {
      console.error('Search error:', error);
      const resultsContainer = document.getElementById('searchResults');
      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="search-no-results">
            <p>Search failed. Please try again.</p>
          </div>
        `;
      }
    }
  }

  function displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    searchState.results = results;
    searchState.selectedIndex = -1;
    
    if (results.length === 0) {
      showNoResults(query);
      return;
    }
    
    const resultsHTML = results.map((result, index) => {
      const excerpt = highlightMatches(result.excerpt || '', query);
      const url = result.url || '#';
      const type = result.type || 'page';
      
      return `
        <a href="${escapeHtml(url)}" class="search-result-item" data-index="${index}">
          <div class="search-result-title">
            <span>${escapeHtml(result.title)}</span>
            <span class="search-result-type">${escapeHtml(type)}</span>
          </div>
          <p class="search-result-excerpt">${excerpt}</p>
          ${url !== '#' ? `<div class="search-result-url">${escapeHtml(url)}</div>` : ''}
        </a>
      `;
    }).join('');
    
    resultsContainer.innerHTML = resultsHTML;
    
    // Add click handlers to results
    const resultItems = resultsContainer.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
      item.addEventListener('click', () => {
        closeSearchModal();
      });
    });
  }

  function highlightMatches(text, query) {
    if (!text || !query) return escapeHtml(text);
    
    const escapedText = escapeHtml(text);
    const words = query.toLowerCase().split(/\s+/);
    let result = escapedText;
    
    words.forEach(word => {
      if (word.length < 2) return;
      const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });
    
    return result;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  
  document.addEventListener('keydown', function(e) {
    // Cmd+K / Ctrl+K - Open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (!searchState.isOpen) {
        openSearchModal();
      }
    }
    
    // 'Escape' - Close search modal or mobile menu
    if (e.key === 'Escape') {
      if (searchState.isOpen) {
        closeSearchModal();
      } else {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        }
      }
    }
  });

  // ============================================
  // UTILITY: Debounce function
  // ============================================
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================
  // RESPONSIVE: Handle window resize
  // ============================================
  
  window.addEventListener('resize', debounce(function() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('mobileOverlay');
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
    }
  }, 250));

})();
