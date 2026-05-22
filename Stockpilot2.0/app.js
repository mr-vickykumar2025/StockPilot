// ── DATA ──────────────────────────────────────────────────────────────────
const USERS = [{username:'admin',password:'admin123',name:'Admin',role:'Store Manager'}];
let currentUser = null;
let products = [], auditLog = [], invoices = [], cart = [];
let editingProductId = null, adjustingProductId = null;

async function loadData() {

  if (!currentUser) return;

  try {

    const doc = await db
      .collection("users")
      .doc(currentUser.uid)
      .get();

    if (doc.exists) {

      const data = doc.data();

      products = data.products || [];
      auditLog = data.auditLog || [];
      invoices = data.invoices || [];

    } else {

      seedProducts();
      await saveData();

    }

  } catch (err) {
    console.error(err);
  }
}
async function saveData() {

  if (!currentUser) return;

  try {

    await db.collection("users")
      .doc(currentUser.uid)
      .set({
        products,
        auditLog,
        invoices
      });

    console.log("Data Saved");

  } catch (err) {
    console.error(err);
  }
}
function seedProducts() {
  products = [
    {id:genId(),sku:'ELC-001',name:'Wireless Headphones',category:'Electronics',price:2499,stock:34,threshold:10,unit:'pcs',supplier:'TechMart',desc:'Over-ear Bluetooth headphones'},
    {id:genId(),sku:'ELC-002',name:'USB-C Hub',category:'Electronics',price:1299,stock:8,threshold:10,unit:'pcs',supplier:'TechMart',desc:'7-in-1 USB-C hub'},
    {id:genId(),sku:'CLO-001',name:'Cotton T-Shirt',category:'Clothing',price:349,stock:65,threshold:15,unit:'pcs',supplier:'FabricKing',desc:'Premium cotton round neck'},
    {id:genId(),sku:'CLO-002',name:'Denim Jeans',category:'Clothing',price:999,stock:4,threshold:8,unit:'pcs',supplier:'FabricKing',desc:'Slim fit denim'},
    {id:genId(),sku:'FNB-001',name:'Green Tea Pack',category:'Food & Beverage',price:189,stock:52,threshold:20,unit:'box',supplier:'NatureLeaf',desc:'100 tea bags'},
    {id:genId(),sku:'FNB-002',name:'Mineral Water 1L',category:'Food & Beverage',price:25,stock:120,threshold:30,unit:'pcs',supplier:'HydroSupply',desc:'Purified mineral water'},
    {id:genId(),sku:'HLD-001',name:'Desk Lamp LED',category:'Household',price:799,stock:7,threshold:5,unit:'pcs',supplier:'BrightHome',desc:'Adjustable LED desk lamp'},
    {id:genId(),sku:'STN-001',name:'Ballpoint Pen Set',category:'Stationery',price:149,stock:0,threshold:10,unit:'pack',supplier:'OfficeDeals',desc:'12-pen set'},
  ];
  saveData();
}
function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function addAudit(type,detail){
  auditLog.unshift({id:genId(),time:new Date().toISOString(),user:currentUser?.name||'System',type,detail});
  if(auditLog.length>500)auditLog=auditLog.slice(0,500);
  saveData();
}

// ── AUTH ──────────────────────────────────────────────────────────────────
function doLogin(){
  const u=document.getElementById('login-user').value.trim();
  const p=document.getElementById('login-pass').value;
  const found=USERS.find(x=>x.username===u&&x.password===p);
  if(found){
    currentUser=found;
    document.getElementById('login-error').style.display='none';
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').style.display='block';
    document.getElementById('sidebar-name').textContent=found.name;
    document.getElementById('sidebar-avatar').textContent=found.name[0].toUpperCase();
    addAudit('LOGIN',`User "${found.name}" logged in`);
    loadData();
    refreshDashboard();
    renderInventory();
    renderPOS();
    renderInvoicesList();
    renderAudit();
  } else {
    document.getElementById('login-error').style.display='block';
  }
}
function doLogout(){
  addAudit('LOGIN',`User "${currentUser.name}" logged out`);
  currentUser=null;
  document.getElementById('app').style.display='none';
  document.getElementById('login-screen').style.display='flex';
  document.getElementById('login-user').value='';
  document.getElementById('login-pass').value='';
}
document.getElementById('login-pass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});
document.getElementById('login-user').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});

