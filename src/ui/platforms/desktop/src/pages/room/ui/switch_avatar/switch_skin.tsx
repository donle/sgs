import { gameSkinInfo } from '../../../../../src/image_loader/skin_data';
import { PlayerId } from 'core/player/player_props';

export type HistoryCharacterSkin = {
  playerId: PlayerId;
  characterName: string;
  skinNameList: string[];
  skinName: string;
  nextTime: number;
};

let historyCharacterSkinInfo: HistoryCharacterSkin[] = [];
export function getSkinName(characterName: string, playerId: PlayerId) {
  const currentTime = new Date().getTime();
  const history = historyCharacterSkinInfo.find(
    history => history.characterName === characterName && history.playerId === playerId,
  );

  if (history) {
    if (currentTime >= history.nextTime) {
      history.skinName = history.skinNameList[Math.floor(Math.random() * history.skinNameList.length)];
      history.nextTime = currentTime + Math.floor(Math.random() * 5 + 30) * 1000;
    }
    return history.skinName;
  }

  const historyCharacterSkin: HistoryCharacterSkin = {
    playerId: playerId,
    characterName: characterName,
    skinNameList: [characterName],
    skinName: characterName,
    nextTime: currentTime + Math.floor(Math.random() * 5 + 30) * 1000,
  };

  gameSkinInfo
    .find(gameSkinInfo => gameSkinInfo.characterName === characterName)
    ?.skinInfo.filter(skinName => skinName !== undefined)
    .forEach(skinInfo => {
      historyCharacterSkin.skinNameList.push(skinInfo.skinName);
    });

  historyCharacterSkinInfo.push(historyCharacterSkin);

  return historyCharacterSkin.skinName;
}
