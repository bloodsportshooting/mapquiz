const STORAGE_KEY = 'geoquiz:maps';
const STORAGE_ERROR_MESSAGE = 'Karten konnten nicht gespeichert werden (Speicher blockiert oder voll). Bitte den Browser-Speicher prüfen.';

const defaultMaps = [
  {
    id: 'demo',
    name: 'Beispielkarte',
    imageBase64: '',
    pins: [
      { id: 'pin-1', type: 'point', name: 'Beispiel-Ort', x: 50, y: 50 }
    ]
  }
];

let memoryStore = [...defaultMaps];

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const clampToPercent = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
};

const normalizePin = (pin) => {
  if (!pin) return null;

  if (pin.type === 'area') {
    const vertices = Array.isArray(pin.vertices)
      ? pin.vertices
          .map((vertex) => ({
            x: clampToPercent(typeof vertex.x === 'number' ? vertex.x : Number(vertex.x)),
            y: clampToPercent(typeof vertex.y === 'number' ? vertex.y : Number(vertex.y))
          }))
          .filter((v) => typeof v.x === 'number' && typeof v.y === 'number')
      : [];

    return {
      id: pin.id || newId(),
      name: pin.name || 'Unbenannte Fläche',
      type: 'area',
      vertices
    };
  }

  return {
    id: pin.id || newId(),
    name: pin.name || 'Unbenannter Punkt',
    type: 'point',
    x: clampToPercent(typeof pin.x === 'number' ? pin.x : Number(pin.x)),
    y: clampToPercent(typeof pin.y === 'number' ? pin.y : Number(pin.y))
  };
};

const normalizeMap = (map) => ({
  ...map,
  pins: Array.isArray(map?.pins) ? map.pins.map(normalizePin).filter(Boolean) : []
});

const getAvailableStorages = () => {
  if (!isBrowser()) return [];

  const stores = [];
  try {
    if (window.localStorage) stores.push(window.localStorage);
  } catch (err) {
    console.error('localStorage not available', err);
  }

  try {
    if (window.sessionStorage) stores.push(window.sessionStorage);
  } catch (err) {
    console.error('sessionStorage not available', err);
  }

  return stores;
};

const loadMaps = () => {
  const fallback = memoryStore?.length ? memoryStore : defaultMaps;

  if (!isBrowser()) return [...fallback];

  const storages = getAvailableStorages();

  for (const store of storages) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = parsed.map(normalizeMap).filter(Boolean);
        memoryStore = [...normalized];
        return [...normalized];
      }
    } catch (err) {
      console.error('Failed to load maps from storage', err);
    }
  }

  return [...fallback];
};

const saveMaps = (maps) => {
  const normalized = Array.isArray(maps) ? maps.map(normalizeMap).filter(Boolean) : defaultMaps;

  // Always keep an in-memory copy so we can at least render within the current session.
  memoryStore = [...normalized];

  const storages = getAvailableStorages();
  if (!storages.length) return;

  const payload = JSON.stringify(normalized);
  let stored = false;

  for (const store of storages) {
    try {
      // Best-effort clean before retry in case the quota is already hit for this key.
      store.removeItem(STORAGE_KEY);
      store.setItem(STORAGE_KEY, payload);
      stored = true;
      break;
    } catch (err) {
      console.error('Failed to save maps to storage', err);
    }
  }

  if (!stored) {
    // Persisting failed (likely quota). Keep memoryStore so the current session keeps working.
    console.warn(STORAGE_ERROR_MESSAGE);
  }
};

const newId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const mapStore = {
  async list() {
    return loadMaps();
  },
  async create(data) {
    const maps = loadMaps();
    const newMap = normalizeMap({
      id: newId(),
      ...data
    });
    const updated = [...maps, newMap];
    saveMaps(updated);
    return newMap;
  },
  async update(id, data) {
    const maps = loadMaps();
    const index = maps.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error('Map not found');
    }
    const updatedMap = normalizeMap({
      ...maps[index],
      ...data,
      id
    });
    const updated = [...maps];
    updated[index] = updatedMap;
    saveMaps(updated);
    return updatedMap;
  },
  async delete(id) {
    const maps = loadMaps();
    const updated = maps.filter((m) => m.id !== id);
    if (updated.length === maps.length) {
      throw new Error('Karte nicht gefunden');
    }
    saveMaps(updated);
    return true;
  }
};

