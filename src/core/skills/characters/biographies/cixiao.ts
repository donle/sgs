import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { PanShi } from './panshi';

@CommonSkill({ name: 'cixiao', description: 'cixiao_description' })
export class CiXiao extends TriggerSkill implements OnDefineReleaseTiming {
  public get RelatedSkills(): string[] {
    return ['panshi'];
  }

  private async handleCiXiaoFlag(room: Room, player: PlayerId, lose?: boolean) {
    if (lose) {
      room.removeFlag(player, this.Name);
      await room.loseSkill(player, PanShi.Name, true);
    } else {
      room.setFlag<boolean>(player, this.Name, true, 'cixiao:yizi');
      await room.obtainSkill(player, PanShi.Name, true);
    }
  }

  public async whenDead(room: Room, owner: Player) {
    for (const player of room.getOtherPlayers(owner.Id)) {
      if (player.getFlag<boolean>(this.Name)) {
        this.handleCiXiaoFlag(room, player.Id, true);
      }
    }
  }

  public async whenLosingSkill(room: Room, owner: Player) {
    for (const player of room.getOtherPlayers(owner.Id)) {
      if (player.getFlag<boolean>(this.Name)) {
        this.handleCiXiaoFlag(room, player.Id, true);
      }
    }
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      room.getOtherPlayers(owner.Id).find(player => !player.getFlag<boolean>(this.Name)) !== undefined &&
      !(room.AlivePlayers.find(player => player.getFlag<boolean>(this.Name)) && owner.getPlayerCards().length === 0)
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && !room.getFlag<boolean>(target, this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === (room.AlivePlayers.find(player => player.getFlag<boolean>(this.Name)) ? 1 : 0);
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return room.AlivePlayers.find(player => player.getFlag<boolean>(this.Name))
      ? TranslationPack.translationJsonPatcher(
          '{0}: do you want to discard a card and choose another player to be your new son?',
          this.Name,
        ).extract()
      : TranslationPack.translationJsonPatcher(
          '{0}: do you want to choose another player to be your son?',
          this.Name,
        ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    if (event.cardIds && event.cardIds.length > 0) {
      await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);
    }

    for (const player of room.getOtherPlayers(event.fromId)) {
      if (player.getFlag<boolean>(this.Name)) {
        this.handleCiXiaoFlag(room, player.Id, true);
      }
    }

    this.handleCiXiaoFlag(room, event.toIds[0]);

    return true;
  }
}
