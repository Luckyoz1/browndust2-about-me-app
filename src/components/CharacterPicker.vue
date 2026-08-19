<script setup>
import { ref, computed, watch, nextTick, reactive } from "vue";
import { characters } from "../data/characters.js";
import { imageUrl, initials, pastelFor } from "../utils.js";

const props = defineProps({
  open: { type: Boolean, default: false },
  currentId: { type: String, default: null },
});
const emit = defineEmits(["select", "clear", "close"]);

const query = ref("");
const searchInput = ref(null);
const broken = reactive(new Set());

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return characters;
  return characters.filter((c) => c.name.toLowerCase().includes(q));
});

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      query.value = "";
      await nextTick();
      searchInput.value?.focus();
    }
  }
);
</script>

<template>
  <Transition name="pop">
    <div
      v-if="open"
      class="overlay"
      @click.self="emit('close')"
      @keydown.esc="emit('close')"
    >
      <div class="sheet" role="dialog" aria-modal="true" aria-label="Choisir un personnage">
        <header class="head">
          <h2>Choisir un personnage</h2>
          <button class="x" aria-label="Fermer" @click="emit('close')">✕</button>
        </header>

        <div class="search">
          <input
            ref="searchInput"
            v-model="query"
            type="text"
            placeholder="Rechercher un personnage…"
            aria-label="Rechercher un personnage"
          />
        </div>

        <div class="grid" role="listbox">
          <button
            v-for="c in results"
            :key="c.id"
            class="pick"
            :class="{ current: c.id === currentId }"
            role="option"
            @click="emit('select', c.id)"
          >
            <span class="thumb">
              <img
                v-if="!broken.has(c.id)"
                :src="imageUrl(c.image)"
                :alt="c.name"
                loading="lazy"
                @error="broken.add(c.id)"
              />
              <span v-else class="thumb-fallback" :style="{ background: pastelFor(c.id) }">
                {{ initials(c.name) }}
              </span>
            </span>
            <span class="name">{{ c.name }}</span>
          </button>

          <p v-if="!results.length" class="empty">
            Aucun personnage pour « {{ query }} ».
          </p>
        </div>

        <footer class="foot">
          <button v-if="currentId" class="btn ghost" @click="emit('clear')">
            Retirer le personnage
          </button>
          <button class="btn" @click="emit('close')">Fermer</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(43, 61, 79, 0.34);
  backdrop-filter: blur(3px);
}
.sheet {
  width: min(660px, 100%);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: var(--board-bg);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(40, 70, 110, 0.32);
  overflow: hidden;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, #ffffff, var(--board-bg));
}
.head h2 {
  margin: 0;
  font-family: "Cinzel", serif;
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.03em;
  color: var(--ink);
}
.x {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--muted);
  font-size: 0.85rem;
  cursor: pointer;
}
.x:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.search {
  padding: 16px 20px 8px;
}
.search input {
  width: 100%;
  font-family: "Cormorant Garamond", serif;
  font-size: 1.12rem;
  color: var(--ink);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 11px 18px;
  outline: none;
}
.search input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 12px;
  padding: 14px 20px 4px;
  overflow-y: auto;
}
.pick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  background: none;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease, transform 0.12s ease;
}
.pick:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  transform: translateY(-2px);
}
.pick.current {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.thumb {
  position: relative;
  width: 72px;
  height: 92px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--portrait-bg);
  border: 1px solid var(--line);
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Cinzel", serif;
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--ink);
}
.name {
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.1;
  text-align: center;
  color: var(--ink);
}
.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--muted);
  padding: 24px;
  font-size: 1.05rem;
}

.foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--line);
}

/* Transition d'ouverture */
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.16s ease;
}
.pop-enter-active .sheet,
.pop-leave-active .sheet {
  transition: transform 0.18s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}
.pop-enter-from .sheet,
.pop-leave-to .sheet {
  transform: translateY(14px) scale(0.98);
}
</style>
