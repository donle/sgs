import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

type JueYongMapper = { [K in keyof CardId]: PlayerId };

@CompulsorySkill({ name: 'jueyong', description: 'jueyong_description' })
export class JueYong extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.OnAimmed || stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      const card = Sanguosha.getCardById(aimEvent.byCardId);
      return (
        aimEvent.toId === owner.Id &&
        AimGroupUtil.getAllTargets(aimEvent.allTargets).length === 1 &&
        !card.isVirtualCard() &&
        !content.triggeredBySkills?.includes(this.Name) &&
        !['peach', 'alcohol'].includes(card.GeneralName) &&
        owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length < owner.Hp
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
        owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length > 0
      );
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseStageChangeEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.AimEvent) {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      AimGroupUtil.cancelTarget(aimEvent, fromId);

      if (room.isCardOnProcessing(aimEvent.byCardId)) {
        await room.moveCards({
          movingCards: [{ card: aimEvent.byCardId, fromArea: CardMoveArea.ProcessingArea }],
          toId: fromId,
          toArea: CardMoveArea.OutsideArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: fromId,
          toOutsideArea: this.Name,
          isOutsideAreaInPublic: true,
          triggeredBySkills: [this.Name],
        });

        const jueyongMapper = room.getFlag<JueYongMapper>(fromId, this.Name) || {};
        jueyongMapper[aimEvent.byCardId] = aimEvent.fromId;
        room.getPlayerById(fromId).setFlag<JueYongMapper>(this.Name, jueyongMapper);
      }
    } else {
      const jueyongMapper = room.getFlag<JueYongMapper>(fromId, this.Name);
      const jue = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.OutsideArea, this.Name).slice();
      if (!jueyongMapper) {
        jue.length > 0 &&
          (await room.moveCards({
            movingCards: jue.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
            fromId,
            toArea: CardMoveArea.DropStack,
            moveReason: CardMoveReason.PlaceToDropStack,
            proposer: fromId,
            triggeredBySkills: [this.Name],
          }));

        return false;
      }

      for (const cardId of jue) {
        const user = jueyongMapper[cardId];
        if (
          user &&
          !room.getPlayerById(user).Dead &&
          room.canUseCardTo(cardId, room.getPlayerById(user), room.getPlayerById(fromId), true)
        ) {
          await room.useCard(
            {
              fromId: user,
              targetGroup: [[fromId]],
              cardId,
              customFromArea: CardMoveArea.OutsideArea,
              customFromId: fromId,
              triggeredBySkills: [this.Name],
            },
            true,
          );
        } else {
          await room.moveCards({
            movingCards: [{ card: cardId, fromArea: CardMoveArea.OutsideArea }],
            fromId,
            toArea: CardMoveArea.DropStack,
            moveReason: CardMoveReason.PlaceToDropStack,
            proposer: fromId,
            triggeredBySkills: [this.Name],
          });
        }
      }

      room.removeFlag(fromId, this.Name);
    }

    return true;
  }
}
