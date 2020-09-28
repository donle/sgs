import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AimStage, AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'danshou', description: 'danshou_description' })
export class DanShou extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return (
      !owner.hasUsedSkill(this.Name) &&
      content.toId === owner.Id &&
      (Sanguosha.getCardById(content.byCardId!).is(CardType.Basic) ||
        Sanguosha.getCardById(content.byCardId!).is(CardType.Trick))
    );
  }

  public async onTrigger() {
    return true;
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PrepareStage;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;

    const numOfDrawing = room.Players.reduce<number>((total, player) => {
      return (
        total +
        room.Analytics.getCardUseRecord(player.Id, true, undefined).filter(
          event =>
            event.toIds !== undefined &&
            event.toIds!.includes(fromId) &&
            (Sanguosha.getCardById(event.cardId).is(CardType.Basic) ||
              Sanguosha.getCardById(event.cardId).is(CardType.Trick)),
        ).length
      );
    }, 0);

    await room.drawCards(numOfDrawing, fromId, undefined, fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: DanShou.Name, description: DanShou.Description })
export class DanshouShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.toStage === PlayerPhaseStages.FinishStageStart && !owner.hasUsedSkill(this.GeneralName);
  }

  public isAvailableCard(owner: string, room: Room, cardId: CardId, selectedCards: CardId[]) {
    return selectedCards.length < room.CurrentPhasePlayer.getCardIds(PlayerCardsArea.HandArea).length;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === room.CurrentPhasePlayer.getCardIds(PlayerCardsArea.HandArea).length;
  }

  public getSkillLog(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers>) {
    return TranslationPack.translationJsonPatcher(
      'do you want to trigger skill {0} to {1} ?',
      this.GeneralName,
      TranslationPack.patchPlayerInTranslation(room.CurrentPhasePlayer),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds } = skillUseEvent;
    if (cardIds !== undefined && cardIds.length > 0) {
      await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.GeneralName);
    }

    const current = room.CurrentPhasePlayer;
    if (!current.Dead) {
      await room.damage({
        fromId,
        toId: current.Id,
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.GeneralName],
      });
    }

    return true;
  }
}
