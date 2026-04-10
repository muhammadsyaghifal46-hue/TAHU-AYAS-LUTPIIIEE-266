/* =========================
   VARIABEL GLOBAL
========================= */
let cart = [];

/* =========================
   FORMAT RUPIAH
========================= */
function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

/* =========================
   FORMAT INPUT HARGA DENGAN TITIK
========================= */
function formatPriceInput(input) {
  let value = input.value.replace(/\D/g, ""); // Hanya ambil angka
  if (!value) value = "0";
  input.value = Number(value).toLocaleString("id-ID");
}

/* =========================
   HITUNG QTY SESUAI NOMINAL
========================= */
function updateQty(priceInputId, unitPrice) {
  const input = document.getElementById(priceInputId);
  let value = parseInt(input.value.replace(/\./g, "")) || 0;
  let qty = Math.floor(value / unitPrice);

  const productCard = input.closest(".product-card");
  const qtySpan = productCard.querySelector(".min-order .min-qty");
  if (qtySpan) qtySpan.textContent = qty;
}

/* =========================
   TAMBAH / KURANG HARGA
   delta = +1 atau -1
========================= */
function changePrice(priceInputId, unitPrice, delta = 1) {
  const input = document.getElementById(priceInputId);
  let value = parseInt(input.value.replace(/\./g, "")) || 0;

  value += 1000 * delta; // Tambah/Kurang fix 1000
  if (value < unitPrice) value = unitPrice; // Minimal harga sesuai unitPrice

  input.value = value.toLocaleString("id-ID");
  updateQty(priceInputId, unitPrice); // Update jumlah biji
}

/* =========================
   TAMBAH KE KERANJANG
========================= */
function addToCartByPrice(name, unitPrice, priceInputId) {
  const input = document.getElementById(priceInputId);
  let totalPrice = parseInt(input.value.replace(/\./g, "")) || unitPrice;
  let qty = Math.floor(totalPrice / unitPrice);

  // Minimal pembelian per produk
  const minMap = {
    "Tahu Goreng Asin": 10,
    "Tahu Goreng Segitiga": 50,
    "Tahu Kotak Putih": 25
  };
  const max = 1000;
  const min = minMap[name] || 1;

  if (qty < min) qty = min;
  if (qty > max) qty = max;

  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.qty += qty;
    if (existingItem.qty > max) existingItem.qty = max;
  } else {
    cart.push({ name, price: unitPrice, qty });
  }

  updateCart();
  showToast("Produk berhasil ditambahkan ke keranjang!");
}

/* =========================
   UPDATE TAMPILAN KERANJANG
========================= */
function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-muted mb-0">Keranjang masih kosong.</p>';
    cartTotal.textContent = "Rp 0";
    cartCount.textContent = "0";
    return;
  }

  let total = 0;
  let totalQty = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    totalQty += item.qty;

    const div = document.createElement("div");
    div.className = "d-flex justify-content-between align-items-center mb-2";
    div.innerHTML = `
      <span>${item.name} x ${item.qty}</span>
      <div>
        <span>${formatRupiah(subtotal)}</span>
        <button class="btn btn-sm btn-danger ms-2" onclick="deleteCartItem(${index})">Hapus</button>
      </div>
    `;
    cartItems.appendChild(div);
  });

  cartTotal.textContent = formatRupiah(total);
  cartCount.textContent = totalQty;
}

/* =========================
   HAPUS ITEM PER PRODUK
========================= */
function deleteCartItem(index) {
  if (confirm("Yakin ingin menghapus item ini?")) {
    cart.splice(index, 1);
    updateCart();
  }
}

/* =========================
   KOSONGKAN KERANJANG
========================= */
function clearCart() {
  if (confirm("Yakin ingin mengosongkan keranjang?")) {
    cart = [];
    updateCart();
  }
}

/* =========================
   CHECKOUT VIA WHATSAPP
========================= */
function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  const metodeAmbil = document.getElementById("metodeAmbil").value;
  const metodeBayar = document.getElementById("metodeBayar").value;

  let pesan = "Halo, saya ingin memesan:\n\n";

  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    pesan += `${item.name} x${item.qty} = ${formatRupiah(subtotal)}\n`;
  });

  pesan += `\nTotal: ${formatRupiah(total)}\n\n`;
  pesan += `Metode Pengambilan: ${metodeAmbil}\n`;
  pesan += `Metode Pembayaran: ${metodeBayar}\n`;

  if (metodeBayar === "DANA") {
    pesan += "Transfer ke DANA: 6282313469840\n";
  } else if (metodeBayar === "Transfer BRI") {
    pesan += "Transfer ke BRI: 3689*********39 (MUHAMMAD LUTHFI)\n";
  } else if (metodeBayar === "COD") {
    pesan += "Bayar di tempat (COD)\n";
  }

  const url = "https://wa.me/6282326826612?text=" + encodeURIComponent(pesan);
  window.open(url, "_blank");
}
/* =========================
   TOAST NOTIFIKASI
========================= */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

/* =========================
   NAVBAR ACTIVE + SCROLL + AUTO CLOSE MOBILE
========================= */
function initNavbar() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const navbar = document.getElementById("mainNavbar");
  const navCollapse = document.getElementById("navMenu");

  function setActiveLink() {
    const scrollY = window.pageYOffset;
    let currentSection = "home";

    sections.forEach(section => {
      const top = section.offsetTop - 180;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSection = section.getAttribute("id");
      }
    });

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
      currentSection = sections[sections.length - 1].getAttribute("id");
    }

    navLinks.forEach(link => link.classList.remove("active"));
    navLinks.forEach(link => {
      if (link.getAttribute("href") === "#" + currentSection) {
        link.classList.add("active");
      }
    });
  }

  function handleNavbarScroll() {
    if (window.scrollY > 30) navbar.classList.add("navbar-scrolled");
    else navbar.classList.remove("navbar-scrolled");
  }

  function handleScroll() {
    setActiveLink();
    handleNavbarScroll();
  }

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("load", handleScroll);

  navLinks.forEach(link => {
    link.addEventListener("click", function () {
      navLinks.forEach(item => item.classList.remove("active"));
      this.classList.add("active");

      // Tutup menu mobile
      if (window.innerWidth < 992) {
        const bsCollapse =
          bootstrap.Collapse.getInstance(navCollapse) ||
          new bootstrap.Collapse(navCollapse, { toggle: false });
        bsCollapse.hide();
      }
    });
  });
}

/* =========================
   INISIALISASI SAAT HALAMAN SIAP
========================= */
document.addEventListener("DOMContentLoaded", () => {
  updateCart();
  initNavbar();
});