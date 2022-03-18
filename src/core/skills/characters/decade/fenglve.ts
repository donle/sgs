import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'fenglve', description: 'fenglve_description' })
export class FengLve extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.getFlag<boolean>(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.canPindian(owner, target);
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, fromId } = event;
    if (!toIds) {
      return false;
    }

    const { pindianCardId, pindianRecord } = await room.pindian(fromId, toIds, this.Name);
    if (!pindianRecord.length) {
      return false;
    }

    if (pindianRecord[0].winner === fromId) {
      const to = room.getPlayerById(toIds[0]);

      const toGive: CardId[] = [];
      if (to.getCardIds().length > 2) {
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent>(
          GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
          {
            toId: toIds[0],
            customCardFields: {
              [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea),
              [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
              [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
            },
            customTitle: this.Name,
            amount: 2,
            triggeredBySkills: [this.Name],
          },
          toIds[0],
          true,
        );

        if (response.selectedCards && response.selectedCards.length === 2) {
          toGive.push(...response.selectedCards);
        } else {
          toGive.push(...Algorithm.randomPick(2, to.getCardIds()));
        }
      } else if (to.getCardIds().length > 0) {
        toGive.push(...to.getCardIds());
      }

      toGive.length > 0 &&
        (await room.moveCards({
          movingCards: toGive.map(card => ({ card, fromArea: to.cardFrom(card) })),
          fromId: toIds[0],
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          triggeredBySkills: [this.Name],
        }));
    } else if (pindianRecord[0].winner === toIds[0] && pindianCardId && room.isCardInDropStack(pindianCardId)) {
      await room.moveCards({
        movingCards: [{ card: pindianCardId, fromArea: CardMoveArea.DropStack }],
        toId: toIds[0],
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        triggeredBySkills: [this.Name],
      });
    }

    if (pindianRecord[0].winner) {
      room.setFlag<boolean>(fromId, this.Name, true);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: FengLve.Name, description: FengLve.Description })
export class FengLveShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.from === PlayerPhase.PlayCardStage && owner.getFlag<boolean>(this.GeneralName);
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
