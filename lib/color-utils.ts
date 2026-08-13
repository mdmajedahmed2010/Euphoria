/**
 * Euphoria — Comprehensive Color Palette & Swatch Utility
 * Supports 50+ fashion & luxury colors, Bengali color names, and automatic hash-based aesthetic fallback.
 */

export const colorMap: Record<string, string> = {
  // Standard Basics
  red: "#ff3b3b",
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#eab308",
  black: "#111827",
  white: "#ffffff",
  grey: "#6b7280",
  gray: "#6b7280",
  "dark grey": "#374151",
  "dark gray": "#374151",
  charcoal: "#36454f",
  silver: "#c0c0c0",

  // Luxury & Fashion Tones
  maroon: "#800000",
  burgundy: "#800020",
  wine: "#722f37",
  ruby: "#e0115f",
  garnet: "#733635",
  purple: "#7e22ce",
  lavender: "#e9d5ff",
  lilac: "#c8a2c8",
  plum: "#8e4585",
  mauve: "#e0b0ff",
  magenta: "#ff00ff",
  "hot pink": "#ff69b4",
  "baby pink": "#f4c2c2",
  "blush pink": "#ffb6c1",
  "dusty rose": "#dcae96",
  rose: "#f43f5e",
  coral: "#ff7f50",
  salmon: "#fa8072",
  peach: "#ffe5b4",
  orange: "#f97316",
  rust: "#b7410e",
  terracotta: "#e2725b",
  amber: "#f59e0b",
  mustard: "#ffdb58",
  gold: "#ffd700",
  golden: "#ffd700",
  "golden yellow": "#ffdf00",
  "rose gold": "#b76e79",
  bronze: "#cd7f32",
  copper: "#b87333",
  champagne: "#f7e7ce",

  // Greens & Earthy
  "olive green": "#808000",
  olive: "#808000",
  emerald: "#10b981",
  "emerald green": "#046307",
  "forest green": "#228b22",
  "dark green": "#006400",
  "sea green": "#2e8b57",
  "mint green": "#98ff98",
  mint: "#a2e8dd",
  sage: "#bcb88a",
  teal: "#008080",
  cyan: "#06b6d4",

  // Blues
  "navy blue": "#000080",
  navy: "#000080",
  "dark blue": "#00008b",
  "royal blue": "#4169e1",
  "sky blue": "#87ceeb",
  sky: "#38bdf8",
  indigo: "#4f46e5",
  cobalt: "#0047ab",

  // Neutrals & Pastels
  beige: "#f5f5dc",
  cream: "#fffdd0",
  ivory: "#fffff0",
  "pearl white": "#eae0c8",
  "off white": "#faf9f6",
  taupe: "#483c32",
  brown: "#8b4513",
  tan: "#d2b48c",
  khaki: "#c3b091",

  // Multi / Gradients
  "black/white": "linear-gradient(135deg, #000000 50%, #ffffff 50%)",
  "red/blue": "linear-gradient(135deg, #ff0000 50%, #0000ff 50%)",
  "red blue": "linear-gradient(135deg, #ff0000 50%, #0000ff 50%)",
  "black/gold": "linear-gradient(135deg, #111827 50%, #ffd700 50%)",
  "white/gold": "linear-gradient(135deg, #ffffff 50%, #ffd700 50%)",
  multicolor: "linear-gradient(135deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)",

  // Bengali Names Support (বাংলা কালার সাপোর্ট)
  "লাল": "#ff3b3b",
  "নীল": "#2563eb",
  "সবুজ": "#16a34a",
  "কালো": "#111827",
  "সada": "#ffffff",
  "সাদা": "#ffffff",
  "হলুদ": "#eab308",
  "গোলাপী": "#ff69b4",
  "বেগুনী": "#7e22ce",
  "মেরুন": "#800000",
  "সোনালী": "#ffd700",
  "রূপালী": "#c0c0c0",
  "আকাশী": "#87ceeb",
  "টিয়া": "#00ff7f",
  "জলপাই": "#808000",
  "কমলা": "#f97316",
  "বাদামী": "#8b4513",
  "ছাই": "#6b7280",
  "নেভী ব্লু": "#000080",
  "ঘিয়ে": "#fffdd0",
  "অফ হোয়াইট": "#faf9f6",
  "জামরঙ": "#8e4585",
};

/**
 * Normalizes string for matching
 */
export function normalizeColorName(str?: string | null): string {
  if (!str) return "";
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Generate a deterministic aesthetic hex color from string hash
 */
function stringToColorHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Use HSL for pleasing saturation and lightness
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 50%)`;
}

/**
 * Returns CSS style object for color swatch
 */
export function getColorStyle(colorName?: string | null): { background?: string; backgroundColor?: string } {
  if (!colorName) return { backgroundColor: "#e5e5e5" };
  const norm = normalizeColorName(colorName);
  
  // Check direct map
  if (colorMap[norm]) {
    const val = colorMap[norm];
    if (val.includes("gradient") || val.startsWith("hsl")) {
      return { background: val };
    }
    return { backgroundColor: val };
  }

  // Check if it's already a hex or rgb or css color
  if (norm.startsWith("#") || norm.startsWith("rgb") || norm.startsWith("hsl")) {
    return { background: colorName };
  }

  // Check if any word in normalized name matches our map (e.g. "Deep Navy Blue" -> matches "navy blue" or "blue")
  for (const key of Object.keys(colorMap)) {
    if (norm.includes(key)) {
      const val = colorMap[key];
      if (val) {
        return val.includes("gradient") ? { background: val } : { backgroundColor: val };
      }
    }
  }

  // Fallback to deterministic aesthetic hash color so it never looks grey or broken
  return { background: stringToColorHash(norm) };
}
