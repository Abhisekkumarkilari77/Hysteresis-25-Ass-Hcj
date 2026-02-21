
const CART_STORAGE_KEY = "ecommerce_cart";

function getCart() {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (_) {
    return [];
  }
}

function saveCart(cart) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (_) {
  }
}

function clearCart() {
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch (_) {
  }
}

function addToCart(productId, quantity) {
  const product = getProductById(productId);
  if (!product) return { ok: false, reason: "not_found" };
  if (product.stock <= 0) return { ok: false, reason: "out_of_stock" };

  const qty = Math.max(1, Number(quantity || 1));
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    const newQty = existing.quantity + qty;
    existing.quantity =
      typeof product.stock === "number"
        ? Math.min(newQty, product.stock)
        : newQty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
      stock: product.stock
    });
  }

  saveCart(cart);
  return { ok: true };
}

function updateCartItemQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === Number(productId));
  if (!item) return;
  const product = getProductById(productId) || item;
  const maxQty =
    typeof product.stock === "number" && product.stock > 0
      ? product.stock
      : Number.POSITIVE_INFINITY;

  const safeQty = Math.max(1, Math.min(Number(quantity) || 1, maxQty));
  item.quantity = safeQty;
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter((entry) => entry.id !== Number(productId));
  saveCart(cart);
}

function calculateCartTotals(cart) {
  const items = cart || getCart();
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const hasItems = items.length > 0;
  const shipping = hasItems ? 99 : 0;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function getCartItemCount() {
  return getCart().reduce((count, item) => count + (item.quantity || 0), 0);
}

