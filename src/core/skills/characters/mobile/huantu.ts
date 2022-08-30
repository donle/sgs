import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CircleSkill, CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CircleSkill
@CommonSkill({ name: 'huantu', description: 'huantu_description' })
export class HuanTu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.to === PlayerPhase.DrawCardStage &&
      !owner.hasUsedSkill(this.Name) &&
      owner.getPlayerCards().length > 0 &&
      room.withinAttackDistance(owner, room.getPlayerById(content.toPlayer))
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to give {1} a card to skip his/her draw phase?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toPlayer)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).toPlayer;
    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: room.getPlayerById(toId).cardFrom(event.cardIds[0]) }],
      fromId: event.fromId,
      toId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      triggeredBySkills: [this.Name],
    });

    room.getPlayerById(event.fromId).setFlag<PlayerId>(this.Name, toId);
    await room.skip(toId, PlayerPhase.DrawCardStage);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: HuanTu.Name, description: HuanTu.Description })
export class HuanTuShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    if (!owner.getFlag<PlayerId>(this.GeneralName)) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.getFlag<PlayerId>(this.GeneralName) &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return (content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    if (
      EventPacker.getIdentifier(
        event.triggeredOnEvent as ServerEventFinder<
          GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent
        >,
      ) === GameEventIdentifiers.PhaseStageChangeEvent
    ) {
      const toId = room.getFlag<PlayerId>(fromId, this.GeneralName);
      room.getPlayerById(fromId).removeFlag(this.GeneralName);
      const options = ['huantu:give'];
      room.getPlayerById(toId).LostHp > 0 && options.unshift('huantu:recover');

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose huantu options: {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedOption = response.selectedOption || options[0];
      if (response.selectedOption === 'huantu:recover') {
        await room.recover({
          toId,
          recoveredHp: 1,
          recoverBy: fromId,
        });

        await room.drawCards(2, toId, 'top', fromId, this.Name);
      } else {
        await room.drawCards(3, fromId, 'top', fromId, this.Name);
        if (room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea).length > 1) {
          const resp = await room.doAskForCommonly(
            GameEventIdentifiers.AskForCardEvent,
            {
              cardAmount: 2,
              toId: fromId,
              reason: this.Name,
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: please choose 2 hand cards to give them to {1}',
                this.Name,
                TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
              ).extract(),
              fromArea: [PlayerCardsArea.HandArea],
              triggeredBySkills: [this.Name],
            },
            fromId,
            true,
          );

          resp.selectedCards =
            resp.selectedCards ||
            Algorithm.randomPick(2, room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea));

          await room.moveCards({
            movingCards: resp.selectedCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
            fromId,
            toId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            triggeredBySkills: [this.Name],
          });
        }
      }
    } else {
      room.getPlayerById(fromId).removeFlag(this.GeneralName);
    }

    return true;
  }
}
