const SUPABASE_URL = 'https://kpgzuapbllzhatakkcts.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fL8D4BepEkupdCNsnMaW1Q_E76Za12D';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State
let allMembers = [];
let allOrders = [];
let allProducts = [];

// Check Authentication
async function checkAuth() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
    }
}

// Tab Switching Logic
const tabs = {
    members: document.getElementById('members-view'),
    orders: document.getElementById('orders-view'),
    inventory: document.getElementById('inventory-view'),
    revenue: document.getElementById('revenue-view')
};

const navLinks = {
    members: document.getElementById('nav-members'),
    orders: document.getElementById('nav-orders'),
    inventory: document.getElementById('nav-inventory'),
    revenue: document.getElementById('nav-revenue')
};

function switchTab(tabName) {
    Object.values(tabs).forEach(t => t.style.display = 'none');
    Object.values(navLinks).forEach(l => l.classList.remove('active'));
    
    tabs[tabName].style.display = 'block';
    navLinks[tabName].classList.add('active');

    if (tabName === 'members') fetchMembers();
    if (tabName === 'orders') fetchOrders();
    if (tabName === 'inventory') fetchInventory();
    if (tabName === 'revenue') updateRevenue();
}

navLinks.members.addEventListener('click', (e) => { e.preventDefault(); switchTab('members'); });
navLinks.orders.addEventListener('click', (e) => { e.preventDefault(); switchTab('orders'); });
navLinks.inventory.addEventListener('click', (e) => { e.preventDefault(); switchTab('inventory'); });
navLinks.revenue.addEventListener('click', (e) => { e.preventDefault(); switchTab('revenue'); });

// --- Members ---
async function fetchMembers() {
    const statusFilter = document.getElementById('filter-status').value;
    const planFilter = document.getElementById('filter-plan').value;

    let query = supabaseClient.from('members').select('*');
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);

    const { data: members, error } = await query.order('created_at', { ascending: false });
    if (error) return;

    allMembers = members;
    const filteredMembers = planFilter === 'all' 
        ? members 
        : members.filter(m => m.selected_plans.includes(planFilter));

    allMembers = members;
    updateMemberStats(members);
    renderMembers(filteredMembers);
}

// Mobile Sidebar Toggle
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const navItems = document.querySelectorAll('.sidebar-nav a');

function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

menuToggle.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

navItems.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    });
});

function updateMemberStats(members) {
    document.getElementById('total-members-count').textContent = members.length;
    document.getElementById('pending-members-count').textContent = members.filter(m => m.status === 'pending').length;
    document.getElementById('verified-members-count').textContent = members.filter(m => m.status === 'verified').length;
    
    const revenue = members
        .filter(m => m.status === 'verified')
        .reduce((sum, m) => sum + parseFloat(m.total_bill), 0);
    document.getElementById('total-revenue-count').textContent = `${revenue} PKR`;
}

