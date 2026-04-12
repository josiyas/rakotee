const STORAGE_KEY = 'rakotee_custom_products';

const form = document.getElementById('productForm');
const listEl = document.getElementById('customProductList');
const storeListEl = document.getElementById('storeProductList');
const clearAllBtn = document.getElementById('clearAllBtn');
const editHint = document.getElementById('editHint');
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editProductIdInput = document.getElementById('editProductId');

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
		const rx = /\{[\s\S]*?id:\s*([0-9]+)[\s\S]*?name:\s*"([^"]+)"[\s\S]*?price:\s*([0-9]+(?:\.[0-9]+)?)[\s\S]*?images:\s*\[([\s\S]*?)\][\s\S]*?\}/g;
		let match;
		while ((match = rx.exec(jsText)) !== null) {
			const images = [];
			const imageRx = /"([^"]+)"/g;
			let imageMatch;
			while ((imageMatch = imageRx.exec(match[4])) !== null) {
				images.push(imageMatch[1]);
			}

			parsed.push({
				id: Number(match[1]),
				name: match[2],
				price: Number(match[3]) || 0,
				images: images.length ? images : ['products/fallback.png'],
				colors: ['Default'],
				sizes: [...DEFAULT_SIZES],
				category: 'Shoes'
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
				<button type="button" data-edit="${idx}" class="edit-btn">Edit</button>
				${canDelete ? `<button type="button" data-remove="${idx}" class="danger">Delete</button>` : ''}
			</div>
		</article>
	`;
}

function setEditMode(isEditing) {
	if (editHint) editHint.style.display = isEditing ? 'block' : 'none';
	if (saveBtn) saveBtn.textContent = isEditing ? 'Update Product' : 'Save Product';
	if (cancelEditBtn) cancelEditBtn.style.display = isEditing ? 'inline-block' : 'none';
}

function fillForm(product) {
	form.elements.name.value = product.name || '';
	form.elements.price.value = Number(product.price) || 0;
	form.elements.images.value = Array.isArray(product.images) ? product.images.join('\n') : '';
	form.elements.colors.value = Array.isArray(product.colors) ? product.colors.join(', ') : '';
	form.elements.sizes.value = Array.isArray(product.sizes) ? product.sizes.join(', ') : '';
	form.elements.category.value = product.category || '';
	form.elements.description.value = Array.isArray(product.description)
		? product.description.join(' ')
		: (product.description || '');
}

function resetFormMode() {
	form.reset();
	if (editProductIdInput) editProductIdInput.value = '';
	setEditMode(false);
}

async function renderStoreList() {
	if (!storeListEl) return;
	const baseProducts = await getStoreProducts();
	const custom = getStoredProducts();
	const overridesById = new Map(
		custom
			.filter((p) => Number.isFinite(Number(p && p.id)))
			.map((p) => [Number(p.id), p])
	);

	const products = baseProducts.map((p) => (overridesById.has(Number(p.id)) ? { ...p, ...overridesById.get(Number(p.id)) } : p));

	if (!products.length) {
		storeListEl.innerHTML = '<p class="help">Could not load store products.</p>';
		return;
	}
	storeListEl.innerHTML = products.slice(0, 120).map((p, idx) => cardTemplate(p, idx, false)).join('');

	storeListEl.querySelectorAll('[data-edit]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const idx = Number(btn.getAttribute('data-edit'));
			const product = products[idx];
			if (!product) return;
			fillForm(product);
			if (editProductIdInput) editProductIdInput.value = String(product.id);
			setEditMode(true);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	});
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

	listEl.querySelectorAll('[data-edit]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const idx = Number(btn.getAttribute('data-edit'));
			const items = getStoredProducts();
			const product = items[idx];
			if (!product) return;
			fillForm(product);
			if (editProductIdInput) editProductIdInput.value = String(product.id || '');
			setEditMode(true);
			window.scrollTo({ top: 0, behavior: 'smooth' });
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
	const editId = Number((formData.get('editProductId') || '').toString().trim());
	const payload = {
		id: Number.isFinite(editId) ? editId : Date.now(),
		name,
		price,
		images,
		description: descriptionText ? [descriptionText] : [name],
		colors: colors.length ? colors : ['Default'],
		sizes: sizes.length ? sizes : [...DEFAULT_SIZES],
		category: category || 'Shoes'
	};

	const existingIndex = products.findIndex((item) => Number(item.id) === Number(payload.id));
	if (existingIndex >= 0) {
		products[existingIndex] = payload;
	} else {
		products.push(payload);
	}

	saveStoredProducts(products);
	resetFormMode();
	renderList();
	renderStoreList();
	alert('Product saved. Open products page to see it.');
});

clearAllBtn.addEventListener('click', () => {
	const ok = confirm('Delete all custom products from this browser?');
	if (!ok) return;
	localStorage.removeItem(STORAGE_KEY);
	resetFormMode();
	renderList();
	renderStoreList();
});

cancelEditBtn.addEventListener('click', () => {
	resetFormMode();
});

renderList();
renderStoreList();
