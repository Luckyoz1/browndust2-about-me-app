import { reactive, watch } from "vue";
import { config } from "../data/config.js";

const STORAGE_KEY = "bd2-about-me:v2";

export function useBoard() {
  const state = reactive({
    boardTitle: config.boardTitle,
    cells: [],
  });

  const makeId = () => "cell-" + Math.random().toString(36).slice(2, 9);

  function loadDefaults() {
    state.boardTitle = config.boardTitle;
    state.cells = config.defaultCells.map((c) => ({
      id: makeId(),
      label: c.label,
      characterId: null,
    }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return loadDefaults();
      const data = JSON.parse(raw);
      state.boardTitle = data.boardTitle ?? config.boardTitle;
      state.cells =
        Array.isArray(data.cells) && data.cells.length
          ? data.cells.map((c) => ({
              id: c.id || makeId(),
              label: c.label ?? "",
              characterId: c.characterId ?? null,
            }))
          : [];
      if (!state.cells.length) loadDefaults();
    } catch (e) {
      console.warn("Sauvegarde illisible, réinitialisation.", e);
      loadDefaults();
    }
  }

  function save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ boardTitle: state.boardTitle, cells: state.cells })
      );
    } catch (e) {
      console.warn("Impossible de sauvegarder localement.", e);
    }
  }

  watch(state, save, { deep: true });

  const findCell = (id) => state.cells.find((c) => c.id === id);

  function setCharacter(cellId, characterId) {
    const cell = findCell(cellId);
    if (cell) cell.characterId = characterId;
  }
  function clearCharacter(cellId) {
    const cell = findCell(cellId);
    if (cell) cell.characterId = null;
  }
  function setLabel(cellId, label) {
    const cell = findCell(cellId);
    if (cell) cell.label = label.trim();
  }
  function addCell() {
    state.cells.push({ id: makeId(), label: "Nouvelle case", characterId: null });
  }
  function removeCell(cellId) {
    state.cells = state.cells.filter((c) => c.id !== cellId);
  }
  function reset() {
    loadDefaults();
  }

  return {
    state,
    load,
    reset,
    setCharacter,
    clearCharacter,
    setLabel,
    addCell,
    removeCell,
  };
}
