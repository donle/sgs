import { CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shanjia', description: 'shanjia_description' })
export class ShanJia extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, owner: Player) {
    const recordNum = owner.getFlag<number>(this.Name);
    if (owner.getFlag<number>(this.Name) === undefined) {
      const lostNum = room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
          event.infos.find(
            info =>
              info.fromId === owner.Id &&
              info.toId !== owner.Id &&
              info.movingCards &&
              info.movingCards.find(
                card =>
                  (card.fromArea === CardMoveArea.HandArea || card.fromArea === CardMoveArea.EquipArea) &&
                  Sanguosha.getCardById(card.card).is(CardType.Equip),
              ) !== undefined &&
              info.moveReason !== CardMoveReason.CardUse,
          ) !== undefined,
      ).reduce<number>((sum, event) => {
        if (event.infos.length === 1) {
          return (
            sum + event.infos[0].movingCards.filter(card => Sanguosha.getCardById(card.card).is(CardType.Equip)).length
          );
        } else {
          const infos = event.infos.filter(
            info =>
              info.fromId === owner.Id &&
              info.toId !== owner.Id &&
              info.movingCards &&
              info.movingCards.find(
                card =>
                  (card.fromArea === CardMoveArea.HandArea || card.fromArea === CardMoveArea.EquipArea) &&
                  Sanguosha.getCardById(card.card).is(CardType.Equip),
              ) !== undefined &&
              info.moveReason !== CardMoveReason.CardUse,
          );

          for (const info of infos) {
            sum += info.movingCards.filter(card => Sanguosha.getCardById(card.card).is(CardType.Equip)).length;
          }
        }

        return sum;
      }, 0);

      const dropNum = 3 - lostNum;
      dropNum > 0 &&
        room.setFlag<number>(
          owner.Id,
          this.Name,
          dropNum,
          TranslationPack.translationJsonPatcher('shanjia count: {0}', dropNum).toString(),
        );
    } else if (recordNum > 0) {
      room.setFlag<number>(
        owner.Id,
        this.Name,
        recordNum,
        TranslationPack.translationJsonPatcher('shanjia count: {0}', recordNum).toString(),
      );
    }
  }

  public async whenLosingSkill(room: Room, owner: Player) {
    const recordNum = owner.getFlag<number>(this.Name);
    if (recordNum) {
      room.setFlag<number>(owner.Id, this.Name, recordNum);
    }
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
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    await room.drawCards(3, fromId, 'top', fromId, this.Name);

    const dropNum = room.getFlag<number>(fromId, this.Name);
    let dropCards: CardId[] | undefined;
    if (dropNum && dropNum > 0) {
      const response = await room.askForCardDrop(
        fromId,
        dropNum,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name,
        TranslationPack.translationJsonPatcher(
          '{0}: please drop {1} card(s), if all of them are equip card, you can use a virtual slash',
          this.Name,
          dropNum,
        ).extract(),
      );

      if (response) {
        dropCards = response.droppedCards;
        await room.dropCards(CardMoveReason.SelfDrop, dropCards, fromId, fromId, this.Name);
      }
    }

    if (
      !dropCards ||
      (dropCards.length > 0 && !dropCards.find(card => !Sanguosha.getCardById(card).is(CardType.Equip)))
    ) {
      const targets = room
        .getOtherPlayers(fromId)
        .filter(player =>
          room.getPlayerById(fromId).canUseCardTo(room, new CardMatcher({ generalName: ['slash'] }), player.Id),
        )
        .map(player => player.Id);

      if (targets.length > 0) {
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players: targets,
            toId: fromId,
            requiredAmount: 1,
            conversation: 'shanjia: do you want to use a slash?',
            triggeredBySkills: [this.Name],
          },
          fromId,
        );

        if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
          await room.useCard({
            fromId,
            targetGroup: [resp.selectedPlayers],
            cardId: VirtualCard.create<Slash>({ cardName: 'slash', bySkill: this.Name }).Id,
            extraUse: true,
            triggeredBySkills: [this.Name],
          });
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ShanJia.Name, description: ShanJia.Description })
export class ShanJiaShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.GameStartEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.GameStartEvent || stage === CardMoveStage.AfterCardMoved
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.GameStartEvent | GameEventIdentifiers.MoveCardEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const moveCardEvent = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      return (
        moveCardEvent.infos.find(
          info =>
            info.fromId === owner.Id &&
            info.toId !== owner.Id &&
            info.movingCards.find(
              card =>
                (card.fromArea === CardMoveArea.HandArea || card.fromArea === CardMoveArea.EquipArea) &&
                Sanguosha.getCardById(card.card).is(CardType.Equip),
            ) !== undefined &&
            info.moveReason !== CardMoveReason.CardUse,
        ) !== undefined && owner.getFlag<number>(this.GeneralName) !== 0
      );
    }

    return identifier === GameEventIdentifiers.GameStartEvent && owner.getFlag<number>(this.GeneralName) === undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.GameStartEvent | GameEventIdentifiers.MoveCardEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.GameStartEvent) {
      room.setFlag<number>(
        fromId,
        this.GeneralName,
        3,
        TranslationPack.translationJsonPatcher('shanjia count: {0}', 3).toString(),
      );
    } else {
      const recordNum =
        room.getFlag<number>(fromId, this.GeneralName) === undefined
          ? 3
          : room.getFlag<number>(fromId, this.GeneralName);
      if (recordNum > 0) {
        const moveCardEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;

        let num: number = 0;
        if (moveCardEvent.infos.length === 0) {
          num += moveCardEvent.infos[0].movingCards.filter(card =>
            Sanguosha.getCardById(card.card).is(CardType.Equip),
          ).length;
        } else {
          const infos = moveCardEvent.infos.filter(
            info =>
              info.fromId === fromId &&
              info.toId !== fromId &&
              info.movingCards.find(
                card =>
                  (card.fromArea === CardMoveArea.HandArea || card.fromArea === CardMoveArea.EquipArea) &&
                  Sanguosha.getCardById(card.card).is(CardType.Equip),
              ) !== undefined &&
              info.moveReason !== CardMoveReason.CardUse,
          );

          for (const info of infos) {
            num += info.movingCards.filter(card => Sanguosha.getCardById(card.card).is(CardType.Equip)).length;
          }
        }

        const newRecord = Math.max(recordNum - num, 0);

        room.setFlag<number>(
          fromId,
          this.GeneralName,
          newRecord,
          newRecord > 0
            ? TranslationPack.translationJsonPatcher('shanjia count: {0}', newRecord).toString()
            : undefined,
        );
      }
    }

    return true;
  }
}
