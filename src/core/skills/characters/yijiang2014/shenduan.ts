import { CardType, VirtualCard } from 'core/cards/card';
import { BingLiangCunDuan } from 'core/cards/legion_fight/bingliangcunduan';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shenduan', description: 'shenduan_description' })
export class ShenDuan extends TriggerSkill {
  private readonly shenDuanTarget = 'shenduan_target';
  private readonly shenDuanCard = 'shenduan_card';
  private readonly shenDuanBannedIds = 'shenduan_banned_ids';

  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      content.infos.find(
        info =>
          info.fromId === owner.Id &&
          (info.moveReason === CardMoveReason.SelfDrop || info.moveReason === CardMoveReason.PassiveDrop) &&
          !(
            owner.Id === info.toId &&
            (info.toArea === PlayerCardsArea.HandArea || info.toArea === PlayerCardsArea.EquipArea)
          ) &&
          info.movingCards.find(
            card => card.fromArea === PlayerCardsArea.HandArea || card.fromArea === PlayerCardsArea.EquipArea,
          ),
      ) !== undefined
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const from = room.getPlayerById(fromId);
    const moveCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    let availableIds: CardId[] = [];

    const flagIds = from.getFlag<CardId[]>(this.shenDuanBannedIds);
    if (flagIds) {
      availableIds = flagIds;
    } else {
      availableIds = moveCardEvent.infos.reduce<CardId[]>((cardIds, info) => {
        if (
          (info.toId === fromId && (info.toArea === CardMoveArea.HandArea || info.toArea === CardMoveArea.EquipArea)) ||
          (info.moveReason !== CardMoveReason.SelfDrop && info.moveReason !== CardMoveReason.PassiveDrop)
        ) {
          return cardIds;
        }

        for (const movingCard of info.movingCards) {
          const realCard = Sanguosha.getCardById(movingCard.card);
          if (
            !Sanguosha.isVirtualCardId(movingCard.card) &&
            realCard.isBlack() &&
            !realCard.is(CardType.Trick) &&
            (movingCard.fromArea === PlayerCardsArea.HandArea || movingCard.fromArea === PlayerCardsArea.EquipArea) &&
            room.isCardInDropStack(movingCard.card)
          ) {
            cardIds.push(movingCard.card);
          }
        }
        return cardIds;
      }, []);

      from.setFlag<CardId[]>(this.shenDuanBannedIds, availableIds);
    }

    if (availableIds.length === 0) {
      from.removeFlag(this.shenDuanBannedIds);
      return false;
    }

    const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
      toId: fromId,
      cardIds: availableIds,
      amount: 1,
      customTitle: 'shenduan: please choose one of these cards',
      ignoreNotifiedStatus: true,
    };

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardEvent>(
      GameEventIdentifiers.AskForChoosingCardEvent,
      askForChooseCardEvent,
      fromId,
    );

    if (response.selectedCards === undefined || response.selectedCards.length === 0) {
      from.removeFlag(this.shenDuanBannedIds);
      return false;
    }

    from.setFlag<CardId[]>(
      this.shenDuanBannedIds,
      from.getFlag<CardId[]>(this.shenDuanBannedIds).filter(id => id !== response.selectedCards![0]),
    );

    const virtualCard = VirtualCard.create<BingLiangCunDuan>(
      {
        cardName: 'bingliangcunduan',
        bySkill: this.Name,
      },
      response.selectedCards,
    );

    const availableTargets = room
      .getOtherPlayers(fromId)
      .filter(
        player =>
          from.canUseCardTo(room, virtualCard.Id, player.Id) &&
          player
            .getCardIds(PlayerCardsArea.JudgeArea)
            .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'bingliangcunduan') === undefined,
      )
      .map(player => player.Id);

    const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      toId: fromId,
      players: availableTargets,
      requiredAmount: 1,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose a target for {1}',
        this.Name,
        TranslationPack.patchCardInTranslation(virtualCard.Id),
      ).extract(),
      triggeredBySkills: [this.Name],
    };

    const newResponse = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      askForPlayerChoose,
      fromId,
    );

    if (newResponse.selectedPlayers === undefined || newResponse.selectedPlayers.length === 0) {
      from.removeFlag(this.shenDuanBannedIds);
      return false;
    }

    EventPacker.addMiddleware(
      {
        tag: this.shenDuanTarget,
        data: newResponse.selectedPlayers[0],
      },
      event,
    );

    EventPacker.addMiddleware(
      {
        tag: this.shenDuanCard,
        data: virtualCard.Id,
      },
      event,
    );

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const target = EventPacker.getMiddleware<PlayerId>(this.shenDuanTarget, event);
    const cardId = EventPacker.getMiddleware<CardId>(this.shenDuanCard, event);

    if (target === undefined || cardId === undefined) {
      return false;
    }

    await room.useCard({
      fromId,
      cardId,
      targetGroup: [[target]],
      customFromArea: CardMoveArea.DropStack,
    });

    const from = room.getPlayerById(fromId);
    if (from.getFlag<boolean>(this.Name)) {
      return false;
    }

    from.setFlag<boolean>(this.Name, true);
    while (true) {
      const invoke = await room.useSkill({
        fromId,
        skillName: this.Name,
        triggeredOnEvent: event.triggeredOnEvent,
      });

      if (!invoke) {
        from.removeFlag(this.Name);
        break;
      }
    }

    return true;
  }
}
