/**
 * SUPER 10 CHILE - PLATAFORMA E-COMMERCE MODERNA
 * Lógica principal del MVP / Prototipo Interactivo
 */

// App State
const state = {
  products: SUPER10_DATA.products || [],
  brands: SUPER10_DATA.brands || [],
  banners: SUPER10_DATA.banners || [],
  stores: SUPER10_DATA.stores || [],
  cart: JSON.parse(localStorage.getItem('s10_cart') || '[]'),
  currentCategory: 'all',
  currentBrand: 'all',
  currentSort: 'featured',
  searchQuery: '',
  isSuperLukasOnly: false,
  isUnipaySelected: false,
  appliedCoupon: null,
  activeSlideIndex: 0,
  fulfillmentMode: 'delivery', // 'delivery' | 'pickup'
  selectedStore: 'Super 10 San Diego, Santiago Centro',
  deliveryAddress: 'Santiago Centro, Región Metropolitana',
  freeShippingThreshold: 25000,
  deliveryFee: 2990
};

// DOM Elements & Initialization
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initFlashTimer();
  renderBrands();
  renderFlashDeals();
  renderProducts();
  renderStores();
  updateCartUI();
  setupEventListeners();
});

// ==========================================================================
// HERO SLIDER
// ==========================================================================
function initSlider() {
  const sliderEl = document.getElementById('heroSlider');
  if (!sliderEl) return;

  const slides = sliderEl.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  if (slides.length === 0) return;

  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    state.activeSlideIndex = index;
  }

  document.getElementById('sliderNext')?.addEventListener('click', () => {
    let nextIndex = (state.activeSlideIndex + 1) % slides.length;
    showSlide(nextIndex);
  });

  document.getElementById('sliderPrev')?.addEventListener('click', () => {
    let prevIndex = (state.activeSlideIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  // Autoplay every 5s
  setInterval(() => {
    let nextIndex = (state.activeSlideIndex + 1) % slides.length;
    showSlide(nextIndex);
  }, 5000);
}

// ==========================================================================
// FLASH DEALS COUNTDOWN TIMER
// ==========================================================================
function initFlashTimer() {
  let totalSeconds = 6 * 3600 + 42 * 60 + 15; // 06:42:15 mock timer
  const hoursEl = document.getElementById('timerHours');
  const minutesEl = document.getElementById('timerMinutes');
  const secondsEl = document.getElementById('timerSeconds');

  if (!hoursEl || !minutesEl || !secondsEl) return;

  setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      hoursEl.textContent = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');
    }
  }, 1000);
}

// ==========================================================================
// RENDER BRANDS
// ==========================================================================
function renderBrands() {
  const container = document.getElementById('brandsContainer');
  if (!container) return;

  container.innerHTML = state.brands.map(brand => `
    <div class="brand-card ${state.currentBrand === brand.name ? 'active' : ''}" onclick="selectBrand('${brand.name}')">
      <img src="${brand.logo}" alt="${brand.name}" class="brand-logo-img" loading="lazy">
      <span class="brand-name">${brand.name}</span>
    </div>
  `).join('');
}

function selectBrand(brandName) {
  state.currentBrand = state.currentBrand === brandName ? 'all' : brandName;
  renderBrands();
  renderProducts();

  // Scroll smoothly to catalog
  const catalogEl = document.getElementById('catalogSection');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  }
}

// ==========================================================================
// RENDER FLASH DEALS (SUPER LUKAS)
// ==========================================================================
function renderFlashDeals() {
  const container = document.getElementById('flashDealsContainer');
  if (!container) return;

  // Pick 4 top discounted / super lukas items
  const flashProducts = state.products
    .filter(p => p.isSuperLukas || p.discount >= 25)
    .slice(0, 4);

  container.innerHTML = flashProducts.map(p => createProductCardHTML(p)).join('');
}

