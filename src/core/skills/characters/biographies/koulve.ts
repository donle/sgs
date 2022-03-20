import { CardId, DamageCardEnum } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { MovingCardProps } from 'core/event/event.server';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'koulve', description: 'koulve_description' })
export class KouLve extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      content.toId !== owner.Id &&
      room.CurrentPhasePlayer === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      !room.getPlayerById(content.toId).Dead &&
      room.getPlayerById(content.toId).LostHp > 0 &&
      room.getPlayerById(content.toId).getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to display {1} card from {2}’s hand?',
      this.Name,
      room.getPlayerById(event.toId).LostHp,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const victim = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId;

    const handCards = room.getPlayerById(victim).getCardIds(PlayerCardsArea.HandArea);
    let selectedCards: CardId[] = handCards;

    if (handCards.length > room.getPlayerById(victim).LostHp) {
      const response = await room.doAskForCommonly(
        GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
        {
          toId: victim,
          customCardFields: {
            [PlayerCardsArea.HandArea]: handCards.length,
          },
          customTitle: this.Name,
          amount: room.getPlayerById(victim).LostHp,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedCardsIndex = response.selectedCardsIndex || [0];
      selectedCards = Algorithm.randomPick(response.selectedCardsIndex.length, handCards);
    }

    const showCardEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      displayCards: selectedCards,
      fromId: victim,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1} from {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        TranslationPack.patchCardInTranslation(...selectedCards),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(victim)),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, showCardEvent);

    const movingCards: MovingCardProps[] = [];
    let hasRed = false;
    for (const id of selectedCards) {
      const card = Sanguosha.getCardById(id);
      if ((Object.values(DamageCardEnum) as string[]).includes(card.GeneralName)) {
        movingCards.push({ card: id, fromArea: CardMoveArea.HandArea });
      }
      hasRed = hasRed || card.isRed();
    }

    await room.moveCards({
      movingCards,
      fromId: victim,
      toId: fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    if (hasRed) {
      room.getPlayerById(fromId).LostHp > 0 ? await room.changeMaxHp(fromId, -1) : await room.loseHp(fromId, 1);
      await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}
