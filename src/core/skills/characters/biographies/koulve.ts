import { CardChoosingOptions, DamageCardEnum } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
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
      room.getPlayerById(content.toId).getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to display a card from {1}’s hand?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const victim = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId;

    const options: CardChoosingOptions = {
      [PlayerCardsArea.HandArea]: room.getPlayerById(victim).getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId,
      toId: victim,
      options,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);
    if (!response) {
      return false;
    }

    const showCardEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      displayCards: [response.selectedCard!],
      fromId: victim,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1} from {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        TranslationPack.patchCardInTranslation(response.selectedCard!),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(victim)),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, showCardEvent);

    const card = Sanguosha.getCardById(response.selectedCard!);
    if ((Object.values(DamageCardEnum) as string[]).includes(card.GeneralName)) {
      await room.moveCards({
        movingCards: [{ card: response.selectedCard!, fromArea: CardMoveArea.HandArea }],
        fromId: victim,
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });
    }

    if (card.isRed()) {
      room.getPlayerById(fromId).LostHp > 0 ? await room.changeMaxHp(fromId, -1) : await room.loseHp(fromId, 1);
      await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}
