import { YaoHu } from './yaohu';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'jutu', description: 'jutu_description' })
export class JuTu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return event.playerId === owner.Id && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const shengs = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, this.Name);
    shengs.length > 0 &&
      (await room.moveCards({
        movingCards: shengs.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
        fromId: event.fromId,
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      }));

    if (room.getFlag<CharacterNationality>(event.fromId, YaoHu.Name)) {
      const num = room.AlivePlayers.filter(
        player => player.Nationality === room.getFlag<CharacterNationality>(event.fromId, YaoHu.Name),
      ).length;
      if (num > 0) {
        await room.drawCards(num + 1, event.fromId, 'top', event.fromId, this.Name);

        let toPut: CardId[] = [];
        if (room.getPlayerById(event.fromId).getPlayerCards().length <= num) {
          toPut = room.getPlayerById(event.fromId).getPlayerCards();
        } else {
          const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
            GameEventIdentifiers.AskForCardEvent,
            {
              cardAmount: num,
              toId: event.fromId,
              reason: this.Name,
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: please choose {1} card(s) to put on your general card as ‘Sheng’',
                this.Name,
                num,
              ).extract(),
              fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
              triggeredBySkills: [this.Name],
            },
            event.fromId,
            true,
          );

          toPut =
            response.selectedCards.length === num
              ? response.selectedCards
              : Algorithm.randomPick(num, room.getPlayerById(event.fromId).getPlayerCards());
        }

        toPut.length > 0 &&
          (await room.moveCards({
            movingCards: toPut.map(card => ({ card, fromArea: room.getPlayerById(event.fromId).cardFrom(card) })),
            fromId: event.fromId,
            toId: event.fromId,
            toArea: CardMoveArea.OutsideArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: event.fromId,
            isOutsideAreaInPublic: true,
            toOutsideArea: this.Name,
            triggeredBySkills: [this.Name],
          }));
      }
    }

    return true;
  }
}
