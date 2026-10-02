const WEDDING_CONFIG = {
  coupleShortName: "Lara & Davi",
  coupleFullName: "Lara Beringuy e Davi Leite",
  weddingDate: "2027-03-13T00:00:00-03:00",
  pixKey: "e7d77842-81c8-4d3b-9673-6a942f9925c5",
  recipient: "DAVI LEITE RIBEIRO DANTAS",
  pixCity: "SAO PAULO",
  honeymoonProgressUrl: "https://script.google.com/macros/s/AKfycbz7YvryoMqLvN6Za-tU5U5-WF-9h4H-b7cfDLkclPdJ83qahfTPwozyCvvQz3g6WXTtAA/exec?action=progress",
  ranking: [],
};

const formatBRL = (value) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
}).format(Number(value));


const normalizePixText = (value, maxLength) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^A-Za-z0-9 .-]/g, "")
  .toUpperCase()
  .trim()
  .slice(0, maxLength);

const emvField = (id, value) => {
  const text = String(value);
  return `${id}${String(text.length).padStart(2, "0")}${text}`;
};

const crc16ccitt = (payload) => {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

const buildPixPayload = ({ value, txid, description }) => {
  const merchantAccount =
    emvField("00", "BR.GOV.BCB.PIX") +
    emvField("01", WEDDING_CONFIG.pixKey) +
    emvField("02", normalizePixText(description, 50));

  const additionalData = emvField("05", normalizePixText(txid, 25) || "***");

  let payload =
    emvField("00", "01") +
    emvField("26", merchantAccount) +
    emvField("52", "0000") +
    emvField("53", "986");

  if (Number(value) > 0) {
    payload += emvField("54", Number(value).toFixed(2));
  }

  payload +=
    emvField("58", "BR") +
    emvField("59", normalizePixText(WEDDING_CONFIG.recipient, 25)) +
    emvField("60", normalizePixText(WEDDING_CONFIG.pixCity, 15)) +
    emvField("62", additionalData) +
    "6304";

  return payload + crc16ccitt(payload);
};


const showToast = (message) => {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove("visible"), 2600);
};

const copyText = async (text, successMessage) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast(successMessage);
    } catch {
      showToast("Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.");
    }
    textarea.remove();
  }
};

// Dados do destinatário exibidos na página.
const recipientElements = document.querySelectorAll("#pix-recipient, #alert-recipient");
recipientElements.forEach((element) => { element.textContent = WEDDING_CONFIG.recipient; });

// Contagem regressiva com estados para o dia e para depois do casamento.
const countdownIds = ["days", "hours", "minutes", "seconds"];
const countdownTarget = new Date(WEDDING_CONFIG.weddingDate);
const countdownTitle = document.querySelector("#countdown-title");
const countdown = document.querySelector("#countdown");
const countdownStatus = document.querySelector("#countdown-status");

const updateCountdown = () => {
  const now = Date.now();
  const difference = countdownTarget.getTime() - now;
  const oneDay = 86400000;

  if (difference > 0) {
    countdown.hidden = false;
    countdownStatus.hidden = true;
    countdownTitle.innerHTML = "Faltam poucos<br><em>capítulos.</em>";
    const values = [
      Math.floor(difference / oneDay),
      Math.floor((difference / 3600000) % 24),
      Math.floor((difference / 60000) % 60),
      Math.floor((difference / 1000) % 60),
    ];
    countdownIds.forEach((id, index) => {
      document.querySelector(`#countdown-${id}`).textContent = String(values[index]).padStart(2, "0");
    });
    return;
  }

  countdown.hidden = true;
  countdownStatus.hidden = false;
  const elapsed = Math.abs(difference);
  if (elapsed < oneDay) {
    countdownTitle.innerHTML = "O grande dia<br><em>chegou.</em>";
    countdownStatus.textContent = "É hoje! 🤍";
  } else {
    const marriedDays = Math.floor(elapsed / oneDay);
    countdownTitle.innerHTML = "E a nossa história<br><em>continua.</em>";
    countdownStatus.textContent = `Casados há ${marriedDays} ${marriedDays === 1 ? "dia" : "dias"}.`;
  }
};
updateCountdown();
window.setInterval(updateCountdown, 1000);

// Mural de carinho automático — alimentado pelas confirmações do RSVP.
const RSVP_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbziS25WSH1YvYpHedyUu57h17m7ZIFD0Z-4N7nhNZ7LoUA_TMFjbKTi_-bfJbunN-Hseg/exec";
const rankingList = document.querySelector("#ranking-list");

