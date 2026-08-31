/*
  EDITE ESTES DADOS ANTES DE PUBLICAR NO GITHUB PAGES.
  A chave Pix abaixo é apenas um espaço reservado.
*/
const WEDDING_CONFIG = {
  pixKey: "SUA-CHAVE-PIX-AQUI",
  recipient: "NOME DO DESTINATÁRIO",
  // Adicione aqui os pagamentos confirmados. O site ordena do maior para o menor valor.
  // Exemplo: { name: "Ana", amount: 300 }
  ranking: [],
};

const pixKeyElement = document.querySelector("#pix-key");
const recipientElements = document.querySelectorAll("#pix-recipient, #alert-recipient");
pixKeyElement.textContent = WEDDING_CONFIG.pixKey;
recipientElements.forEach((element) => { element.textContent = WEDDING_CONFIG.recipient; });

const rankingList = document.querySelector("#ranking-list");
const rankingEntries = [...WEDDING_CONFIG.ranking].sort((a, b) => b.amount - a.amount);
const formatCurrency = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

if (rankingEntries.length === 0) {
  rankingList.innerHTML = `<div class="ranking-empty"><div><strong>O primeiro capítulo ainda está em branco.</strong><p>Quando chegar a primeira contribuição, o nome aparecerá aqui — sempre na ordem do maior valor.</p></div></div>`;
} else {
  rankingEntries.forEach((entry, index) => {
    const row = document.createElement("div");
    const position = document.createElement("span");
    const name = document.createElement("span");
    const value = document.createElement("span");
    row.className = "ranking-row";
    position.className = "ranking-position";
    position.textContent = String(index + 1).padStart(2, "0");
    name.className = "ranking-name";
    name.textContent = entry.name;
    value.className = "ranking-value";
    value.textContent = formatCurrency(entry.amount);
    row.append(position, name, value);
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
