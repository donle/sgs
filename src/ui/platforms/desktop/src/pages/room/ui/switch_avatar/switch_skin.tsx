import { gameSkinInfo } from '../../../../../src/image_loader/skin_data';
import { PlayerId } from 'core/player/player_props';

export type HistoryCharacterSkin = {
  playerId: PlayerId;
  historyCharacterName: string;
  skinNameList: string[];
  nextTime: number;
};

let historyCharacterSkinInfo: HistoryCharacterSkin[] = [];
export function getSkinName(characterName: string, playerId?: PlayerId) {
  let newskinNameList: string[] = [];
  let skinName: string = '';
  if (playerId === undefined) {
    return characterName;
  }
  const currentTime = new Date().getTime();
  for (const history of historyCharacterSkinInfo) {
    if (history.historyCharacterName === characterName && history.playerId === playerId) {
      if (currentTime >= history.nextTime && history.skinNameList.length > 1) {
        let oldName = history.skinNameList[Math.floor(Math.random() * history.skinNameList.length)];
        if (oldName) {
          history.skinNameList.splice(history.skinNameList.indexOf(oldName), 1);
          history.skinNameList.unshift(oldName);
        }
        skinName = history.skinNameList[0];
        history.nextTime = currentTime + Math.floor(Math.random() * 5 + 5) * 1000;
        break;
      } else {
        skinName = history.skinNameList[0] ? history.skinNameList[0] : characterName;
      }
    }
  }
  if (skinName === '' && characterName !== undefined && playerId !== undefined) {
    if (!newskinNameList.includes(characterName)) {
      newskinNameList.push(characterName);
    }
    gameSkinInfo
      .find(skinInfo => skinInfo.characterName === characterName)
      ?.skinInfo.filter(skinName => skinName !== undefined)
      .forEach(skinInfo => {
        if (!newskinNameList.includes(skinInfo.skinName)) {
          newskinNameList.push(skinInfo.skinName);
        }
      });

    const historyCharacterSkin: HistoryCharacterSkin = {
      playerId: playerId,
      historyCharacterName: characterName,
      skinNameList: newskinNameList,
      nextTime: currentTime + Math.floor(Math.random() * 5 + 5) * 1000,
    };
    historyCharacterSkinInfo.push(historyCharacterSkin);
    skinName = characterName;
  }
  return skinName;
}
