import { VirtualCard } from 'core/cards/card';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { ActiveSkill, OnDefineReleaseTiming, ResponsiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

type JingLveMapper = { [playerId: string]: CardId };

@CommonSkill({ name: 'jinglve', description: 'jinglve_description' })
export class JingLve extends ActiveSkill {
  public static readonly JingLveMapper = 'jinglve_mapper';

  public canUse(room: Room, owner: Player) {
    return (
      !owner.hasUsedSkill(this.Name) &&
      !room.AlivePlayers.find(player => player.getFlag<JingLveMapper>(JingLve.JingLveMapper))
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const originalPlayers = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
    originalPlayers.includes(event.toIds[0]) || originalPlayers.push(event.toIds[0]);
    room.setFlag<PlayerId[]>(event.fromId, this.Name, originalPlayers);

    const options: CardChoosingOptions = {
      [PlayerCardsArea.HandArea]: room.getPlayerById(event.toIds[0]).getCardIds(PlayerCardsArea.HandArea),
    };

    const chooseCardEvent = {
      fromId: event.fromId,
      toId: event.toIds![0],
      options,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, event.fromId, false, true);
    if (!response) {
      return false;
    }

    const realId = VirtualCard.getActualCards([response.selectedCard!])[0];
    const sishi = Sanguosha.getCardById(response.selectedCard!);
    room.setFlag<JingLveMapper>(
      event.toIds[0],
      JingLve.JingLveMapper,
      { [event.fromId]: realId },
      TranslationPack.translationJsonPatcher(
        'sishi: {0} {1}',
        sishi.Name,
        Functional.getCardSuitCharText(sishi.Suit) + Functional.getCardNumberRawText(sishi.CardNumber),
      ).toString(),
      [event.fromId],
    );

    room.getPlayerById(event.toIds[0]).hasShadowSkill(JingLveSiShi.Name) ||
      (await room.obtainSkill(event.toIds[0], JingLveSiShi.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_jinglve_sishi', description: 's_jinglve_sishi_description' })
export class JingLveSiShi extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(room: Room, owner: PlayerId): boolean {
    return !room.getFlag<JingLveMapper>(owner, JingLve.JingLveMapper);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.PhaseChangeEvent
    >,
    stage?: AllStage,
  ): boolean {
    return (
      stage === CardUseStage.CardUsing ||
      stage === CardMoveStage.AfterCardMoved ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.PhaseChangeEvent
    >,
  ): boolean {
    const sishi = owner.getFlag<JingLveMapper>(JingLve.JingLveMapper);
    if (!sishi) {
      return true;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        VirtualCard.getActualCards([cardUseEvent.cardId]).includes(Object.values(sishi)[0]) &&
        !(Sanguosha.getCardById(cardUseEvent.cardId).Skill instanceof ResponsiveSkill && !cardUseEvent.toCardIds)
      );
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      return (
        (event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.find(
          info =>
            !(info.toId === owner.Id && info.toArea === CardMoveArea.EquipArea) &&
            info.toArea !== CardMoveArea.ProcessingArea &&
            info.movingCards.find(cardInfo => cardInfo.card === Object.values(sishi)[0]),
        ) !== undefined
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.from === PlayerPhase.PhaseFinish &&
        phaseChangeEvent.fromPlayer === owner.Id &&
        owner.getCardIds().find(id => VirtualCard.getActualCards([id])[0] === Object.values(sishi)[0]) !== undefined
      );
    }

    return false;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    if (!room.getFlag<JingLveMapper>(event.fromId, JingLve.JingLveMapper)) {
      await room.loseSkill(event.fromId, this.Name);
      return false;
    }

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      if (Sanguosha.getCardById(cardUseEvent.cardId).Skill instanceof ResponsiveSkill) {
        cardUseEvent.toCardIds = undefined;
      } else {
        cardUseEvent.targetGroup = undefined;
      }
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const sishi = Object.entries(room.getFlag<JingLveMapper>(event.fromId, JingLve.JingLveMapper))[0];
      if (
        !room.getPlayerById(sishi[0]).Dead &&
        (unknownEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.find(
          info =>
            info.toArea === CardMoveArea.DropStack &&
            info.moveReason !== CardMoveReason.CardUse &&
            info.movingCards.find(cardInfo => cardInfo.card === sishi[1]),
        ) &&
        room.isCardInDropStack(sishi[1])
      ) {
        await room.moveCards({
          movingCards: [{ card: sishi[1], fromArea: CardMoveArea.DropStack }],
          toId: sishi[0],
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: sishi[0],
          triggeredBySkills: [this.Name],
        });
      }
    } else {
      const sishi = Object.entries(room.getFlag<JingLveMapper>(event.fromId, JingLve.JingLveMapper))[0];
      if (!room.getPlayerById(sishi[0]).Dead) {
        const toGain = room
          .getPlayerById(event.fromId)
          .getCardIds()
          .find(id => VirtualCard.getActualCards([id])[0] === sishi[1]);
        toGain &&
          (await room.moveCards({
            movingCards: [{ card: toGain, fromArea: room.getPlayerById(event.fromId).cardFrom(toGain) }],
            fromId: event.fromId,
            toId: sishi[0],
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActivePrey,
            proposer: event.fromId,
            triggeredBySkills: [this.Name],
          }));
      }
    }

    room.removeFlag(event.fromId, JingLve.JingLveMapper);
    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}
