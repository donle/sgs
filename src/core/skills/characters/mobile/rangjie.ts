import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'rangjie', description: 'rangjie_description' })
export class RangJie extends TriggerSkill {
  private RangJieOptions = ['rangjie:move', 'rangjie:gain'];

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return content.toId === owner.Id;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const canMove = room.AlivePlayers.find(player => {
      const cards = [...player.getCardIds(PlayerCardsArea.EquipArea), ...player.getCardIds(PlayerCardsArea.JudgeArea)];
      if (cards.length === 0) {
        return false;
      }

      return room.getOtherPlayers(player.Id).find(p => cards.find(id => room.canPlaceCardTo(id, p.Id)));
    });

    const options = this.RangJieOptions.slice();
    canMove || options.shift();

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher('{0}: please choose rangjie options', this.Name).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
    );

    if (response.selectedOption) {
      EventPacker.addMiddleware({ tag: this.Name, data: response.selectedOption }, event);
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const chosen = EventPacker.getMiddleware<string>(this.Name, event);

    if (chosen === this.RangJieOptions[0]) {
      room.notify(
        GameEventIdentifiers.AskForSkillUseEvent,
        {
          invokeSkillNames: [RangJieSelect.Name],
          toId: fromId,
          conversation: 'rangjie: please move a card on the game board',
        },
        fromId,
      );
      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId);

      if (response.toIds) {
        const toIds = response.toIds;
        const moveFrom = room.getPlayerById(toIds[0]);
        const moveTo = room.getPlayerById(toIds[1]);
        const canMovedEquipCardIds: CardId[] = [];
        const canMovedJudgeCardIds: CardId[] = [];

        const fromEquipArea = moveFrom.getCardIds(PlayerCardsArea.EquipArea);
        canMovedEquipCardIds.push(...fromEquipArea.filter(id => room.canPlaceCardTo(id, moveTo.Id)));

        const fromJudgeArea = moveFrom.getCardIds(PlayerCardsArea.JudgeArea);
        canMovedJudgeCardIds.push(...fromJudgeArea.filter(id => room.canPlaceCardTo(id, moveTo.Id)));

        const options: CardChoosingOptions = {
          [PlayerCardsArea.JudgeArea]: canMovedJudgeCardIds,
          [PlayerCardsArea.EquipArea]: canMovedEquipCardIds,
        };

        const chooseCardEvent = {
          fromId,
          toId: fromId,
          options,
          triggeredBySkills: [this.Name],
        };

        const resp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);
        if (!resp) {
          return false;
        }

        const area = moveFrom.getCardIds(PlayerCardsArea.EquipArea).includes(resp.selectedCard!)
          ? CardMoveArea.EquipArea
          : CardMoveArea.JudgeArea;
        await room.moveCards({
          movingCards: [{ card: resp.selectedCard!, fromArea: area }],
          fromId: toIds[0],
          toId: toIds[1],
          toArea: area,
          moveReason: CardMoveReason.PassiveMove,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        });
      }
    } else {
      const options = ['basic card', 'trick card', 'equip card'];
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose rangjie options',
            this.Name,
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedOption = response.selectedOption || options[0];

      const typeNameMapper = {
        [options[0]]: CardType.Basic,
        [options[1]]: CardType.Trick,
        [options[2]]: CardType.Equip,
      };
      const type = typeNameMapper[response.selectedOption];

      const cards = room.findCardsByMatcherFrom(new CardMatcher({ type: [type] }));
      cards.length > 0 &&
        (await room.moveCards({
          movingCards: [{ card: cards[Math.floor(Math.random() * cards.length)], fromArea: CardMoveArea.DrawStack }],
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        }));
    }

    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'rangjie_select', description: 'rangjie_select_description' })
export class RangJieSelect extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 2;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    const to = room.getPlayerById(target);
    const equiprCardIds = to.getCardIds(PlayerCardsArea.EquipArea);
    const judgeCardIds = to.getCardIds(PlayerCardsArea.JudgeArea);

    if (selectedTargets.length === 0) {
      return equiprCardIds.length + judgeCardIds.length > 0;
    } else if (selectedTargets.length === 1) {
      let canBeTarget: boolean = false;
      const from = room.getPlayerById(selectedTargets[0]);

      const fromEquipArea = from.getCardIds(PlayerCardsArea.EquipArea);
      canBeTarget = canBeTarget || fromEquipArea.find(id => room.canPlaceCardTo(id, target)) !== undefined;

      const fromJudgeArea = from.getCardIds(PlayerCardsArea.JudgeArea);
      canBeTarget = canBeTarget || fromJudgeArea.find(id => room.canPlaceCardTo(id, target)) !== undefined;

      return canBeTarget;
    }

    return false;
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toIds } = event;
    return [
      { from: fromId, tos: [toIds![0]] },
      { from: toIds![0], tos: [toIds![1]] },
    ];
  }

  public resortTargets() {
    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}