// ==========================================================================
// RENDER PRODUCTS CATALOG
// ==========================================================================
function renderProducts() {
  const container = document.getElementById('productsGrid');
  const countEl = document.getElementById('resultsCount');
  if (!container) return;

  let filtered = state.products.filter(p => {
    // Category filter
    if (state.currentCategory !== 'all' && p.category !== state.currentCategory) return false;
    // Brand filter
    if (state.currentBrand !== 'all' && p.brand !== state.currentBrand) return false;
    // Super Lukas filter
    if (state.isSuperLukasOnly && !p.isSuperLukas) return false;
    // Search query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      const inName = p.name.toLowerCase().includes(q);
      const inBrand = p.brand.toLowerCase().includes(q);
      const inCat = p.category.toLowerCase().includes(q);
      if (!inName && !inBrand && !inCat) return false;
    }
    return true;
  });

  // Sorting
  if (state.currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.currentSort === 'discount') {
    filtered.sort((a, b) => b.discount - a.discount);
  } else if (state.currentSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (countEl) {
    countEl.textContent = `${filtered.length} productos`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">No encontramos productos</h3>
        <p style="color: var(--s10-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Prueba con otros términos de búsqueda o cambia los filtros seleccionados.</p>
        <button class="btn-checkout" style="width: auto; margin: 0 auto; padding: 0.6rem 1.5rem;" onclick="resetFilters()">Restablecer Filtros</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => createProductCardHTML(p)).join('');
}

function resetFilters() {
  state.currentCategory = 'all';
  state.currentBrand = 'all';
  state.searchQuery = '';
  state.isSuperLukasOnly = false;
  state.currentSort = 'featured';

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'all');
  });

  renderBrands();
  renderProducts();
}