// ── NAVIGATION ────────────────────────────────────────────────────────────
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>{if(n.textContent.toLowerCase().includes(name.split('-')[0]))n.classList.add('active')});
  if(name==='dashboard')refreshDashboard();
  if(name==='invoices'){document.getElementById('invoices-list-wrap').style.display='block';document.getElementById('invoice-detail').style.display='none';renderInvoicesList();}
  if(name==='audit')renderAudit();
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function refreshDashboard(){
  const totalProducts=products.length;
  const totalValue=products.reduce((s,p)=>s+p.price*p.stock,0);
  const lowStock=products.filter(p=>p.stock<=p.threshold&&p.stock>0);
  const outOfStock=products.filter(p=>p.stock===0);
  const todaySales=invoices.filter(inv=>{const d=new Date(inv.date);const t=new Date();return d.toDateString()===t.toDateString()});
  const todayRevenue=todaySales.reduce((s,inv)=>s+inv.total,0);

  document.getElementById('dash-stats').innerHTML=`
    <div class="stat-card blue"><div class="stat-label">Total Products</div><div class="stat-value">${totalProducts}</div><div class="stat-delta" style="color:var(--text3)">${outOfStock.length} out of stock</div></div>
    <div class="stat-card green"><div class="stat-label">Inventory Value</div><div class="stat-value">₹${Math.round(totalValue).toLocaleString('en-IN')}</div><div class="stat-delta" style="color:var(--text3)">across all products</div></div>
    <div class="stat-card amber"><div class="stat-label">Low Stock Items</div><div class="stat-value">${lowStock.length}</div><div class="stat-delta" style="color:var(--text3)">below threshold</div></div>
    <div class="stat-card green"><div class="stat-label">Today's Revenue</div><div class="stat-value">₹${Math.round(todayRevenue).toLocaleString('en-IN')}</div><div class="stat-delta" style="color:var(--text3)">${todaySales.length} sales today</div></div>
  `;

  const allLow=products.filter(p=>p.stock<=p.threshold);
  const banner=document.getElementById('low-stock-banner');
  if(allLow.length){
    banner.style.display='flex';
    document.getElementById('low-stock-text').innerHTML=`<strong>${allLow.length} product(s)</strong> are at or below their low stock threshold. Restock soon!`;
  } else {banner.style.display='none';}

  const txBody=document.getElementById('dash-transactions-body');
  const recent=auditLog.filter(a=>a.type==='SALE').slice(0,6);
  txBody.innerHTML=recent.length?recent.map(a=>`<tr><td style="color:var(--text)">${a.detail.split('"')[1]||'Sale'}</td><td><span class="badge badge-blue">Sale</span></td><td>${a.detail.match(/(\d+) x/)?.[1]||'-'}</td><td style="color:var(--green)">₹${a.detail.match(/₹([\d,]+)/)?.[1]||'-'}</td><td style="color:var(--text3)">${timeAgo(a.time)}</td></tr>`).join('')
    :`<tr><td colspan="5" class="empty-state" style="padding:2rem;text-align:center;color:var(--text3)">No transactions yet</td></tr>`;

  const lowBody=document.getElementById('low-stock-table');
  const lowItems=products.filter(p=>p.stock<=p.threshold).slice(0,8);
  lowBody.innerHTML=lowItems.length?lowItems.map(p=>`<tr><td style="color:var(--text)">${p.name}</td><td><span class="badge ${p.stock===0?'badge-red':'badge-amber'}">${p.stock}</span></td><td style="color:var(--text3)">${p.threshold}</td></tr>`).join('')
    :`<tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--green)">✓ All stock levels healthy</td></tr>`;
}
function timeAgo(iso){const diff=(Date.now()-new Date(iso))/1000;if(diff<60)return 'just now';if(diff<3600)return Math.floor(diff/60)+'m ago';if(diff<86400)return Math.floor(diff/3600)+'h ago';return Math.floor(diff/86400)+'d ago';}

