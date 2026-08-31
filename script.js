/*
  EDITE ESTES DADOS ANTES DE PUBLICAR NO GITHUB PAGES.
  A chave Pix abaixo é apenas um espaço reservado.
*/
const WEDDING_CONFIG = {
  coupleShortName: "Lara & Davi",
  coupleFullName: "Lara Beringuy e Davi Leite",
  weddingDate: "2027-03-13T00:00:00-03:00",
  pixKey: "e7d77842-81c8-4d3b-9673-6a942f9925c5",
  recipient: "DAVI LEITE RIBEIRO DANTAS",
  // Mantenha os nomes do maior para o menor valor. Os valores não ficam públicos no site.
  // Exemplo: ["Ana", "Bruno"]
  ranking: [],
};

const pixKeyElement = document.querySelector("#pix-key");
const recipientElements = document.querySelectorAll("#pix-recipient, #alert-recipient");
pixKeyElement.textContent = WEDDING_CONFIG.pixKey;
recipientElements.forEach((element) => { element.textContent = WEDDING_CONFIG.recipient; });

const rankingList = document.querySelector("#ranking-list");
const countdownIds = ["days", "hours", "minutes", "seconds"];
const countdownTarget = new Date(WEDDING_CONFIG.weddingDate);
const updateCountdown = () => {
  const difference = Math.max(0, countdownTarget.getTime() - Date.now());
  const values = [
    Math.floor(difference / 86400000),
    Math.floor((difference / 3600000) % 24),
    Math.floor((difference / 60000) % 60),
    Math.floor((difference / 1000) % 60),
  ];
  countdownIds.forEach((id, index) => {
    document.querySelector(`#countdown-${id}`).textContent = String(values[index]).padStart(2, "0");
  });
};
updateCountdown();
window.setInterval(updateCountdown, 1000);

const rankingEntries = [...WEDDING_CONFIG.ranking];

if (rankingEntries.length === 0) {
  rankingList.innerHTML = `<div class="ranking-empty"><div><strong>O primeiro capítulo ainda está em branco.</strong><p>Quando chegar a primeira contribuição, o nome aparecerá aqui — sempre na ordem do maior valor.</p></div></div>`;
} else {
  rankingEntries.forEach((entry, index) => {
    const row = document.createElement("div");
    const position = document.createElement("span");
    const name = document.createElement("span");
    row.className = "ranking-row";
    position.className = "ranking-position";
    position.textContent = String(index + 1).padStart(2, "0");
    name.className = "ranking-name";
    name.textContent = entry;
    row.append(position, name);
    rankingList.appendChild(row);
  });
}

const dialog = document.querySelector("#gift-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const customValue = document.querySelector("#custom-value");
const toast = document.querySelector("#toast");

document.querySelectorAll(".gift-button").forEach((button) => {
  button.addEventListener("click", () => {
    dialogTitle.textContent = button.dataset.gift;
    customValue.value = button.dataset.value === "0" ? "" : button.dataset.value;
    dialog.showModal();
  });
});

document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#go-to-pix").addEventListener("click", () => {
  dialog.close();
  document.querySelector("#pix").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(() => document.querySelector("#copy-key").focus(), 550);
});

document.querySelector("#copy-key").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(WEDDING_CONFIG.pixKey);
    toast.textContent = "Chave Pix copiada.";
  } catch {
    toast.textContent = "Selecione e copie a chave Pix acima.";
  }
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 2600);
});
