import { CharacterId } from 'core/characters/character';
import { HuaShenInfo, Player } from 'core/player/player';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { PlayerCards, PlayerCardsArea, PlayerCardsOutside, PlayerId, PlayerStatus } from './player_props';

export class ClientPlayer extends Player {
  private visibleOutsideAreas: string[] = [];
  private visiblePlayerTags: { [name: string]: string } = {};

  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    protected playerPosition: number,
    playerCharacterId?: CharacterId,
    playerCards?: PlayerCards & {
      [PlayerCardsArea.OutsideArea]: PlayerCardsOutside;
    },
    protected status: PlayerStatus = PlayerStatus.Online,
  ) {
    super(playerCards, playerCharacterId);
  }

  setFlag<T>(name: string, value: T, tagName?: string): T {
    if (tagName && this.visiblePlayerTags[name] !== tagName) {
      this.visiblePlayerTags[name] = tagName;
    } else if (!tagName && this.visiblePlayerTags[name] !== undefined) {
      delete this.visiblePlayerTags[name];
    }

    return super.setFlag(name, value);
  }
  public clearFlags() {
    this.visiblePlayerTags = {};
    super.clearFlags();
  }
  removeFlag(name: string) {
    delete this.visiblePlayerTags[name];
    super.removeFlag(name);
  }

  setVisibleOutsideArea(areaName: string) {
    this.visibleOutsideAreas.push(areaName);
  }
  unsetVisibleOutsideArea(areaName: string) {
    const index = this.visibleOutsideAreas.findIndex(area => area === areaName);
    if (index >= 0) {
      this.visibleOutsideAreas.splice(index, 1);
    }
  }
  isOutsideAreaVisible(areaName: string) {
    return this.visibleOutsideAreas.includes(areaName);
  }
  getAllVisibleTags() {
    return Object.values(this.visiblePlayerTags);
  }

  setHuaShenInfo(info: HuaShenInfo) {
    if (this.huashenInfo) {
      this.removeFlag(
        TranslationPack.translationJsonPatcher('huashen skill:{0}', this.huashenInfo.skillName).toString(),
      );
    }
    this.setFlag(TranslationPack.translationJsonPatcher('huashen skill:{0}', info.skillName).toString(), true);
    super.setHuaShenInfo(info);
  }

  bury() {
    for (const areaName of this.playerOutsideCharactersAreaNames) {
      if (this.playerOutsideCards[areaName]) {
        delete this.playerOutsideCards[areaName];
      }
    }
    super.bury();
  }
}