// Generate single card HTML
function createProductCardHTML(product) {
  const inCartItem = state.cart.find(item => item.id === product.id);
  const qtyInCart = inCartItem ? inCartItem.quantity : 0;
  const formattedPrice = formatCLP(product.price);
  const formattedOriginal = formatCLP(product.originalPrice);
  const unipayPrice = formatCLP(Math.round(product.price * 0.85));

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-badges">
        ${product.discount > 0 ? `<span class="badge-discount">-${product.discount}% Ahorro</span>` : ''}
        ${product.isSuperLukas ? `<span class="badge-lukas">⭐ Súper Lukas</span>` : ''}
        ${product.isClub10 ? `<span class="badge-club10">Club 10</span>` : ''}
      </div>

      <button class="product-fav-btn" onclick="toggleFavorite('${product.id}')" title="Guardar en favoritos">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
      </button>

      <div class="product-img-wrapper" onclick="openQuickView('${product.id}')">
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
      </div>

      <div class="product-brand">${product.brand}</div>
      <h3 class="product-title" onclick="openQuickView('${product.id}')" title="${product.name}">${product.name}</h3>
      <div class="product-unit">${product.unit}</div>

      <div class="product-price-row">
        <div>
          <span class="price-main">${formattedPrice}</span>
          ${product.discount > 0 ? `<span class="price-original">${formattedOriginal}</span>` : ''}
        </div>
        <div class="price-unipay">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
          ${unipayPrice} con Unipay
        </div>
      </div>

      <div class="product-action" id="action-${product.id}">
        ${qtyInCart === 0 ? `
          <button class="btn-add-cart" onclick="addToCart('${product.id}')">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Agregar
          </button>
        ` : `
          <div class="quantity-stepper">
            <button class="stepper-btn" onclick="updateCartQuantity('${product.id}', -1)">-</button>
            <span class="stepper-value">${qtyInCart}</span>
            <button class="stepper-btn" onclick="updateCartQuantity('${product.id}', 1)">+</button>
          </div>
        `}
      </div>
    </div>
  `;
}

// ==========================================================================
// SHOPPING CART SYSTEM
// ==========================================================================
function addToCart(productId, qty = 1) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: qty
    });
  }

  saveCart();
  updateCartUI();
  renderProducts();
  renderFlashDeals();
  showToast(`¡${product.name} agregado al carro!`);
}

function updateCartQuantity(productId, delta) {
  const index = state.cart.findIndex(item => item.id === productId);
  if (index === -1) return;

  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
    showToast('Producto eliminado del carro');
  }

  saveCart();
  updateCartUI();
  renderProducts();
  renderFlashDeals();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  renderProducts();
  renderFlashDeals();
  showToast('Producto eliminado');
}

function saveCart() {
  localStorage.setItem('s10_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const badgeEl = document.getElementById('cartBadge');
  const subtotalHeaderEl = document.getElementById('cartHeaderSubtotal');
  const itemsContainer = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');
  const discountRowEl = document.getElementById('cartDiscountRow');
  const discountAmountEl = document.getElementById('cartDiscountAmount');
  const deliveryFeeEl = document.getElementById('cartDeliveryFee');
  const totalEl = document.getElementById('cartTotal');
  const meterFillEl = document.getElementById('freeDeliveryFill');
  const meterTextEl = document.getElementById('freeDeliveryText');

  // Calculations
  const totalItemsCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (badgeEl) badgeEl.textContent = totalItemsCount;
  if (subtotalHeaderEl) subtotalHeaderEl.textContent = formatCLP(rawSubtotal);

  // Free shipping meter
  if (meterFillEl && meterTextEl) {
    const remaining = state.freeShippingThreshold - rawSubtotal;
    if (remaining <= 0) {
      meterFillEl.style.width = '100%';
      meterTextEl.innerHTML = `<span>🎉 ¡Felicidades! Tienes <strong>Despacho GRATIS</strong></span>`;
    } else {
      const pct = Math.min(100, Math.round((rawSubtotal / state.freeShippingThreshold) * 100));
      meterFillEl.style.width = `${pct}%`;
      meterTextEl.innerHTML = `<span>Agrega <strong>${formatCLP(remaining)}</strong> más para Despacho Gratis</span><span>${pct}%</span>`;
    }
  }

  // Render Cart Drawer Body
  if (itemsContainer) {
    if (state.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🛒</div>
          <h4 style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.5rem;">Tu carro está vacío</h4>
          <p style="font-size: 0.85rem; margin-bottom: 1.25rem;">Aprovecha los precios súper baratos y las marcas propias que rinden más.</p>
          <button class="btn-checkout" style="font-size: 0.85rem; padding: 0.65rem 1.25rem; width: auto; margin: 0 auto;" onclick="toggleCartDrawer()">Explorar Ofertas</button>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = state.cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatCLP(item.price * item.quantity)} <span style="font-size: 0.75rem; color: var(--s10-muted); font-weight: normal;">(${formatCLP(item.price)} c/u)</span></div>
          </div>
          <div class="cart-item-stepper">
            <button onclick="updateCartQuantity('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQuantity('${item.id}', 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Eliminar">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `).join('');
    }
  }

  // Calculate discounts
  let totalDiscount = 0;
  if (state.isUnipaySelected) {
    totalDiscount += Math.round(rawSubtotal * 0.15); // 15% Unipay
  }
  if (state.appliedCoupon) {
    totalDiscount += state.appliedCoupon.discount;
  }

  const effectiveDeliveryFee = (rawSubtotal >= state.freeShippingThreshold || state.fulfillmentMode === 'pickup' || rawSubtotal === 0) ? 0 : state.deliveryFee;
  const finalTotal = Math.max(0, rawSubtotal - totalDiscount + effectiveDeliveryFee);

  if (subtotalEl) subtotalEl.textContent = formatCLP(rawSubtotal);
  if (discountRowEl && discountAmountEl) {
    if (totalDiscount > 0) {
      discountRowEl.style.display = 'flex';
      discountAmountEl.textContent = `-${formatCLP(totalDiscount)}`;
    } else {
      discountRowEl.style.display = 'none';
    }
  }
  if (deliveryFeeEl) {
    deliveryFeeEl.textContent = effectiveDeliveryFee === 0 ? '¡GRATIS!' : formatCLP(effectiveDeliveryFee);
    deliveryFeeEl.style.color = effectiveDeliveryFee === 0 ? 'var(--s10-green)' : 'inherit';
  }
  if (totalEl) totalEl.textContent = formatCLP(finalTotal);
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (!drawer || !backdrop) return;

  const isActive = drawer.classList.contains('active');
  drawer.classList.toggle('active', !isActive);
  backdrop.classList.toggle('active', !isActive);
  document.body.style.overflow = !isActive ? 'hidden' : '';
}