function renderMembers(members) {
    const tbody = document.getElementById('members-table-body');
    tbody.innerHTML = members.map(m => `
        <tr>
            <td>${m.full_name}</td>
            <td>${m.phone}</td>
            <td>${m.selected_plans.join(', ')}</td>
            <td>${m.total_bill}</td>
            <td><span class="status-badge status-${m.status}">${m.status}</span></td>
            <td>${m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : 'N/A'}</td>
            <td>
                <div class="action-btns">
                    ${m.status === 'pending' ? `<button class="btn btn-sm btn-verify" onclick="verifyMember('${m.id}', '${m.join_date}')">Verify</button>` : ''}
                    <button class="btn btn-sm btn-edit" onclick="openEditModal('${m.id}')">Edit</button>
                    <button class="btn btn-sm btn-delete" onclick="deleteMember('${m.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// --- Orders ---
async function fetchOrders() {
    const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

    if (error) return;
    allOrders = orders;

    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td>${o.member_name}</td>
            <td>${o.member_phone}</td>
            <td>${o.products ? o.products.name : 'Unknown'}</td>
            <td>${o.quantity}</td>
            <td>${o.total_price}</td>
            <td><span class="status-badge status-${o.status}">${o.status}</span></td>
            <td>
                <div class="action-btns">
                    ${o.status === 'pending' ? `<button class="btn btn-sm btn-verify" onclick="completeOrder('${o.id}', '${o.product_id}', ${o.quantity})">Complete</button>` : ''}
                    <button class="btn btn-sm btn-delete" onclick="deleteOrder('${o.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function completeOrder(id, productId, qty) {
    // Decrement stock
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        const newStock = Math.max(0, product.stock - qty);
        await supabaseClient.from('products').update({ stock: newStock }).eq('id', productId);
    }

    const { error } = await supabaseClient.from('orders').update({ status: 'completed' }).eq('id', id);
    if (error) alert(error.message);
    else fetchOrders();
}

// --- Inventory ---
async function fetchInventory() {
    const { data: products, error } = await supabaseClient.from('products').select('*').order('name');
    if (error) return;
    allProducts = products;

    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = products.map(p => {
        let stockClass = 'stock-ok';
        if (p.stock <= 0) stockClass = 'stock-none';
        else if (p.stock < 5) stockClass = 'stock-low';

        return `
            <tr>
                <td><img src="${p.image_url}" class="inventory-img" onerror="this.src='https://via.placeholder.com/50'"></td>
                <td>${p.name}</td>
                <td>${p.category || 'Supplement'}</td>
                <td>${p.price} PKR</td>
                <td><span class="stock-badge ${stockClass}">${p.stock} In Stock</span></td>
                <td>${p.is_hot_selling ? '🔥 Yes' : 'No'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-edit" onclick="openProductModal('${p.id}')">Edit</button>
                        <button class="btn btn-sm btn-delete" onclick="deleteProduct('${p.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// --- Product Modal ---
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

document.getElementById('btn-add-product').addEventListener('click', () => openProductModal());
document.getElementById('close-product-modal').addEventListener('click', () => productModal.style.display = 'none');

document.getElementById('product-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('file-name').textContent = file.name;
    }
});

function openProductModal(id = null) {
    const title = document.getElementById('product-modal-title');
    productForm.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('file-name').textContent = 'No file';

    if (id) {
        const p = allProducts.find(prod => prod.id === id);
        title.textContent = 'Edit Product';
        document.getElementById('product-id').value = p.id;
        document.getElementById('product-name').value = p.name;
        document.getElementById('product-price').value = p.price;
        document.getElementById('product-stock').value = p.stock;
        document.getElementById('product-category').value = p.category || 'others';
        document.getElementById('product-image').value = p.image_url;
        document.getElementById('product-desc').value = p.description || '';
        document.getElementById('product-hot-selling').checked = p.is_hot_selling;
    } else {
        title.textContent = 'Add New Product';
    }
    productModal.style.display = 'flex';
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const id = document.getElementById('product-id').value;
    const file = document.getElementById('product-file').files[0];
    let imageUrl = document.getElementById('product-image').value;

    try {
        // Handle File Upload if selected
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: uploadData, error: uploadError } = await supabaseClient
                .storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabaseClient
                .storage
                .from('product-images')
                .getPublicUrl(filePath);
            
            imageUrl = publicUrl;
        }

        const productData = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value) || 0,
            stock: parseInt(document.getElementById('product-stock').value) || 0,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-desc').value,
            image_url: imageUrl,
            is_hot_selling: document.getElementById('product-hot-selling').checked
        };

        let error;
        if (id) {
            ({ error } = await supabaseClient.from('products').update(productData).eq('id', id));
        } else {
            ({ error } = await supabaseClient.from('products').insert([productData]));
        }

        if (error) throw error;

        productModal.style.display = 'none';
        fetchInventory();
    } catch (err) {
        alert('Error saving product: ' + err.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

async function deleteProduct(id) {
    if (!confirm('Are you sure? This will remove the product from the store.')) return;
    const { error } = await supabaseClient.from('products').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchInventory();
}

// --- Member Edit Modal ---
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');

function openEditModal(id) {
    const m = allMembers.find(mem => mem.id === id);
    document.getElementById('edit-id').value = m.id;
    document.getElementById('edit-name').value = m.full_name;
    document.getElementById('edit-phone').value = m.phone;
    document.getElementById('edit-status').value = m.status;
    document.getElementById('edit-expiry').value = m.expiry_date ? m.expiry_date.split('T')[0] : '';
    editModal.style.display = 'flex';
}

document.getElementById('close-edit-modal').addEventListener('click', () => editModal.style.display = 'none');

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const updateData = {
        full_name: document.getElementById('edit-name').value,
        phone: document.getElementById('edit-phone').value,
        status: document.getElementById('edit-status').value,
        expiry_date: document.getElementById('edit-expiry').value || null
    };

    const { error } = await supabaseClient.from('members').update(updateData).eq('id', id);
    if (error) alert(error.message);
    else {
        editModal.style.display = 'none';
        fetchMembers();
    }
});

// --- Other Actions ---
async function verifyMember(id, joinDate) {
    const expiryDate = new Date(joinDate || new Date());
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const { error } = await supabaseClient.from('members').update({ status: 'verified', expiry_date: expiryDate.toISOString() }).eq('id', id);
    if (error) alert(error.message);
    else fetchMembers();
}

async function deleteMember(id) {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabaseClient.from('members').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchMembers();
}

async function deleteOrder(id) {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabaseClient.from('orders').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchOrders();
}

function updateRevenue() {
    const filter = document.getElementById('revenue-filter').value;
    
    let memberRev = allMembers.filter(m => m.status === 'verified').reduce((s, m) => s + parseFloat(m.total_bill), 0);
    let storeRev = allOrders.filter(o => o.status === 'completed').reduce((s, o) => s + parseFloat(o.total_price), 0);

    if (filter === 'gym') {
        storeRev = 0;
    } else if (filter === 'orders') {
        memberRev = 0;
    }

    document.getElementById('member-revenue-total').textContent = `${memberRev} PKR`;
    document.getElementById('store-revenue-total').textContent = `${storeRev} PKR`;
    document.getElementById('grand-total-revenue').textContent = `${memberRev + storeRev} PKR`;
}

// Init
document.getElementById('filter-status').addEventListener('change', fetchMembers);
document.getElementById('filter-plan').addEventListener('change', fetchMembers);
document.getElementById('revenue-filter').addEventListener('change', updateRevenue);

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    fetchMembers();
    fetchInventory(); // To populate products for stock logic
});
