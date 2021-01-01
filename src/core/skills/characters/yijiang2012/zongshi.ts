import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardColor, CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FilterSkill, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'zongshi', description: 'zongshi_description' })
export class ZongShi extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(room: Room): number {
    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);

    return nations.length;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ZongShi.Name, description: ZongShi.Description })
export class ZongShiNullify extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardEffectStage.PreCardEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ): boolean {
    return (
      room.CurrentPlayer !== owner &&
      owner.getCardIds(PlayerCardsArea.HandArea).length >= owner.getMaxCardHold(room) &&
      event.toIds !== undefined &&
      event.toIds.includes(owner.Id) &&
      Sanguosha.getCardById(event.cardId!).Color === CardColor.None
    );
  }

  public async onTrigger(
    room: Room,
    content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    const cardEffectEvent = content.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;

    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, nullify {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
      this.GeneralName,
      TranslationPack.patchCardInTranslation(cardEffectEvent.cardId),
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardEffectEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    cardEffectEvent.nullifiedTargets?.push(event.fromId);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ZongShiNullify.Name, description: ZongShiNullify.Description })
export class ZongShiProhibit extends FilterSkill {
  public canBeUsedCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, attacker?: PlayerId): boolean {
    const ownerPlayer = room.getPlayerById(owner);
    if (
      room.CurrentPlayer === ownerPlayer ||
      ownerPlayer.getCardIds(PlayerCardsArea.HandArea).length < ownerPlayer.getMaxCardHold(room)
    ) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      return !new CardMatcher({ type: [CardType.DelayedTrick] }).match(cardId);
    } else {
      return !Sanguosha.getCardById(cardId).is(CardType.DelayedTrick);
    }
  }
}
