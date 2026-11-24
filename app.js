const PAGE_SIZE = 20;
let allItems = [];
let filteredItems = [];
let currentPage = 1;
let toastTimer;

const $ = (id) => document.getElementById(id);
const searchInput = $("searchInput");
const resultsBody = $("resultsBody");

function normalize(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
}
function normalizeItem(item) {
  const id = Number(item.id ?? item.ID ?? item.entry);
  const name = String(item.name ?? item.nome ?? item.Name ?? "").trim();
  if (!Number.isInteger(id) || id <= 0 || !name) return null;
  return { id, name, category: String(item.category ?? item.categoria ?? "Outros"), type: String(item.type ?? item.tipo ?? "—") };
}
function setItems(items, sourceLabel) {
  const valid = items.map(normalizeItem).filter(Boolean);
  const map = new Map();
  valid.forEach(item => map.set(`${item.id}|${item.name}`, item));
  allItems = [...map.values()].sort((a,b) => a.id - b.id || a.name.localeCompare(b.name));
  $("totalCount").textContent = allItems.length.toLocaleString("pt-BR");
  const categories = [...new Set(allItems.map(x => x.category))].sort((a,b)=>a.localeCompare(b));
  $("categoryFilter").innerHTML = '<option value="">Todas as categorias</option>' + categories.map(c=>`<option value="${safeText(c)}">${safeText(c)}</option>`).join("");
  $("notice").textContent = `${sourceLabel} • ${allItems.length.toLocaleString("pt-BR")} registros válidos.`;
  runSearch();
}
function runSearch() {
  const q = normalize(searchInput.value);
  const category = $("categoryFilter").value;
  filteredItems = allItems.filter(item => {
    const matchesQuery = !q || normalize(item.name).includes(q) || String(item.id).includes(q) || normalize(item.type).includes(q);
    return matchesQuery && (!category || item.category === category);
  });
  currentPage = 1;
  render();
}
function render() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredItems.slice(start, start + PAGE_SIZE);
  resultsBody.innerHTML = pageItems.map(item => `<tr>
    <td><span class="item-id">${item.id}</span></td>
    <td><span class="item-name">${safeText(item.name)}</span></td>
    <td><span class="category">${safeText(item.category)}</span></td>
    <td>${safeText(item.type)}</td>
    <td><button class="copy-btn" data-id="${item.id}">Copiar comando</button></td>
  </tr>`).join("");
  $("resultCount").textContent = filteredItems.length.toLocaleString("pt-BR");
  $("emptyState").hidden = pageItems.length !== 0;
  $("pageInfo").textContent = filteredItems.length ? `Mostrando ${start+1}–${Math.min(start+PAGE_SIZE,filteredItems.length)} de ${filteredItems.length.toLocaleString("pt-BR")} itens` : "Mostrando 0 itens";
  $("prevPage").disabled = currentPage <= 1;
  $("nextPage").disabled = currentPage * PAGE_SIZE >= filteredItems.length;
}
async function copyCommand(id) {
  const command = `.additem ${id} 1`;
  try {
    await navigator.clipboard.writeText(command);
    showToast(`Comando copiado: ${command}`);
  } catch {
    const area = document.createElement("textarea");
    area.value = command; document.body.appendChild(area); area.select();
    document.execCommand("copy"); area.remove(); showToast(`Comando copiado: ${command}`);
  }
}
$("searchButton").addEventListener("click", runSearch);
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") runSearch(); });
$("categoryFilter").addEventListener("change", runSearch);
$("prevPage").addEventListener("click", () => { currentPage--; render(); });
$("nextPage").addEventListener("click", () => { currentPage++; render(); });
resultsBody.addEventListener("click", e => {
  const button = e.target.closest("[data-id]");
  if (button) copyCommand(button.dataset.id);
});
document.querySelectorAll(".chip").forEach(button => button.addEventListener("click", () => {
  searchInput.value = button.dataset.query; runSearch();
}));
$("fileInput").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const text = await file.text();
    let parsed;
    if (file.name.toLowerCase().endsWith(".json")) parsed = JSON.parse(text);
    else parsed = parseCSV(text);
    if (!Array.isArray(parsed)) parsed = parsed.items ?? parsed.data ?? [];
    setItems(parsed, `Banco importado: ${file.name}`);
    showToast("Banco de dados carregado!");
  } catch (error) {
    alert("Não foi possível ler esse arquivo. Use JSON ou CSV com colunas id e name/nome.");
  }
  e.target.value = "";
});
function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const parseLine = line => {
    const out=[]; let cell="", quoted=false;
    for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'&&quoted){cell+='"';i++;}else if(c==='"'){quoted=!quoted;}else if(c===","&&!quoted){out.push(cell);cell="";}else{cell+=c;}}
    out.push(cell); return out;
  };
  const headers=parseLine(lines.shift()).map(x=>x.trim().toLowerCase());
  return lines.map(line=>{const values=parseLine(line);const obj={};headers.forEach((h,i)=>obj[h]=values[i]??"");return obj;});
}
fetch("items.json").then(r => { if (!r.ok) throw new Error("missing"); return r.json(); })
  .then(data => setItems(Array.isArray(data) ? data : (data.items || []), "Banco inicial"))
  .catch(() => setItems([], "Nenhum banco inicial encontrado — importe um arquivo JSON ou CSV"));
