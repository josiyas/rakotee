// ========== Helper Functions ==========
function getCartItems() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCartItems(items) {
  localStorage.setItem('cart', JSON.stringify(items));
}

// ========== Wait for DOM ==========
document.addEventListener('DOMContentLoaded', function() {
  // ========== DOM Elements ==========
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalSpan = document.getElementById('cartTotal');
  const cartIconBtn = document.getElementById('cartIconBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      const cart = getCartItems();
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }

  // ========== Render Cart ==========
  function renderCart() {
    const cartItems = getCartItems();
    cartItemsDiv.innerHTML = '';

    if (cartItems.length === 0) {
      cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
      cartTotalSpan.textContent = '0.00';
      return;
    }

    let total = 0;

    cartItems.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const itemDiv = document.createElement('div');
      // Add cart-item-link class and data-product-id for modal linking
      itemDiv.className = 'cart-item cart-item-link';
      itemDiv.setAttribute('data-product-id', item.id);

      itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <p>Size: ${item.size || '-'}</p>
          <p>Color: ${item.color || '-'}</p>
          <p>Price: R ${item.price.toFixed(2)}</p>
          <div class="cart-item-actions">
            <label>Qty:</label>
            <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="qty-input" />
            <button class="remove-btn" data-index="${index}">Remove</button>
          </div>
        </div>
      `;

      cartItemsDiv.appendChild(itemDiv);
    });

    cartTotalSpan.textContent = total.toFixed(2);
    attachEventListeners();

    // Attach click event for modal opening
    document.querySelectorAll('.cart-item-link').forEach(el => {
      el.addEventListener('click', function (e) {
        // Prevent click on qty/remove from triggering modal
        if (
          e.target.classList.contains('qty-input') ||
          e.target.classList.contains('remove-btn')
        ) return;
        const productId = this.getAttribute('data-product-id');
        // 'products' must be globally available
        if (window.products && typeof window.openProductModal === 'function') {
          const product = window.products.find(p => String(p.id) === String(productId));
          if (product) {
            window.openProductModal(product);
          }
        }
      });
    });
  }

  // ========== Event Handlers ==========
  function getEventTargetIndex(event) {
    return parseInt(event.target.getAttribute('data-index'));
  }

  function attachEventListeners() {
    const qtyInputs = document.querySelectorAll('.qty-input');
    const removeButtons = document.querySelectorAll('.remove-btn');

    qtyInputs.forEach(input => {
      input.addEventListener('change', event => {
        const index = getEventTargetIndex(event);
        const cart = getCartItems();
        const newQty = parseInt(event.target.value);

        if (newQty > 0) {
          cart[index].quantity = newQty;
          saveCartItems(cart);
          renderCart();
          updateCartCount();
        }
      });
    });

    removeButtons.forEach(button => {
      button.addEventListener('click', event => {
        const index = getEventTargetIndex(event);
        const cart = getCartItems();
        cart.splice(index, 1);
        saveCartItems(cart);
        renderCart();
        updateCartCount();
      });
    });
  }

  // ========== Cart Sidebar Events ==========
  if (cartIconBtn && cartSidebar) {
    cartIconBtn.addEventListener('click', () => {
      renderCart();
      cartSidebar.classList.add('open');
      document.body.style.overflow = 'hidden'; // prevent background scroll when open
    });
  }

  if (closeCartBtn && cartSidebar) {
    closeCartBtn.addEventListener('click', () => {
      cartSidebar.classList.remove('open');
      document.body.style.overflow = ''; // re-enable scroll
    });
  }

  // ========== Cart Count ==========
  function updateCartCount() {
    const cart = getCartItems();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
  }

  // ========== Initialize ==========
  renderCart();
  updateCartCount();
});