export type SearchRule<T> = {
  field: keyof T;
  priority: number;
  mode: "prefix" | "substring";
};

type IndexedItem<T> = T & {
  _search: Record<string, string>;
};

export function createIndex<T extends Record<string, any>>(
  list: T[],
  rules: SearchRule<T>[]
) {
  // Normalize searchable fields once
  const indexed: IndexedItem<T>[] = list.map((item) => {
    const _search: Record<string, string> = {};

    rules.forEach((r) => {
      const value = String(item[r.field] ?? "").toLowerCase();
      _search[r.field as string] = value;
    });

    return { ...item, _search };
  });

  // Build sorted maps for fields using prefix search
  const sortedByField: Record<string, IndexedItem<T>[]> = {};

  rules
    .filter((r) => r.mode === "prefix")
    .forEach((r) => {
      const key = r.field as string;

      sortedByField[key] = [...indexed].sort((a, b) =>
        a._search[key].localeCompare(b._search[key])
      );
    });

  return { indexed, sortedByField, rules };
}

function binarySearchPrefix<T>(
  list: IndexedItem<T>[],
  key: string,
  field: string
) {
  let low = 0;
  let high = list.length - 1;
  let firstMatchIndex = -1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const value = list[mid]._search[field];

    if (value.startsWith(key)) {
      firstMatchIndex = mid;
      high = mid - 1;
    } else if (value < key) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return firstMatchIndex;
}

export function search<T extends Record<string, any>>(
  index: ReturnType<typeof createIndex<T>>,
  query: string,
  limit = 25
) {
  if (!query.trim()) return [];

  const key = query.toLowerCase();
  const results: any[] = [];
  const { indexed, sortedByField, rules } = index;

  for (const rule of rules) {
    const f = rule.field as string;

    // PREFIX SEARCH ==================================================
    if (rule.mode === "prefix") {
      const sorted = sortedByField[f];
      if (!sorted) continue;

      const start = binarySearchPrefix(sorted, key, f);

      if (start !== -1) {
        for (let i = start; i < sorted.length; i++) {
          const item = sorted[i];
          if (!item._search[f].startsWith(key)) break;

          results.push({
            ...item,
            rank: rule.priority,
            matchPosition: 0,
          });

          if (results.length >= limit) break;
        }
      }
    }

    // SUBSTRING SEARCH ===============================================
    if (rule.mode === "substring") {
      indexed.forEach((item) => {
        const pos = item._search[f].indexOf(key);
        if (pos > 0) {
          results.push({
            ...item,
            rank: rule.priority - pos,
            matchPosition: pos,
          });
        }
      });
    }
  }

  // DEDUPE + SORT =====================================================
  const unique = new Map();
  results.forEach((item) =>
    unique.set((item as any)._id ?? item.id ?? JSON.stringify(item), item)
  );

  return Array.from(unique.values())
    .sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank;
      return a.matchPosition - b.matchPosition;
    })
    .slice(0, limit);
}
