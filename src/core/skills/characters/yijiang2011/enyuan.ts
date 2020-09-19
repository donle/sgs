import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'enyuan', description: 'enyuan_description' })
export class EnYuan extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ) {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === CardMoveStage.AfterCardMoved;
  }

  public triggerableTimes(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>,
  ) {
    const identifier = EventPacker.getIdentifier<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>(
      event,
    );
    if (identifier === GameEventIdentifiers.DamageEvent) {
      return (event as ServerEventFinder<GameEventIdentifiers.DamageEvent>).damage;
    } else {
      return 1;
    }
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>,
  ) {
    const identifier = EventPacker.getIdentifier<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>(
      content,
    );

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        damageEvent.toId === owner.Id &&
        damageEvent.fromId !== undefined &&
        room.getPlayerById(damageEvent.fromId).Dead === false
      );
    } else {
      const moveCardEvent = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      return (
        moveCardEvent.toId === owner.Id &&
        moveCardEvent.fromId !== undefined &&
        moveCardEvent.toArea === CardMoveArea.HandArea &&
        moveCardEvent.movingCards.length >= 2 &&
        room.getPlayerById(moveCardEvent.fromId).Dead === false
      );
    }
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>,
  ) {
    const identifier = EventPacker.getIdentifier<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>(
      content,
    );
    let target: Player;
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      target = room.getPlayerById(damageEvent.fromId!);
    } else {
      const moveCardEvent = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      target = room.getPlayerById(moveCardEvent.fromId!);
    }
    return TranslationPack.translationJsonPatcher(
      'do you want to trigger skill {0} to {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(target),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillEffectEvent;
    const identifier = EventPacker.getIdentifier(triggeredOnEvent!);

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      const damageFromId = damageEvent.fromId;
      const damageFrom = room.getPlayerById(damageFromId!);

      if (damageFrom.getCardIds(PlayerCardsArea.HandArea).length > 0) {
        const askForChooseCard: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
          toId: damageFromId!,
          cardIds: damageFrom.getCardIds(PlayerCardsArea.HandArea),
          amount: 1,
          customTitle: TranslationPack.translationJsonPatcher(
            '{0}: you need to give a handcard to {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillEffectEvent.fromId)),
          ).toString(),
        };

        room.notify(GameEventIdentifiers.AskForChoosingCardEvent, askForChooseCard, damageFromId!);

        const { selectedCards } = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingCardEvent,
          damageFromId!,
        );

        if (selectedCards === undefined) {
          await room.loseHp(damageFromId!, 1);
        } else {
          await room.moveCards({
            movingCards: selectedCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
            moveReason: CardMoveReason.ActiveMove,
            fromId: damageFromId!,
            toId: skillEffectEvent.fromId,
            toArea: CardMoveArea.HandArea,
            proposer: skillEffectEvent.fromId,
          });
        }
      } else {
        await room.loseHp(damageFromId!, 1);
      }
    } else {
      const moveCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      await room.drawCards(1, moveCardEvent.fromId, undefined, skillEffectEvent.fromId, this.Name);
    }

    return true;
  }
}
