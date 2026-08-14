/* ========== AURELIA — App Logic + Flying Cart ========== */

const dishes = [
  {
    id: "truffle-pasta",
    name: "Truffle Tagliatelle",
    price: 34,
    desc: "Handmade pasta, black truffle, 24-month aged parmesan, fresh herbs",
    image: "https://images.unsplash.com/photo-1473093294670-1f6c2d1b8b3a?w=600&q=80"
  },
  {
    id: "wagyu",
    name: "A5 Wagyu Ribeye",
    price: 98,
    desc: "Japanese A5, charcoal grilled, bone marrow butter, seasonal greens",
    image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&q=80"
  },
  {
    id: "scallops",
    name: "Seared Scallops",
    price: 36,
    desc: "Dive scallops, cauliflower purée, brown butter, caviar",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80"
  },
  {
    id: "lobster",
    name: "Lobster Risotto",
    price: 48,
    desc: "Carnaroli rice, Maine lobster, saffron, lemon zest",
    image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80"
  },
  {
    id: "duck",
    name: "Roasted Duck Breast",
    price: 42,
    desc: "Crispy skin, cherry gastrique, confit leg, root vegetables",
    image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=600&q=80"
  },
  {
    id: "chocolate",
    name: "Dark Chocolate Soufflé",
    price: 18,
    desc: "Valrhona 70%, crème anglaise, gold leaf",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80"
  }
];

// ---------- State ----------
let cart = JSON.parse(localStorage.getItem("aurelia-cart") || "[]");

// ---------- DOM ----------
const dishesGrid = document.getElementById("dishesGrid");
const cartBtn = document.getElementById("cartBtn");
const cartBadge = document.getElementById("cartBadge");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const flyersContainer = document.getElementById("flyers");
const navbar = document.getElementById("navbar");

// ---------- Render Dishes ----------
function renderDishes() {
  dishesGrid.innerHTML = dishes.map(dish => `
    <article class="dish-card" data-dish-id="${dish.id}">
      <div class="dish-image-wrap" data-dish-image>
        <img src="${dish.image}" alt="${dish.name}" class="dish-img" loading="lazy" />
        <div class="dish-overlay"></div>
      </div>
      <div class="dish-info">
        <h3 class="dish-name">${dish.name}</h3>
        <p class="dish-price">$${dish.price}</p>
        <p class="dish-desc">${dish.desc}</p>
        <button class="add-btn" data-add="${dish.id}">Add to Order</button>
      </div>
    </article>
  `).join("");

  // Bind add buttons
  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.add;
      const dish = dishes.find(d => d.id === id);
      if (dish) addToCartWithFlight(dish, btn);
    });
  });
}

// ---------- Cart Logic ----------
function saveCart() {
  localStorage.setItem("aurelia-cart", JSON.stringify(cart));
  updateBadge();
  renderCartItems();
}

function updateBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = total;
  if (total > 0) {
    cartBadge.classList.add("visible");
  } else {
    cartBadge.classList.remove("visible");
  }
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty-cart">Your cart is empty</p>`;
    cartTotalEl.textContent = "$0";
    return;
  }

  let total = 0;
  cartItemsEl.innerHTML = cart.map(item => {
    const dish = dishes.find(d => d.id === item.id);
    if (!dish) return "";
    const line = dish.price * item.qty;
    total += line;
    return `
      <div class="cart-item">
        <img src="${dish.image}" alt="${dish.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-name">${dish.name}</div>
          <div class="cart-item-price">$${dish.price}</div>
          <div class="cart-item-qty">Qty: ${item.qty}</div>
        </div>
      </div>
    `;
  }).join("");

  cartTotalEl.textContent = `$${total}`;
}

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("visible");
  document.body.style.overflow = "";
}

// ---------- Flying Animation (Curved + Rotation) ----------
function addToCartWithFlight(dish, buttonEl) {
  const card = buttonEl.closest("[data-dish-id]");
  const imgEl = card.querySelector("[data-dish-image] img");
  const cartIcon = cartBtn;

  if (!imgEl || !cartIcon) {
    // fallback: just add
    addToCart(dish.id);
    return;
  }

  const startRect = imgEl.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const endX = endRect.left + endRect.width / 2;
  const endY = endRect.top + endRect.height / 2;

  // Create flyer
  const flyer = document.createElement("div");
  flyer.className = "flyer";
  flyer.innerHTML = `<img src="${dish.image}" alt="" />`;
  flyer.style.left = "0";
  flyer.style.top = "0";
  flyer.style.transform = `translate(${startX - 40}px, ${startY - 40}px) scale(1) rotate(0deg)`;
  flyer.style.opacity = "1";
  flyersContainer.appendChild(flyer);

  // Force reflow
  flyer.offsetHeight;

  // Animate with cubic-bezier style timing using Web Animations API
  // We approximate the quadratic Bezier with keyframes
  const controlY = Math.min(startY, endY) - 160;

  const keyframes = [
    {
      transform: `translate(${startX - 40}px, ${startY - 40}px) scale(1) rotate(0deg)`,
      opacity: 1,
      offset: 0
    },
    {
      transform: `translate(${(startX + endX) / 2 - 40}px, ${controlY - 40}px) scale(0.7) rotate(-28deg)`,
      opacity: 0.95,
      offset: 0.45
    },
    {
      transform: `translate(${endX - 40}px, ${endY - 40}px) scale(0.22) rotate(8deg)`,
      opacity: 0.4,
      offset: 1
    }
  ];

  const animation = flyer.animate(keyframes, {
    duration: 850,
    easing: "cubic-bezier(0.22, 0.03, 0.26, 1)",
    fill: "forwards"
  });

  animation.onfinish = () => {
    flyer.remove();
    // Bounce the cart icon
    cartBtn.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.28)" },
        { transform: "scale(1)" }
      ],
      { duration: 380, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
    );
  };

  // Add to cart slightly before the end
  setTimeout(() => {
    addToCart(dish.id);
  }, 680);
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
}

// ---------- Event Listeners ----------
cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartDrawer);
cartOverlay.addEventListener("click", closeCartDrawer);

document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  if (cart.length === 0) return;
  alert("This is a demo. In a real site this would proceed to checkout / payment.");
  cart = [];
  saveCart();
  closeCartDrawer();
});

// Navbar scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 60) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Quick action buttons (demo)
["orderBtn", "quickOrder", "mobileOrder"].forEach(id => {
  document.getElementById(id)?.addEventListener("click", () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  });
});

["reserveBtn", "heroReserve", "quickReserve", "ctaReserve", "mobileReserve"].forEach(id => {
  document.getElementById(id)?.addEventListener("click", () => {
    alert("Reservation system demo.\nIn the full version this opens a beautiful multi-step booking wizard.");
  });
});

// ---------- Init ----------
renderDishes();
updateBadge();
renderCartItems();

console.log("%cAurelia Fine Dining — Demo Site Ready", "color: #c9a962; font-size: 14px;");
