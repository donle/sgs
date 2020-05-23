import { CharacterId } from 'core/characters/character';
import { Player } from 'core/player/player';
import { PlayerCards, PlayerCardsArea, PlayerCardsOutside, PlayerId } from './player_props';

export class ClientPlayer extends Player {
  private visibleOutsideAreas: string[] = [];

  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    protected playerPosition: number,
    playerCharacterId?: CharacterId,
    playerCards?: PlayerCards & {
      [PlayerCardsArea.OutsideArea]: PlayerCardsOutside;
    },
  ) {
    super(playerCards, playerCharacterId);
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
}