const formatPersonName = (value) => String(value || "")
  .trim()
  .toLocaleLowerCase("pt-BR")
  .replace(/(^|[\s'-])([\p{L}])/gu, (match, separator, letter) =>
    separator + letter.toLocaleUpperCase("pt-BR")
  );

const renderMuralNames = (entries) => {
  rankingList.innerHTML = "";

  if (!entries.length) {
    rankingList.innerHTML = `<div class="ranking-empty"><div><strong>Nosso mural está esperando os primeiros carinhos.</strong><p>Quando chegarem as primeiras confirmações pelo site, os nomes vão aparecer por aqui.</p></div></div>`;
    return;
  }

  entries.forEach((entry) => {
    const item = typeof entry === "string" ? { name: entry, companion: "" } : entry;
    const row = document.createElement("article");
    const mark = document.createElement("span");
    const content = document.createElement("div");
    const name = document.createElement("strong");

    row.className = "ranking-row mural-card";
    mark.className = "ranking-position mural-mark";
    mark.textContent = "✳";
    content.className = "mural-card-content";
    name.className = "ranking-name mural-name";
    name.textContent = formatPersonName(item.name);

    content.appendChild(name);

    if (item.companion) {
      const companion = document.createElement("span");
      companion.className = "mural-companion";
      companion.textContent = `com ${formatPersonName(item.companion)}`;
      content.appendChild(companion);
    }

    row.append(mark, content);
    rankingList.appendChild(row);
  });
};

rankingList.innerHTML = `<div class="ranking-empty"><div><strong>Carregando os carinhos...</strong><p>Estamos atualizando o mural com as confirmações recebidas.</p></div></div>`;

fetch(`${RSVP_WEBAPP_URL}?action=mural&t=${Date.now()}`, { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error("Falha ao carregar o mural.");
    return response.json();
  })
  .then((payload) => {
    if (!payload || payload.ok !== true || !Array.isArray(payload.names)) {
      renderMuralNames([]);
      return;
    }
    renderMuralNames(payload.names);
  })
  .catch(() => renderMuralNames([]));

// Filtros + carregamento progressivo para evitar uma página gigante no celular.
const filterButtons = [...document.querySelectorAll(".filter-btn")];
const giftCards = [...document.querySelectorAll(".gift-card")];
const loadMoreWrap = document.querySelector("#load-more-wrap");
const loadMoreButton = document.querySelector("#load-more-gifts");
const giftResultsNote = document.querySelector("#gift-results-note");
const PAGE_SIZE = 12;
let currentFilter = "all";
let visibleLimit = PAGE_SIZE;

const getFilteredCards = () => giftCards.filter((card) => currentFilter === "all" || card.dataset.category === currentFilter);

const renderGiftGrid = () => {
  const filtered = getFilteredCards();
  giftCards.forEach((card) => {
    const matches = currentFilter === "all" || card.dataset.category === currentFilter;
    card.classList.toggle("hidden-card", !matches);
    card.classList.remove("limit-hidden");
  });

  filtered.forEach((card, index) => {
    card.classList.toggle("limit-hidden", index >= visibleLimit);
  });

  const visibleCount = Math.min(visibleLimit, filtered.length);
  const remaining = Math.max(0, filtered.length - visibleCount);
  loadMoreWrap.hidden = remaining === 0;
  if (remaining > 0) {
    loadMoreButton.innerHTML = `Ver mais ${Math.min(PAGE_SIZE, remaining)} presentes <span aria-hidden="true">↓</span>`;
    giftResultsNote.textContent = `Mostrando ${visibleCount} de ${filtered.length} presentes.`;
  } else {
    giftResultsNote.textContent = filtered.length ? `Mostrando todos os ${filtered.length} presentes desta categoria.` : "Nenhum presente nesta categoria.";
  }
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    visibleLimit = PAGE_SIZE;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderGiftGrid();
  });
});

loadMoreButton.addEventListener("click", () => {
  visibleLimit += PAGE_SIZE;
  renderGiftGrid();
});
renderGiftGrid();

