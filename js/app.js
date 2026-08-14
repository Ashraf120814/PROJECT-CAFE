/* ========== FLAVORO — Complete App ========== */

const dishes = [
  {
    id: "alfredo",
    name: "Creamy Alfredo Pasta",
    desc: "White sauce pasta with herbs",
    price: 12.99,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80"
  },
  {
    id: "chicken",
    name: "Grilled Chicken Steak",
    desc: "Served with veggies & sauce",
    price: 15.99,
    badge: null,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80"
  },
  {
    id: "pizza",
    name: "Margherita Pizza",
    desc: "Classic cheese pizza",
    price: 11.99,
    badge: null,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80"
  },
  {
    id: "lava",
    name: "Chocolate Lava Cake",
    desc: "Warm chocolate with ice cream",
    price: 7.99,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80"
  },
  {
    id: "burger",
    name: "Classic Cheeseburger",
    desc: "Juicy beef patty, cheddar, pickles",
    price: 13.49,
    badge: null,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80"
  },
  {
    id: "salad",
    name: "Caesar Salad",
    desc: "Crisp romaine, parmesan, croutons",
    price: 9.99,
    badge: null,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80"
  }
];

let cart = JSON.parse(localStorage.getItem("flavoro-cart") || "[]");
let selectedTime = null;

// ---------- DOM ----------
const dishesGrid = document.getElementById("dishesGrid");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartBody = document.getElementById("cartBody");
const cartTotal = document.getElementById("cartTotal");
const overlay = document.getElementById("overlay");
const closeCart = document.getElementById("closeCart");
const header = document.getElementById("header");
const reservationModal = document.getElementById("reservationModal");
const openReservation = document.getElementById("openReservation");
const closeModal = document.getElementById("closeModal");
const reservationForm = document.getElementById("reservationForm");
const confirmation = document.getElementById("confirmation");
const flyers = document.getElementById("flyers");

