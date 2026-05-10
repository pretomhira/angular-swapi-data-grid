export interface CharacterLocationRef {
  name: string;
  url: string;
}

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: CharacterLocationRef;
  location: CharacterLocationRef;
  image: string;
  episode: string[];
  url: string;
  created: string;
}
