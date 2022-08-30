import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'duojing', description: 'duojing_description' })
export class DuoJing extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.fromId === owner.Id && owner.Armor > 0 && Sanguosha.getCardById(content.byCardId).GeneralName === 'slash'
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to use this skill to {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.changeArmor(event.fromId, -1);

    const to = room.getPlayerById((event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).toId);
    if (to.getPlayerCards().length > 0) {
      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId: event.fromId,
        toId: to.Id,
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, chooseCardEvent.fromId, false, true);
      if (!response) {
        return false;
      }

      await room.moveCards({
        movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
        fromId: chooseCardEvent.toId,
        toId: chooseCardEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: chooseCardEvent.fromId,
        triggeredBySkills: [this.Name],
      });
    }

    EventPacker.addMiddleware(
      { tag: this.Name, data: event.fromId },
      event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>,
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: DuoJing.Name, description: DuoJing.Description })
export class DuoJingShadow extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!room.getFlag<number>(owner.Id, this.GeneralName)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return room.getFlag<number>(owner.Id, this.GeneralName);
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: DuoJingShadow.Name, description: DuoJingShadow.Description })
export class DuoJingRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      return (
        EventPacker.getMiddleware<PlayerId>(this.GeneralName, event) === owner.Id &&
        room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
        room.CurrentPhasePlayer === owner
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return owner.getFlag<number>(this.GeneralName) !== undefined;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (
      EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>) ===
      GameEventIdentifiers.CardUseEvent
    ) {
      const additionalUsableTimes = room.getFlag<number>(event.fromId, this.GeneralName) || 0;
      room.setFlag<number>(event.fromId, this.GeneralName, additionalUsableTimes + 1);
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}
