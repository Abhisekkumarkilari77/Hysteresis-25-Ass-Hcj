
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "home";
  initCartBadge();
  attachGlobalHandlers();

  if (page === "home") {
    initHomePage();
  } else if (page === "product") {
    initProductPage();
  } else if (page === "cart") {
    initCartPage();
  } else if (page === "checkout") {
    initCheckoutPage();
  }
});

function showToast(message, variant = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("toast--success", "toast--error");
  toast.classList.add(variant === "error" ? "toast--error" : "toast--success");
  toast.classList.add("is-visible");

  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function initCartBadge() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  el.textContent = String(getCartItemCount());
}

function refreshCartBadge() {
  initCartBadge();
}

function attachGlobalHandlers() {
  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }
}

function initHomePage() {
  const grid = document.getElementById("product-grid");
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");
  const searchInput = document.getElementById("search-input");
  const emptyState = document.getElementById("product-empty-state");
  const heroCount = document.getElementById("hero-product-count");

  if (heroCount) {
    heroCount.textContent = String(products.length);
  }

  if (!grid) return;

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );
  if (categoryFilter) {
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });
  }

  let currentQuery = "";
  let currentCategory = "all";
  let currentSort = "featured";

  function applyFilters() {
    let filtered = [...products];

    if (currentCategory !== "all") {
      filtered = filtered.filter((p) => p.category === currentCategory);
    }

    if (currentQuery.trim()) {
      const q = currentQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (currentSort === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === "rating-desc") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    renderProducts(grid, filtered);
    if (emptyState) {
      emptyState.hidden = filtered.length > 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentQuery = event.target.value;
      applyFilters();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", (event) => {
      currentCategory = event.target.value;
      applyFilters();
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", (event) => {
      currentSort = event.target.value;
      applyFilters();
    });
  }

  applyFilters();
}

function renderProducts(container, list) {
  container.innerHTML = "";
  list.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imageWrapper = document.createElement("a");
    imageWrapper.className = "product-card-image-wrapper";
    imageWrapper.href = `product.html?id=${encodeURIComponent(product.id)}`;

    const img = document.createElement("img");
    img.src = product.image || "https://via.placeholder.com/400x300?text=Product";
    img.alt = product.name;
    imageWrapper.appendChild(img);

    const body = document.createElement("div");
    body.className = "product-card-body";

    const titleLink = document.createElement("a");
    titleLink.href = imageWrapper.href;
    titleLink.className = "product-card-title";
    titleLink.textContent = product.name;

    const category = document.createElement("div");
    category.className = "product-card-category";
    category.textContent = product.category || "General";

    const meta = document.createElement("div");
    meta.className = "product-card-meta";
    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPriceINR(product.price);
    const rating = document.createElement("span");
    rating.className = "rating-pill";
    rating.textContent = ` ${product.rating.toFixed(1)}`;
    meta.appendChild(price);
    meta.appendChild(rating);

    const actions = document.createElement("div");
    actions.className = "product-card-actions";
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "btn btn-primary";
    addButton.textContent = "Add to Cart";
    addButton.addEventListener("click", () => {
      const result = addToCart(product.id, 1);
      if (!result.ok && result.reason === "out_of_stock") {
        showToast("This item is currently out of stock.", "error");
      } else if (result.ok) {
        showToast("Added to cart.");
        refreshCartBadge();
      }
    });

    const viewButton = document.createElement("a");
    viewButton.href = imageWrapper.href;
    viewButton.className = "btn btn-secondary";
    viewButton.textContent = "View details";

    actions.appendChild(addButton);
    actions.appendChild(viewButton);

    body.appendChild(titleLink);
    body.appendChild(category);
    body.appendChild(meta);
    body.appendChild(actions);

    card.appendChild(imageWrapper);
    card.appendChild(body);
    container.appendChild(card);
  });
}

