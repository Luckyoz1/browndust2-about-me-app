<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { toBlob } from "html-to-image";
import { useBoard } from "./composables/useBoard.js";
import GalleryCell from "./components/GalleryCell.vue";
import CharacterPicker from "./components/CharacterPicker.vue";

const board = useBoard();
const { state } = board;

const pickerOpen = ref(false);
const activeCellId = ref(null);
const activeCell = computed(() =>
  state.cells.find((c) => c.id === activeCellId.value) || null
);

function openPicker(cellId) {
  activeCellId.value = cellId;
  pickerOpen.value = true;
}
function closePicker() {
  pickerOpen.value = false;
  activeCellId.value = null;
}
function onSelect(characterId) {
  if (activeCellId.value) board.setCharacter(activeCellId.value, characterId);
  closePicker();
}
function onClearFromPicker() {
  if (activeCellId.value) board.clearCharacter(activeCellId.value);
  closePicker();
}

const editingCellId = ref(null);
function startEdit(cellId) {
  editingCellId.value = cellId;
}
function saveLabel(cellId, value) {
  board.setLabel(cellId, value);
  editingCellId.value = null;
}

const editingTitle = ref(false);
const titleInput = ref(null);
async function startTitleEdit() {
  editingTitle.value = true;
  await nextTick();
  titleInput.value?.focus();
  titleInput.value?.select();
}

function reset() {
  if (confirm("Réinitialiser le tableau ? Tes personnages et libellés reviendront par défaut.")) {
    board.reset();
  }
}

const boardRef = ref(null);
const exporting = ref(false);

async function downloadImage() {
  if (!boardRef.value) return;
  editingCellId.value = null;
  editingTitle.value = false;
  exporting.value = true;

  await nextTick();
  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch (e) {}
  }
  await new Promise((r) => setTimeout(r, 80));

  try {
    const filename = `${(state.boardTitle || "about-me")
      .replace(/[^\w\u00C0-\u024F-]+/g, "-")
      .toLowerCase()}-browndust2.webp`;

    const blob = await toBlob(boardRef.value, {
      type: "image/webp",   
      quality: 0.85,    
      pixelRatio: 2,        
      backgroundColor: "#eaf3fb",
      cacheBust: true,
    });
    
    if (!blob) throw new Error("La génération de l'image a échoué.");

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert("L'export a échoué : " + (e?.message || e));
  } finally {
    exporting.value = false;
  }
}

onMounted(board.load);
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <div class="brand">Brown&nbsp;Dust&nbsp;II · <span>About me</span></div>
      <div class="tools">
        <button class="btn ghost" @click="board.addCell">＋ Add new </button>
        <button class="btn ghost" @click="reset">Reset</button>
        <button class="btn solid" @click="downloadImage">⤓ Downlaod </button>
      </div>
    </div>

    <!-- ZONE EXPORTÉE -->
    <main ref="boardRef" class="board" :class="{ exporting }">
      <div class="glow" aria-hidden="true"></div>

      <header class="board-head">
        <p class="eyebrow">My selection</p>
        <h1
          v-if="!editingTitle || exporting"
          class="title"
          @click="!exporting && startTitleEdit()"
        >
          {{ state.boardTitle }}
        </h1>
        <input
          v-else
          ref="titleInput"
          v-model="state.boardTitle"
          class="title-input"
          aria-label="Titre du tableau"
          @keyup.enter="editingTitle = false"
          @blur="editingTitle = false"
        />
        <div class="divider" aria-hidden="true">
          <span class="rule left"></span>
          <span class="gem"></span>
          <span class="rule right"></span>
        </div>
      </header>

      <section class="grid">
        <GalleryCell
          v-for="cell in state.cells"
          :key="cell.id"
          :cell="cell"
          :editing="editingCellId === cell.id"
          :exporting="exporting"
          @pick="openPicker(cell.id)"
          @clear="board.clearCharacter(cell.id)"
          @start-edit="startEdit(cell.id)"
          @save-label="saveLabel(cell.id, $event)"
          @remove-cell="board.removeCell(cell.id)"
        />

        <button
          v-if="!exporting"
          class="add-cell"
          aria-label="Ajouter une case"
          @click="board.addCell"
        >
          <span class="add-plus">＋</span>
          <span class="add-text">Add</span>
        </button>
      </section>

      <p class="signature">Brown Dust II — About me</p>
    </main>

    <p v-show="!exporting" class="tip">
      Clique sur une <strong>carte</strong> pour choisir un personnage,
      sur <strong>✎</strong> pour renommer une case, sur le <strong>titre</strong> pour le modifier.
    </p>

    <CharacterPicker
      :open="pickerOpen"
      :current-id="activeCell ? activeCell.characterId : null"
      @select="onSelect"
      @clear="onClearFromPicker"
      @close="closePicker"
    />
  </div>
