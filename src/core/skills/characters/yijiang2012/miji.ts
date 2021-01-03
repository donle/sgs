import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'miji', description: 'miji_description' })
export class MiJi extends TriggerSkill {
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
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.LostHp > 0
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw {1} card(s)?',
      this.Name,
      owner.LostHp,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const x = from.LostHp;

    await room.drawCards(x, fromId, 'top', fromId, this.Name);
    if (from.getCardIds(PlayerCardsArea.HandArea).length >= x) {
      room.setFlag<number>(fromId, this.Name, x);

      const skillUseEvent = {
        invokeSkillNames: [MiJiShadow.Name],
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to give another player {1} hand card(s)?',
          this.Name,
          x,
        ).extract(),
      }
      room.notify(
        GameEventIdentifiers.AskForSkillUseEvent,
        skillUseEvent,
        fromId,
      );
      
      const { toIds, cardIds } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForSkillUseEvent,
        fromId,
      );
      room.removeFlag(fromId, this.Name);

      if (toIds && cardIds) {
        await room.moveCards({
          movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
          fromId,
          toId: toIds[0],
          moveReason: CardMoveReason.ActivePrey,
          toArea: CardMoveArea.HandArea,
          proposer: fromId,
          movedByReason: this.Name,
        })
      }
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: MiJi.Name, description: MiJi.Description })
export class MiJiShadow extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === owner.getFlag<number>(this.GeneralName);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
  ): boolean {
    const player = room.getPlayerById(owner)
    return selectedCards.length <= player.getFlag<number>(this.GeneralName);
  }

  public availableCardAreas(): PlayerCardsArea[] {
    return [PlayerCardsArea.HandArea];
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  async onTrigger() {
    return true;
  }

  async onEffect() {
    return true;
  }
}
