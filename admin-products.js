const STORAGE_KEY = 'rakotee_custom_products';

const form = document.getElementById('productForm');
const listEl = document.getElementById('productList');
const clearAllBtn = document.getElementById('clearAllBtn');

const DEFAULT_SIZES = ['2UK', '3UK', '4UK', '5UK', '6UK', '7UK', '8UK', '9UK', '10UK', '11UK', '12UK'];

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
			const image = ((Array.isArray(p.images) ? p.images[0] : p.image) || 'products/fallback.png').toString();
			const name = (p.name || 'Product').toString();
			const price = Number(p.price) || 0;
			const imageCount = Array.isArray(p.images) ? p.images.length : 1;
			const colors = Array.isArray(p.colors) ? p.colors.join(', ') : 'Default';
			const sizes = Array.isArray(p.sizes) ? p.sizes.join(', ') : DEFAULT_SIZES.join(', ');
			return `
				<article class="item">
					<img class="thumb" src="${image}" alt="${name}" onerror="this.onerror=null;this.src='products/fallback.png';">
					<div class="meta">
						<div class="name">${name}</div>
						<div class="sub">R ${price.toFixed(2)} · ${imageCount} image(s)</div>
						<div class="sub">Colors: ${colors}</div>
						<div class="sub">Sizes: ${sizes}</div>
					</div>
					<div class="item-actions">
						<button type="button" data-remove="${idx}" class="danger">Delete</button>
					</div>
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
	const imagesRaw = (formData.get('images') || '').toString().trim();
	const colorsRaw = (formData.get('colors') || '').toString().trim();
	const sizesRaw = (formData.get('sizes') || '').toString().trim();
	const category = (formData.get('category') || '').toString().trim();
	const descriptionText = (formData.get('description') || '').toString().trim();

	const images = imagesRaw
		.split(/\r?\n|,/)
		.map((path) => path.trim())
		.filter(Boolean);

	const colors = colorsRaw
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);

	const sizes = sizesRaw
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);

	if (!name || !images.length || !Number.isFinite(price)) {
		alert('Please fill name, price, and at least one image path.');
		return;
	}

	const products = getStoredProducts();
	products.push({
		id: Date.now(),
		name,
		price,
		images,
		description: descriptionText ? [descriptionText] : [name],
		colors: colors.length ? colors : ['Default'],
		sizes: sizes.length ? sizes : [...DEFAULT_SIZES],
		category: category || 'Shoes'
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
