import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, LordSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@LordSkill
@CommonSkill({ name: 'lei_weidi', description: 'lei_weidi_description' })
export class LeiWeiDi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.DropCardStageStart &&
      owner.getCardIds(PlayerCardsArea.HandArea).length - owner.getMaxCardHold(room) > 0 &&
      room.getOtherPlayers(owner.Id).find(player => player.Nationality === CharacterNationality.Qun) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      target !== owner &&
      room.getPlayerById(target).Nationality === CharacterNationality.Qun &&
      !room.getPlayerById(owner).getFlag<PlayerId[]>(this.Name)?.includes(target)
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a card to give it to another Qun general (can repeat {1} times)?',
      this.Name,
      owner.getCardIds(PlayerCardsArea.HandArea).length - owner.getMaxCardHold(room),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    const from = room.getPlayerById(fromId);
    let n = from.getCardIds(PlayerCardsArea.HandArea).length - room.getPlayerById(fromId).getMaxCardHold(room);

    let toGive: CardId = cardIds[0];
    let target: PlayerId = toIds[0];
    const targets: PlayerId[] = [];
    do {
      await room.moveCards({
        movingCards: [{ card: toGive, fromArea: CardMoveArea.HandArea }],
        fromId,
        toId: target,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });
      n--;

      if (n === 0 || from.getCardIds(PlayerCardsArea.HandArea).length === 0) {
        break;
      }

      targets.push(target);
      room.setFlag<PlayerId[]>(fromId, this.Name, targets);

      room.notify(
        GameEventIdentifiers.AskForSkillUseEvent,
        {
          invokeSkillNames: [this.Name],
          toId: fromId,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: do you want to choose a card to give it to another Qun general (can repeat {1} times)?',
            this.Name,
            n,
          ).extract(),
        },
        fromId,
      );
      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId);

      if (response.toIds && response.cardIds) {
        target = response.toIds[0];
        toGive = response.cardIds[0];
      } else {
        break;
      }

    } while (true);

    room.removeFlag(fromId, this.Name);

    return true;
  }
}
