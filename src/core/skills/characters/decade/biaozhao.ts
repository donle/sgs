import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'biaozhao', description: 'biaozhao_description' })
export class BiaoZhao extends TriggerSkill {
  public isAutoTrigger(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      event !== undefined &&
      !(
        EventPacker.getIdentifier(event) === GameEventIdentifiers.PhaseStageChangeEvent &&
        event.toStage === PlayerPhaseStages.FinishStageStart
      )
    );
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.MoveCardEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        ((phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
          owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length === 0 &&
          owner.getPlayerCards().length > 0) ||
          (phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
            owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length > 0))
      );
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const biao = owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name);
      return (
        biao.length > 0 &&
        (content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.find(
          info =>
            info.toArea === CardMoveArea.DropStack &&
            info.movingCards.find(
              cardInfo =>
                !Sanguosha.isVirtualCardId(cardInfo.card) &&
                Sanguosha.getCardById(cardInfo.card).Suit === Sanguosha.getCardById(biao[0]).Suit &&
                Sanguosha.getCardById(cardInfo.card).CardNumber === Sanguosha.getCardById(biao[0]).CardNumber,
            ),
        ) !== undefined
      );
    }

    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put a card on your general card as ‘Biao’?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.MoveCardEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      if (
        (unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).toStage ===
        PlayerPhaseStages.FinishStageStart
      ) {
        if (!event.cardIds) {
          return false;
        }

        await room.moveCards({
          movingCards: [
            { card: event.cardIds[0], fromArea: room.getPlayerById(event.fromId).cardFrom(event.cardIds[0]) },
          ],
          fromId: event.fromId,
          toId: event.fromId,
          toArea: CardMoveArea.OutsideArea,
          moveReason: CardMoveReason.ActiveMove,
          isOutsideAreaInPublic: false,
          toOutsideArea: this.Name,
          triggeredBySkills: [this.Name],
        });
      } else {
        await room.moveCards({
          movingCards: [
            {
              card: room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, this.Name)[0],
              fromArea: CardMoveArea.OutsideArea,
            },
          ],
          fromId: event.fromId,
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.PlaceToDropStack,
          triggeredBySkills: [this.Name],
        });

        const players = room.AlivePlayers.map(player => player.Id);

        let most = 0;
        for (const player of room.AlivePlayers) {
          if (player.getCardIds(PlayerCardsArea.HandArea).length > most) {
            most = Math.min(5, player.getCardIds(PlayerCardsArea.HandArea).length);
          }

          if (most === 5) {
            break;
          }
        }

        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players,
            toId: event.fromId,
            requiredAmount: 1,
            conversation: TranslationPack.translationJsonPatcher(
              'biaozhao: please choose a target to let him recover 1 hp, and then he draws {1} cards',
              this.Name,
              most,
            ).extract(),
            triggeredBySkills: [this.Name],
          },
          event.fromId,
          true,
        );

        resp.selectedPlayers = resp.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];

        await room.recover({
          toId: resp.selectedPlayers[0],
          recoveredHp: 1,
          recoverBy: event.fromId,
        });

        const diff = most - room.getPlayerById(resp.selectedPlayers[0]).getCardIds(PlayerCardsArea.HandArea).length;
        diff > 0 && (await room.drawCards(diff, resp.selectedPlayers[0], 'top', event.fromId, this.Name));
      }
    } else {
      const biao = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, this.Name);
      const infos = (unknownEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.filter(
        info =>
          info.toArea === CardMoveArea.DropStack &&
          (info.moveReason === CardMoveReason.SelfDrop || info.moveReason === CardMoveReason.PassiveDrop) &&
          info.proposer !== undefined &&
          info.proposer !== event.fromId &&
          info.movingCards.find(
            cardInfo =>
              !Sanguosha.isVirtualCardId(cardInfo.card) &&
              Sanguosha.getCardById(cardInfo.card).Suit === Sanguosha.getCardById(biao[0]).Suit &&
              Sanguosha.getCardById(cardInfo.card).CardNumber === Sanguosha.getCardById(biao[0]).CardNumber,
          ),
      );

      if (infos.length > 0) {
        const proposer = infos[0].proposer!;
        await room.moveCards({
          movingCards: [{ card: biao[0], fromArea: CardMoveArea.OutsideArea }],
          fromId: event.fromId,
          toId: proposer,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer,
          triggeredBySkills: [this.Name],
        });
      } else {
        await room.moveCards({
          movingCards: [{ card: biao[0], fromArea: CardMoveArea.OutsideArea }],
          fromId: event.fromId,
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.PlaceToDropStack,
          proposer: event.fromId,
          triggeredBySkills: [this.Name],
        });
      }

      await room.loseHp(event.fromId, 1);
    }

    return true;
  }
}
