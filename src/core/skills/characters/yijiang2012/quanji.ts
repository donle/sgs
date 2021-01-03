import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import {
  AllStage,
  DamageEffectStage,
  PhaseStageChangeStage,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, RulesBreakerSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'quanji', description: 'quanji_description' })
export class QuanJi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      stage === PhaseStageChangeStage.StageChanged ||
      stage === DamageEffectStage.AfterDamagedEffect
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
  ): boolean {
    const unknownEvent = EventPacker.getIdentifier(content);
    if (unknownEvent === GameEventIdentifiers.PhaseStageChangeEvent) {
      const event = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        event.playerId === owner.Id &&
        event.toStage === PlayerPhaseStages.PlayCardStageEnd &&
        owner.getCardIds(PlayerCardsArea.HandArea).length > owner.Hp
      );
    } else if (unknownEvent === GameEventIdentifiers.DamageEvent) {
      const event = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return event.toId === owner.Id;
    }

    return false;
  }

  public triggerableTimes(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
  ): number {
    if (EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.damage;
    }
    
    return 1;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw a card, then put a hand card on your general card?',
      this.Name
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    if (from.getCardIds(PlayerCardsArea.HandArea).length > 0) {
      let card: CardId;

      if (from.getCardIds(PlayerCardsArea.HandArea).length > 1) {
        const skillUseEvent = {
          invokeSkillNames: [QuanJiShadow.Name],
          toId: fromId,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please put a hand card on your general card',
            this.Name,
          ).extract(),
        }
        room.notify(
          GameEventIdentifiers.AskForSkillUseEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForSkillUseEvent>(skillUseEvent),
          fromId,
        );
  
        const { cardIds } = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForSkillUseEvent,
          fromId,
        );

        const handcards = from.getCardIds(PlayerCardsArea.HandArea);
        card = cardIds ? cardIds[0] : handcards[Math.floor(Math.random() * handcards.length)];
      } else {
        card = from.getCardIds(PlayerCardsArea.HandArea)[0];
      }
     
      await room.moveCards({
        movingCards: [{ card, fromArea: CardMoveArea.HandArea }],
        fromId,
        toId: fromId,
        toArea: PlayerCardsArea.OutsideArea,
        moveReason: CardMoveReason.ActiveMove,
        toOutsideArea: this.Name,
        isOutsideAreaInPublic: true,
        proposer: fromId,
        movedByReason: this.Name,
      });
  
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QuanJi.Name, description: QuanJi.Description })
export class QuanJiShadow extends TriggerSkill {
  isTriggerable() {
    return false;
  }

  canUse() {
    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public availableCardAreas(): PlayerCardsArea[] {
    return [PlayerCardsArea.HandArea];
  }

  async onTrigger() {
    return true;
  }

  async onEffect() {
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QuanJiShadow.Name, description: QuanJiShadow.Description })
export class QuanJiBuff extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(room: Room, owner: Player) {
    return owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length;
  }
}
