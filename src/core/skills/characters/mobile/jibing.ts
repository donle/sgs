import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jibing', description: 'jibing_description' })
export class JiBing extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['slash', 'jink'];
  }

  public canUse(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent>,
  ) {
    if (owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length === 0) {
      return false;
    }

    const identifier = event && EventPacker.getIdentifier(event);
    if (
      identifier === GameEventIdentifiers.AskForCardUseEvent ||
      identifier === GameEventIdentifiers.AskForCardResponseEvent
    ) {
      return (
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ generalName: ['slash'] })) ||
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ name: ['jink'] }))
      );
    }

    return owner.canUseCard(room, new CardMatcher({ name: ['slash'] }));
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(
    room: Room,
    owner: Player,
    pendingCardId: CardId,
    selectedCards: CardId[],
    containerCard?: CardId,
    cardMatcher?: CardMatcher,
  ): boolean {
    return (
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).includes(pendingCardId) &&
      (!!cardMatcher || owner.canUseCard(room, new CardMatcher({ generalName: ['slash'] })))
    );
  }

  public availableCardAreas() {
    return [PlayerCardsArea.OutsideArea];
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string) {
    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: JiBing.Name, description: JiBing.Description })
export class JiBingShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage): boolean {
    return stage === DrawCardStage.BeforeDrawCardEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage &&
      content.drawAmount > 0 &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length <
        room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
          if (!allNations.includes(player.Nationality)) {
            allNations.push(player.Nationality);
          }
          return allNations;
        }, []).length
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put 2 cards from the top of draw stack?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>).drawAmount = 0;

    const topCard = room.getCards(2, 'top');
    await room.moveCards({
      movingCards: topCard.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      toId: event.fromId,
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.GeneralName,
      isOutsideAreaInPublic: true,
      proposer: event.fromId,
      movedByReason: this.GeneralName,
    });

    return true;
  }
}
