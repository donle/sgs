import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zuilun', description: 'zuilun_description' })
export class ZuiLun extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public getSkillLog(room: Room, player: Player): PatchedTranslationObject {
    const events = room.Analytics.getRecordEvents<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent
    >(
      event => {
        const identifier = EventPacker.getIdentifier(event);
        if (identifier === GameEventIdentifiers.DamageEvent) {
          const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
          return damageEvent.fromId === player.Id;
        } else {
          const moveCardEvent = event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
          return (
            moveCardEvent.infos.find(
              info =>
                info.fromId === player.Id &&
                info.movingCards &&
                info.movingCards.find(
                  card => card.fromArea === CardMoveArea.HandArea || card.fromArea === CardMoveArea.EquipArea,
                ) !== undefined &&
                info.moveReason === CardMoveReason.SelfDrop,
            ) !== undefined
          );
        }
      },
      player.Id,
      'round',
    );

    let n = 0;
    events.find(event => EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent) && n++;
    events.find(event => EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent) || n++;
    room
      .getOtherPlayers(player.Id)
      .find(p => p.getCardIds(PlayerCardsArea.HandArea).length < player.getCardIds(PlayerCardsArea.HandArea).length) ||
      n++;

    player.setFlag<number>(this.Name, n);
    return n > 0
      ? TranslationPack.translationJsonPatcher(
          '{0}: do you want to obtain {1} card(s) from the top of draw stack?',
          this.Name,
          n,
        ).extract()
      : TranslationPack.translationJsonPatcher(
          '{0}: do you want to view 3 cards from the top of draw stack, then choose another player to lose 1 hp with him?',
          this.Name,
        ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const topCards = room.getCards(3, 'top');
    const n = room.getPlayerById(fromId).getFlag<number>(this.Name);

    if (n === 3) {
      await room.moveCards({
        movingCards: topCards.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });
    } else {
      const askForPlaceCardsInDileEvent =
        n > 0
          ? {
              toId: fromId,
              cardIds: topCards,
              top: topCards.length,
              topStackName: 'draw stack top',
              bottom: n,
              bottomStackName: 'to obtain',
              bottomMaxCard: n,
              bottomMinCard: n,
              movable: true,
              triggeredBySkills: [this.Name],
            }
          : {
              toId: fromId,
              cardIds: topCards,
              top: topCards.length,
              topStackName: 'draw stack top',
              bottom: 0,
              bottomStackName: 'to obtain',
              movable: true,
              triggeredBySkills: [this.Name],
            };

      const { top, bottom } = await room.doAskForCommonly<GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
        GameEventIdentifiers.AskForPlaceCardsInDileEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
          askForPlaceCardsInDileEvent,
        ),
        fromId,
      );

      room.putCards('top', ...top);
      if (bottom.length > 0) {
        await room.moveCards({
          movingCards: bottom.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        });
      } else {
        const players = room.getOtherPlayers(fromId).map(player => player.Id);
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>({
            players,
            toId: fromId,
            requiredAmount: 1,
            conversation: 'zuilun: please choose another player to lose 1 hp with you',
            triggeredBySkills: [this.Name],
          }),
          fromId,
        );

        resp.selectedPlayers = resp.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];
        await room.loseHp(fromId, 1);
        await room.loseHp(resp.selectedPlayers[0], 1);
      }
    }

    return true;
  }
}
