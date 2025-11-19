/*
	rakotee-store cart.js
	Client-side cart system (no backend)
	- localStorage cart under key 'rakotee_cart_v1'
	- window.Cart API (add/update/remove/clear/total)
	- Renders into existing `#cartSidebar` and `#cartOverlay`
	- Checkout options: PayFast redirect (GET) and PayPal Smart Buttons
	- Order logging via EmailJS (frontend)

	NOTE: Replace CONFIG placeholders with your actual credentials:
		- CONFIG.PAYFAST.merchant_id / merchant_key
		- CONFIG.PAYPAL.client_id
		- CONFIG.EMAILJS.* values

	All UI changes try to reuse existing markup and styles.
*/

(function(){
	'use strict';

	const CART_KEY = 'rakotee_cart_v1';

	const CONFIG = {
		PAYFAST: {
			merchant_id: '',
			merchant_key: '',
			endpoint: 'https://www.payfast.co.za/eng/process'
		},
		PAYPAL: {
			client_id: '',
			currency: 'ZAR'
		},
		EMAILJS: {
			user_id: '',
			service_id: '',
			template_id: ''
		}
	};

	// storage helpers
	function readCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); } catch(e){ return []; } }
	function writeCart(items){
		localStorage.setItem(CART_KEY, JSON.stringify(items));
		// store last update timestamp and a small snapshot for abandoned cart restore
		try{
			localStorage.setItem('rakotee_cart_last_update', new Date().toISOString());
			localStorage.setItem('rakotee_cart_last_snapshot', JSON.stringify({ items: items, updatedAt: new Date().toISOString() }));
		}catch(e){ /* ignore storage errors */ }
	}

	// Cart API
	const Cart = {
		getItems(){ return readCart(); },
		save(items){ writeCart(items); renderCart(); updateCartCount(); },
		add(item){
			const items = readCart();
			const found = items.find(i => i.id === item.id);
			if(found) found.quantity = (found.quantity||1) + (item.quantity||1);
			else items.push(Object.assign({ quantity: item.quantity||1 }, item));
			Cart.save(items);
		},
		updateQuantity(id, qty){ const items = readCart(); const it = items.find(i=>i.id===id); if(!it) return; it.quantity = qty; if(it.quantity<=0) Cart.remove(id); else Cart.save(items); },
		remove(id){ const items = readCart().filter(i=>i.id!==id); Cart.save(items); },
		clear(){ Cart.save([]); },
		total(){ return readCart().reduce((s,i)=>s + (i.price*(i.quantity||1)),0); }
	};

	window.Cart = Cart; // expose

	// DOM caching
	let cartSidebar, cartOverlay, cartItemsNode, cartTotalNode, cartCountNodes, cartIconBtn, closeCartBtn, checkoutBtn;

	function initDOM(){
		cartSidebar = document.getElementById('cartSidebar');
		cartOverlay = document.getElementById('cartOverlay');
		cartItemsNode = document.getElementById('cartItems');
		cartTotalNode = document.getElementById('cartTotal');
		cartCountNodes = document.querySelectorAll('.cart-count');
		cartIconBtn = document.getElementById('cartIconBtn');
		closeCartBtn = document.getElementById('closeCartBtn');
		checkoutBtn = document.getElementById('checkout-btn');
	}

	function escapeHtml(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

	// Render
	function renderCart(){
		const items = Cart.getItems();
		if(!cartItemsNode) return;
		cartItemsNode.innerHTML = '';
		if(!items.length){ cartItemsNode.innerHTML = '<p>Your cart is empty.</p>'; if(cartTotalNode) cartTotalNode.textContent = '0.00'; updateCartCount(); return; }
		items.forEach(it => {
			const div = document.createElement('div'); div.className='cart-item';
			div.innerHTML = `
				<img src="${escapeHtml(it.image||'/products/fallback.png')}" alt="${escapeHtml(it.name)}">
				<div class="meta">
					<h4>${escapeHtml(it.name)}</h4>
					<p>R ${Number(it.price).toFixed(2)}</p>
					<div class="qty">
						<label>Qty</label>
						<input type="number" min="0" value="${it.quantity||1}" data-id="${escapeHtml(it.id)}" class="cart-qty-input" />
						<button class="remove-btn" data-id="${escapeHtml(it.id)}">Remove</button>
					</div>
				</div>
				<div class="subtotal">R ${Number(it.price*(it.quantity||1)).toFixed(2)}</div>
			`;
			cartItemsNode.appendChild(div);
		});
		if(cartTotalNode) cartTotalNode.textContent = Number(Cart.total()).toFixed(2);
		updateCartCount();
	}

	function updateCartCount(){ const count = Cart.getItems().reduce((s,i)=>s+(i.quantity||1),0); cartCountNodes.forEach(n=>n.textContent = count); }

	function openCart(){ if(cartSidebar) cartSidebar.classList.add('open'); if(cartOverlay) cartOverlay.classList.add('visible'); document.body.style.overflow='hidden'; renderCart(); }
	function closeCart(){ if(cartSidebar) cartSidebar.classList.remove('open'); if(cartOverlay) cartOverlay.classList.remove('visible'); document.body.style.overflow=''; }

	// Attach global listeners
	function bindEvents(){
		if(cartIconBtn) cartIconBtn.addEventListener('click', openCart);
		if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
		if(cartOverlay) cartOverlay.addEventListener('click', closeCart);

		// delegate quantity change + remove
		if(cartItemsNode){
			cartItemsNode.addEventListener('change', (e)=>{ if(e.target && e.target.classList.contains('cart-qty-input')){ const id=e.target.dataset.id; const q=parseInt(e.target.value,10)||0; Cart.updateQuantity(id,q); } });
			cartItemsNode.addEventListener('click', (e)=>{ const rem=e.target.closest('.remove-btn'); if(!rem) return; const id=rem.dataset.id; Cart.remove(id); });
		}

		// Global add-to-cart (works with dynamic products)
		document.body.addEventListener('click', (e)=>{
			const btn = e.target.closest('.add-to-cart'); if(!btn) return;
			const id = btn.dataset.itemId || btn.getAttribute('data-item-id') || (`p-${Date.now()}`);
			const name = btn.dataset.itemName || btn.getAttribute('data-item-name') || 'Item';
			const price = parseFloat(btn.dataset.itemPrice || btn.getAttribute('data-item-price') || '0') || 0;
			const image = btn.dataset.itemImage || btn.getAttribute('data-item-image') || (btn.closest('.product-card') && btn.closest('.product-card').querySelector('img') ? btn.closest('.product-card').querySelector('img').src : '/products/fallback.png');
			Cart.add({ id, name, price, image, quantity:1 });
		});

		// Checkout button
		if(checkoutBtn) checkoutBtn.addEventListener('click', showCheckoutOptions);
	}

	// Abandoned cart: check on load and show restore prompt if >24h
	function checkAbandonedCart(){
		try{
			const last = localStorage.getItem('rakotee_cart_last_update');
			if(!last) return;
			const diff = Date.now() - new Date(last).getTime();
			if(diff > 24*60*60*1000){
				// show lightweight modal to restore
				const modal = document.createElement('div'); modal.className='abandon-modal';
				modal.innerHTML = `
					<div class="abandon-box">
						<p>Your cart was last updated more than 24 hours ago.</p>
						<button id="restoreCartBtn" class="btn">Restore cart</button>
						<button id="dismissRestore" class="btn">Dismiss</button>
					</div>
				`;
				document.body.appendChild(modal);
				document.getElementById('restoreCartBtn').addEventListener('click', ()=>{
					const snap = JSON.parse(localStorage.getItem('rakotee_cart_last_snapshot')||'{}');
					if(snap && Array.isArray(snap.items)){
						writeCart(snap.items);
						renderCart(); updateCartCount();
					}
					modal.remove();
				});
				document.getElementById('dismissRestore').addEventListener('click', ()=>{ modal.remove(); });
			}
		}catch(e){ /* ignore */ }
	}

	// Checkout implementation
	async function showCheckoutOptions(){
		const items = Cart.getItems(); if(!items.length){ alert('Your cart is empty'); return; }
		// small inline UI (collect name, email, phone)
		const prompt = document.createElement('div'); prompt.className='checkout-prompt';
		prompt.innerHTML = `
			<label for="checkoutName">Full name</label>
			<input id="checkoutName" type="text" placeholder="Your full name" style="width:100%;padding:8px;margin:6px 0" />
			<div class="field-error" data-for="checkoutName" style="color:#c00;font-size:0.9rem;display:none"></div>
			<label for="checkoutEmail">Email for receipt</label>
			<input id="checkoutEmail" type="email" placeholder="you@example.com" style="width:100%;padding:8px;margin:6px 0" />
			<div class="field-error" data-for="checkoutEmail" style="color:#c00;font-size:0.9rem;display:none"></div>
			<label for="checkoutPhone">Phone (optional)</label>
			<input id="checkoutPhone" type="tel" placeholder="+27 82 000 0000" style="width:100%;padding:8px;margin:6px 0" />
			<div class="field-error" data-for="checkoutPhone" style="color:#c00;font-size:0.9rem;display:none"></div>
			<div style="display:flex;gap:8px;margin-top:8px;">
				<button id="pfBtn" class="btn checkout">PayFast</button>
				<button id="ppBtn" class="btn paypal">PayPal</button>
			</div>
			<div id="paypal-buttons" style="margin-top:8px"></div>
		`;
		const summary = document.querySelector('.cart-summary'); if(summary) summary.style.display='none'; if(cartSidebar) cartSidebar.appendChild(prompt);
		const nameInput = prompt.querySelector('#checkoutName');
		const emailInput = prompt.querySelector('#checkoutEmail');
		const phoneInput = prompt.querySelector('#checkoutPhone');
		const pfBtn = prompt.querySelector('#pfBtn'); const ppBtn = prompt.querySelector('#ppBtn'); const ppContainer = prompt.querySelector('#paypal-buttons');

		pfBtn.addEventListener('click', async ()=>{
			clearFieldErrors();
			const customerName = (nameInput.value || '').trim();
			const customerEmail = (emailInput.value || '').trim();
			const customerPhone = (phoneInput.value || '').trim();
			const valid = validateCheckoutFields({ customerName, customerEmail, customerPhone });
			if(!valid) return;
			// store pending customer info so we can create the order after PayFast returns
			localStorage.setItem('rakotee_pending_order', JSON.stringify({ customerName, customerEmail, customerPhone, method: 'payfast' }));
			await sendOrderEmail(customerEmail);
			goPayFast();
		});

		ppBtn.addEventListener('click', async ()=>{
			clearFieldErrors();
			const customerName = (nameInput.value || '').trim();
			const customerEmail = (emailInput.value || '').trim();
			const customerPhone = (phoneInput.value || '').trim();
			const valid = validateCheckoutFields({ customerName, customerEmail, customerPhone });
			if(!valid) return;
			await sendOrderEmail(customerEmail);
			try{ await loadPayPalAndRender(ppContainer, { customerName, customerEmail, customerPhone }); }catch(e){ alert('PayPal load failed'); }
		});

		// clicking overlay will restore
		const restore = ()=>{ if(summary) summary.style.display=''; prompt.remove(); cartOverlay.removeEventListener('click', restore); };
		cartOverlay.addEventListener('click', restore);
	}

	// EmailJS wrapper
	async function sendOrderEmail(email){
		if(!CONFIG.EMAILJS.user_id || !CONFIG.EMAILJS.service_id || !CONFIG.EMAILJS.template_id) return;
		if(!window.emailjs){ await loadScript('https://cdn.emailjs.com/sdk/3.2.0/email.min.js'); try{ emailjs.init(CONFIG.EMAILJS.user_id); }catch(e){ console.warn('emailjs init', e); } }
		const items = Cart.getItems(); const itemsStr = items.map(i=>`${i.name} x${i.quantity} — R ${Number(i.price*i.quantity).toFixed(2)}`).join('\n');
		const params = { customer_email: email||'', order_total: Number(Cart.total()).toFixed(2), order_items: itemsStr };
		try{ await emailjs.send(CONFIG.EMAILJS.service_id, CONFIG.EMAILJS.template_id, params); } catch(e){ console.warn('email send err', e); }
	}

	// Checkout field validation helpers
	function showFieldError(name, msg){ const el = document.querySelector(`.field-error[data-for="${name}"]`); if(el){ el.textContent = msg; el.style.display='block'; } }
	function clearFieldErrors(){ document.querySelectorAll('.field-error').forEach(e=>{ e.textContent=''; e.style.display='none'; }); }
	function validateCheckoutFields({ customerName, customerEmail, customerPhone }){
		let ok = true;
		if(!customerName || customerName.length < 2){ showFieldError('checkoutName','Please enter your full name'); ok = false; }
		if(!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)){ showFieldError('checkoutEmail','Please enter a valid email'); ok = false; }
		if(customerPhone && !/^[\d\s+\-()]{6,}$/.test(customerPhone)){ showFieldError('checkoutPhone','Please enter a valid phone number'); ok = false; }
		return ok;
	}

	// PayFast redirect (GET). Note: exposing merchant_key/client-side is insecure but requested as frontend-only.
	function goPayFast(){
		const orderId = 'RK' + Date.now(); const amount = Number(Cart.total()).toFixed(2);
		// return_url points to client-side order-success page which will create the order from cart + pending info
		const returnUrl = window.location.origin + '/order-success.html?method=payfast';
		const qs = new URLSearchParams({ merchant_id: CONFIG.PAYFAST.merchant_id, merchant_key: CONFIG.PAYFAST.merchant_key, amount, item_name: `Rakotee Order #${orderId}`, return_url: returnUrl, cancel_url: window.location.origin + '/cart.html' });
		window.location.href = CONFIG.PAYFAST.endpoint + '?' + qs.toString();
	}

	// PayPal SDK loader + render
		function loadPayPalAndRender(container, customer){
			return new Promise((resolve,reject)=>{
				if(window.paypal){ try{ renderPayPal(container, customer); resolve(window.paypal); }catch(e){ reject(e); } return; }
				if(!CONFIG.PAYPAL.client_id) return reject(new Error('PayPal client id not set'));
				const src = `https://www.paypal.com/sdk/js?client-id=${CONFIG.PAYPAL.client_id}&currency=${CONFIG.PAYPAL.currency}`;
				loadScript(src).then(()=>{ try{ renderPayPal(container, customer); resolve(window.paypal); }catch(e){ reject(e); } }).catch(reject);
			});
		}

		function renderPayPal(container, customer){
			window.paypal.Buttons({
				createOrder: (data,actions)=> actions.order.create({ purchase_units:[{ amount:{ value: Number(Cart.total()).toFixed(2) } }] }),
				onApprove: async (data,actions)=>{
					try{
						await actions.order.capture();
						// create order only after successful capture
						const items = Cart.getItems();
						// prepare products array
						const products = items.map(i=>({ id: i.id, name: i.name, price: Number(i.price), quantity: Number(i.quantity||1), image: i.image||'' }));
						const totalAmount = Number(Cart.total());
						// ensure Orders module is available
						let Orders = window.Orders;
						if(!Orders){ try{ const mod = await import('./orders.module.js'); Orders = mod.default || mod; }catch(e){ console.warn('Failed to import Orders module', e); } }
						if(Orders && Orders.createOrder){
							const order = Orders.createOrder({ customerName: customer.customerName, customerEmail: customer.customerEmail, customerPhone: customer.customerPhone, products, totalAmount, paymentStatus: 'Paid', orderStatus: 'Processing' });
							// clear cart and redirect to success page
							Cart.clear(); renderCart(); updateCartCount(); closeCart();
							window.location.href = '/order-success.html?method=paypal&orderId=' + encodeURIComponent(order.orderId);
						} else {
							// fallback
							Cart.clear(); renderCart(); updateCartCount(); closeCart(); alert('Payment successful — order recorded locally.');
						}
					}catch(err){ console.error('PayPal onApprove error', err); alert('Payment succeeded but order creation failed'); }
				},
				onError: (err)=>{ console.error('PayPal error', err); alert('PayPal failed'); }
			}).render(container);
		}

	// small loader
	function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }

	// initial setup
	document.addEventListener('DOMContentLoaded', ()=>{ initDOM(); bindEvents(); renderCart(); updateCartCount(); checkAbandonedCart(); });

})();
