// Mock Data corresponding to the generated images
const products = [
    {
        id: 1,
        title: "Antique 22k Gold Heritage Necklace",
        category: "Gold",
        weight: "45.500g",
        image: "C:/Users/WELCOME/.gemini/antigravity/brain/a5bcd5c8-56e8-4af2-9c5f-59794b42d838/gold_necklace_1772701254129.png"
    },
    {
        id: 2,
        title: "Bridal Antique 22k Gold Ring",
        category: "Gold",
        weight: "6.200g",
        image: "C:/Users/WELCOME/.gemini/antigravity/brain/a5bcd5c8-56e8-4af2-9c5f-59794b42d838/gold_ring_1772701320587.png"
    },
    {
        id: 3,
        title: "92.5 Sterling Silver Crafted Bangle",
        category: "Silver Bracelets",
        weight: "24.350g",
        image: "C:/Users/WELCOME/.gemini/antigravity/brain/a5bcd5c8-56e8-4af2-9c5f-59794b42d838/silver_bangle_1772701291338.png"
    },
    {
        id: 4,
        title: "Delicate Gold Baby Chain",
        category: "Gold",
        weight: "4.150g",
        image: "C:/Users/WELCOME/.gemini/antigravity/brain/a5bcd5c8-56e8-4af2-9c5f-59794b42d838/baby_chain_1772701342271.png"
    },
    {
        id: 5,
        title: "Elegant Silver Solitaire Ring",
        category: "Silver Rings",
        weight: "4.500g",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b2938e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 6,
        title: "Classic Silver Floral Pendant",
        category: "Silver Pendants",
        weight: "3.200g",
        image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 7,
        title: "Simple Silver Pearl Studs",
        category: "Silver Studs",
        weight: "2.100g",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 8,
        title: "Traditional Silver Toe Ring",
        category: "Silver Toe Rings",
        weight: "5.500g",
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 9,
        title: "Classic Silver Chain",
        category: "Silver Chains",
        weight: "12.000g",
        image: "https://images.unsplash.com/photo-1599643478514-4a4f8f4a7c03?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    }
];

let cart = JSON.parse(localStorage.getItem('sri_renga_cart')) || [];
let currentMainFilter = 'all';
let currentSubFilter = 'all-silver';

function init() {
    renderProducts();
    updateCartUI();
    setupEventListeners();
    setupFilterListeners();
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
        <i data-lucide="scale"></i> ${product.weight}
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
                return product.category.startsWith('Silver');
            }
            return product.category === currentSubFilter;
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
            <div class="cart-item-weight">Weight: ${item.weight}</div>
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
