// PASO 1: Definir claves y referencias del DOM
const LS_KEY = "runs"; // clave de LocalStorage para persistir el arreglo

const runForm = document.getElementById("runForm");
const runId = document.getElementById("runId");
const dateInput = document.getElementById("date");
const distanceInput = document.getElementById("distance");
const durationInput = document.getElementById("duration");
const notesInput = document.getElementById("notes");

const runsTbody = document.getElementById("runsTbody");
const sumDistance = document.getElementById("sumDistance");
const sumDuration = document.getElementById("sumDuration");
const avgPace = document.getElementById("avgPace");

const searchInput = document.getElementById("searchInput");
const searchClearBtn = document.getElementById("searchClearBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");

// PASO 2: Estado en memoria (sincrónico con LocalStorage)
let runs = []; // cada run: { id, date, distanceKm, durationSec, notes }

// PASO 3: Utilidades de tiempo y formato
function parseTimeToSeconds(timeStr) {
  // Acepta hh:mm:ss o mm:ss o ss
  const parts = timeStr.trim().split(":").map(Number);
  if (parts.some(isNaN)) return null;

  if (parts.length === 3) {
    const [hh, mm, ss] = parts;
    return hh * 3600 + mm * 60 + ss;
  }
  if (parts.length === 2) {
    const [mm, ss] = parts;
    return mm * 60 + ss;
  }
  if (parts.length === 1) {
    const [ss] = parts;
    return ss;
  }
  return null;
}

function formatSeconds(sec) {
  const s = Math.max(0, Math.floor(sec));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function computePace(durationSec, distanceKm) {
  // ritmo = (segundos totales / km) expresado en mm:ss por km
  if (!distanceKm || distanceKm <= 0) return "—";
  const paceSec = durationSec / distanceKm;
  const mm = Math.floor(paceSec / 60);
  const ss = String(Math.round(paceSec % 60)).padStart(2, "0");
  return `${mm}:${ss} min/km`;
}

// PASO 4: LocalStorage (cargar/guardar)
function loadFromLocalStorage() {
  const raw = localStorage.getItem(LS_KEY);
  runs = raw ? JSON.parse(raw) : [];
}

function saveToLocalStorage() {
  localStorage.setItem(LS_KEY, JSON.stringify(runs));
}

// PASO 5: Render de tabla + totales
function renderTable(filterText = "") {
  // limpiar cuerpo
  runsTbody.innerHTML = "";

  // filtrar por texto (fecha o notas)
  const term = filterText.trim().toLowerCase();
  const filtered = runs.filter((r) => {
    if (!term) return true;
    return (
      r.date.toLowerCase().includes(term) ||
      (r.notes || "").toLowerCase().includes(term)
    );
  });

  // ordenar por fecha descendente
  filtered.sort((a, b) => (a.date < b.date ? 1 : -1));

  // pintar filas
  for (const run of filtered) {
    const tr = document.createElement("tr");

    const tdDate = document.createElement("td");
    tdDate.textContent = run.date;

    const tdDistance = document.createElement("td");
    tdDistance.textContent = Number(run.distanceKm).toFixed(2);

    const tdDuration = document.createElement("td");
    tdDuration.textContent = formatSeconds(run.durationSec);

    const tdPace = document.createElement("td");
    tdPace.textContent = computePace(run.durationSec, run.distanceKm);

    const tdNotes = document.createElement("td");
    tdNotes.textContent = run.notes || "";

    const tdActions = document.createElement("td");
    tdActions.className = "has-text-right";

    const btnGroup = document.createElement("div");
    btnGroup.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.className = "button is-small is-info is-light";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => onEdit(run.id));

    const delBtn = document.createElement("button");
    delBtn.className = "button is-small is-danger is-light";
    delBtn.textContent = "Eliminar";
    delBtn.addEventListener("click", () => onDelete(run.id));

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(delBtn);
    tdActions.appendChild(btnGroup);

    tr.appendChild(tdDate);
    tr.appendChild(tdDistance);
    tr.appendChild(tdDuration);
    tr.appendChild(tdPace);
    tr.appendChild(tdNotes);
    tr.appendChild(tdActions);

    runsTbody.appendChild(tr);
  }

  // Totales (sobre filtrados)
  const totalKm = filtered.reduce(
    (acc, r) => acc + Number(r.distanceKm || 0),
    0
  );
  const totalSec = filtered.reduce(
    (acc, r) => acc + Number(r.durationSec || 0),
    0
  );
  sumDistance.textContent = totalKm.toFixed(2);
  sumDuration.textContent = formatSeconds(totalSec);
  avgPace.textContent = totalKm > 0 ? computePace(totalSec, totalKm) : "—";
}

// PASO 6: Crear (C) y Actualizar (U)
function onSubmit(e) {
  e.preventDefault();

  // Validar inputs básicos
  const date = dateInput.value;
  const distanceKm = parseFloat(distanceInput.value);
  const durationSec = parseTimeToSeconds(durationInput.value);
  const notes = notesInput.value.trim();

  if (!date || isNaN(distanceKm) || distanceKm < 0) {
    alert("Revisa la fecha y la distancia (km).");
    return;
  }
  if (durationSec === null || durationSec < 0) {
    alert("Formato de tiempo inválido. Usa hh:mm:ss, mm:ss o ss.");
    return;
  }

  const editingId = runId.value;

  if (editingId) {
    // Actualizar
    const idx = runs.findIndex((r) => r.id === editingId);
    if (idx >= 0) {
      runs[idx] = { ...runs[idx], date, distanceKm, durationSec, notes };
      saveToLocalStorage();
      renderTable(searchInput.value);
      resetForm();
    }
  } else {
    // Crear
    const newRun = {
      id: crypto.randomUUID(), // id único
      date,
      distanceKm,
      durationSec,
      notes,
    };
    runs.push(newRun);
    saveToLocalStorage();
    renderTable(searchInput.value);
    resetForm();
  }
}

// PASO 7: Editar (cargar datos al formulario)
function onEdit(id) {
  const run = runs.find((r) => r.id === id);
  if (!run) return;

  runId.value = run.id;
  dateInput.value = run.date;
  distanceInput.value = String(run.distanceKm);
  durationInput.value = formatSeconds(run.durationSec);
  notesInput.value = run.notes || "";

  saveBtn.textContent = "Actualizar";
}

// PASO 8: Eliminar (D)
function onDelete(id) {
  if (!confirm("¿Eliminar este registro?")) return;
  runs = runs.filter((r) => r.id !== id);
  saveToLocalStorage();
  renderTable(searchInput.value);
}

// PASO 9: Resetear formulario
function resetForm() {
  runId.value = "";
  runForm.reset();
  saveBtn.textContent = "Guardar";
}

// PASO 10: Borrar todo
function clearAll() {
  if (!confirm("¿Borrar TODOS los registros?")) return;
  runs = [];
  saveToLocalStorage();
  renderTable(searchInput.value);
  resetForm();
}

// PASO 11: Buscar (por fecha o notas)
function onSearch() {
  renderTable(searchInput.value);
}

function clearSearch() {
  searchInput.value = "";
  renderTable("");
}

// PASO 12: Inicializar eventos y cargar datos
function init() {
  loadFromLocalStorage();
  renderTable();

  runForm.addEventListener("submit", onSubmit);
  resetBtn.addEventListener("click", resetForm);
  clearAllBtn.addEventListener("click", clearAll);

  searchInput.addEventListener("input", onSearch);
  searchClearBtn.addEventListener("click", clearSearch);
}

// PASO 13: Arranque
document.addEventListener("DOMContentLoaded", init);
