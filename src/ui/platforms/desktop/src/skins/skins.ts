export type CharacterSkinInfo = {
  character: string;
  infos: SkinInfo[];
};

export type SkinInfo = {
  quality: string;
  images: Images[];
  voices: Voices[];
};
export type Images = {
  name: string;
  illustrator: string;
  title: string;
  seat: string;
  big: string;
  origin: string;
};
export type Voices = {
  skill: string;
  detail: Location[];
};
export type Location = {
  location: string;
  lines: string;
};
