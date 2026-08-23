(() => {
  "use strict";

  /* ---------------- MOCK DATA ---------------- */

  const RANDOM_ITEMS = [
    { icon: "📦", name: "Bakery Boxes (50pcs)", seller: "Manila Packworks", rating: 4.2, price: "₱780", unit: "/bundle", topSeller: false },
    { icon: "📱", name: "Phone Case Bulk Lot", seller: "Cebu Gadget Hub", rating: 3.9, price: "₱1,150", unit: "/lot", topSeller: false },
    { icon: "🔩", name: "Steel Nails 2in (5kg)", seller: "Ferretería Ilocos", rating: 4.0, price: "₱620", unit: "/pack", topSeller: false },
    { icon: "🧵", name: "Fuzzy Floral Wire", seller: "Nena's Craft Supplies", rating: 4.8, price: "₱2,500", unit: "/100 rolls", topSeller: true },
    { icon: "🧦", name: "Assorted Socks (Wholesale)", seller: "Baguio Knitworks", rating: 4.1, price: "₱950", unit: "/dozen", topSeller: false },
    { icon: "🍬", name: "Candy Jar Fillers", seller: "Sweet Divisoria", rating: 4.3, price: "₱410", unit: "/kilo", topSeller: false },
  ];

  const FLORAL_ITEMS = [
    { icon: "🧵", name: "Fuzzy Floral Wire", seller: "Nena's Craft Supplies", rating: 4.8, reviews: 612, price: "₱2,500", unit: "/100 rolls", topSeller: true },
    { icon: "🎀", name: "Floral Wrap Packaging", seller: "Divisoria Wrap Co.", rating: 4.7, reviews: 540, price: "₱890", unit: "/50 sheets", topSeller: true },
    { icon: "🧺", name: "Woven Flower Baskets", seller: "Baguio Rattan Craft", rating: 4.5, reviews: 388, price: "₱1,320", unit: "/dozen", topSeller: false },
    { icon: "🌿", name: "Green Floral Foam Blocks", seller: "GreenStem Supply", rating: 4.4, reviews: 301, price: "₱610", unit: "/pack of 20", topSeller: false },
    { icon: "🎗️", name: "Satin Ribbon Spools", seller: "Nena's Craft Supplies", rating: 4.8, reviews: 612, price: "₱750", unit: "/24 spools", topSeller: true },
    { icon: "✂️", name: "Floral Shears (Pro)", seller: "Manila Garden Tools", rating: 4.2, reviews: 156, price: "₱340", unit: "/piece", topSeller: false },
  ];

  const ACTIVITY = [
    { icon: "🧵", title: "Nena's Craft Supplies", sub: "Bagsakan order", amt: "-₱2,510.00", neg: true },
    { icon: "💵", title: "Cash In via GCash", sub: "BPI •• 4821", amt: "+₱5,000.00", neg: false },
    { icon: "🎀", title: "Divisoria Wrap Co.", sub: "Bagsakan order", amt: "-₱890.00", neg: true },
  ];

  /* ---------------- STATE ---------------- */

  const state = {
    curated: false,
    activeItem: null, // { icon, name, seller, price }
    insure: true,
    subtotal: 2500,
  };

  /* ---------------- VIEW ROUTING ---------------- */

  const views = document.querySelectorAll(".view");
  const navitems = document.querySelectorAll(".navitem");
  const bottomnav = document.getElementById("bottomnav");

  function showView(name) {
    views.forEach(v => v.classList.toggle("active", v.dataset.view === name));
    navitems.forEach(n => n.classList.toggle("active", n.dataset.target === name));
    bottomnav.style.display = (name === "checkout") ? "none" : "flex";
  }

  navitems.forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.target));
  });

  /* ---------------- BAGSAKAN GRID ---------------- */

  const grid = document.getElementById("item-grid");
  const gridTitle = document.getElementById("grid-title");
  const gridHint = document.getElementById("grid-hint");
  const gabaiBanner = document.getElementById("gabai-banner");
  const pickBtn = document.getElementById("btn-pick-for-me");

  function renderGrid(items, { sorted }) {
    grid.innerHTML = "";
    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <div class="item-crate">
          ${item.topSeller ? '<span class="top-seller-badge">⭐ Top Seller</span>' : ""}
          <span>${item.icon}</span>
        </div>
        <div class="item-body">
          <div class="item-name">${item.name}</div>
          <div class="item-meta">
            <span class="item-seller">${item.seller}</span>
            <span class="item-rating">★ ${item.rating}</span>
          </div>
          <div class="item-price">${item.price} <small>${item.unit}</small></div>
          <button class="chat-cta">Chat with Seller</button>
        </div>
      `;
      card.querySelector(".chat-cta").addEventListener("click", () => openChat(item));
      grid.appendChild(card);
    });
    gridHint.textContent = sorted ? "sorted by reputation" : "unsorted";
    gridHint.classList.toggle("sorted", sorted);
  }

  renderGrid(RANDOM_ITEMS, { sorted: false });

  pickBtn.addEventListener("click", () => {
    if (state.curated) return;
    pickBtn.classList.add("busy");
    pickBtn.querySelector(".pfm-text strong").textContent = "Curating…";
    pickBtn.querySelector(".pfm-text small").textContent = "GAB AI is matching Bagsakan to your shop";

    setTimeout(() => {
      state.curated = true;
      const sorted = [...FLORAL_ITEMS].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      renderGrid(sorted, { sorted: true });
      gridTitle.textContent = "Picked for your Flower Shop";
      gabaiBanner.hidden = false;
      pickBtn.classList.remove("busy");
      pickBtn.querySelector(".pfm-text strong").textContent = "Picked for your shop ✓";
      pickBtn.querySelector(".pfm-text small").textContent = "Tap to re-curate Bagsakan";
    }, 1100);
  });

  /* ---------------- CHAT ---------------- */

  const chatLog = document.getElementById("chat-log");
  const chatSellerName = document.getElementById("chat-seller-name");
  const chatSellerAvatar = document.getElementById("chat-seller-avatar");
  const chatContextChip = document.getElementById("chat-context-chip");
  document.getElementById("chat-back").addEventListener("click", () => showView("bagsakan"));

  function openChat(item) {
    state.activeItem = item;
    chatSellerName.textContent = item.seller;
    chatSellerAvatar.textContent = item.icon;
    chatContextChip.textContent = `Re: ${item.name}`;
    chatLog.innerHTML = "";
    showView("chat");
    renderGabaiSuggestion(item);
  }

  function bubble(text, who) {
    const row = document.createElement("div");
    row.className = `bubble-row ${who}`;
    row.innerHTML = `<div class="bubble">${text}</div>`;
    chatLog.appendChild(row);
    chatLog.scrollTop = chatLog.scrollHeight;
    return row;
  }

  function typingIndicator() {
    const row = document.createElement("div");
    row.className = "bubble-row them";
    row.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    chatLog.appendChild(row);
    chatLog.scrollTop = chatLog.scrollHeight;
    return row;
  }

  function renderGabaiSuggestion(item) {
    const wrap = document.createElement("div");
    wrap.className = "gabai-suggest";
    wrap.id = "gabai-suggest-box";
    wrap.innerHTML = `
      <div class="gabai-avatar">G</div>
      <div class="gabai-suggest-body">
        <p class="gabai-suggest-label">GAB AI suggests</p>
        <p class="gabai-suggest-text">"Hi po! Interested in bulk ${item.name} for my flower shop — do you have a price for 100 rolls, and is pick-up available?"</p>
        <div class="gabai-suggest-actions">
          <button class="gabai-btn primary" id="gabai-use-suggestion">Use this message</button>
          <button class="gabai-btn ghost" id="gabai-dismiss">Dismiss</button>
        </div>
      </div>
    `;
    chatLog.appendChild(wrap);
    chatLog.scrollTop = chatLog.scrollHeight;

    document.getElementById("gabai-use-suggestion").addEventListener("click", () => {
      wrap.remove();
      bubble(`Hi po! Interested in bulk ${item.name} for my flower shop — do you have a price for 100 rolls, and is pick-up available?`, "me");
      simulateSellerReply(item);
    });
    document.getElementById("gabai-dismiss").addEventListener("click", () => wrap.remove());
  }

  function simulateSellerReply(item) {
    const typing = typingIndicator();
    setTimeout(() => {
      typing.remove();
      bubble(`Bulk order price for 100 wires: ${item.price}. Do you allow pick-up? Opo, available sa Divisoria stall namin! 🌷`, "them");

      const typing2 = typingIndicator();
      setTimeout(() => {
        typing2.remove();
        renderOfferCard(item);
      }, 1300);
    }, 1400);
  }

  function renderOfferCard(item) {
    const row = document.createElement("div");
    row.className = "bubble-row them";
    row.innerHTML = `
      <div class="offer-card" id="offer-card">
        <p class="offer-card-eyebrow">Seller offer</p>
        <p class="offer-card-item">${item.name} — 100 rolls</p>
        <div class="offer-card-row">
          <span class="offer-card-price">${item.price}</span>
          <span class="offer-card-cta">View Offer →</span>
        </div>
      </div>
    `;
    chatLog.appendChild(row);
    chatLog.scrollTop = chatLog.scrollHeight;
    row.querySelector("#offer-card").addEventListener("click", () => openCheckout(item));
  }

  /* ---------------- CHECKOUT ---------------- */

  document.getElementById("checkout-back").addEventListener("click", () => showView("chat"));

  const coThumb = document.getElementById("co-thumb");
  const coItem = document.getElementById("co-item");
  const coSeller = document.getElementById("co-seller");
  const coPrice = document.getElementById("co-price");
  const insureToggle = document.getElementById("insure-toggle");
  const totSubtotal = document.getElementById("tot-subtotal");
  const totInsure = document.getElementById("tot-insure");
  const totInsureRow = document.getElementById("tot-insure-row");
  const totGrand = document.getElementById("tot-grand");
  const placeOrderTotal = document.getElementById("place-order-total");

  function peso(n) {
    return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function openCheckout(item) {
    coThumb.textContent = item.icon;
    coItem.textContent = `${item.name} — 100 rolls`;
    coSeller.textContent = `from ${item.seller}`;
    coPrice.textContent = item.price;
    state.subtotal = Number(item.price.replace(/[₱,]/g, ""));
    updateTotals();
    showView("checkout");
  }

  function updateTotals() {
    const insureFee = insureToggle.checked ? 10 : 0;
    totInsureRow.style.display = insureToggle.checked ? "flex" : "none";
    totSubtotal.textContent = peso(state.subtotal);
    totInsure.textContent = peso(insureFee);
    const grand = state.subtotal + insureFee;
    totGrand.textContent = peso(grand);
    placeOrderTotal.textContent = peso(grand);
  }

  insureToggle.addEventListener("change", updateTotals);

  document.querySelectorAll(".paymethod").forEach(label => {
    label.addEventListener("click", () => {
      document.querySelectorAll(".paymethod").forEach(l => {
        l.classList.remove("selected");
        l.querySelector("input").checked = false;
      });
      label.classList.add("selected");
      label.querySelector("input").checked = true;
    });
  });

  /* ---------------- PLACE ORDER / SUCCESS ---------------- */

  const successModal = document.getElementById("success-modal");
  const successTitle = document.getElementById("success-title");
  const successSub = document.getElementById("success-sub");
  const orderId = document.getElementById("order-id");

  document.getElementById("btn-place-order").addEventListener("click", () => {
    const insured = insureToggle.checked;
    successTitle.textContent = insured ? "Order Placed & Protected!" : "Order Placed!";
    successSub.textContent = insured
      ? `${state.activeItem ? state.activeItem.seller : "Your seller"} has been notified. This delivery is covered by GInsure Transit.`
      : `${state.activeItem ? state.activeItem.seller : "Your seller"} has been notified. Track this order anytime in Chat.`;
    orderId.textContent = "TG-" + Math.floor(20000 + Math.random() * 9000);
    successModal.hidden = false;
  });

  document.getElementById("btn-back-home").addEventListener("click", () => {
    successModal.hidden = true;
    showView("bagsakan");
  });

  /* ---------------- WALLET ---------------- */

  const activityList = document.getElementById("activity-list");
  ACTIVITY.forEach(a => {
    const row = document.createElement("div");
    row.className = "activity-row";
    row.innerHTML = `
      <div class="activity-icon">${a.icon}</div>
      <div class="activity-info">
        <p class="activity-title">${a.title}</p>
        <p class="activity-sub">${a.sub}</p>
      </div>
      <div class="activity-amt ${a.neg ? "neg" : "pos"}">${a.amt}</div>
    `;
    activityList.appendChild(row);
  });

  /* ---------------- INIT ---------------- */
  showView("bagsakan");

  /* ---------------- SERVICE WORKER ---------------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
