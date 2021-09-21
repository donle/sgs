import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  DrawCardStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FilterSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tunchu', description: 'tunchu_description' })
export class TunChu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage): boolean {
    return stage === DrawCardStage.CardDrawing;
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.DrawCardStage;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage &&
      content.drawAmount > 0 &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length === 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;

    drawCardEvent.drawAmount += 2;
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: TunChu.Name, description: TunChu.Description })
export class TunChuDebuff extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    if (room.getPlayerById(owner).getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length === 0) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? !cardId.match(new CardMatcher({ generalName: ['slash'] }))
      : Sanguosha.getCardById(cardId).GeneralName !== 'slash';
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TunChuDebuff.Name, description: TunChuDebuff.Description })
export class TunChuShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayerStage === PlayerPhaseStages.DrawCardStageEnd && stage === PhaseStageChangeStage.StageChanged
    );
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
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.DrawCardStageEnd &&
      owner.hasUsedSkill(this.GeneralName) &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public getSkillLog(room: Room, owner: Player) {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put at least 1 hand card on your general card as ‘liang’?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    event.cardIds.length > 0 &&
      (await room.moveCards({
        movingCards: event.cardIds.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId: event.fromId,
        toId: event.fromId,
        toArea: CardMoveArea.OutsideArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.fromId,
        isOutsideAreaInPublic: true,
        toOutsideArea: this.GeneralName,
        triggeredBySkills: [this.GeneralName],
      }));

    return true;
  }
}
