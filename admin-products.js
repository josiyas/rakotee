const STORAGE_KEY = 'rakotee_custom_products';

const form = document.getElementById('productForm');
const listEl = document.getElementById('productList');
const clearAllBtn = document.getElementById('clearAllBtn');

function getStoredProducts() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const data = raw ? JSON.parse(raw) : [];
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}

function saveStoredProducts(products) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function renderList() {
	const products = getStoredProducts();
	if (!products.length) {
		listEl.innerHTML = '<p class="help">No custom products yet.</p>';
		return;
	}

	listEl.innerHTML = products
		.map((p, idx) => {
			const image = (p.image || (Array.isArray(p.images) ? p.images[0] : '') || 'products/fallback.png').toString();
			const name = (p.name || 'Product').toString();
			const price = Number(p.price) || 0;
			return `
				<article class="item">
					<img class="thumb" src="${image}" alt="${name}" onerror="this.onerror=null;this.src='products/fallback.png';">
					<div class="meta">
						<div class="name">${name}</div>
						<div class="sub">R ${price.toFixed(2)} · ${image}</div>
					</div>
					<button type="button" data-remove="${idx}" class="danger">Delete</button>
				</article>
			`;
		})
		.join('');

	listEl.querySelectorAll('[data-remove]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const idx = Number(btn.getAttribute('data-remove'));
			const items = getStoredProducts();
			items.splice(idx, 1);
			saveStoredProducts(items);
			renderList();
		});
	});
}

form.addEventListener('submit', (event) => {
	event.preventDefault();

	const formData = new FormData(form);
	const name = (formData.get('name') || '').toString().trim();
	const price = Number(formData.get('price'));
	const image = (formData.get('image') || '').toString().trim();
	const descriptionText = (formData.get('description') || '').toString().trim();

	if (!name || !image || !Number.isFinite(price)) {
		alert('Please fill name, price, and image path.');
		return;
	}

	const products = getStoredProducts();
	products.push({
		name,
		price,
		image,
		description: descriptionText ? [descriptionText] : undefined,
		colors: ['Default']
	});

	saveStoredProducts(products);
	form.reset();
	renderList();
	alert('Product saved. Open products page to see it.');
});

clearAllBtn.addEventListener('click', () => {
	const ok = confirm('Delete all custom products from this browser?');
	if (!ok) return;
	localStorage.removeItem(STORAGE_KEY);
	renderList();
});

renderList();
