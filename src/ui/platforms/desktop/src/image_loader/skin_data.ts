export type SkinInfo = {
  skinName: string;
  skinLocation: string;
  voiceInfos: VoiceInfo[];
};

export type CharacterSkinInfo = {
  characterName: string;
  skinInfo: SkinInfo[];
};

export type VoiceInfo = {
  voiceName: string;
  voiceLocations: string[];
};

export const gameSkinInfo: CharacterSkinInfo[] = [
  {
    characterName: 'diaochan',
    skinInfo: [
      {
        skinName: 'huahaoyueyuan',
        skinLocation: 'diaochan/1.png',
        voiceInfos: [
          {
            voiceName: 'xiaoji',
            voiceLocations: ['audio_loader/xiaoji1.mp3'],
          },
        ],
      },
      {
        skinName: 'shenguanzhaoren',
        skinLocation: 'diaochan/2.png',
        voiceInfos: [
          {
            voiceName: 'xiaoji',
            voiceLocations: ['audio_loader/xiaoji1.mp3'],
          },
        ],
      },
    ],
  },
];
