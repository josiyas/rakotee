// Lazy loading for product images
// This script will add 'loading="lazy"' to all product images after DOM is loaded

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.product-img').forEach(img => {
    img.setAttribute('loading', 'lazy');
  });
});