// ---------- Render Dishes ----------
function renderDishes() {
  dishesGrid.innerHTML = dishes.map(d => `
    <article class="dish-card" data-id="${d.id}">
      <div class="dish-img-wrap" data-img>
        ${d.badge ? `<span class="dish-badge">${d.badge}</span>` : ""}
        <img src="${d.image}" alt="${d.name}" loading="lazy" />
      </div>
      <div class="dish-info">
        <h3 class="dish-name">${d.name}</h3>
        <p class="dish-desc">${d.desc}</p>
        <div class="dish-footer">
          <span class="dish-price">$${d.price.toFixed(2)}</span>
          <button class="add-btn" data-add="${d.id}">+</button>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.add;
      const dish = dishes.find(d => d.id === id);
      if (dish) addWithFlight(dish, btn);
    });
  });
}

// ---------- Cart ----------
function saveCart() {
  localStorage.setItem("flavoro-cart", JSON.stringify(cart));
  updateCount();
  renderCart();
}

function updateCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = total;
  cartCount.classList.toggle("show", total > 0);
}

function renderCart() {
  if (!cart.length) {
    cartBody.innerHTML = `<p class="empty">Your cart is empty</p>`;
    cartTotal.textContent = "$0.00";
    return;
  }
  let total = 0;
  cartBody.innerHTML = cart.map(item => {
    const d = dishes.find(x => x.id === item.id);
    if (!d) return "";
    const line = d.price * item.qty;
    total += line;
    return `
      <div class="cart-item">
        <img src="${d.image}" alt="${d.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${d.name}</div>
          <div class="cart-item-price">$${d.price.toFixed(2)}</div>
          <div class="cart-item-qty">Qty: ${item.qty}</div>
        </div>
      </div>
    `;
  }).join("");
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

// ---------- Flying Animation ----------
function addWithFlight(dish, btn) {
  const card = btn.closest("[data-id]");
  const imgEl = card.querySelector("[data-img] img");
  if (!imgEl || !cartBtn) {
    addToCart(dish.id);
    return;
  }

  const start = imgEl.getBoundingClientRect();
  const end = cartBtn.getBoundingClientRect();
  const startX = start.left + start.width / 2;
  const startY = start.top + start.height / 2;
  const endX = end.left + end.width / 2;
  const endY = end.top + end.height / 2;

  const flyer = document.createElement("div");
  flyer.className = "flyer";
  flyer.innerHTML = `<img src="${dish.image}" alt="" />`;
  flyer.style.transform = `translate(${startX - 35}px, ${startY - 35}px) scale(1) rotate(0deg)`;
  flyer.style.opacity = "1";
  flyers.appendChild(flyer);
  flyer.offsetHeight;

  const controlY = Math.min(startY, endY) - 140;
  const keyframes = [
    { transform: `translate(${startX - 35}px, ${startY - 35}px) scale(1) rotate(0deg)`, opacity: 1 },
    { transform: `translate(${(startX + endX)/2 - 35}px, ${controlY - 35}px) scale(0.65) rotate(-25deg)`, opacity: 0.95, offset: 0.45 },
    { transform: `translate(${endX - 35}px, ${endY - 35}px) scale(0.2) rotate(8deg)`, opacity: 0.35 }
  ];

  const anim = flyer.animate(keyframes, {
    duration: 800,
    easing: "cubic-bezier(0.22, 0.03, 0.26, 1)",
    fill: "forwards"
  });

  anim.onfinish = () => {
    flyer.remove();
    cartBtn.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
      { duration: 350, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
    );
  };

  setTimeout(() => addToCart(dish.id), 650);
}

function addToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
}

// ---------- Reservation Modal ----------
function openModal() {
  reservationModal.classList.add("open");
  document.body.style.overflow = "hidden";
  // set min date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").min = today;
}
function closeModalFn() {
  reservationModal.classList.remove("open");
  document.body.style.overflow = "";
  // reset form after close
  setTimeout(() => {
    reservationForm.hidden = false;
    confirmation.hidden = true;
    reservationForm.reset();
    selectedTime = null;
    document.querySelectorAll(".time-slot").forEach(s => s.classList.remove("active"));
  }, 300);
}

// Time slots
document.querySelectorAll(".time-slot").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time-slot").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    selectedTime = btn.dataset.time;
    document.getElementById("selectedTime").value = selectedTime;
  });
});

reservationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!selectedTime) {
    alert("Please select a time slot");
    return;
  }

  const guests = document.getElementById("guests").value;
  const date = document.getElementById("date").value;
  const name = document.getElementById("name").value;
  const seating = document.querySelector('input[name="seating"]:checked').value;

  const dateObj = new Date(date + "T12:00:00");
  const niceDate = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  document.getElementById("confirmDetails").innerHTML = `
    <strong>${name}</strong><br>
    ${guests} guests · ${seating}<br>
    ${niceDate} at ${selectedTime.replace(":", ":").replace(/^(\d+)/, m => {
      const h = parseInt(m);
      return h > 12 ? (h-12) : h;
    })} ${selectedTime.startsWith("1") || selectedTime.startsWith("2") ? "PM" : "PM"}
  `;

  reservationForm.hidden = true;
  confirmation.hidden = false;
});

// ---------- Events ----------
cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartDrawer);
overlay.addEventListener("click", () => {
  closeCartDrawer();
  closeModalFn();
});
openReservation.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalFn);
document.getElementById("closeConfirm").addEventListener("click", closeModalFn);

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  alert("This is a demo. In a real site this would go to checkout.");
  cart = [];
  saveCart();
  closeCartDrawer();
});

// Header scroll
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 50);
});

// Mobile nav (simple)
document.getElementById("mobileToggle")?.addEventListener("click", () => {
  alert("Mobile menu can be expanded here. For now use the section links.");
});

// ---------- Init ----------
renderDishes();
updateCount();
renderCart();

console.log("%cFlavoro Restaurant — Complete Website Ready", "color:#f97316;font-size:14px;font-weight:bold");