// ==========================================================================
// SEARCH & AUTOCOMPLETE
// ==========================================================================
function setupEventListeners() {
  // Cart open/close triggers
  document.getElementById('cartTriggerBtn')?.addEventListener('click', toggleCartDrawer);
  document.getElementById('cartCloseBtn')?.addEventListener('click', toggleCartDrawer);
  document.getElementById('cartBackdrop')?.addEventListener('click', toggleCartDrawer);

  // Search input live autocomplete
  const searchInput = document.getElementById('searchInput');
  const searchResultsDropdown = document.getElementById('searchResultsDropdown');

  if (searchInput && searchResultsDropdown) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      state.searchQuery = query;

      if (query.length < 2) {
        searchResultsDropdown.classList.remove('active');
        renderProducts();
        return;
      }

      const matches = state.products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      ).slice(0, 6);

      if (matches.length > 0) {
        searchResultsDropdown.innerHTML = matches.map(p => `
          <div class="search-result-item" onclick="selectSearchResult('${p.id}')">
            <img src="${p.image}" alt="${p.name}" class="search-result-img">
            <div class="search-result-info">
              <div class="search-result-name">${p.name}</div>
              <div class="search-result-brand">${p.brand} • ${p.category}</div>
            </div>
            <div class="search-result-price">${formatCLP(p.price)}</div>
          </div>
        `).join('');
        searchResultsDropdown.classList.add('active');
      } else {
        searchResultsDropdown.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: var(--s10-muted); font-size: 0.85rem;">
            No se encontraron coincidencias para "${query}"
          </div>
        `;
        searchResultsDropdown.classList.add('active');
      }

      renderProducts();
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResultsDropdown.contains(e.target)) {
        searchResultsDropdown.classList.remove('active');
      }
    });
  }

  // Category filter pills
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentCategory = btn.dataset.category;
      renderProducts();
    });
  });

  // Sort select
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      renderProducts();
    });
  }

  // Super Lukas toggle pill
  document.getElementById('superLukasNavPill')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.isSuperLukasOnly = !state.isSuperLukasOnly;
    const pill = document.getElementById('superLukasNavPill');
    pill.classList.toggle('active', state.isSuperLukasOnly);
    renderProducts();
    document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Coupon code
  document.getElementById('applyCouponBtn')?.addEventListener('click', () => {
    const input = document.getElementById('couponInput');
    const code = input ? input.value.trim().toUpperCase() : '';
    if (code === 'SUPER10' || code === 'BIENVENIDA') {
      state.appliedCoupon = { code: code, discount: 3000 };
      updateCartUI();
      showToast('🎉 ¡Cupón aplicado: $3.000 de descuento!');
      if (input) input.disabled = true;
    } else {
      showToast('⚠️ Cupón no válido. Prueba con "SUPER10"');
    }
  });

  // Unipay toggle
  document.getElementById('unipayToggle')?.addEventListener('change', (e) => {
    state.isUnipaySelected = e.target.checked;
    updateCartUI();
    showToast(state.isUnipaySelected ? '💳 15% Descuento Unipay activado' : 'Descuento Unipay desactivado');
  });

  // Fulfillment selector modal
  document.getElementById('fulfillmentBtn')?.addEventListener('click', openFulfillmentModal);
  document.getElementById('fulfillmentModalClose')?.addEventListener('click', closeFulfillmentModal);
  document.getElementById('fulfillmentBackdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'fulfillmentBackdrop') closeFulfillmentModal();
  });

  // Checkout modal
  document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);
  document.getElementById('checkoutModalClose')?.addEventListener('click', closeCheckoutModal);
}

function selectSearchResult(productId) {
  const searchResultsDropdown = document.getElementById('searchResultsDropdown');
  if (searchResultsDropdown) searchResultsDropdown.classList.remove('active');
  openQuickView(productId);
}

// ==========================================================================
// STORE LOCATOR
// ==========================================================================
function renderStores(filterQuery = '') {
  const container = document.getElementById('storesContainer');
  if (!container) return;

  const filteredStores = state.stores.filter(s => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
           s.comuna.toLowerCase().includes(q) ||
           s.region.toLowerCase().includes(q) ||
           s.address.toLowerCase().includes(q);
  });

  container.innerHTML = filteredStores.map(store => `
    <div class="store-card">
      <h4 class="store-card-name">${store.name}</h4>
      <div class="store-card-address">${store.address}</div>
      <div class="store-card-hours">⏰ ${store.hours}</div>
      <div class="store-services-list">
        ${store.services.map(srv => `<span class="service-pill">${srv}</span>`).join('')}
      </div>
      <button class="btn-select-store" onclick="selectStoreAsPickup('${store.name}')">
        Elegir para Retiro Gratis
      </button>
    </div>
  `).join('');
}

function selectStoreAsPickup(storeName) {
  state.fulfillmentMode = 'pickup';
  state.selectedStore = storeName;
  updateFulfillmentDisplay();
  updateCartUI();
  showToast(`📍 Tienda seleccionada para retiro: ${storeName}`);
  closeFulfillmentModal();
}

function updateFulfillmentDisplay() {
  const labelEl = document.getElementById('fulfillmentLabel');
  const valueEl = document.getElementById('fulfillmentValue');
  if (state.fulfillmentMode === 'pickup') {
    if (labelEl) labelEl.textContent = 'Retiro en Tienda:';
    if (valueEl) valueEl.innerHTML = `${state.selectedStore.split(',')[0]} <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`;
  } else {
    if (labelEl) labelEl.textContent = 'Entregar en:';
    if (valueEl) valueEl.innerHTML = `${state.deliveryAddress} <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`;
  }
}

// ==========================================================================
// MODALS & QUICK VIEW
// ==========================================================================
function openQuickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const modalBackdrop = document.getElementById('quickViewModal');
  const contentEl = document.getElementById('quickViewContent');
  if (!modalBackdrop || !contentEl) return;

  contentEl.innerHTML = `
    <div class="quick-view-grid">
      <div style="display: flex; align-items: center; justify-content: center;">
        <img src="${product.image}" alt="${product.name}" class="quick-view-img">
      </div>
      <div style="display: flex; flex-direction: column;">
        <div style="font-size: 0.75rem; font-weight: 800; color: var(--s10-red); text-transform: uppercase; margin-bottom: 0.25rem;">
          ${product.brand} • ${product.category}
        </div>
        <h2 style="font-size: 1.4rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.5rem; color: var(--s10-navy);">
          ${product.name}
        </h2>
        <div style="font-size: 0.85rem; color: var(--s10-muted); margin-bottom: 1rem;">
          Formato: ${product.unit} | Código EAN: ${product.id}
        </div>

        <div style="background: #F8FAFC; border: 1px solid var(--s10-border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: baseline; gap: 0.75rem;">
            <span style="font-size: 1.8rem; font-weight: 800; color: var(--s10-red);">${formatCLP(product.price)}</span>
            ${product.discount > 0 ? `<span style="font-size: 1rem; color: var(--s10-muted); text-decoration: line-through;">${formatCLP(product.originalPrice)}</span>` : ''}
            ${product.discount > 0 ? `<span class="badge-discount">-${product.discount}% OFF</span>` : ''}
          </div>
          <div style="font-size: 0.85rem; color: #1D4ED8; font-weight: 700; margin-top: 0.35rem;">
            💳 ${formatCLP(Math.round(product.price * 0.85))} pagando con Tarjeta Unipay
          </div>
        </div>

        <div style="margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--s10-slate); line-height: 1.5;">
          Calidad garantizada por Super 10. Producto seleccionado especialmente para brindarte el máximo ahorro familiar sin comprometer frescura ni rendimiento.
        </div>

        <div style="margin-top: auto; display: flex; gap: 0.75rem;">
          <button class="btn-checkout" onclick="addToCart('${product.id}'); closeQuickView();">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Agregar al Carro
          </button>
        </div>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modalBackdrop = document.getElementById('quickViewModal');
  if (modalBackdrop) modalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

// Fulfillment Modal
function openFulfillmentModal() {
  const modal = document.getElementById('fulfillmentBackdrop');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeFulfillmentModal() {
  const modal = document.getElementById('fulfillmentBackdrop');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function saveFulfillmentChoice(mode) {
  state.fulfillmentMode = mode;
  if (mode === 'delivery') {
    const input = document.getElementById('modalAddressInput');
    if (input && input.value.trim()) {
      state.deliveryAddress = input.value.trim();
    }
  }
  updateFulfillmentDisplay();
  updateCartUI();
  closeFulfillmentModal();
  showToast(mode === 'delivery' ? '📍 Dirección de despacho actualizada' : '📍 Modalidad Retiro en Tienda guardada');
}

// Checkout Modal
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Tu carro está vacío');
    return;
  }

  const modal = document.getElementById('checkoutBackdrop');
  const detailsEl = document.getElementById('checkoutOrderSummary');
  if (!modal || !detailsEl) return;

  const rawSubtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let totalDiscount = 0;
  if (state.isUnipaySelected) totalDiscount += Math.round(rawSubtotal * 0.15);
  if (state.appliedCoupon) totalDiscount += state.appliedCoupon.discount;
  const effectiveDeliveryFee = (rawSubtotal >= state.freeShippingThreshold || state.fulfillmentMode === 'pickup') ? 0 : state.deliveryFee;
  const finalTotal = Math.max(0, rawSubtotal - totalDiscount + effectiveDeliveryFee);

  detailsEl.innerHTML = `
    <div style="background: #F8FAFC; border: 1px solid var(--s10-border); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem;">
      <div style="font-weight: 800; margin-bottom: 0.75rem; color: var(--s10-navy);">Resumen del Pedido</div>
      <div style="font-size: 0.85rem; color: var(--s10-slate); margin-bottom: 0.35rem;">Modalidad: <strong>${state.fulfillmentMode === 'delivery' ? 'Despacho a Domicilio' : 'Retiro en Tienda'}</strong></div>
      <div style="font-size: 0.85rem; color: var(--s10-slate); margin-bottom: 0.75rem;">Destino: <strong>${state.fulfillmentMode === 'delivery' ? state.deliveryAddress : state.selectedStore}</strong></div>
      <div style="border-top: 1px dashed var(--s10-border); padding-top: 0.75rem; margin-top: 0.75rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
          <span>Subtotal (${state.cart.length} productos):</span>
          <span>${formatCLP(rawSubtotal)}</span>
        </div>
        ${totalDiscount > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--s10-green); margin-bottom: 0.3rem;">
            <span>Descuentos y Club 10:</span>
            <span>-${formatCLP(totalDiscount)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
          <span>Despacho:</span>
          <span>${effectiveDeliveryFee === 0 ? '¡GRATIS!' : formatCLP(effectiveDeliveryFee)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; color: var(--s10-red); margin-top: 0.5rem; border-top: 1px solid var(--s10-border); padding-top: 0.5rem;">
          <span>Total a Pagar:</span>
          <span>${formatCLP(finalTotal)}</span>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutBackdrop');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function completeMockOrder() {
  closeCheckoutModal();
  toggleCartDrawer();
  state.cart = [];
  saveCart();
  updateCartUI();
  renderProducts();
  renderFlashDeals();

  alert('🎉 ¡Pedido de prueba generado exitosamente!\n\nEste es el flujo de compra integrado propuesto para Super 10 Chile, con validación de stock, selección de tienda y pago online.');
}

// ==========================================================================
// UTILITIES
// ==========================================================================
function formatCLP(amount) {
  return '$' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🛒</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 200);
  }, 2600);
}

function toggleFavorite(productId) {
  showToast('Guardado en tus favoritos de Club 10 ❤️');
}
