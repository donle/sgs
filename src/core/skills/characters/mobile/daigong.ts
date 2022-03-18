import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'daigong', description: 'daigong_description' })
export class DaiGong extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.fromId !== undefined &&
      !owner.hasUsedSkill(this.Name) &&
      !room.getPlayerById(content.fromId).Dead &&
      content.toId === owner.Id &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const from = room.getPlayerById(event.fromId);
    const hancards = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea);
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, {
      fromId: event.fromId,
      displayCards: hancards,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(...hancards),
      ).extract(),
    });

    const suits = hancards.reduce<CardSuit[]>((allsuits, id) => {
      const suit = Sanguosha.getCardById(id).Suit;
      allsuits.includes(suit) || allsuits.push(suit);
      return allsuits;
    }, []);

    const source = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!;
    if (suits.length < 4 && room.getPlayerById(source).getPlayerCards().length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId: source,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: you need to give a card to {1}, otherwise the damage to {1} will be terminated',
            this.Name,
            TranslationPack.patchPlayerInTranslation(from),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          cardMatcher: new CardMatcher({
            suit: [CardSuit.Club, CardSuit.Diamond, CardSuit.Heart, CardSuit.Spade].filter(
              suit => !suits.includes(suit),
            ),
          }).toSocketPassenger(),
          triggeredBySkills: [this.Name],
        },
        source,
      );

      if (response.selectedCards.length > 0) {
        await room.moveCards({
          movingCards: [
            {
              card: response.selectedCards[0],
              fromArea: room.getPlayerById(source).cardFrom(response.selectedCards[0]),
            },
          ],
          fromId: source,
          toId: event.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: source,
          triggeredBySkills: [this.Name],
        });

        return true;
      }
    }

    EventPacker.terminate(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>);

    return true;
  }
}
