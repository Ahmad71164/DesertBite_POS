// Quick API CRUD test
const BASE = 'http://localhost:5000/api';

const login = await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'Admin', password: 'DesertBite@786' })
});
const { token } = await login.json();
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

console.log('\n=== CUSTOMER CRUD ===');
// Create
const cr = await fetch(`${BASE}/customers`, { method: 'POST', headers: H, body: JSON.stringify({ name: 'CRM Test Customer', phone: '03011112222' }) });
console.log('POST /customers:', cr.status);
const cust = await cr.json();
console.log('  Created:', JSON.stringify(cust).substring(0, 150));

if (cust.id) {
  // Update
  const ur = await fetch(`${BASE}/customers/${cust.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ name: 'Updated CRM Customer', email: 'test@crm.com', address: 'Test Address 123' }) });
  console.log('PATCH /customers/:id:', ur.status);
  const uc = await ur.json();
  console.log('  Updated:', JSON.stringify(uc).substring(0, 150));

  // Delete
  const dr = await fetch(`${BASE}/customers/${cust.id}`, { method: 'DELETE', headers: H });
  console.log('DELETE /customers/:id:', dr.status, await dr.json());
}

console.log('\n=== EMPLOYEE CRUD ===');
// Create user
const eu = await fetch(`${BASE}/users`, { method: 'POST', headers: H, body: JSON.stringify({ name: 'Test Employee', email: 'testemployee@desertbite.local', password: 'TestPass123', role: 'CASHIER' }) });
console.log('POST /users:', eu.status);
const emp = await eu.json();
console.log('  Created:', JSON.stringify(emp).substring(0, 150));

if (emp.id) {
  // Update
  const eur = await fetch(`${BASE}/users/${emp.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ name: 'Updated Employee', role: 'CASHIER', active: true }) });
  console.log('PATCH /users/:id:', eur.status);
  const eu2 = await eur.json();
  console.log('  Updated:', JSON.stringify(eu2).substring(0, 150));

  // Delete
  const edr = await fetch(`${BASE}/users/${emp.id}`, { method: 'DELETE', headers: H });
  console.log('DELETE /users/:id:', edr.status, await edr.json());
}

console.log('\n=== MENU CRUD ===');
const cats = await (await fetch(`${BASE}/menu/categories`, { headers: H })).json();
const catId = cats[0]?.id;
console.log('Category to use:', catId);

const mi = await fetch(`${BASE}/menu/items`, { method: 'POST', headers: H, body: JSON.stringify({ name: 'Test Item CRUD', categoryId: catId, sellingPrice: 350, costPrice: 100, preparationTime: 10 }) });
console.log('POST /menu/items:', mi.status);
const item = await mi.json();
console.log('  Created:', JSON.stringify(item).substring(0, 150));

if (item.id) {
  const mir = await fetch(`${BASE}/menu/items/${item.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ name: 'Updated Test Item', sellingPrice: 400 }) });
  console.log('PATCH /menu/items/:id:', mir.status);
  const di = await fetch(`${BASE}/menu/items/${item.id}`, { method: 'DELETE', headers: H });
  console.log('DELETE /menu/items/:id:', di.status);
}
