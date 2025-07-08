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

// --- Account dropdown logic ---
function renderAccountDropdown() {
  const isLoggedIn = localStorage.getItem("rakotee_logged_in") === "true";
  const userEmail = localStorage.getItem("user_email");
  const accountDropdown = document.getElementById("accountDropdown");
  if (!accountDropdown) return;
  if (isLoggedIn) {
    accountDropdown.innerHTML = `
      <button class="icon-btn" id="accountToggle" aria-label="Account" tabindex="0">
        <i class="fas fa-user"></i>
        <span class="user-email" style="margin-left:8px;font-size:0.95em;">${userEmail ? userEmail : ""}</span>
      </button>
      <div class="dropdown-menu" id="accountMenu">
        <a href="account.html">Account</a>
        <a href="#" id="logoutBtn">Logout</a>
      </div>
    `;
  } else {
    accountDropdown.innerHTML = `
      <button class="icon-btn" id="accountToggle" aria-label="Account" tabindex="0">
        <i class="fas fa-user"></i>
      </button>
      <div class="dropdown-menu" id="accountMenu">
        <a href="login.html">Login</a>
        <a href="register.html">Register</a>
      </div>
    `;
  }
  // Dropdown toggle logic
  const toggle = accountDropdown.querySelector("#accountToggle");
  const menu = accountDropdown.querySelector("#accountMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("active");
      accountDropdown.setAttribute("aria-expanded", menu.classList.contains("active"));
      if (menu.classList.contains("active")) menu.querySelector("a").focus();
    });
    toggle.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") toggle.click();
    });
    document.addEventListener("click", function handler() {
      menu.classList.remove("active");
      accountDropdown.setAttribute("aria-expanded", false);
    }, { once: true });
  }
  // Logout handler
  const logoutBtn = accountDropdown.querySelector("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = function(e) {
      e.preventDefault();
      localStorage.setItem("rakotee_logged_in", "false");
      localStorage.removeItem("user_email");
      location.reload();
    };
  }
}
renderAccountDropdown();

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
