import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { BoMing } from './boming';

@CompulsorySkill({ name: 'ejian', description: 'ejian_description' })
export class EJian extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return !!event.infos.find(
      info =>
        info.toId &&
        !(owner.getFlag<PlayerId[]>(this.Name) || []).includes(info.toId) &&
        info.triggeredBySkills?.includes(BoMing.Name),
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    for (const info of (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos) {
      if (
        info.toId &&
        !(room.getPlayerById(event.fromId).getFlag<PlayerId[]>(this.Name) || []).includes(info.toId) &&
        info.triggeredBySkills?.includes(BoMing.Name)
      ) {
        const sameTypeCards = room
          .getPlayerById(info.toId)
          .getPlayerCards()
          .filter(
            cardId =>
              cardId !== info.movingCards[0].card &&
              Sanguosha.getCardById(info.movingCards[0].card).BaseType === Sanguosha.getCardById(cardId).BaseType,
          );
        if (sameTypeCards.length > 0) {
          const options = ['ejian:damage', 'ejian:discard'];
          const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
            GameEventIdentifiers.AskForChoosingOptionsEvent,
            {
              options,
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: please choose ejian options: {1}',
                this.Name,
                Functional.getCardTypeRawText(Sanguosha.getCardById(info.movingCards[0].card).BaseType),
              ).extract(),
              toId: info.toId,
              triggeredBySkills: [this.Name],
            },
            info.toId,
          );

          response.selectedOption = response.selectedOption || options[0];
          if (response.selectedOption === options[0]) {
            await room.damage({
              toId: info.toId,
              damage: 1,
              damageType: DamageType.Normal,
              triggeredBySkills: [this.Name],
            });
          } else {
            const to = room.getPlayerById(info.toId);
            const handCards = to.getCardIds(PlayerCardsArea.HandArea);
            const displayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
              fromId: info.toId,
              displayCards: handCards,
              translationsMessage: TranslationPack.translationJsonPatcher(
                '{0} displayed cards {1}',
                TranslationPack.patchPlayerInTranslation(to),
                TranslationPack.patchCardInTranslation(...handCards),
              ).extract(),
            };
            room.broadcast(GameEventIdentifiers.CardDisplayEvent, displayEvent);

            await room.dropCards(CardMoveReason.SelfDrop, sameTypeCards, info.toId, info.toId, this.Name);
          }

          const originalPlayers = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
          originalPlayers.push(info.toId);
          room.getPlayerById(event.fromId).setFlag<PlayerId[]>(this.Name, originalPlayers);
        }

        break;
      }
    }

    return true;
  }
}
