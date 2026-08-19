<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { charById } from "../data/characters.js";
import { imageUrl, initials, pastelFor } from "../utils.js";

const props = defineProps({
  cell: { type: Object, required: true },
  editing: { type: Boolean, default: false },
  exporting: { type: Boolean, default: false },
});

const emit = defineEmits([
  "pick",
  "clear",
  "start-edit",
  "save-label",
  "remove-cell",
]);

const character = computed(() =>
  props.cell.characterId ? charById[props.cell.characterId] : null
);

const broken = ref(false);
watch(character, () => (broken.value = false));
const showImage = computed(() => character.value && !broken.value);

const labelInput = ref(null);
const draft = ref(props.cell.label);
watch(
  () => props.editing,
  async (on) => {
    if (on) {
      draft.value = props.cell.label;
      await nextTick();
      labelInput.value?.focus();
      labelInput.value?.select();
    }
  }
);
</script>

<template>
  <figure class="cell">
    <div class="card" :class="{ empty: !character }" @click="emit('pick')">
      <div class="portrait">
        <img
          v-if="showImage"
          :src="imageUrl(character.image)"
          :alt="character.name"
          @error="broken = true"
        />
        <div
          v-else-if="character"
          class="fallback"
          :style="{ background: pastelFor(character.id) }"
        >
          {{ initials(character.name) }}
        </div>
        <div v-else class="placeholder">
          <span class="plus">+</span>
          <span class="hint">Choisir</span>
        </div>

        <div class="sheen" aria-hidden="true"></div>

        <!-- Actions (masquées à l'export) -->
        <div v-if="!exporting" class="actions">
          <button
            class="chip"
            title="Renommer la case"
            aria-label="Renommer la case"
            @click.stop="emit('start-edit')"
          >
            ✎
          </button>
          <button
            v-if="character"
            class="chip"
            title="Retirer le personnage"
            aria-label="Retirer le personnage"
            @click.stop="emit('clear')"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <figcaption class="label">
      <template v-if="editing && !exporting">
        <input
          ref="labelInput"
          v-model="draft"
          class="label-input"
          aria-label="Libellé de la case"
          @keyup.enter="emit('save-label', draft)"
          @blur="emit('save-label', draft)"
        />
        <button
          class="remove"
          title="Supprimer cette case"
          @mousedown.prevent="emit('remove-cell')"
        >
          Supprimer la case
        </button>
      </template>
      <span v-else class="label-text">{{ cell.label || "—" }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.cell {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* --- Carte-portrait --- */
.card {
  padding: 7px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(70, 110, 150, 0.12);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}
.card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 14px 30px rgba(60, 110, 156, 0.22);
}
.card:active {
  transform: translateY(-1px);
}

.portrait {
  position: relative;
  width: 100%;
  padding-bottom: 128%; /* portrait ~3:4 (compatible export) */
  border-radius: 11px;
  overflow: hidden;
  background: var(--portrait-bg);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6),
    inset 0 0 0 2px var(--line);
}
.portrait img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* léger reflet lumineux (ambiance ciel) */
.sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.28) 0%,
    rgba(255, 255, 255, 0) 34%
  );
  pointer-events: none;
}
.fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Cinzel", serif;
  font-weight: 600;
  font-size: 1.9rem;
  color: var(--ink);
}
.placeholder {
  position: absolute;
  inset: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--muted);
  border: 1.5px dashed var(--silver);
  border-radius: 9px;
}
.placeholder .plus {
  font-size: 2rem;
  line-height: 1;
  color: var(--accent);
  font-weight: 400;
}
.placeholder .hint {
  font-family: "Cinzel", serif;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* --- Actions --- */
.actions {
  position: absolute;
  top: 7px;
  right: 7px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.14s ease;
}
.card:hover .actions {
  opacity: 1;
}
@media (hover: none) {
  .actions {
    opacity: 0.9;
  }
}
.chip {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  color: var(--accent-deep);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--line);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(70, 110, 150, 0.18);
}
.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* --- Libellé (plaque serif) --- */
.label {
  text-align: center;
}
.label-text {
  display: inline-block;
  max-width: 100%;
  padding: 5px 14px;
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
  font-size: 0.98rem;
  line-height: 1.15;
  letter-spacing: 0.01em;
  color: var(--accent-deep);
  background: var(--accent-soft);
  border: 1px solid var(--line);
  border-radius: 999px;
}
.label-input {
  width: 100%;
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
  font-size: 0.98rem;
  text-align: center;
  color: var(--ink);
  background: #fff;
  border: 1px solid var(--accent);
  border-radius: 10px;
  padding: 5px 8px;
  outline: none;
}
.remove {
  display: block;
  margin: 6px auto 0;
  font-family: "Cormorant Garamond", serif;
  font-size: 0.82rem;
  color: var(--danger);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}
</style>
