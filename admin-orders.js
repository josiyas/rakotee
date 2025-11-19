import * as Orders from './orders.module.js';

const tblBody = document.querySelector('#ordersTable tbody');
const searchInput = document.getElementById('searchInput');
const btnNewSample = document.getElementById('btnNewSample');
const btnClearAll = document.getElementById('btnClearAll');
const btnExport = document.getElementById('btnExport');
const importFile = document.getElementById('importFile');
const modal = document.getElementById('orderModal');
const modalClose = document.getElementById('modalClose');

function formatCurrency(v){ return 'R ' + Number(v).toFixed(2); }
function formatDate(iso){ try{ return new Date(iso).toLocaleString(); }catch(e){ return iso; } }

function renderTable(filter){
  const orders = Orders.getAllOrders();
  const q = (filter||'').toLowerCase().trim();
  tblBody.innerHTML = '';
  orders.forEach(o=>{
    if(q){ const hay = (o.orderId+ ' ' + o.customerName + ' ' + o.customerEmail).toLowerCase(); if(!hay.includes(q)) return; }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="id">${o.orderId}</td>
      <td>
        <div class="cust-name">${escapeHtml(o.customerName)}</div>
        <div class="cust-email">${escapeHtml(o.customerEmail)}</div>
      </td>
      <td>${formatCurrency(o.totalAmount)}</td>
      <td>
        <select class="payment-select" data-id="${o.orderId}">
          ${['Paid','Pending','Failed'].map(s=>`<option value="${s}" ${o.paymentStatus===s? 'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>
        <select class="status-select" data-id="${o.orderId}">
          ${['Placed','Processing','Shipped','Delivered','Cancelled'].map(s=>`<option value="${s}" ${o.orderStatus===s? 'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>${formatDate(o.createdAt)}</td>
      <td>
        <button class="btn view-btn" data-id="${o.orderId}">View Details</button>
      </td>
    `;
    tblBody.appendChild(tr);
  });
}

function escapeHtml(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// handle events
tblBody.addEventListener('change', (e)=>{
  const sel = e.target;
  if(sel.classList.contains('status-select')){
    const id = sel.dataset.id; const ns = sel.value; try{ Orders.updateOrderStatus(id, ns); }catch(err){ alert(err.message); }
  }
  if(sel.classList.contains('payment-select')){
    const id = sel.dataset.id; const ns = sel.value; try{ Orders.updatePaymentStatus(id, ns); }catch(err){ alert(err.message); }
  }
});

tblBody.addEventListener('click', (e)=>{
  const btn = e.target.closest('.view-btn'); if(!btn) return; const id = btn.dataset.id; openModal(id);
});

function openModal(orderId){
  const order = Orders.getOrder(orderId); if(!order) return alert('Order not found');
  modal.querySelector('.customer-info').innerHTML = `
    <h4>Customer</h4>
    <p><strong>${escapeHtml(order.customerName)}</strong><br>${escapeHtml(order.customerEmail)}<br>${escapeHtml(order.customerPhone||'')}</p>
  `;
  modal.querySelector('.products-list').innerHTML = `
    <h4>Products</h4>
    <div class="products">
      ${order.products.map(p=>`<div class="product-row"><img src="${escapeHtml(p.image||'')}" alt=""/><div><div class="pname">${escapeHtml(p.name)}</div><div>Qty: ${p.quantity}</div><div>Price: ${formatCurrency(p.price)}</div></div></div>`).join('')}
    </div>
  `;
  modal.querySelector('.order-financials').innerHTML = `
    <h4>Totals</h4>
    <p>Subtotal: ${formatCurrency(order.totalAmount)}</p>
    <p>Created: ${formatDate(order.createdAt)}</p>
  `;
  modal.querySelector('.order-controls').innerHTML = `
    <label>Payment Status:
      <select id="modalPayment">
        ${['Paid','Pending','Failed'].map(s=>`<option value="${s}" ${order.paymentStatus===s ? 'selected':''}>${s}</option>`).join('')}
      </select>
    </label>
    <label>Order Status:
      <select id="modalStatus">
        ${['Placed','Processing','Shipped','Delivered','Cancelled'].map(s=>`<option value="${s}" ${order.orderStatus===s ? 'selected':''}>${s}</option>`).join('')}
      </select>
    </label>
    <div class="modal-actions">
      <button id="modalSave" class="btn">Save</button>
      <button id="modalCancel" class="btn">Close</button>
    </div>
  `;
  modal.setAttribute('aria-hidden','false'); modal.classList.add('open');

  modal.querySelector('#modalCancel').addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  modal.querySelector('#modalSave').addEventListener('click', ()=>{
    const newPay = modal.querySelector('#modalPayment').value;
    const newStatus = modal.querySelector('#modalStatus').value;
    try{ Orders.updatePaymentStatus(orderId, newPay); Orders.updateOrderStatus(orderId, newStatus); alert('Saved'); closeModal(); }catch(err){ alert(err.message); }
  }, { once:true });
}
function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }

// search
searchInput.addEventListener('input', ()=>{ renderTable(searchInput.value); });

// sample data
btnNewSample.addEventListener('click', ()=>{
  const sample = {
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+27123456789',
    products: [ { id: 'p1', name: 'Sample Tea', price: 49.99, quantity: 2, image: '' } ],
  };
  Orders.createOrder(sample); renderTable();
});

btnClearAll.addEventListener('click', ()=>{ if(confirm('Clear ALL orders?')){ Orders.clearAllOrders(); renderTable(); } });

// Export orders as JSON
btnExport.addEventListener('click', ()=>{
  try{
    const data = Orders.getAllOrders();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `rakotee-orders-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }catch(e){ alert('Export failed: ' + e.message); }
});

// Import orders from JSON file - replaces existing orders after confirmation
importFile.addEventListener('change', (e)=>{
  const f = e.target.files && e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const parsed = JSON.parse(ev.target.result);
      if(!Array.isArray(parsed)) throw new Error('Invalid format: expected array of orders');
      // basic schema validation
      const ok = parsed.every(o => o && o.orderId && o.customerName && o.customerEmail && Array.isArray(o.products) && typeof o.totalAmount !== 'undefined');
      if(!ok) throw new Error('JSON schema mismatch — orders must include orderId, customerName, customerEmail, products, totalAmount');
      if(!confirm('Import will replace all existing orders. Continue?')) return;
      // write directly to storage key used by Orders module
      localStorage.setItem('rakotee_orders_v1', JSON.stringify(parsed));
      window.dispatchEvent(new CustomEvent('orders-updated', { detail: { count: parsed.length } }));
      renderTable();
      alert('Import complete');
    }catch(err){ alert('Import failed: ' + err.message); }
  };
  reader.readAsText(f);
});

// listen for updates
window.addEventListener('orders-updated', ()=> renderTable(searchInput.value));

// initial render
document.addEventListener('DOMContentLoaded', ()=> renderTable());
