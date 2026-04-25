const STORAGE_KEY = 'rakotee_custom_products';

const form = document.getElementById('productForm');
const listEl = document.getElementById('customProductList');
const storeListEl = document.getElementById('storeProductList');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportHardcodeBtn = document.getElementById('exportHardcodeBtn');
const hardcodeOutputEl = document.getElementById('hardcodeOutput');
const editHint = document.getElementById('editHint');
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editProductIdInput = document.getElementById('editProductId');
const categorySelect = document.getElementById('category');
const sizesInput = document.getElementById('sizes');
const catTabs = document.getElementById('catTabs');
const storeSearchInput = document.getElementById('storeSearch');
const syncStatusEl = document.getElementById('syncStatus');

const DEFAULT_SHOE_SIZES = ['2UK', '3UK', '4UK', '5UK', '6UK', '7UK', '8UK', '9UK', '10UK', '11UK', '12UK'];
const DEFAULT_PHONE_SIZES = ['64GB', '128GB', '256GB', '512GB'];
// Keep backward-compat alias used in payload construction
const DEFAULT_SIZES = DEFAULT_SHOE_SIZES;
const HOST = (window.location.hostname || '').toLowerCase();
const IS_LOCAL = HOST === 'localhost' || HOST === '127.0.0.1';
const OFFICIAL_API_BASE = IS_LOCAL ? 'http://localhost:5000' : 'https://rakotee-back.onrender.com';
const API_CANDIDATES = [
	OFFICIAL_API_BASE,
	window.location.origin,
	'http://localhost:5000',
	'https://rakotee-back.onrender.com'
];

let activeCategoryFilter = '';
let activeSearchTerm = '';
let activeApiBase = '';

// --- Auto-fill sizes when category changes ---
function getDefaultSizesForCategory(cat) {
	return (cat || '').toLowerCase() === 'phones' ? DEFAULT_PHONE_SIZES : DEFAULT_SHOE_SIZES;
}

function getLegacyAdminToken() {
	try {
		return sessionStorage.getItem('rakotee_admin_token') || localStorage.getItem('rakotee_admin_token') || '';
	} catch {
		return '';
	}
}

function getAuthHeaders() {
	const token = getLegacyAdminToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

function setSyncStatus(message, isGood) {
	if (!syncStatusEl) return;
	syncStatusEl.textContent = message;
	syncStatusEl.style.borderColor = isGood ? 'rgba(86, 209, 137, 0.7)' : 'rgba(116, 140, 171, 0.55)';
	syncStatusEl.style.background = isGood ? 'rgba(15, 82, 44, 0.35)' : 'rgba(13, 19, 33, 0.58)';
}

async function detectApiBase() {
	for (const base of API_CANDIDATES) {
		try {
			const res = await fetch(`${base}/health`, { method: 'GET' });
			if (res.ok) return base;
		} catch {
			// Continue with next candidate.
		}
	}
	return '';
}

async function syncProductToServer(product) {
	return { ok: false, reason: 'disabled' };
}

if (categorySelect && sizesInput) {
	categorySelect.addEventListener('change', () => {
		// Only auto-fill if the user hasn't typed custom sizes
		const current = sizesInput.value.trim();
		const prevDefaults = [...DEFAULT_SHOE_SIZES, ...DEFAULT_PHONE_SIZES].map(s => s.toLowerCase());
		const isEmpty = !current;
		const isDefault = isEmpty || prevDefaults.some(d => current.toLowerCase() === d) ||
			current.split(',').map(s => s.trim()).every(s => prevDefaults.includes(s.toLowerCase()));
		if (isEmpty || isDefault) {
			sizesInput.value = getDefaultSizesForCategory(categorySelect.value).join(', ');
		}
	});
}

function getStoredProducts() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const data = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(data)) return [];

		const cleaned = data.map((item) => {
			if (!item || typeof item !== 'object') return item;
			const clone = { ...item };
			const desc = Array.isArray(clone.description)
				? clone.description.map((d) => (d || '').toString().trim()).filter(Boolean)
				: [];
			const name = (clone.name || '').toString().trim().toLowerCase();
			if (desc.length === 1 && desc[0].toLowerCase() === name) {
				delete clone.description;
			}
			return clone;
		});

		if (JSON.stringify(cleaned) !== JSON.stringify(data)) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
		}

		return cleaned;
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

		const startToken = 'const products = [';
		const start = jsText.indexOf(startToken);
		if (start < 0) return [];

		const arrayStart = jsText.indexOf('[', start);
		if (arrayStart < 0) return [];

		let i = arrayStart;
		let depth = 0;
		let inString = false;
		let escaped = false;
		let quote = '';

		for (; i < jsText.length; i++) {
			const ch = jsText[i];

			if (inString) {
				if (escaped) {
					escaped = false;
					continue;
				}
				if (ch === '\\') {
					escaped = true;
					continue;
				}
				if (ch === quote) {
					inString = false;
					quote = '';
				}
				continue;
			}

			if (ch === '"' || ch === "'" || ch === '`') {
				inString = true;
				quote = ch;
				continue;
			}

			if (ch === '[') depth++;
			if (ch === ']') {
				depth--;
				if (depth === 0) {
					i++;
					break;
				}
			}
		}

		const arrayLiteral = jsText.slice(arrayStart, i).trim();
		if (!arrayLiteral || !arrayLiteral.startsWith('[') || !arrayLiteral.endsWith(']')) return [];

		const sourceProducts = Function(`"use strict"; return (${arrayLiteral});`)();
		if (!Array.isArray(sourceProducts)) return [];

		return sourceProducts
			.filter((p) => p && typeof p === 'object')
			.map((p) => {
				const images = Array.isArray(p.images)
					? p.images.map((img) => (img || '').toString().trim()).filter(Boolean)
					: [];
				const description = Array.isArray(p.description)
					? p.description.map((d) => (d || '').toString().trim()).filter(Boolean)
					: (p.description ? [(p.description || '').toString().trim()] : []);

				return {
					id: Number(p.id),
					name: (p.name || '').toString(),
					price: Number(p.price) || 0,
					images: images.length ? images : ['products/fallback.png'],
					description,
					colors: Array.isArray(p.colors) && p.colors.length ? p.colors : ['Default'],
					sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : getDefaultSizesForCategory(p.category),
					category: (p.category || 'Shoes').toString()
				};
			});
	} catch {
		return [];
	}
}