// ── INVENTORY ─────────────────────────────────────────────────────────────
let activeCategory='All';
function renderInventory(){
  const search=document.getElementById('inv-search').value.toLowerCase();
  const sort=document.getElementById('inv-sort').value;
  const cats=['All',...new Set(products.map(p=>p.category))];
  document.getElementById('cat-filter').innerHTML=cats.map(c=>`<div class="cat-pill ${c===activeCategory?'active':''}" onclick="setCategory('${c}')">${c}</div>`).join('');

  let list=products.filter(p=>{
    const inCat=activeCategory==='All'||p.category===activeCategory;
    const inSearch=!search||p.name.toLowerCase().includes(search)||p.sku.toLowerCase().includes(search)||p.category.toLowerCase().includes(search);
    return inCat&&inSearch;
  });
  list.sort((a,b)=>sort==='price'?a.price-b.price:sort==='stock'?a.stock-b.stock:sort==='category'?a.category.localeCompare(b.category):a.name.localeCompare(b.name));

  const lowAll=products.filter(p=>p.stock<=p.threshold);
  const banner=document.getElementById('inv-low-banner');
  if(lowAll.length){
    banner.style.display='flex';
    document.getElementById('inv-low-text').innerHTML=`<strong>${lowAll.length} item(s)</strong> are at or below their low stock threshold — ${products.filter(p=>p.stock===0).length} out of stock.`;
  } else banner.style.display='none';

  const body=document.getElementById('inv-table-body');
  body.innerHTML=list.length?list.map(p=>{
    const status=p.stock===0?`<span class="badge badge-red">Out of Stock</span>`:p.stock<=p.threshold?`<span class="badge badge-amber">Low Stock</span>`:`<span class="badge badge-green">In Stock</span>`;
    return `<tr>
      <td style="font-family:'DM Mono',monospace;font-size:.78rem;color:var(--text3)">${p.sku}</td>
      <td><div style="font-weight:500;color:var(--text)">${p.name}</div><div style="font-size:.74rem;color:var(--text3)">${p.supplier||''} · ${p.unit}</div></td>
      <td><span class="badge badge-gray">${p.category}</span></td>
      <td style="font-family:'DM Mono',monospace;font-weight:500;color:${p.stock===0?'var(--red)':p.stock<=p.threshold?'var(--amber)':'var(--text)'}">${p.stock}</td>
      <td style="font-family:'DM Mono',monospace;color:var(--green)">₹${p.price.toLocaleString('en-IN')}</td>
      <td>${status}</td>
      <td><div class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="openAdjustModal('${p.id}')">Adjust</button>
        <button class="btn btn-ghost btn-sm" onclick="openProductModal('${p.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">Del</button>
      </div></td>
    </tr>`;
  }).join(''):`<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📦</div><p>No products found</p></div></td></tr>`;
}
function setCategory(c){activeCategory=c;renderInventory();}

