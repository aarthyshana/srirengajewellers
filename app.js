// Products will be fetched from database
let products = [];

let cart = JSON.parse(localStorage.getItem('sri_renga_cart')) || [];
let currentMainFilter = 'all';
let currentSubFilter = 'all-silver';

async function init() {
    await fetchRates();
    await fetchProducts();
    renderProducts();
    updateCartUI();
    setupEventListeners();
    setupFilterListeners();
}

async function fetchRates() {
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const response = await fetch(`/api/rates?date=${formattedDate}`);
        if (!response.ok) return;
        const data = await response.json();

        const goldRateEl = document.getElementById('gold-rate');
        const silverRateEl = document.getElementById('silver-rate');
        const rateDateEl = document.getElementById('rate-date');

        if (goldRateEl && data.gold_rate) {
            goldRateEl.innerText = `₹${data.gold_rate.toLocaleString('en-IN')}`;
        }
        if (silverRateEl && data.silver_rate) {
            silverRateEl.innerText = `₹${data.silver_rate.toLocaleString('en-IN')}`;
        }
        if (rateDateEl && data.date) {
            // Format YYYY-MM-DD to DD MMM YYYY
            const d = new Date(data.date);
            if (!isNaN(d.getTime())) {
                const options = { day: '2-digit', month: 'short', year: 'numeric' };
                rateDateEl.innerText = d.toLocaleDateString('en-GB', options);
            } else {
                rateDateEl.innerText = data.date;
            }
        }
    } catch (error) {
        console.error("Error fetching rates:", error);
    }
}

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error("Failed to fetch products");
        products = await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        products = [];
    }
}

function createProductCardHTML(product) {
    return `
    <div class="product-card glass">
      <div class="product-img-container">
        <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy">
      </div>
      <div class="product-category">${product.category}</div>
      <h3 class="product-title serif">${product.title}</h3>
      <div class="product-weight">
        <i data-lucide="scale"></i> ${product.weight} g
      </div>
      <div class="product-actions">
        <button class="btn btn-outline btn-cart" onclick="addToCart(${product.id})">
          Add to Selection
        </button>
      </div>
    </div>
  `;
}

function getFilteredProducts() {
    return products.filter(product => {
        if (currentMainFilter === 'all') return true;

        if (currentMainFilter === 'gold') {
            return product.category === 'Gold';
        }

        if (currentMainFilter === 'silver') {
            if (currentSubFilter === 'all-silver') {
                return product.category === 'Silver' || (product.category && product.category.startsWith('Silver'));
            }
            return product.sub_category === currentSubFilter || product.category === currentSubFilter;
        }
        return true;
    });
}

function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return; // If not on home page

    const filteredProducts = getFilteredProducts();

    if (filteredProducts.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">No products found in this category.</p>';
    } else {
        container.innerHTML = filteredProducts.map(createProductCardHTML).join('');
    }

    // Re-initialize icons for newly added HTML
    if (window.lucide) {
        lucide.createIcons();
    }
}

function setupFilterListeners() {
    const mainBtns = document.querySelectorAll('.filter-btn');
    const subBtns = document.querySelectorAll('.sub-filter-btn');
    const subFilterContainer = document.getElementById('silver-sub-filters');

    if (!mainBtns.length) return;

    mainBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            mainBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            currentMainFilter = e.target.getAttribute('data-filter');

            // Toggle sub-filters for silver
            if (currentMainFilter === 'silver') {
                subFilterContainer.classList.remove('hidden');
                // Reset sub-filter to all when explicitly clicking main filter
                subBtns.forEach(b => b.classList.remove('active'));
                subBtns[0].classList.add('active');
                currentSubFilter = 'all-silver';
            } else {
                subFilterContainer.classList.add('hidden');
            }

            renderProducts();
        });
    });

    subBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            subBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentSubFilter = e.target.getAttribute('data-subfilter');
            renderProducts();
        });
    });
}

function updateCartUI() {
    // Update badge count
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = cart.length;

    // Update cart drawer items
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalWeight = document.getElementById('cart-total-weight');

    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty">Your selection is empty.</p>';
            if (cartTotalWeight) cartTotalWeight.innerText = "0";
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title}" class="cart-item-img">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.title}</h4>
            <div class="cart-item-weight">Weight: ${item.weight} g</div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
          </div>
        </div>
      `).join('');
            if (cartTotalWeight) cartTotalWeight.innerText = cart.length;
        }
    }
}

window.addToCart = function (productId) {
    const product = products.find(p => p.id === productId);
    if (product && !cart.find(item => item.id === productId)) {
        cart.push(product);
        localStorage.setItem('sri_renga_cart', JSON.stringify(cart));
        updateCartUI();
        toggleCart(true);
    }
};

window.removeFromCart = function (productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('sri_renga_cart', JSON.stringify(cart));
    updateCartUI();
};

function toggleCart(forceOpen) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');

    if (!drawer || !overlay) return;

    if (forceOpen === true || !drawer.classList.contains('active')) {
        drawer.classList.add('active');
        overlay.classList.add('active');
    } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    }
}

function setupEventListeners() {
    const cartToggleBtn = document.getElementById('cart-toggle');
    const cartCloseBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');

    if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => toggleCart());
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));
}

// Call init when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