function normalizeImagePath(path) {
	const img = (path || 'products/fallback.png').toString().trim();
	return img.startsWith('/') ? img.slice(1) : img;
}

function toJsString(str) {
	return JSON.stringify((str || '').toString());
}

function toJsArray(arr) {
	return `[${(arr || []).map((item) => toJsString(item)).join(', ')}]`;
}

function toHardcodeBlock(items) {
	return (items || []).map((p) => {
		const id = Number.isFinite(Number(p.id)) ? Number(p.id) : Date.now();
		const name = toJsString(p.name || 'Product');
		const price = Number.isFinite(Number(p.price)) ? Number(p.price).toFixed(2) : '0.00';
		const images = toJsArray((p.images || []).map((img) => {
			const raw = (img || '').toString().trim();
			if (!raw) return 'products/fallback.png';
			if (/^data:/i.test(raw) || /^https?:\/\//i.test(raw)) return raw;
			return raw.startsWith('/') ? raw : `/${raw}`;
		}));
		const sizes = toJsArray(Array.isArray(p.sizes) && p.sizes.length ? p.sizes : getDefaultSizesForCategory(p.category));
		const colors = toJsArray(Array.isArray(p.colors) && p.colors.length ? p.colors : ['Default']);
		const category = toJsString((p.category || 'Shoes').toString());
		const descItems = Array.isArray(p.description) && p.description.length ? p.description : [];
		const description = `description: ${toJsArray(descItems)},`;
		return `  {\n    id: ${id},\n    name: ${name},\n    category: ${category},\n    price: ${price},\n    images: ${images},\n    sizes: ${sizes},\n    colors: ${colors},\n    ${description}\n  }`;
	}).join(',\n');
}

function cardTemplate(product, idx, canDelete) {
	const image = normalizeImagePath((Array.isArray(product.images) ? product.images[0] : product.image));
	const name = (product.name || 'Product').toString();
	const price = Number(product.price) || 0;
	const imageCount = Array.isArray(product.images) ? product.images.length : 1;
	const colors = Array.isArray(product.colors) ? product.colors.join(', ') : 'Default';
	const sizes = Array.isArray(product.sizes) ? product.sizes.join(', ') : getDefaultSizesForCategory(product.category).join(', ');
	const description = Array.isArray(product.description)
		? product.description.join(' ')
		: (product.description || '').toString();
	const descriptionPreview = description.trim();
	return `
		<article class="item">
			<img class="thumb" src="${image}" alt="${name}" onerror="this.onerror=null;this.src='products/fallback.png';">
			<div class="meta">
				<div class="name">${name}</div>
				<div class="sub">R ${price.toFixed(2)} · ${imageCount} image(s)</div>
				<div class="sub">Colors: ${colors}</div>
				<div class="sub">Sizes: ${sizes}</div>
				<div class="sub">${descriptionPreview ? descriptionPreview.slice(0, 140) : ''}</div>
			</div>
			<div class="item-actions">
				<button type="button" data-edit="${idx}" class="edit-btn">Edit</button>
				${canDelete ? `<button type="button" data-remove="${idx}" class="danger">Delete</button>` : ''}
			</div>
		</article>
	`;
}

function productMatchesSearch(product, term) {
	if (!term) return true;
	const parts = [
		product.id,
		product.name,
		product.category,
		Array.isArray(product.colors) ? product.colors.join(' ') : '',
		Array.isArray(product.sizes) ? product.sizes.join(' ') : '',
		Array.isArray(product.description) ? product.description.join(' ') : product.description
	]
		.map((p) => (p || '').toString().toLowerCase());
	return parts.some((p) => p.includes(term));
}

function getFilteredStoreProducts() {
	const cat = activeCategoryFilter.toLowerCase();
	const term = activeSearchTerm.toLowerCase().trim();
	return allStoreProducts.filter((p) => {
		const byCategory = !cat || (p.category || '').toLowerCase() === cat;
		return byCategory && productMatchesSearch(p, term);
	});
}

function renderCategoryTabs() {
	if (!catTabs) return;
	const categories = Array.from(new Set(allStoreProducts.map((p) => (p.category || 'Shoes').toString().trim()).filter(Boolean)))
		.sort((a, b) => a.localeCompare(b));
	const allCats = ['All', ...categories];
	catTabs.innerHTML = allCats
		.map((cat) => {
			const value = cat === 'All' ? '' : cat;
			const active = value.toLowerCase() === activeCategoryFilter.toLowerCase();
			return `<button type="button" class="cat-tab${active ? ' active' : ''}" data-cat="${value}">${cat}</button>`;
		})
		.join('');
	catTabs.querySelectorAll('.cat-tab').forEach((tab) => {
		tab.addEventListener('click', () => {
			activeCategoryFilter = (tab.dataset.cat || '').toString();
			renderCategoryTabs();
			renderStoreCards(getFilteredStoreProducts());
		});
	});
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

// All merged store products — kept at module scope so cat-tabs can re-filter without re-fetching
let allStoreProducts = [];

function renderStoreCards(products) {
	if (!storeListEl) return;
	if (!products.length) {
		storeListEl.innerHTML = '<p class="help">No products in this category.</p>';
		return;
	}
	storeListEl.innerHTML = products.map((p, idx) => cardTemplate(p, idx, false)).join('');
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

function initSearch() {
	if (!storeSearchInput) return;
	storeSearchInput.addEventListener('input', () => {
		activeSearchTerm = storeSearchInput.value || '';
		renderStoreCards(getFilteredStoreProducts());
	});
}

async function renderStoreList() {
	if (!storeListEl) return;
	const baseProducts = await getStoreProducts();
	const baseById = new Map(
		baseProducts
			.filter((p) => Number.isFinite(Number(p && p.id)))
			.map((p) => [Number(p.id), p])
	);
	const custom = getStoredProducts();
	const overridesById = new Map(
		custom
			.filter((p) => Number.isFinite(Number(p && p.id)))
			.map((p) => [Number(p.id), p])
	);

	const products = baseProducts.map((p) => (overridesById.has(Number(p.id)) ? { ...p, ...overridesById.get(Number(p.id)) } : p));

	// Preserve store description when an override contains old placeholder text.
	products.forEach((p, idx) => {
		const override = overridesById.get(Number(p.id));
		const baseProduct = baseById.get(Number(p.id));
		if (!override) return;

		const desc = Array.isArray(override.description)
			? override.description.map((d) => (d || '').toString().trim()).filter(Boolean)
			: [];
		const name = (override.name || p.name || '').toString().trim().toLowerCase();
		const isPlaceholder = desc.length === 1 && desc[0].toLowerCase() === name;

		if (isPlaceholder || !desc.length) {
			products[idx].description = baseProduct ? baseProduct.description : p.description;
		}
	});

	if (!products.length) {
		storeListEl.innerHTML = '<p class="help">Could not load store products.</p>';
		return;
	}

	allStoreProducts = products;
	renderCategoryTabs();
	renderStoreCards(getFilteredStoreProducts());
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

form.addEventListener('submit', async (event) => {
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
		colors: colors.length ? colors : ['Default'],
		sizes: sizes.length ? sizes : getDefaultSizesForCategory(category),
		category: category || 'Shoes'
	};

	if (descriptionText) {
		payload.description = [descriptionText];
	}

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
	setSyncStatus('Saved locally (no server sync)', false);
	alert('Product saved locally. Use Export Hardcode Block to publish in products.js.');
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

if (exportHardcodeBtn) {
	exportHardcodeBtn.addEventListener('click', async () => {
		const items = getStoredProducts();
		if (!items.length) {
			alert('No custom products to export yet.');
			return;
		}
		const block = toHardcodeBlock(items);
		if (hardcodeOutputEl) hardcodeOutputEl.value = block;
		try {
			await navigator.clipboard.writeText(block);
			setSyncStatus('Hardcode block copied. Paste into products.js', true);
		} catch {
			setSyncStatus('Hardcode block generated. Copy from textarea below.', true);
		}
	});
}

renderList();
initSearch();
renderStoreList();

(async () => {
	setSyncStatus('Local-only persistence (no server sync)', false);
})();
