const WEDDING_CONFIG = {
  coupleShortName: "Lara & Davi",
  coupleFullName: "Lara Beringuy e Davi Leite",
  weddingDate: "2027-03-13T00:00:00-03:00",
  pixKey: "e7d77842-81c8-4d3b-9673-6a942f9925c5",
  recipient: "DAVI LEITE RIBEIRO DANTAS",
  // Mantenha os nomes do maior para o menor valor. Os valores não ficam públicos no site.
  ranking: [],
};

const formatBRL = (value) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
}).format(Number(value));

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

// Dados Pix públicos exibidos na página.
const pixKeyElement = document.querySelector("#pix-key");
const recipientElements = document.querySelectorAll("#pix-recipient, #alert-recipient");
pixKeyElement.textContent = WEDDING_CONFIG.pixKey;
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
    const row = document.createElement("div");
    const mark = document.createElement("span");
    const name = document.createElement("span");
    row.className = "ranking-row";
    mark.className = "ranking-position";
    mark.textContent = "✳";
    name.className = "ranking-name";
    name.textContent = formatPersonName(entry);
    row.append(mark, name);
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

// Escolha de presente: deixa claro que o site apenas orienta o Pix.
const dialog = document.querySelector("#gift-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogValue = document.querySelector("#dialog-value");
const selectedGiftSummary = document.querySelector("#selected-gift-summary");
const selectedGiftName = document.querySelector("#selected-gift-name");
const selectedGiftValue = document.querySelector("#selected-gift-value");
let selectedGift = null;

const renderSelectedGift = () => {
  if (!selectedGift) {
    selectedGiftSummary.hidden = true;
    return;
  }
  selectedGiftName.textContent = selectedGift.name;
  selectedGiftValue.textContent = selectedGift.value > 0 ? formatBRL(selectedGift.value) : "valor livre";
  selectedGiftSummary.hidden = false;
};

try {
  const saved = window.sessionStorage.getItem("selectedWeddingGift");
  if (saved) {
    selectedGift = JSON.parse(saved);
    renderSelectedGift();
  }
} catch {
  // A seleção continua funcionando mesmo se o armazenamento do navegador estiver indisponível.
}

document.querySelectorAll(".gift-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedGift = {
      name: button.dataset.gift,
      value: Number(button.dataset.value || 0),
    };
    dialogTitle.textContent = selectedGift.name;
    dialogValue.textContent = selectedGift.value > 0 ? formatBRL(selectedGift.value) : "valor livre";
    dialog.showModal();
  });
});

document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const clickedOutside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (clickedOutside) dialog.close();
});

document.querySelector("#go-to-pix").addEventListener("click", () => {
  if (selectedGift) {
    try { window.sessionStorage.setItem("selectedWeddingGift", JSON.stringify(selectedGift)); } catch {}
    renderSelectedGift();
  }
  dialog.close();
  document.querySelector("#pix").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(() => document.querySelector("#copy-key").focus(), 550);
});

document.querySelector("#copy-key").addEventListener("click", () => {
  copyText(WEDDING_CONFIG.pixKey, "Chave Pix copiada.");
});

document.querySelector("#copy-gift-summary").addEventListener("click", () => {
  if (!selectedGift) return;
  const valueText = selectedGift.value > 0 ? formatBRL(selectedGift.value) : "valor livre";
  copyText(`Presente escolhido: ${selectedGift.name} — ${valueText}`, "Identificação do presente copiada.");
});