function openProductModal(id){
  editingProductId=id||null;
  const p=id?products.find(x=>x.id===id):null;
  document.getElementById('modal-title-text').textContent=p?'Edit Product':'Add Product';
  document.getElementById('f-name').value=p?.name||'';
  document.getElementById('f-sku').value=p?.sku||`PRD-${String(products.length+1).padStart(3,'0')}`;
  document.getElementById('f-category').value=p?.category||'Electronics';
  document.getElementById('f-price').value=p?.price||'';
  document.getElementById('f-stock').value=p?.stock||'';
  document.getElementById('f-threshold').value=p?.threshold||10;
  document.getElementById('f-desc').value=p?.desc||'';
  document.getElementById('f-supplier').value=p?.supplier||'';
  document.getElementById('f-unit').value=p?.unit||'pcs';
  document.getElementById('product-modal').classList.add('open');
}
function closeProductModal(){document.getElementById('product-modal').classList.remove('open');}
function saveProduct(){
  const name=document.getElementById('f-name').value.trim();
  const sku=document.getElementById('f-sku').value.trim();
  const price=parseFloat(document.getElementById('f-price').value);
  const stock=parseInt(document.getElementById('f-stock').value);
  if(!name||!sku||isNaN(price)||isNaN(stock)){toast('Please fill all required fields','error');return;}
  if(editingProductId){
    const idx=products.findIndex(x=>x.id===editingProductId);
    const old={...products[idx]};
    products[idx]={...products[idx],name,sku,category:document.getElementById('f-category').value,price,stock,threshold:parseInt(document.getElementById('f-threshold').value)||10,desc:document.getElementById('f-desc').value,supplier:document.getElementById('f-supplier').value,unit:document.getElementById('f-unit').value};
    addAudit('EDIT',`Edited product "${name}" (SKU: ${sku}) — stock: ${old.stock}→${stock}, price: ₹${old.price}→₹${price}`);
    toast('Product updated','success');
  } else {
    const np={id:genId(),name,sku,category:document.getElementById('f-category').value,price,stock,threshold:parseInt(document.getElementById('f-threshold').value)||10,desc:document.getElementById('f-desc').value,supplier:document.getElementById('f-supplier').value,unit:document.getElementById('f-unit').value};
    products.push(np);
    addAudit('ADD',`Added product "${name}" (SKU: ${sku}) — stock: ${stock}, price: ₹${price}`);
    toast('Product added','success');
  }
  saveData();closeProductModal();renderInventory();renderPOS();refreshDashboard();
}
function deleteProduct(id){
  const p=products.find(x=>x.id===id);
  if(!confirm(`Delete "${p.name}"? This cannot be undone.`))return;
  products=products.filter(x=>x.id!==id);
  addAudit('DELETE',`Deleted product "${p.name}" (SKU: ${p.sku})`);
  saveData();renderInventory();renderPOS();refreshDashboard();
  toast('Product deleted','info');
}

function openAdjustModal(id){
  adjustingProductId=id;
  const p=products.find(x=>x.id===id);
  document.getElementById('adjust-product-name').textContent=`${p.name} — Current stock: ${p.stock} ${p.unit}`;
  document.getElementById('adj-type').value='add';
  document.getElementById('adj-qty').value='';
  document.getElementById('adj-note').value='';
  document.getElementById('adjust-modal').classList.add('open');
}
function closeAdjustModal(){document.getElementById('adjust-modal').classList.remove('open');}
function applyAdjust(){
  const p=products.find(x=>x.id===adjustingProductId);
  const type=document.getElementById('adj-type').value;
  const qty=parseInt(document.getElementById('adj-qty').value);
  const note=document.getElementById('adj-note').value;
  if(isNaN(qty)||qty<0){toast('Enter a valid quantity','error');return;}
  const oldStock=p.stock;
  if(type==='add')p.stock+=qty;
  else if(type==='remove'){if(qty>p.stock){toast('Cannot remove more than available stock','error');return;}p.stock-=qty;}
  else p.stock=qty;
  addAudit('EDIT',`Stock adjusted for "${p.name}": ${oldStock}→${p.stock} (${type}${note?', Note: '+note:''})`);
  saveData();closeAdjustModal();renderInventory();refreshDashboard();
  toast(`Stock updated: ${oldStock} → ${p.stock}`,'success');
}

