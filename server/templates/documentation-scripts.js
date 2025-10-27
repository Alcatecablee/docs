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
  // KEYBOARD SHORTCUTS
  // ============================================
  
  document.addEventListener('keydown', function(e) {
    // '/' - Focus search (if implemented)
    if (e.key === '/') {
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }
    
    // 'Escape' - Close mobile menu
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('mobileOverlay');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
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