function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = getProductById(id);

  const nameEl = document.getElementById("product-name");
  const priceEl = document.getElementById("product-price");
  const stockEl = document.getElementById("product-stock");
  const ratingEl = document.getElementById("product-rating");
  const reviewsEl = document.getElementById("product-reviews");
  const descEl = document.getElementById("product-description");
  const imageEl = document.getElementById("product-image");
  const specsList = document.getElementById("product-specs-list");
  const qtyInput = document.getElementById("quantity-input");
  const form = document.getElementById("add-to-cart-form");
  const addButton = document.getElementById("add-to-cart-button");

  if (!product) {
    if (nameEl) {
      nameEl.textContent = "Product not found";
    }
    if (descEl) {
      descEl.textContent =
        "We couldn't find this product. It may have been removed from the catalog.";
    }
    if (addButton) addButton.disabled = true;
    return;
  }

  if (nameEl) nameEl.textContent = product.name;
  if (priceEl) priceEl.textContent = formatPriceINR(product.price);
  if (stockEl) {
    if (product.stock > 0) {
      stockEl.textContent = `${product.stock} in stock`;
      stockEl.classList.add("product-stock--in");
    } else {
      stockEl.textContent = "Out of stock (demo)";
      stockEl.classList.add("product-stock--out");
    }
  }
  if (ratingEl) {
    ratingEl.textContent = ` ${product.rating.toFixed(1)}`;
  }
  if (reviewsEl) {
    reviewsEl.textContent = `${product.reviewsCount} reviews`;
  }
  if (descEl) {
    descEl.textContent = product.description;
  }
  if (imageEl) {
    imageEl.src =
      product.image || "https://via.placeholder.com/640x480?text=Product";
    imageEl.alt = product.name;
  }
  if (specsList && product.specs) {
    specsList.innerHTML = "";
    Object.entries(product.specs).forEach(([key, value]) => {
      const dt = document.createElement("dt");
      dt.textContent = key;
      const dd = document.createElement("dd");
      dd.textContent = String(value);
      specsList.appendChild(dt);
      specsList.appendChild(dd);
    });
  }

  if (qtyInput && product.stock > 0) {
    qtyInput.max = String(product.stock);
  }
  if (addButton && product.stock <= 0) {
    addButton.disabled = true;
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (product.stock <= 0) {
        showToast("This item is currently out of stock.", "error");
        return;
      }
      const qty =
        qtyInput && qtyInput.value ? parseInt(qtyInput.value, 10) || 1 : 1;
      const result = addToCart(product.id, qty);
      if (result.ok) {
        showToast("Added to cart.");
        refreshCartBadge();
      } else if (result.reason === "out_of_stock") {
        showToast("This item is currently out of stock.", "error");
      }
    });
  }

  const relatedGrid = document.getElementById("related-product-grid");
  if (relatedGrid) {
    const related = products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 3);
    if (related.length > 0) {
      renderProducts(relatedGrid, related);
    } else {
      relatedGrid.parentElement.hidden = true;
    }
  }
}

function initCartPage() {
  const itemsContainer = document.getElementById("cart-items");
  const emptyState = document.getElementById("cart-empty-state");
  const subtotalEl = document.getElementById("summary-subtotal");
  const shippingEl = document.getElementById("summary-shipping");
  const totalEl = document.getElementById("summary-total");
  const checkoutButton = document.getElementById("checkout-button");
  const continueButton = document.getElementById("continue-shopping-button");

  function render() {
    const cart = getCart();
    const hasItems = cart.length > 0;

    if (emptyState) emptyState.hidden = hasItems;
    if (!itemsContainer) return;

    itemsContainer.innerHTML = "";

    if (!hasItems) {
      if (checkoutButton) checkoutButton.disabled = true;
      if (subtotalEl) subtotalEl.textContent = "₹0";
      if (shippingEl) shippingEl.textContent = "₹0";
      if (totalEl) totalEl.textContent = "₹0";
      refreshCartBadge();
      return;
    }

    cart.forEach((item) => {
      const product = getProductById(item.id) || item;
      const row = document.createElement("article");
      row.className = "cart-item";

      const imageWrap = document.createElement("div");
      imageWrap.className = "cart-item-image";
      const img = document.createElement("img");
      img.src =
        product.image ||
        "https://via.placeholder.com/120x120?text=Product";
      img.alt = product.name;
      imageWrap.appendChild(img);

      const main = document.createElement("div");
      main.className = "cart-item-main";

      const titleRow = document.createElement("div");
      titleRow.className = "cart-item-title-row";

      const titleLink = document.createElement("a");
      titleLink.href = `product.html?id=${encodeURIComponent(product.id)}`;
      titleLink.className = "cart-item-title";
      titleLink.textContent = product.name;

      const linePrice = document.createElement("div");
      linePrice.className = "cart-item-price";
      linePrice.textContent = formatPriceINR(
        product.price * (item.quantity || 1)
      );

      titleRow.appendChild(titleLink);
      titleRow.appendChild(linePrice);

      const meta = document.createElement("div");
      meta.className = "cart-item-meta";
      meta.textContent = `₹${product.price.toLocaleString(
        "en-IN"
      )} per item • Qty ${item.quantity}`;

      const controls = document.createElement("div");
      controls.className = "cart-item-controls";

      const decrement = document.createElement("button");
      decrement.type = "button";
      decrement.className = "icon-button";
      decrement.textContent = "−";

      const quantityInput = document.createElement("input");
      quantityInput.type = "number";
      quantityInput.className = "input quantity-input";
      quantityInput.min = "1";
      if (typeof product.stock === "number" && product.stock > 0) {
        quantityInput.max = String(product.stock);
      }
      quantityInput.value = String(item.quantity || 1);

      const increment = document.createElement("button");
      increment.type = "button";
      increment.className = "icon-button";
      increment.textContent = "+";

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "cart-item-remove";
      removeButton.textContent = "Remove";

      decrement.addEventListener("click", () => {
        const newQty = Math.max(1, (parseInt(quantityInput.value, 10) || 1) - 1);
        quantityInput.value = String(newQty);
        updateCartItemQuantity(item.id, newQty);
        render();
        refreshCartBadge();
      });

      increment.addEventListener("click", () => {
        const current = parseInt(quantityInput.value, 10) || 1;
        let next = current + 1;
        if (typeof product.stock === "number" && product.stock > 0) {
          next = Math.min(next, product.stock);
        }
        quantityInput.value = String(next);
        updateCartItemQuantity(item.id, next);
        render();
        refreshCartBadge();
      });

      quantityInput.addEventListener("change", () => {
        updateCartItemQuantity(item.id, quantityInput.value);
        render();
        refreshCartBadge();
      });

      removeButton.addEventListener("click", () => {
        removeFromCart(item.id);
        showToast("Removed from cart.");
        render();
        refreshCartBadge();
      });

      controls.appendChild(decrement);
      controls.appendChild(quantityInput);
      controls.appendChild(increment);
      controls.appendChild(removeButton);

      main.appendChild(titleRow);
      main.appendChild(meta);
      main.appendChild(controls);

      row.appendChild(imageWrap);
      row.appendChild(main);

      itemsContainer.appendChild(row);
    });

    const totals = calculateCartTotals(cart);
    if (subtotalEl)
      subtotalEl.textContent = formatPriceINR(totals.subtotal);
    if (shippingEl)
      shippingEl.textContent = totals.subtotal ? formatPriceINR(totals.shipping) : "₹0";
    if (totalEl) totalEl.textContent = formatPriceINR(totals.total);
    if (checkoutButton) checkoutButton.disabled = !hasItems;

    refreshCartBadge();
  }

  render();

  if (continueButton) {
    continueButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) {
        showToast("Your cart is empty.", "error");
        return;
      }
      window.location.href = "checkout.html";
    });
  }
}

