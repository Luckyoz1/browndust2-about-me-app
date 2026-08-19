
export function imageUrl(path) {
  return import.meta.env.BASE_URL + path;
}

export function initials(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PASTELS = [
  "#FFD6E0", "#D6E4FF", "#D9F5E4", "#FFF1CC",
  "#E7DAFF", "#FFE0CC", "#D9F3FF", "#F3DAFF",
];
export function pastelFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PASTELS[h % PASTELS.length];
}
