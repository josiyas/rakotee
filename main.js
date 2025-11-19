// main.js
// All main scripts moved from index.html for better organization and maintainability.
// Accessibility, UI/UX, and event handling improvements included.

// --- Mobile menu logic ---
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileOverlay = document.getElementById("mobileOverlay");
if (menuToggle && mobileMenu && mobileOverlay) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("active");
    mobileOverlay.classList.toggle("active");
    menuToggle.innerHTML = `<i class="fas fa-${isOpen ? "times" : "bars"}"></i>`;
    menuToggle.setAttribute("aria-expanded", isOpen);
    if (isOpen) mobileMenu.querySelector("a").focus();
  });
  mobileOverlay.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");
    menuToggle.innerHTML = `<i class="fas fa-bars"></i>`;
    menuToggle.setAttribute("aria-expanded", false);
  });
  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      mobileOverlay.classList.remove("active");
      menuToggle.innerHTML = `<i class="fas fa-bars"></i>`;
      menuToggle.setAttribute("aria-expanded", false);
    });
  });
  // Keyboard navigation for menu
  menuToggle.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") menuToggle.click();
  });
}

// --- Search bar toggle ---
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
if (searchToggle && searchBar) {
  searchToggle.addEventListener("click", () => {
    const isVisible = searchBar.style.display === "block";
    searchBar.style.display = isVisible ? "none" : "block";
    if (!isVisible) searchBar.querySelector("input").focus();
  });
  searchToggle.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") searchToggle.click();
  });
}

// Account features removed — account pages and auth scripts deleted.
// If you later want to re-enable account UI, restore the old `renderAccountDropdown` function and the related pages.

// --- Mailing list form feedback ---
const mailingListForm = document.getElementById("mailingListForm");
if (mailingListForm) {
  mailingListForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("mailingListEmail").value;
    const feedback = document.getElementById("mailingListFeedback");
    // Simple email validation
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      feedback.textContent = "Thank you for subscribing!";
      feedback.style.display = "inline";
      feedback.style.color = "green";
      setTimeout(() => { feedback.style.display = "none"; }, 3000);
      mailingListForm.reset();
    } else {
      feedback.textContent = "Please enter a valid email.";
      feedback.style.display = "inline";
      feedback.style.color = "red";
    }
  });
}

// --- Modal and Cart Sidebar Accessibility ---
function trapFocus(element) {
  const focusableEls = element.querySelectorAll('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  const firstFocusableEl = focusableEls[0];
  const lastFocusableEl = focusableEls[focusableEls.length - 1];
  element.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) { // shift + tab
        if (document.activeElement === firstFocusableEl) {
          e.preventDefault();
          lastFocusableEl.focus();
        }
      } else { // tab
        if (document.activeElement === lastFocusableEl) {
          e.preventDefault();
          firstFocusableEl.focus();
        }
      }
    }
    if (e.key === 'Escape') {
      if (element.id === 'productModal') closeModal();
      if (element.id === 'cartSidebar') closeCart();
    }
  });
}

// Modal logic
const productModal = document.getElementById('productModal');
const closeModalBtn = document.getElementById('closeModalBtn');
function closeModal() {
  if (productModal) {
    productModal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
}
if (productModal && closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal);
  closeModalBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') closeModal();
  });
  trapFocus(productModal);
}

// Cart sidebar logic
const cartSidebar = document.getElementById('cartSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');
function closeCart() {
  if (cartSidebar) {
    cartSidebar.style.display = 'none';
    document.body.classList.remove('cart-open');
  }
}
if (cartSidebar && closeCartBtn) {
  closeCartBtn.addEventListener('click', closeCart);
  closeCartBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') closeCart();
  });
  trapFocus(cartSidebar);
}

// --- Focus styles for accessibility ---
document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
  }
});
document.addEventListener('mousedown', function() {
  document.body.classList.remove('user-is-tabbing');
});

// --- Security: Avoid unsafe innerHTML for user content ---
// (No user-generated content is rendered directly. If added in future, use textContent or DOM methods.)

// --- End main.js ---
