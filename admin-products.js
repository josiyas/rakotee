const STORAGE_KEY = 'rakotee_custom_products';

const form = document.getElementById('productForm');
const listEl = document.getElementById('customProductList');
const storeListEl = document.getElementById('storeProductList');
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

async function getStoreProducts() {
	try {
		const response = await fetch('products.js', { cache: 'no-store' });
		if (!response.ok) return [];
		const jsText = await response.text();

		const parsed = [];
		const rx = /name:\s*"([^"]+)"[\s\S]*?price:\s*([0-9]+(?:\.[0-9]+)?)[\s\S]*?images:\s*\[\s*"([^"]+)"/g;
		let match;
		while ((match = rx.exec(jsText)) !== null) {
			parsed.push({
				name: match[1],
				price: Number(match[2]) || 0,
				images: [match[3]]
			});
		}
		return parsed;
	} catch {
		return [];
	}
}

function normalizeImagePath(path) {
	const img = (path || 'products/fallback.png').toString().trim();
	return img.startsWith('/') ? img.slice(1) : img;
}

function cardTemplate(product, idx, canDelete) {
	const image = normalizeImagePath((Array.isArray(product.images) ? product.images[0] : product.image));
	const name = (product.name || 'Product').toString();
	const price = Number(product.price) || 0;
	const imageCount = Array.isArray(product.images) ? product.images.length : 1;
	const colors = Array.isArray(product.colors) ? product.colors.join(', ') : 'Default';
	const sizes = Array.isArray(product.sizes) ? product.sizes.join(', ') : DEFAULT_SIZES.join(', ');
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
				${canDelete ? `<button type="button" data-remove="${idx}" class="danger">Delete</button>` : ''}
			</div>
		</article>
	`;
}

async function renderStoreList() {
	if (!storeListEl) return;
	const products = await getStoreProducts();
	if (!products.length) {
		storeListEl.innerHTML = '<p class="help">Could not load store products.</p>';
		return;
	}
	storeListEl.innerHTML = products.slice(0, 120).map((p, idx) => cardTemplate(p, idx, false)).join('');
}

function renderList() {
	const products = getStoredProducts();
	if (!products.length) {
		listEl.innerHTML = '<p class="help">No custom products yet.</p>';
		return;
	}

	listEl.innerHTML = products
		.map((p, idx) => cardTemplate(p, idx, true))
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
renderStoreList();
