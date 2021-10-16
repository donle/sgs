import { VirtualCard } from 'core/cards/card';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'weikui', description: 'weikui_description' })
export class WeiKui extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.Hp > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    await room.loseHp(event.fromId, 1);

    const handCards = room.getPlayerById(event.toIds[0]).getCardIds(PlayerCardsArea.HandArea);
    if (handCards.find(id => Sanguosha.getCardById(id).GeneralName === 'jink')) {
      const originalPlayers = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
      originalPlayers.includes(event.toIds[0]) || originalPlayers.push(event.toIds[0]);
      room.setFlag<PlayerId[]>(event.fromId, this.Name, originalPlayers);

      const virtualSlash = VirtualCard.create({ cardName: 'slash', bySkill: this.Name }).Id;
      room.getPlayerById(event.fromId).canUseCardTo(room, virtualSlash, event.toIds[0], true) &&
        (await room.useCard(
          {
            fromId: event.fromId,
            targetGroup: [event.toIds],
            cardId: virtualSlash,
          },
          true,
        ));
    } else {
      const options: CardChoosingOptions = {
        [PlayerCardsArea.HandArea]: room.getPlayerById(event.toIds[0]).getCardIds(PlayerCardsArea.HandArea),
      };

      const chooseCardEvent = {
        fromId: event.fromId,
        toId: event.toIds[0],
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, event.fromId, true, true);
      if (!response) {
        return false;
      }

      await room.dropCards(CardMoveReason.SelfDrop, [response.selectedCard!], event.toIds[0], event.fromId, this.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: WeiKui.Name, description: WeiKui.Description })
export class WeiKuiBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakDistanceTo(room: Room, owner: Player, target: Player): number {
    return owner.getFlag<PlayerId[]>(this.GeneralName)?.includes(target.Id) ? 1 : 0;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: WeiKuiBuff.Name, description: WeiKuiBuff.Description })
export class WeiKuiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
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

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PhaseFinish &&
      owner.getFlag<PlayerId[]>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