</template>

<style scoped>
.page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 20px 18px 48px;
}


.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.brand {
  font-family: "Cinzel", serif;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.brand span {
  color: var(--accent-deep);
}
.tools {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}


.board {
  position: relative;
  padding: 36px 28px 24px;
  background:
    radial-gradient(120% 60% at 50% -10%, rgba(255, 255, 255, 0.9), transparent 60%),
    linear-gradient(180deg, #dcecf8 0%, var(--board-bg) 46%, #ffffff 100%);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  box-shadow: 0 18px 44px rgba(60, 100, 150, 0.20),
    inset 0 0 0 1px var(--line);
  overflow: hidden;
}

.glow {
  position: absolute;
  inset: -34% 12% auto 12%;
  height: 300px;
  background: radial-gradient(60% 100% at 50% 0%, rgba(255, 255, 255, 0.75), transparent 70%);
  pointer-events: none;
}

.board-head {
  position: relative;
  text-align: center;
  margin-bottom: 28px;
}
.eyebrow {
  margin: 0 0 8px;
  font-family: "Cinzel", serif;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-size: 0.64rem;
  color: var(--accent-deep);
}
.title {
  margin: 0;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: clamp(1.5rem, 4.4vw, 2.5rem);
  letter-spacing: 0.03em;
  color: var(--ink);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  cursor: text;
  line-height: 1.14;
}
.title:hover {
  color: var(--accent-deep);
}
.title-input {
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: clamp(1.5rem, 4.4vw, 2.5rem);
  text-align: center;
  color: var(--ink);
  background: #fff;
  border: 1px solid var(--accent);
  border-radius: 12px;
  padding: 4px 14px;
  width: min(100%, 620px);
  outline: none;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
}
.divider .rule {
  height: 1px;
  width: 74px;
}
.divider .rule.left {
  background: linear-gradient(90deg, transparent, var(--accent));
}
.divider .rule.right {
  background: linear-gradient(90deg, var(--accent), transparent);
}
.divider .gem {
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  background: var(--accent);
  box-shadow: 0 0 0 3px rgba(91, 147, 196, 0.18);
}


.grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 22px 18px;
}

.add-cell {
  align-self: stretch;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.55);
  border: 1.5px dashed var(--silver);
  border-radius: 16px;
  cursor: pointer;
  transition: border-color 0.16s ease, color 0.16s ease, background 0.16s ease;
}
.add-cell:hover {
  border-color: var(--accent);
  color: var(--accent-deep);
  background: var(--accent-soft);
}
.add-plus {
  font-size: 2rem;
  line-height: 1;
}
.add-text {
  font-family: "Cinzel", serif;
  font-weight: 500;
  font-size: 0.64rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.signature {
  position: relative;
  text-align: center;
  margin: 26px 0 0;
  font-family: "Cinzel", serif;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-size: 0.62rem;
  color: var(--muted);
}

.board.exporting .add-cell {
  display: none;
}

.tip {
  text-align: center;
  margin: 18px auto 0;
  max-width: 640px;
  color: var(--muted);
  font-size: 1.05rem;
}
.tip strong {
  color: var(--accent-deep);
  font-weight: 700;
}

/* --- Responsive --- */
@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(4, 1fr); gap: 18px 14px; }
  .board { padding: 30px 20px 20px; }
}
@media (max-width: 640px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 440px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: 16px 12px; }
  .board { padding: 24px 14px 18px; border-radius: 18px; }
  .tools { width: 100%; }
  .btn { flex: 1; }
}
</style>