import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
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
        moveCardEvent.infos.find(
          info =>
            info.toId === owner.Id &&
            info.fromId !== undefined &&
            info.toArea === CardMoveArea.HandArea &&
            info.movingCards.length >= 2 &&
            room.getPlayerById(info.fromId).Dead === false,
        ) !== undefined
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
      const info =
        moveCardEvent.infos.length === 1
          ? moveCardEvent.infos[0]
          : moveCardEvent.infos.find(
              info =>
                info.toId === owner.Id &&
                info.fromId !== undefined &&
                info.toArea === CardMoveArea.HandArea &&
                info.movingCards.length >= 2 &&
                room.getPlayerById(info.fromId).Dead === false,
            )!;

      target = room.getPlayerById(info.fromId!);
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

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const identifier = EventPacker.getIdentifier(triggeredOnEvent!);

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      const damageFromId = damageEvent.fromId!;
      const damageFrom = room.getPlayerById(damageFromId);

      if (damageFrom.getCardIds(PlayerCardsArea.HandArea).length > 0) {
        const { selectedCards } = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          {
            cardAmount: 1,
            toId: damageFromId,
            reason: this.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: you need to give a handcard to {1}',
              this.Name,
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea],
            triggeredBySkills: [this.Name],
          },
          damageFromId,
        );

        if (selectedCards.length > 0) {
          const suit = Sanguosha.getCardById(selectedCards[0]).Suit;
          await room.moveCards({
            movingCards: selectedCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
            moveReason: CardMoveReason.ActiveMove,
            fromId: damageFromId,
            toId: fromId,
            toArea: CardMoveArea.HandArea,
            proposer: damageFromId,
          });

          if (suit !== CardSuit.Heart) {
            await room.drawCards(1, fromId, 'top', fromId, this.Name);
          }
        } else {
          await room.loseHp(damageFromId, 1);
        }
      } else {
        await room.loseHp(damageFromId, 1);
      }
    } else {
      const moveCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      const info =
        moveCardEvent.infos.length === 1
          ? moveCardEvent.infos[0]
          : moveCardEvent.infos.find(
              info =>
                info.toId === fromId &&
                info.fromId !== undefined &&
                info.toArea === CardMoveArea.HandArea &&
                info.movingCards.length >= 2 &&
                room.getPlayerById(info.fromId).Dead === false,
            )!;
      await room.drawCards(1, info.fromId, undefined, fromId, this.Name);
    }

    return true;
  }
}
