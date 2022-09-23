import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yaopei', description: 'yaopei_description' })
export class YaoPei extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId !== owner.Id &&
      !room.getPlayerById(content.playerId).Dead &&
      content.toStage === PlayerPhaseStages.DropCardStageEnd &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
          event.infos.find(info => info.fromId === content.playerId && info.moveReason === CardMoveReason.SelfDrop) !==
            undefined,
        content.playerId,
        'phase',
      ).length > 0
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const current = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;
    const records = room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      moveCardEvent =>
        EventPacker.getIdentifier(moveCardEvent) === GameEventIdentifiers.MoveCardEvent &&
        moveCardEvent.infos.find(info => info.fromId === current && info.moveReason === CardMoveReason.SelfDrop) !==
          undefined,
      current,
      'phase',
    );

    const cardSuits = records.reduce<CardSuit[]>((suits, moveCardEvent) => {
      if (suits.length > 3) {
        return suits;
      }

      if (moveCardEvent.infos.length === 1) {
        for (const cardInfo of moveCardEvent.infos[0].movingCards) {
          const suit = Sanguosha.getCardById(cardInfo.card).Suit;
          suits.includes(suit) || suits.push(suit);
        }
      } else {
        for (const info of moveCardEvent.infos) {
          if (info.fromId !== current || info.moveReason !== CardMoveReason.SelfDrop) {
            continue;
          }

          for (const cardInfo of info.movingCards) {
            const suit = Sanguosha.getCardById(cardInfo.card).Suit;
            suits.includes(suit) || suits.push(suit);
          }
        }
      }

      return suits;
    }, []);

    const response = await room.askForCardDrop(
      event.fromId,
      1,
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      false,
      room
        .getPlayerById(event.fromId)
        .getPlayerCards()
        .filter(id => cardSuits.includes(Sanguosha.getCardById(id).Suit)),
      this.Name,
      TranslationPack.translationJsonPatcher('{0}: do you want discard a card?', this.Name).extract(),
    );

    if (response.droppedCards.length > 0) {
      EventPacker.addMiddleware({ tag: this.Name, data: response.droppedCards }, event);
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    await room.dropCards(
      CardMoveReason.SelfDrop,
      EventPacker.getMiddleware<CardId[]>(this.Name, event)!,
      fromId,
      fromId,
      this.Name,
    );

    const current = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;

    const options = ['yaopei:you', 'yaopei:opponent'];
    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose yaopei options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(current)),
        ).extract(),
        toId: fromId,
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    resp.selectedOption = resp.selectedOption || options[1];

    await room.recover({
      toId: resp.selectedOption === options[0] ? fromId : current,
      recoveredHp: 1,
      recoverBy: fromId,
    });

    await room.drawCards(2, resp.selectedOption === options[0] ? current : fromId, 'top', fromId, this.Name);

    return true;
  }
}
