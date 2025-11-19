// orders.module.js
// Front-end orders data model stored in LocalStorage

const STORAGE_KEY = 'rakotee_orders_v1';

const VALID_ORDER_STATUSES = ['Placed','Processing','Shipped','Delivered','Cancelled'];
const VALID_PAYMENT_STATUSES = ['Paid','Pending','Failed'];

function generateId(){
  return 'ord_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,9);
}

function nowISO(){ return new Date().toISOString(); }

function readStore(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); }catch(e){ return []; } }
function writeStore(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent('orders-updated',{detail:{count: list.length}})); }

function validateProduct(p){ if(!p) return false; if(typeof p.id === 'undefined') return false; if(!p.name) return false; if(isNaN(Number(p.price))) return false; if(isNaN(parseInt(p.quantity,10))) return false; return true; }
function validateOrderData(d){ if(!d) throw new Error('orderData required'); if(!d.customerName) throw new Error('customerName required'); if(!d.customerEmail) throw new Error('customerEmail required'); if(!Array.isArray(d.products) || !d.products.length) throw new Error('products required'); d.products.forEach(p=>{ if(!validateProduct(p)) throw new Error('invalid product in products'); }); }

export function createOrder(orderData){
  validateOrderData(orderData);
  const orders = readStore();
  const orderId = generateId();
  const total = orderData.products.reduce((s,p)=> s + (Number(p.price) * (Number(p.quantity)||0)), 0);
  const order = {
    orderId,
    customerName: String(orderData.customerName),
    customerEmail: String(orderData.customerEmail),
    customerPhone: orderData.customerPhone ? String(orderData.customerPhone) : '',
    products: orderData.products.map(p=>({ id: String(p.id), name: String(p.name), price: Number(p.price), quantity: Number(p.quantity)||1, image: p.image||'' })),
    totalAmount: Number(total),
    paymentStatus: orderData.paymentStatus && VALID_PAYMENT_STATUSES.includes(orderData.paymentStatus) ? orderData.paymentStatus : 'Pending',
    orderStatus: orderData.orderStatus && VALID_ORDER_STATUSES.includes(orderData.orderStatus) ? orderData.orderStatus : 'Placed',
    createdAt: nowISO()
  };
  orders.unshift(order); // newest first
  writeStore(orders);
  return order;
}

export function getAllOrders(){ return readStore(); }
export function getOrder(orderId){ return readStore().find(o=>o.orderId===orderId) || null; }

export function updateOrderStatus(orderId, newStatus){ if(!VALID_ORDER_STATUSES.includes(newStatus)) throw new Error('invalid order status'); const orders = readStore(); const idx = orders.findIndex(o=>o.orderId===orderId); if(idx===-1) throw new Error('order not found'); orders[idx].orderStatus = newStatus; writeStore(orders); return orders[idx]; }
export function updatePaymentStatus(orderId, newStatus){ if(!VALID_PAYMENT_STATUSES.includes(newStatus)) throw new Error('invalid payment status'); const orders = readStore(); const idx = orders.findIndex(o=>o.orderId===orderId); if(idx===-1) throw new Error('order not found'); orders[idx].paymentStatus = newStatus; writeStore(orders); return orders[idx]; }

export function clearAllOrders(){ writeStore([]); }

// expose for non-module usage as well
if(typeof window !== 'undefined'){
  window.Orders = {
    createOrder, getAllOrders, getOrder, updateOrderStatus, updatePaymentStatus, clearAllOrders
  };
}

export default { createOrder, getAllOrders, getOrder, updateOrderStatus, updatePaymentStatus, clearAllOrders };
