export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

const STATE_ALIASES: Record<string, IndianState> = {
  // Jammu & Kashmir aliases (from Postal API, abbreviations, etc.)
  "jammu and kashmir": "Jammu and Kashmir",
  "jammu & kashmir": "Jammu and Kashmir",
  "jammu and kashmir (ut)": "Jammu and Kashmir",
  "jammu & kashmir (ut)": "Jammu and Kashmir",
  "j&k": "Jammu and Kashmir",
  "j & k": "Jammu and Kashmir",
  "jammu": "Jammu and Kashmir",
  "kashmir": "Jammu and Kashmir",

  // Andaman & Nicobar aliases
  "andaman and nicobar islands": "Andaman and Nicobar Islands",
  "andaman and nicobar": "Andaman and Nicobar Islands",
  "andaman & nicobar islands": "Andaman and Nicobar Islands",
  "andaman & nicobar": "Andaman and Nicobar Islands",
  "a & n islands": "Andaman and Nicobar Islands",
  "a&n islands": "Andaman and Nicobar Islands",

  // Dadra and Nagar Haveli and Daman and Diu aliases
  "dadra and nagar haveli and daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  "dadra & nagar haveli and daman & diu": "Dadra and Nagar Haveli and Daman and Diu",
  "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "dadra & nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  "daman & diu": "Dadra and Nagar Haveli and Daman and Diu",
  "dnh & dd": "Dadra and Nagar Haveli and Daman and Diu",
  "dnh and dd": "Dadra and Nagar Haveli and Daman and Diu",

  // Delhi aliases
  "delhi": "Delhi",
  "new delhi": "Delhi",
  "nct of delhi": "Delhi",
  "national capital territory of delhi": "Delhi",

  // Puducherry aliases
  "puducherry": "Puducherry",
  "pondicherry": "Puducherry",

  // Odisha aliases
  "odisha": "Odisha",
  "orissa": "Odisha",

  // Uttarakhand aliases
  "uttarakhand": "Uttarakhand",
  "uttaranchal": "Uttarakhand",

  // Ladakh aliases
  "ladakh": "Ladakh",
  "leh ladakh": "Ladakh",
  "leh & ladakh": "Ladakh",
  "leh and ladakh": "Ladakh",

  // Tamil Nadu aliases
  "tamil nadu": "Tamil Nadu",
  "tamilnadu": "Tamil Nadu",

  // West Bengal aliases
  "west bengal": "West Bengal",
  "bengal": "West Bengal",

  // Chhattisgarh aliases
  "chhattisgarh": "Chhattisgarh",
  "chhatisgarh": "Chhattisgarh",
};

/**
 * Normalizes any variation, postal API return value, or alias of an Indian State
 * to its canonical IndianState name. Returns null if not recognized.
 */
export function normalizeIndianState(value: unknown): IndianState | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  // 1. Direct case-insensitive match against canonical states
  const directMatch = INDIAN_STATES.find(
    (s) => s.toLowerCase() === raw.toLowerCase(),
  );
  if (directMatch) return directMatch;

  // 2. Direct alias lookup
  const cleanAliasKey = raw.toLowerCase().replace(/\s+/g, " ");
  if (STATE_ALIASES[cleanAliasKey]) {
    return STATE_ALIASES[cleanAliasKey];
  }

  // 3. Fallback: normalize '&' to 'and', strip special chars, collapse spaces
  const simplify = (str: string) =>
    str
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const simplifiedInput = simplify(raw);
  const normalizedMatch = INDIAN_STATES.find(
    (s) => simplify(s) === simplifiedInput,
  );
  if (normalizedMatch) return normalizedMatch;

  return null;
}

/**
 * Checks whether a value is a valid Indian state or recognized alias (e.g. "Jammu & Kashmir").
 */
export function isIndianState(value: string): boolean {
  return normalizeIndianState(value) !== null;
}
