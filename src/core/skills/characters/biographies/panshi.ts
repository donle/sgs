import { CiXiao } from './cixiao';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  DamageEffectStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'panshi', description: 'panshi_description' })
export class PanShi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === DamageEffectStage.DamageEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);

    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
        owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
        room.getOtherPlayers(owner.Id).find(player => player.hasSkill(CiXiao.Name)) !== undefined
      );
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
        damageEvent.cardIds !== undefined &&
        Sanguosha.getCardById(damageEvent.cardIds[0]).GeneralName === 'slash' &&
        damageEvent.fromId === owner.Id &&
        room.getPlayerById(damageEvent.toId).hasSkill(CiXiao.Name)
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent
    >;
    const hands = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea);

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      let card: CardId;
      let toId: PlayerId;
      const dad = room.getOtherPlayers(fromId).filter(player => player.hasSkill(CiXiao.Name));
      if (dad.length > 1) {
        const skillUseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForSkillUseEvent>({
          invokeSkillNames: [PanShiSelect.Name],
          toId: fromId,
          conversation: 'panshi: please choose one hand card and one target',
        });
        room.notify(GameEventIdentifiers.AskForSkillUseEvent, skillUseEvent, fromId);
        const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId);

        if (response.cardIds) {
          card = response.cardIds[0];
        } else {
          card = hands[Math.floor(Math.random() * hands.length)];
        }

        if (response.toIds) {
          toId = response.toIds[0];
        } else {
          toId = dad[Math.floor(Math.random() * dad.length)].Id;
        }
      } else {
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
            cardAmount: 1,
            toId: fromId,
            reason: this.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: you need to give a handcard to {1}',
              this.Name,
              TranslationPack.patchPlayerInTranslation(dad[0]),
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea],
            triggeredBySkills: [this.Name],
          }),
          fromId,
        );

        response.selectedCards =
          response.selectedCards.length > 0
            ? response.selectedCards
            : [hands[Math.floor(Math.random() * hands.length)]];

        card = response.selectedCards[0];
        toId = dad[0].Id;
      }

      await room.moveCards({
        movingCards: [{ card, fromArea: CardMoveArea.HandArea }],
        fromId,
        toId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
      });
    } else {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage++;
      room.endPhase(PlayerPhase.PlayCardStage);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'shadow_panshi', description: 'shadow_panshi_description' })
export class PanShiSelect extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).hasSkill(CiXiao.Name);
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}
