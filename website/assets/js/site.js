/* =====================================================================
   ANCESTRY DECODED — Company website behaviour
   Mobile nav · order edition pricing · uploads · card formatting ·
   validation · (demo) order placement.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  /* ---------- Order / checkout page ---------- */
  var form = document.getElementById("orderForm");
  if (!form) return;

  var VAT_RATE = 0.2;

  function fmt(n) {
    return "£" + n.toFixed(2);
  }

  /* Preselect edition from ?tier= query (set by pricing links) */
  var params = new URLSearchParams(window.location.search);
  var requestedTier = params.get("tier");
  if (requestedTier) {
    var match = form.querySelector('input[name="tier"][value="' + requestedTier + '"]');
    if (match) match.checked = true;
  }

  /* ---------- Live order summary ---------- */
  var giftBox = document.getElementById("giftBox");
  var rowGift = document.getElementById("rowGift");
  var sumName = document.getElementById("sumName");
  var sumBase = document.getElementById("sumBase");
  var sumSubtotal = document.getElementById("sumSubtotal");
  var sumVat = document.getElementById("sumVat");
  var sumTotal = document.getElementById("sumTotal");

  function selectedTier() {
    return form.querySelector('input[name="tier"]:checked');
  }

  function updateSummary() {
    var tier = selectedTier();
    if (!tier) return;
    var base = parseFloat(tier.getAttribute("data-price"));
    var name = tier.getAttribute("data-name");
    var subtotal = base; // gift packaging is free for now
    var vat = subtotal * VAT_RATE;
    var total = subtotal + vat;

    sumName.textContent = name;
    sumBase.textContent = fmt(base);
    sumSubtotal.textContent = fmt(subtotal);
    sumVat.textContent = fmt(vat);
    sumTotal.textContent = fmt(total);
    if (rowGift) rowGift.hidden = !(giftBox && giftBox.checked);
  }

  form.querySelectorAll('input[name="tier"]').forEach(function (el) {
    el.addEventListener("change", updateSummary);
  });
  if (giftBox) giftBox.addEventListener("change", updateSummary);
  updateSummary();

  /* ---------- File upload feedback ---------- */
  function wireDropzone(id) {
    var dz = document.getElementById(id);
    if (!dz) return;
    var input = dz.querySelector('input[type="file"]');
    var fileLabel = dz.querySelector(".dz-file");
    input.addEventListener("change", function () {
      if (input.files && input.files.length) {
        dz.classList.add("has-file");
        fileLabel.hidden = false;
        fileLabel.textContent = "✓ " + input.files[0].name;
      } else {
        dz.classList.remove("has-file");
        fileLabel.hidden = true;
      }
    });
  }
  wireDropzone("dzFront");
  wireDropzone("dzProfile");

  /* ---------- Card field formatting ---------- */
  var cardNumber = document.getElementById("cardNumber");
  var cardExp = document.getElementById("cardExp");
  var cardCvc = document.getElementById("cardCvc");
  var cardType = document.getElementById("cardType");

  function detectCard(num) {
    if (/^4/.test(num)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(num)) return "Mastercard";
    if (/^3[47]/.test(num)) return "Amex";
    return "";
  }

  if (cardNumber) {
    cardNumber.addEventListener("input", function () {
      var digits = cardNumber.value.replace(/\D/g, "").slice(0, 19);
      cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
      if (cardType) cardType.textContent = detectCard(digits);
    });
  }
  if (cardExp) {
    cardExp.addEventListener("input", function () {
      var d = cardExp.value.replace(/\D/g, "").slice(0, 4);
      if (d.length >= 3) d = d.slice(0, 2) + "/" + d.slice(2);
      cardExp.value = d;
    });
  }
  if (cardCvc) {
    cardCvc.addEventListener("input", function () {
      cardCvc.value = cardCvc.value.replace(/\D/g, "").slice(0, 4);
    });
  }

  /* ---------- Validation ---------- */
  function setInvalid(input, invalid) {
    var field = input.closest(".field");
    if (field) field.classList.toggle("is-invalid", invalid);
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function validExpiry(v) {
    var m = /^(\d{2})\/(\d{2})$/.exec(v);
    if (!m) return false;
    var month = parseInt(m[1], 10);
    return month >= 1 && month <= 12;
  }

  function validateForm() {
    var ok = true;
    function check(id, test) {
      var el = document.getElementById(id);
      if (!el) return;
      var valid = test(el.value.trim());
      setInvalid(el, !valid);
      if (!valid) ok = false;
    }
    check("firstName", function (v) { return v.length > 0; });
    check("lastName", function (v) { return v.length > 0; });
    check("email", validEmail);
    check("cardName", function (v) { return v.length > 0; });
    check("cardNumber", function (v) { return v.replace(/\s/g, "").length >= 13; });
    check("cardExp", validExpiry);
    check("cardCvc", function (v) { return v.length >= 3; });
    check("cardZip", function (v) { return v.length > 0; });
    return ok;
  }

  /* clear error styling as the user types */
  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () { setInvalid(el, false); });
  });

  /* ---------- Submit (demo) ---------- */
  /*
    DEMO ONLY — this does not charge a card.
    To accept real payments, replace the block below with a call to your
    payment provider. Recommended: Stripe.

      1. Add a small backend endpoint that creates a PaymentIntent and
         returns its client_secret (never expose your secret key client-side).
      2. Load Stripe.js, mount Stripe Elements in the Payment section
         (you can drop the manual card fields once Elements is used).
      3. On submit, call stripe.confirmCardPayment(clientSecret, { ... })
         and only show the confirmation panel on success.
      4. Send the order details (edition, contact, notes, photo links) to
         your backend to kick off report production.
  */
  var placeOrder = document.getElementById("placeOrder");
  var confirmPanel = document.getElementById("confirm");
  var confirmRef = document.getElementById("confirmRef");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateForm()) {
      var firstInvalid = form.querySelector(".field.is-invalid");
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    placeOrder.disabled = true;
    placeOrder.textContent = "Processing…";

    /* simulate a payment round-trip */
    setTimeout(function () {
      var ref = "AD-" + Math.floor(100000 + Math.random() * 900000);
      if (confirmRef) confirmRef.textContent = ref;
      form.style.display = "none";
      if (confirmPanel) {
        confirmPanel.classList.add("is-visible");
        confirmPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1100);
  });
})();
