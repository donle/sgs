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
        skinLocation: 'images/洛神御水.gif',
        voiceInfos: [
          {
            voiceName: 'lijian',
            voiceLocations: ['voices/luoshen1.mp3'],
          },
          {
            voiceName: 'biyue',
            voiceLocations: ['voices/luoshen2.mp3'],
          },
          {
            voiceName: 'death',
            voiceLocations: ['voices/zhenji.mp3'],
          },
        ],
      },
      {
        skinName: 'shenguanzhaoren',
        skinLocation: 'images/端瑞洛水.png',
        voiceInfos: [
          {
            voiceName: 'lijian',
            voiceLocations: ['voices/xiaoji1.mp3'],
          },
          {
            voiceName: 'biyue',
            voiceLocations: ['voices/xiaoji2.mp3'],
          },
          {
            voiceName: 'death',
            voiceLocations: ['voices/yinpin.ogg'],
          },
        ],
      },
    ],
  },
];
