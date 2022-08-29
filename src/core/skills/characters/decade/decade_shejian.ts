import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AimStage, AllStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'decade_shejian', description: 'decade_shejian_description' })
export class DecadeShejian extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      event.toId === owner.Id &&
      event.fromId !== owner.Id &&
      owner.hasUsedSkillTimes(this.Name) < 2 &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 1 &&
      AimGroupUtil.getAllTargets(event.allTargets).length === 1 &&
      !room.AlivePlayers.find(player => player.Dying)
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public availableCardAreas(): PlayerCardsArea[] {
    return [PlayerCardsArea.HandArea];
  }

  public getSkillLog(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to discard at least 2 hand cards to use this skill to {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);

    const userId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).fromId;
    const user = room.getPlayerById(userId);

    const options = ['decade_shejian:damage'];
    user.getPlayerCards().length > 0 && options.push('decade_shejian:discard');

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose decade_shejian options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(user),
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    if (response.selectedOption === 'decade_shejian:discard') {
      let toDiscard = user.getPlayerCards();
      if (toDiscard.length > event.cardIds.length) {
        const resp = await room.doAskForCommonly(
          GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
          {
            toId: event.fromId,
            customCardFields: {
              [PlayerCardsArea.EquipArea]: user.getCardIds(PlayerCardsArea.EquipArea),
              [PlayerCardsArea.HandArea]: user.getCardIds(PlayerCardsArea.HandArea).length,
            },
            customTitle: this.Name,
            amount: event.cardIds.length,
            triggeredBySkills: [this.Name],
          },
          event.fromId,
          true,
        );

        if ((resp.selectedCards || []).length + (resp.selectedCardsIndex || []).length < event.cardIds.length) {
          toDiscard = Algorithm.randomPick(event.cardIds.length, user.getPlayerCards());
        } else {
          toDiscard = resp.selectedCards || [];
          toDiscard.push(
            ...Algorithm.randomPick(event.cardIds.length - toDiscard.length, user.getCardIds(PlayerCardsArea.HandArea)),
          );
        }
      }

      await room.dropCards(CardMoveReason.PassiveDrop, toDiscard, userId, event.fromId, this.Name);
    } else {
      await room.damage({
        fromId: event.fromId,
        toId: userId,
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}