// ── POS / SALES ───────────────────────────────────────────────────────────
function renderPOS(){
  const search=document.getElementById('pos-search').value.toLowerCase();
  const list=products.filter(p=>(!search||p.name.toLowerCase().includes(search)||p.sku.toLowerCase().includes(search))&&p.stock>0);
  document.getElementById('pos-table-body').innerHTML=list.length?list.map(p=>`<tr>
    <td><div style="font-weight:500;color:var(--text)">${p.name}</div><div style="font-size:.74rem;color:var(--text3)">${p.sku}</div></td>
    <td><span class="badge badge-gray">${p.category}</span></td>
    <td style="font-family:'DM Mono',monospace;color:var(--green)">₹${p.price.toLocaleString('en-IN')}</td>
    <td style="font-family:'DM Mono',monospace;color:${p.stock<=p.threshold?'var(--amber)':'var(--text2)'}">${p.stock}</td>
    <td><button class="btn btn-accent btn-sm" onclick="addToCart('${p.id}')">+ Add</button></td>
  </tr>`).join(''):`<tr><td colspan="5"><div class="empty-state"><p>No in-stock products found</p></div></td></tr>`;
}
function addToCart(id){
  const p=products.find(x=>x.id===id);
  const existing=cart.find(c=>c.id===id);
  if(existing){
    if(existing.qty>=p.stock){toast('Not enough stock','error');return;}
    existing.qty++;
  } else cart.push({id,name:p.name,price:p.price,qty:1,unit:p.unit});
  renderCart();
  toast(`${p.name} added to cart`,'success');
}
function renderCart(){
  const list=document.getElementById('cart-items-list');
  if(!cart.length){
    list.innerHTML='<div class="empty-state" style="padding:1.5rem 0"><div class="empty-icon">🛒</div><p>Cart is empty</p></div>';
    document.getElementById('cart-total-section').style.display='none';
    return;
  }
  list.innerHTML=cart.map((c,i)=>`<div class="cart-item">
    <div style="flex:1;min-width:0"><div style="font-weight:500;font-size:.83rem;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</div><div style="font-size:.74rem;color:var(--green)">₹${c.price.toLocaleString('en-IN')}</div></div>
    <div class="cart-qty-ctrl">
      <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
      <span style="font-family:'DM Mono',monospace;font-size:.85rem;min-width:22px;text-align:center">${c.qty}</span>
      <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
      <button class="qty-btn" onclick="removeCartItem(${i})" style="color:var(--red);border-color:rgba(239,68,68,.3)">×</button>
    </div>
  </div>`).join('');
  const sub=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const tax=sub*0.18;
  document.getElementById('ct-sub').textContent='₹'+Math.round(sub).toLocaleString('en-IN');
  document.getElementById('ct-tax').textContent='₹'+Math.round(tax).toLocaleString('en-IN');
  document.getElementById('ct-total').textContent='₹'+Math.round(sub+tax).toLocaleString('en-IN');
  document.getElementById('cart-total-section').style.display='block';
}
function changeQty(i,delta){
  const p=products.find(x=>x.id===cart[i].id);
  cart[i].qty=Math.max(1,Math.min(cart[i].qty+delta,p.stock));
  renderCart();
}
function removeCartItem(i){cart.splice(i,1);renderCart();}
function clearCart(){cart=[];renderCart();}
function processSale(){
  if(!cart.length){toast('Cart is empty','error');return;}
  const customer=document.getElementById('customer-name').value.trim()||'Walk-in Customer';
  const sub=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const tax=sub*0.18;
  const total=sub+tax;
  const invNum='INV-'+Date.now().toString().slice(-6);
  const inv={id:genId(),num:invNum,customer,date:new Date().toISOString(),items:cart.map(c=>({...c})),subtotal:sub,tax,total};
  invoices.unshift(inv);
  cart.forEach(c=>{const p=products.find(x=>x.id===c.id);if(p)p.stock-=c.qty;});
  cart.forEach(c=>addAudit('SALE',`Sold "${c.name}" x${c.qty} to "${customer}" for ₹${(c.price*c.qty).toLocaleString('en-IN')} [${invNum}]`));
  saveData();clearCart();renderPOS();refreshDashboard();renderInventory();
  toast(`Sale processed! Invoice ${invNum}`,'success');
  document.getElementById('customer-name').value='';
}