// Escolha de presente + Pix direto com valor predeterminado.
const dialog = document.querySelector("#gift-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogValue = document.querySelector("#dialog-value");
const pixQrElement = document.querySelector("#pix-qr");
const pixCopyCode = document.querySelector("#pix-copy-code");
const copyPixCodeButton = document.querySelector("#copy-pix-code");
const selectedGiftSummary = document.querySelector("#selected-gift-summary");
const selectedGiftName = document.querySelector("#selected-gift-name");
const selectedGiftValue = document.querySelector("#selected-gift-value");
let selectedGift = null;

const categoryLabel = (slug) => ({
  casa: "Casa",
  viagem: "Lua de Mel",
  pokemon: "Pokémon & TCG",
  brincadeiras: "Brincadeiras",
  metas: "Grandes Metas",
}[slug] || "Outros");

const renderSelectedGift = () => {
  if (!selectedGift) {
    selectedGiftSummary.hidden = true;
    return;
  }

  selectedGiftName.textContent = selectedGift.name;
  selectedGiftValue.textContent = selectedGift.value > 0
    ? formatBRL(selectedGift.value)
    : "valor livre";

  selectedGiftSummary.hidden = false;
};

const renderGiftPix = () => {
  if (!selectedGift) return;

  const payload = buildPixPayload({
    value: selectedGift.value,
    txid: selectedGift.txid,
    description: selectedGift.name,
  });

  selectedGift.pixPayload = payload;
  pixCopyCode.value = payload;
  pixQrElement.innerHTML = "";

  try {
    if (typeof window.QRCode !== "function") {
      throw new Error("Biblioteca de QR Code indisponível.");
    }

    new window.QRCode(pixQrElement, {
      text: payload,
      width: 220,
      height: 220,
      correctLevel: window.QRCode.CorrectLevel.M,
    });
  } catch {
    pixQrElement.innerHTML =
      '<p class="qr-fallback">Não foi possível gerar o QR Code. Use o botão “Copiar Pix pronto”.</p>';
  }
};

const openSelectedGiftPix = () => {
  if (!selectedGift) return;

  dialogTitle.textContent = selectedGift.name;
  dialogValue.textContent = selectedGift.value > 0
    ? formatBRL(selectedGift.value)
    : "valor livre";

  renderGiftPix();
  dialog.showModal();
};

try {
  const saved = window.sessionStorage.getItem("selectedWeddingGift");
  if (saved) {
    selectedGift = JSON.parse(saved);
    renderSelectedGift();
  }
} catch {}

document.querySelectorAll(".gift-button").forEach((button, index) => {
  button.addEventListener("click", () => {
    const card = button.closest(".gift-card");

    selectedGift = {
      name: button.dataset.gift,
      value: Number(button.dataset.value || 0),
      category: categoryLabel(card?.dataset.category),
      txid: `LARADAVI${String(index + 1).padStart(2, "0")}`,
    };

    try {
      window.sessionStorage.setItem("selectedWeddingGift", JSON.stringify(selectedGift));
    } catch {}

    renderSelectedGift();
    openSelectedGiftPix();
  });
});

document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const clickedOutside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedOutside) dialog.close();
});

copyPixCodeButton.addEventListener("click", () => {
  if (!selectedGift?.pixPayload) return;
  copyText(selectedGift.pixPayload, "Pix Copia e Cola copiado.");
});

document.querySelector("#go-to-pix").addEventListener("click", () => {
  renderSelectedGift();
  dialog.close();
  document.querySelector("#pix").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#pay-selected-gift")?.addEventListener("click", openSelectedGiftPix);

// Termômetro da lua de mel.
// Usa JSONP porque o Apps Script responde em outro domínio.
const updateHoneymoonProgress = (percent) => {
  const safe = Math.max(0, Math.min(100, Number(percent) || 0));
  const percentEl = document.querySelector("#honeymoon-percent");
  const fillEl = document.querySelector("#honeymoon-fill");
  const barEl = document.querySelector("#honeymoon-progressbar");
  const statusEl = document.querySelector("#honeymoon-status");

  if (!percentEl || !fillEl || !barEl) return;

  percentEl.textContent = `${Math.round(safe)}%`;
  fillEl.style.width = `${safe}%`;
  barEl.setAttribute("aria-valuenow", String(Math.round(safe)));

  if (statusEl) {
    statusEl.textContent = safe >= 100
      ? "Conseguimos! Nosso sonho chegou ao castelo. 🏰✨"
      : `${Math.round(safe)}% do sonho já realizado. Cada presente nos leva mais perto do castelo.`;
  }
};

const loadHoneymoonProgress = () => {
  const callbackName = `__honeymoonProgress_${Date.now()}`;
  const script = document.createElement("script");
  const separator = WEDDING_CONFIG.honeymoonProgressUrl.includes("?") ? "&" : "?";

  window[callbackName] = (data) => {
    try {
      if (data?.ok) updateHoneymoonProgress(data.percent);
    } finally {
      delete window[callbackName];
      script.remove();
    }
  };

  script.src = `${WEDDING_CONFIG.honeymoonProgressUrl}${separator}callback=${encodeURIComponent(callbackName)}&t=${Date.now()}`;
  script.onerror = () => {
    delete window[callbackName];
    script.remove();
  };

  document.body.appendChild(script);
};

loadHoneymoonProgress();

document.querySelector("#honeymoon-gifts-link")?.addEventListener("click", () => {
  window.setTimeout(() => {
    const travelFilter = document.querySelector('.filter-btn[data-filter="viagem"]');
    if (travelFilter) travelFilter.click();
  }, 350);
});
