import { Character } from '../../../../core/models/character.model';
import { applyLocalEdits } from './starship-grid.helpers';

describe('applyLocalEdits', () => {
  const createCharacter = (id: number, name: string, status = 'Alive'): Character =>
    ({
      id,
      name,
      status,
      species: 'Human',
      type: '',
      gender: 'Male',
      origin: { name: 'Earth', url: '' },
      location: { name: 'Earth', url: '' },
      image: '',
      episode: [],
      url: '',
      created: '',
    }) as Character;

  it('should apply edited value to the matching row', () => {
    const rows = [createCharacter(1, 'Rick Sanchez')];

    const editedRows = new Map<number, Partial<Character>>([[1, { name: 'Edited Rick' }]]);

    const result = applyLocalEdits(rows, editedRows);

    expect(result[0].name).toBe('Edited Rick');
  });

  it('should keep original row when there is no local edit', () => {
    const rows = [createCharacter(1, 'Rick Sanchez'), createCharacter(2, 'Morty Smith')];

    const editedRows = new Map<number, Partial<Character>>([[1, { name: 'Edited Rick' }]]);

    const result = applyLocalEdits(rows, editedRows);

    expect(result[0].name).toBe('Edited Rick');
    expect(result[1].name).toBe('Morty Smith');
  });

  it('should preserve non-edited fields from API row', () => {
    const rows = [createCharacter(1, 'Rick Sanchez', 'Alive')];

    const editedRows = new Map<number, Partial<Character>>([[1, { name: 'Edited Rick' }]]);

    const result = applyLocalEdits(rows, editedRows);

    expect(result[0].name).toBe('Edited Rick');
    expect(result[0].status).toBe('Alive');
    expect(result[0].species).toBe('Human');
  });
});
