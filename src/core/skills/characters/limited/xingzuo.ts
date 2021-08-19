import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
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
import { CommonSkill, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xingzuo', description: 'xingzuo_description' })
export class XingZuo extends TriggerSkill {
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
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const cards = room.getCards(3, 'bottom');
    const handcards = from.getCardIds(PlayerCardsArea.HandArea);

    const bottomName = 'the bottom of draw stack';
    const { selectedCards } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardEvent>(
      GameEventIdentifiers.AskForChoosingCardEvent,
      {
        amount: 3,
        customCardFields: {
          [bottomName]: cards,
          [PlayerCardsArea.HandArea]: handcards,
        },
        toId: fromId,
        customTitle: 'xingzuo: please select cards to put on draw stack bottom',
      },
      fromId,
    );

    if (selectedCards) {
      const toGain = cards.filter(card => !selectedCards.includes(card));

      if (toGain.length > 0) {
        const toBottom = selectedCards.filter(card => !cards.includes(card));

        await room.moveCards(
          {
            movingCards: toGain.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
            toArea: CardMoveArea.ProcessingArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: fromId,
            engagedPlayerIds: [fromId],
          },
          {
            movingCards: toBottom.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
            fromId,
            toArea: CardMoveArea.ProcessingArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: fromId,
            engagedPlayerIds: [],
          },
        );

        await room.moveCards(
          {
            movingCards: toBottom.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
            toArea: CardMoveArea.DrawStack,
            moveReason: CardMoveReason.ActiveMove,
            proposer: fromId,
            engagedPlayerIds: [fromId],
            placeAtTheBottomOfDrawStack: true,
          },
          {
            movingCards: toGain.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
            toId: fromId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: fromId,
          },
        );

        from.setFlag<boolean>(this.Name, true);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XingZuo.Name, description: XingZuo.Description })
export class XingZuoShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

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
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.getFlag<boolean>(this.GeneralName)
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to exchange hand cards with draw stack bottom?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const toExchange = room.getPlayerById(toIds[0]).getCardIds(PlayerCardsArea.HandArea);
    const num = toExchange.length;
    const cards = room.getCards(3, 'bottom');

    await room.moveCards(
      {
        movingCards: cards.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
        toArea: CardMoveArea.ProcessingArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: toIds[0],
      },
      {
        movingCards: toExchange.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId: toIds[0],
        toArea: CardMoveArea.ProcessingArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: toIds[0],
      },
    );

    await room.moveCards(
      {
        movingCards: toExchange.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        toArea: CardMoveArea.DrawStack,
        moveReason: CardMoveReason.ActiveMove,
        proposer: toIds[0],
        placeAtTheBottomOfDrawStack: true,
      },
      {
        movingCards: cards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        toId: toIds[0],
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: toIds[0],
      },
    );

    num > 3 && (await room.loseHp(fromId, 1));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XingZuoShadow.Name, description: XingZuoShadow.Description })
export class XingZuoClear extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.from === PlayerPhase.PhaseFinish && owner.getFlag<boolean>(this.GeneralName);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
