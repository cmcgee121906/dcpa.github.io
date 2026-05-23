document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');

  function openDrawer() {
    mobileDrawer?.classList.add('open');
    mobileDrawerOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
    
    // Animate hamburger morphing
    const lines = mobileMenuBtn?.querySelectorAll('span');
    if (lines && lines.length === 3) {
      lines[0].style.transform = 'translateY(6px) rotate(45deg)';
      lines[1].style.opacity = '0';
      lines[2].style.transform = 'translateY(-6px) rotate(-45deg)';
    }
  }

  function closeDrawer() {
    mobileDrawer?.classList.remove('open');
    mobileDrawerOverlay?.classList.remove('open');
    document.body.style.overflow = ''; // Re-enable scroll
    
    // Reset hamburger lines
    const lines = mobileMenuBtn?.querySelectorAll('span');
    if (lines && lines.length === 3) {
      lines[0].style.transform = '';
      lines[1].style.opacity = '';
      lines[2].style.transform = '';
    }
  }

  mobileMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileDrawer?.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeDrawerBtn?.addEventListener('click', closeDrawer);
  mobileDrawerOverlay?.addEventListener('click', closeDrawer);

  // 2. Mobile Accordion Menus
  const accordionBtns = document.querySelectorAll('.accordion-btn');
  accordionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('i');
      
      // Close other open accordions
      accordionBtns.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.classList.remove('active');
          const otherContent = otherBtn.nextElementSibling;
          if (otherContent) otherContent.style.maxHeight = null;
          const otherIcon = otherBtn.querySelector('i');
          if (otherIcon) otherIcon.style.transform = '';
        }
      });

      // Toggle this accordion
      btn.classList.toggle('active');
      if (content) {
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
          if (icon) icon.style.transform = '';
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      }
    });
  });

  // 3. Highlight Active Navigation Links
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  const desktopLinks = document.querySelectorAll('nav a, nav div.relative > a');
  desktopLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentFile || (currentFile === 'index.html' && href === 'index.html')) {
      link.classList.add('nav-link-active');
      // If it's inside a dropdown, also highlight the parent dropdown toggle
      const parentDropdown = link.closest('.dropdown');
      if (parentDropdown) {
        const toggle = parentDropdown.querySelector('a');
        toggle?.classList.add('nav-link-active');
      }
    }
  });

  // 4. Client-side Form Validation for apply.html
  const applyForm = document.getElementById('apply-form');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      let isValid = true;
      const requiredInputs = applyForm.querySelectorAll('input[required], select[required]');
      
      requiredInputs.forEach(input => {
        const value = input.value.trim();
        const parentDiv = input.parentElement;
        let errorMsg = parentDiv?.querySelector('.error-message');
        
        if (!value) {
          isValid = false;
          input.classList.remove('border-gray-200');
          input.classList.add('border-red-500');
          
          if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.className = 'error-message text-red-500 text-xs mt-1 animate-fade-in-up';
            errorMsg.innerText = 'This field is required';
            parentDiv?.appendChild(errorMsg);
          }
        } else {
          input.classList.remove('border-red-500');
          input.classList.add('border-gray-200');
          errorMsg?.remove();
          
          // Custom validation checks
          if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              isValid = false;
              input.classList.add('border-red-500');
              if (!errorMsg) {
                errorMsg = document.createElement('p');
                errorMsg.className = 'error-message text-red-500 text-xs mt-1';
                errorMsg.innerText = 'Please enter a valid email address';
                parentDiv?.appendChild(errorMsg);
              }
            }
          }
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        // Shake the submit button for visual feedback
        const submitBtn = applyForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.classList.add('animate-shake');
          setTimeout(() => {
            submitBtn.classList.remove('animate-shake');
          }, 500);
        }
      }
    });
  }
});
