export type SkinInfo = {
  skinName: string;
  skinLocation: string;
};

export type CharacterSkinInfo = {
  characterName: string;
  skinInfo: SkinInfo[];
};

export const gameSkinInfo: CharacterSkinInfo[] = [
  {
    characterName: 'diaochan',
    skinInfo: [
      { skinName: 'huahaoyueyuan', skinLocation: 'diaochan/1.png' },
      { skinName: 'shenguanzhaoren', skinLocation: 'diaochan/2.png' },
      { skinName: 'yuanhua', skinLocation: 'diaochan/3.png' },
    ],
  },
  {
    characterName: 'sunshangxiang',
    skinInfo: [
      { skinName: 'yuanhua', skinLocation: 'sunshangxiang/1.png' },
      { skinName: 'huahaoyueyuan', skinLocation: 'sunshangxiang/2.png' },
      { skinName: 'xxxx', skinLocation: 'sunshangxiang/3.png' },
    ],
  },
];
