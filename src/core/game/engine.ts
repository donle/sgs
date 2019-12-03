import { Card, CardId, CardType } from 'core/cards/card';
import { Character } from 'core/characters/character';
import { Player } from 'core/player/player';
import { Skill } from 'core/skills/skill';
import { PlayerStage } from './stage';

export class Sanguosha {
  private currentPlayer: Player;
  private gameStage: PlayerStage;
  private skills: Skill[];

  constructor(
    private cards: Card[],
    private characters: Character[],
    private players: Player[],
    hiddenSkills: Skill[] = [],
  ) {
    this.skills = hiddenSkills;
    for (const character of this.characters) {
      this.skills = this.skills.concat(character.Skills);
    }
  }

  public getCardById<T extends Card>(cardId: CardId): T {
    return this.cards.find(card => card.Id === cardId) as T;
  }

  public get CurrentPlayer() {
    return this.currentPlayer;
  }

  public set CurrentPlayer(player: Player) {
    this.currentPlayer = player;
  }

  public get CurrentPlayerStage() {
    return this.gameStage;
  }

  public set CurrentPlayerStage(stage: PlayerStage) {
    this.gameStage = stage;
  }

  public get OtherPlayers() {
    return this.players.filter(player => player.Id !== this.currentPlayer.Id);
  }

  public getSkillBySkillName(name: string) {
    return this.skills.find(skill => skill.Name === name);
  }

  public getCharacterByCharaterName(name: string) {
    return this.characters.find(character => character.Name === name);
  }
}