function initCheckoutPage() {
  const container = document.getElementById("checkout-container");
  const confirmation = document.getElementById("checkout-confirmation");
  const form = document.getElementById("checkout-form");
  const placeOrderButton = document.getElementById("place-order-button");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const shippingEl = document.getElementById("checkout-shipping");
  const totalEl = document.getElementById("checkout-total");
  const itemsContainer = document.getElementById("checkout-items");
  const confirmationOrderId = document.getElementById(
    "confirmation-order-id"
  );
  const confirmationContinue = document.getElementById(
    "confirmation-continue"
  );

  const cart = getCart();
  const hasItems = cart.length > 0;

  if (!hasItems) {
    if (placeOrderButton) placeOrderButton.disabled = true;
    if (itemsContainer) {
      itemsContainer.innerHTML =
        '<p class="muted-text">Your cart is empty. Add items before checking out.</p>';
    }
    if (subtotalEl) subtotalEl.textContent = "₹0";
    if (shippingEl) shippingEl.textContent = "₹0";
    if (totalEl) totalEl.textContent = "₹0";
    return;
  }

  if (itemsContainer) {
    itemsContainer.innerHTML = "";
    cart.forEach((item) => {
      const product = getProductById(item.id) || item;
      const row = document.createElement("div");
      row.className = "summary-item";

      const title = document.createElement("span");
      title.className = "summary-item-title";
      title.textContent = product.name;

      const meta = document.createElement("span");
      meta.className = "summary-item-meta";
      meta.textContent = `x${item.quantity}`;

      const price = document.createElement("span");
      price.textContent = formatPriceINR(
        product.price * (item.quantity || 1)
      );

      row.appendChild(title);
      row.appendChild(meta);
      row.appendChild(price);
      itemsContainer.appendChild(row);
    });
  }

  const totals = calculateCartTotals(cart);
  if (subtotalEl) subtotalEl.textContent = formatPriceINR(totals.subtotal);
  if (shippingEl)
    shippingEl.textContent = totals.subtotal
      ? formatPriceINR(totals.shipping)
      : "₹0";
  if (totalEl) totalEl.textContent = formatPriceINR(totals.total);

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!cart.length) {
        showToast("Your cart is empty.", "error");
        return;
      }

      if (!form.reportValidity()) {
        return;
      }

      const orderId = `HS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      clearCart();
      refreshCartBadge();

      if (container) container.hidden = true;
      if (confirmation) confirmation.hidden = false;
      if (confirmationOrderId) {
        confirmationOrderId.textContent = `Demo order reference: ${orderId}`;
      }
      showToast("Order placed (demo).");
    });
  }

  if (confirmationContinue) {
    confirmationContinue.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
}

