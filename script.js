/* ============================================================
   Neon Nights — Club Entry System
   The original door policy, dressed up for the web.
   ============================================================ */

(() => {
  "use strict";

  /* -------------------- Elements -------------------- */
  const form = document.getElementById("entryForm");
  const ageInput = document.getElementById("age");
  const ticketInput = document.getElementById("ticket");
  const vipInput = document.getElementById("vip");
  const ageError = document.getElementById("ageError");
  const submitBtn = document.getElementById("submitBtn");
  const againBtn = document.getElementById("againBtn");

  const resultPanel = document.getElementById("resultPanel");
  const idleView = document.getElementById("idleView");
  const scanView = document.getElementById("scanView");
  const passView = document.getElementById("passView");

  const passIcon = document.getElementById("passIcon");
  const passBadge = document.getElementById("passBadge");
  const passTitle = document.getElementById("passTitle");
  const passMessage = document.getElementById("passMessage");
  const passCode = document.getElementById("passCode");
  const passAge = document.getElementById("passAge");
  const passTicket = document.getElementById("passTicket");
  const passVip = document.getElementById("passVip");

  const statChecked = document.getElementById("statChecked");
  const statVip = document.getElementById("statVip");
  const statDenied = document.getElementById("statDenied");

  /* -------------------- Icons -------------------- */
  const icons = {
    denied:
      '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="m9 9 6 6m0-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    ticket:
      '<svg viewBox="0 0 24 24" fill="none"><path d="M4 8.5A2.5 2.5 0 0 0 6.5 6h11A2.5 2.5 0 0 0 20 8.5v1a2.5 2.5 0 0 0 0 5v1a2.5 2.5 0 0 0-2.5 2.5h-11A2.5 2.5 0 0 0 4 15.5v-1a2.5 2.5 0 0 0 0-5v-1Z" stroke="currentColor" stroke-width="1.8"/><path d="M13 7v10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 2"/></svg>',
    regular:
      '<svg viewBox="0 0 24 24" fill="none"><path d="M5 20V7l7 4V7l7 4V4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20h16" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    vip:
      '<svg viewBox="0 0 24 24" fill="none"><path d="m3 7 4.5 10L12 10l4.5 7L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };

  /* -------------------- Door policy (from the original project) -------------------- */
  function evaluate(age, hasTicket, isVip) {
    if (age < 18) {
      return {
        state: "denied",
        badge: "ENTRY DENIED",
        title: "You're not allowed to enter!",
        message:
          "The minimum age is 18. This one's not on you — come back when the time is right.",
      };
    }
    if (!hasTicket) {
      return {
        state: "ticket",
        badge: "TICKET REQUIRED",
        title: "Please bring your ticket!",
        message:
          "You're old enough, but the door needs a valid pass. Grab a ticket and try again.",
      };
    }
    if (!isVip) {
      return {
        state: "regular",
        badge: "GENERAL ADMISSION",
        title: "You're allowed to enter regular lounge",
        message: "All checks passed. The main floor is waiting — enjoy the night!",
      };
    }
    return {
      state: "vip",
      badge: "VIP ACCESS",
      title: "VIP access granted",
      message:
        "Welcome Sir/Ma'am! You can enter VIP lounge & access all premium facilities, Enjoy!",
    };
  }

  /* -------------------- Stats (persisted locally) -------------------- */
  const STORE_KEY = "neon-nights-stats";
  let stats = { checked: 0, vip: 0, denied: 0 };

  function loadStats() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved && typeof saved === "object") {
        stats = {
          checked: Number(saved.checked) || 0,
          vip: Number(saved.vip) || 0,
          denied: Number(saved.denied) || 0,
        };
      }
    } catch (error) {
      /* Storage unavailable — stats simply stay in memory. */
    }
    renderStats();
  }

  function saveStats() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(stats));
    } catch (error) {
      /* Ignore storage failures (private mode, blocked cookies, etc.). */
    }
    renderStats();
  }

  function renderStats() {
    statChecked.textContent = stats.checked.toLocaleString();
    statVip.textContent = stats.vip.toLocaleString();
    statDenied.textContent = stats.denied.toLocaleString();
  }

  /* -------------------- View helpers -------------------- */
  function showView(view) {
    [idleView, scanView, passView].forEach((el) => {
      el.hidden = el !== view;
    });
  }

  function makeCode() {
    const bytes = new Uint32Array(1);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      bytes[0] = Math.floor(Math.random() * 10000);
    }
    return `#NN-${String(bytes[0] % 10000).padStart(4, "0")}`;
  }

  function renderPass(verdict, guest) {
    passIcon.innerHTML = icons[verdict.state];
    passBadge.textContent = verdict.badge;
    passTitle.textContent = verdict.title;
    passMessage.textContent = verdict.message;
    passCode.textContent = makeCode();
    passAge.textContent = `AGE ${guest.age}`;
    passTicket.textContent = `TICKET ${guest.hasTicket ? "YES" : "NO"}`;
    passVip.textContent = `VIP ${guest.isVip ? "YES" : "NO"}`;
    resultPanel.dataset.state = verdict.state;
    showView(passView);
  }

  /* -------------------- Form handling -------------------- */
  function clearActivePreset() {
    document.querySelectorAll(".preset").forEach((btn) => btn.classList.remove("is-active"));
  }

  [ageInput, ticketInput, vipInput].forEach((el) => {
    el.addEventListener("input", () => {
      ageError.hidden = true;
      clearActivePreset();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const raw = ageInput.value.trim();
    const age = Number(raw);

    if (raw === "" || !Number.isInteger(age) || age < 1 || age > 120) {
      ageError.hidden = false;
      ageInput.focus();
      ageInput.setAttribute("aria-invalid", "true");
      return;
    }
    ageInput.removeAttribute("aria-invalid");
    ageError.hidden = true;

    submitBtn.disabled = true;
    showView(scanView);

    const guest = {
      age,
      hasTicket: ticketInput.checked,
      isVip: vipInput.checked,
    };

    window.setTimeout(() => {
      const verdict = evaluate(guest.age, guest.hasTicket, guest.isVip);

      stats.checked += 1;
      if (verdict.state === "vip") stats.vip += 1;
      if (verdict.state === "denied" || verdict.state === "ticket") stats.denied += 1;
      saveStats();

      renderPass(verdict, guest);
      submitBtn.disabled = false;
    }, 850);
  });

  againBtn.addEventListener("click", () => {
    resultPanel.dataset.state = "idle";
    showView(idleView);
    ageInput.focus();
    ageInput.select();
  });

  /* -------------------- Demo presets -------------------- */
  const presets = {
    minor: { age: 16, ticket: false, vip: false },
    noticket: { age: 22, ticket: false, vip: false },
    regular: { age: 24, ticket: true, vip: false },
    vip: { age: 27, ticket: true, vip: true },
  };

  document.querySelectorAll(".preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = presets[btn.dataset.preset];
      if (!preset) return;

      ageInput.value = preset.age;
      ticketInput.checked = preset.ticket;
      vipInput.checked = preset.vip;
      ageError.hidden = true;
      ageInput.removeAttribute("aria-invalid");

      clearActivePreset();
      btn.classList.add("is-active");

      resultPanel.dataset.state = "idle";
      showView(idleView);
      form.requestSubmit ? form.requestSubmit() : submitBtn.click();
    });
  });

  /* -------------------- Init -------------------- */
  loadStats();
  showView(idleView);
})();
