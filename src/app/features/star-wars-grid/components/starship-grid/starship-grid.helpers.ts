import { Character } from '../../../../core/models/character.model';

export function matchesGlobalSearch(row: Character, term: string): boolean {
  const needle = term.toLowerCase();

  const haystack = [
    row.name,
    row.status,
    row.species,
    row.type,
    row.gender,
    row.origin?.name ?? '',
    row.location?.name ?? '',
    String(row.id),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle);
}

export function applyLocalEdits(
  rows: Character[],
  editedRows: Map<number, Partial<Character>>,
): Character[] {
  return rows.map((row) => ({
    ...row,
    ...(editedRows.get(row.id) ?? {}),
  }));
}