// ── INVOICES ──────────────────────────────────────────────────────────────
function renderInvoicesList(){
  const search=document.getElementById('inv-search2').value.toLowerCase();
  const list=invoices.filter(inv=>!search||inv.num.toLowerCase().includes(search)||inv.customer.toLowerCase().includes(search));
  const body=document.getElementById('invoices-list-body');
  body.innerHTML=list.length?list.map(inv=>`<tr>
    <td style="font-family:'DM Mono',monospace;font-size:.8rem;color:var(--accent2)">${inv.num}</td>
    <td style="color:var(--text)">${inv.customer}</td>
    <td style="color:var(--text3)">${inv.items.length} item(s)</td>
    <td style="font-family:'DM Mono',monospace;color:var(--green)">₹${Math.round(inv.total).toLocaleString('en-IN')}</td>
    <td style="color:var(--text3)">${new Date(inv.date).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</td>
    <td><button class="btn btn-ghost btn-sm" onclick="viewInvoice('${inv.id}')">View →</button></td>
  </tr>`).join(''):`<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🧾</div><p>No invoices yet. Process a sale first!</p></div></td></tr>`;
}
function viewInvoice(id){
  const inv=invoices.find(x=>x.id===id);
  document.getElementById('invoices-list-wrap').style.display='none';
  document.getElementById('invoice-detail').style.display='block';
  const rows=inv.items.map(item=>`<tr><td>${item.name}</td><td>${item.qty} ${item.unit}</td><td>₹${item.price.toLocaleString('en-IN')}</td><td style="font-weight:600">₹${(item.price*item.qty).toLocaleString('en-IN')}</td></tr>`).join('');
  document.getElementById('invoice-content').innerHTML=`
    <div class="inv-header">
      <div><div class="inv-logo">StockPilot <small>Inventory & Sales</small></div></div>
      <div class="inv-meta"><strong>${inv.num}</strong>Date: ${new Date(inv.date).toLocaleDateString('en-IN',{dateStyle:'long'})}<br>Time: ${new Date(inv.date).toLocaleTimeString('en-IN',{timeStyle:'short'})}</div>
    </div>
    <div class="inv-parties">
      <div><div class="inv-party-label">From</div><div class="inv-party-name">StockPilot Store</div><div class="inv-party-detail">123 Market Street<br>New Delhi, India<br>GST: 07AABCS1429B1Z1</div></div>
      <div><div class="inv-party-label">Bill To</div><div class="inv-party-name">${inv.customer}</div><div class="inv-party-detail">Walk-in Customer</div></div>
    </div>
    <table class="inv-table">
      <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="inv-totals">
      <div class="inv-total-row"><span>Subtotal</span><span>₹${Math.round(inv.subtotal).toLocaleString('en-IN')}</span></div>
      <div class="inv-total-row"><span>GST (18%)</span><span>₹${Math.round(inv.tax).toLocaleString('en-IN')}</span></div>
      <div class="inv-total-row grand"><span>Total</span><span>₹${Math.round(inv.total).toLocaleString('en-IN')}</span></div>
    </div>
    <div class="inv-footer">Thank you for your purchase! · StockPilot Inventory Management System</div>
  `;
}
function closeInvoiceDetail(){document.getElementById('invoices-list-wrap').style.display='block';document.getElementById('invoice-detail').style.display='none';}

// ── AUDIT LOG ─────────────────────────────────────────────────────────────
function renderAudit(){
  const search=document.getElementById('audit-search').value.toLowerCase();
  const type=document.getElementById('audit-type').value;
  const list=auditLog.filter(a=>{
    const inType=!type||a.type===type;
    const inSearch=!search||a.detail.toLowerCase().includes(search)||a.user.toLowerCase().includes(search);
    return inType&&inSearch;
  });
  const typeColors={ADD:'badge-green',EDIT:'badge-blue',DELETE:'badge-red',SALE:'badge-amber',LOGIN:'badge-gray'};
  const body=document.getElementById('audit-body');
  body.innerHTML=list.length?list.map(a=>`<tr>
    <td style="font-size:.76rem;color:var(--text3);white-space:nowrap;font-family:'DM Mono',monospace">${new Date(a.time).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'medium'})}</td>
    <td style="color:var(--text)">${a.user}</td>
    <td><span class="badge ${typeColors[a.type]||'badge-gray'}">${a.type}</span></td>
    <td style="color:var(--text2);font-size:.8rem">${a.detail}</td>
  </tr>`).join(''):`<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📜</div><p>No audit records found</p></div></td></tr>`;
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function toast(msg,type='info'){
  const tc=document.getElementById('toast-container');
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  const icons={success:'✓',error:'✗',info:'ℹ'};
  t.innerHTML=`<span>${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  tc.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300)},3000);
}