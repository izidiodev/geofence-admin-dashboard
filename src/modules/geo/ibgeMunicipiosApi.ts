const IBGE_MUNICIPIOS_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome";

export interface MunicipioOption {
  id: number;
  nome: string;
  sigla: string;
  label: string;
}

let cache: MunicipioOption[] | null = null;
let inflight: Promise<MunicipioOption[]> | null = null;

function parseMunicipio(raw: unknown): MunicipioOption | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const nome = o.nome;
  const id = o.id;
  const microrregiao = o.microrregiao as Record<string, unknown> | undefined;
  const mesorregiao = microrregiao?.mesorregiao as Record<string, unknown> | undefined;
  const uf = mesorregiao?.UF as Record<string, unknown> | undefined;
  const sigla = uf?.sigla;
  if (typeof nome !== "string" || typeof sigla !== "string" || id == null) return null;
  const numId = typeof id === "number" ? id : Number(id);
  if (!Number.isFinite(numId)) return null;
  const siglaUp = sigla.toUpperCase();
  return { id: numId, nome, sigla: siglaUp, label: `${nome} - ${siglaUp}` };
}

export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function formatCityUfDisplay(city: string, uf: string): string {
  const c = city.trim();
  const u = uf.trim().toUpperCase();
  if (c === "" && u === "") return "";
  if (c === "") return u;
  if (u === "") return c;
  return `${c} - ${u}`;
}

export function parseCityUfFromLabel(label: string): { city: string; uf: string } | null {
  const t = label.trim();
  const idx = t.lastIndexOf(" - ");
  if (idx <= 0 || idx === t.length - 3) return null;
  const city = t.slice(0, idx).trim();
  const uf = t.slice(idx + 3).trim().toUpperCase();
  if (city === "" || uf === "") return null;
  return { city, uf };
}

export async function loadIbgeMunicipios(): Promise<MunicipioOption[]> {
  if (cache != null) return cache;
  if (inflight != null) return inflight;
  inflight = (async () => {
    const res = await fetch(IBGE_MUNICIPIOS_URL);
    if (!res.ok) throw new Error(`IBGE ${res.status}`);
    const data: unknown = await res.json();
    if (!Array.isArray(data)) throw new Error("Resposta IBGE inválida");
    const list = data.map(parseMunicipio).filter((x): x is MunicipioOption => x != null);
    cache = list;
    return list;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function filterMunicipios(
  list: MunicipioOption[],
  query: string,
  limit = 50
): MunicipioOption[] {
  const q = normalizeSearch(query.trim());
  if (q === "") return list.slice(0, limit);
  return list.filter((m) => normalizeSearch(m.label).includes(q)).slice(0, limit);
}

export function labelsSet(list: MunicipioOption[]): Set<string> {
  return new Set(list.map((m) => m.label));
}

export function isIbgePairInList(list: MunicipioOption[], city: string, uf: string): boolean {
  const c = city.trim();
  const u = uf.trim().toUpperCase();
  if (c === "" || u === "") return false;
  return list.some((m) => m.nome === c && m.sigla.toUpperCase() === u);
}
