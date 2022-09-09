import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, OnDefineReleaseTiming, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'choutao', description: 'choutao_description' })
export class ChouTao extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim || stage === AimStage.AfterAimmed;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
    stage?: AllStage,
  ): boolean {
    if (Sanguosha.getCardById(event.byCardId).GeneralName !== 'slash') {
      return false;
    }

    if (stage === AimStage.AfterAim) {
      return (
        event.fromId === owner.Id &&
        event.isFirstTarget &&
        !!owner.getPlayerCards().find(cardId => room.canDropCard(owner.Id, cardId))
      );
    } else {
      return (
        event.fromId !== owner.Id &&
        event.toId === owner.Id &&
        room.getPlayerById(event.fromId).getPlayerCards().length > 0
      );
    }
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      `{0}: do you want to discard a card from {1} to set {2} Unoffsetable${
        event.fromId === owner.Id ? ' and restore your limit of using slash' : ''
      }?`,
      this.Name,
      TranslationPack.patchCardInTranslation(event.byCardId),
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const user = aimEvent.fromId;

    const userPlayer = room.getPlayerById(user);
    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: userPlayer.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: userPlayer.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId: event.fromId,
      toId: user,
      options,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, event.fromId, true, true);
    if (!response) {
      return false;
    }

    await room.dropCards(CardMoveReason.PassiveDrop, [response.selectedCard!], user, event.fromId, this.Name);

    EventPacker.setUnoffsetableEvent(aimEvent);

    if (user === event.fromId) {
      room.syncGameCommonRules(event.fromId, user => {
        room.CommonRules.addCardUsableTimes(new CardMatcher({ generalName: ['slash'] }), 1, user);
        user.addInvisibleMark(this.Name, 1);
      });
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ChouTao.Name, description: ChouTao.Description })
export class ChouTaoShadow extends TriggerSkill implements OnDefineReleaseTiming {
  get Muted() {
    return true;
  }

  public isFlaggedSkill() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.AfterStageChanged;
  }

  isAutoTrigger() {
    return true;
  }

  afterLosingSkill(room: Room) {
    return room.CurrentPlayerStage === PlayerPhaseStages.PlayCardStageEnd;
  }

  afterDead(room: Room) {
    return room.CurrentPlayerStage === PlayerPhaseStages.PlayCardStageEnd;
  }

  private clearChouTaoHistory(room: Room, from: Player) {
    const extraUse = from.getInvisibleMark(this.GeneralName);
    if (extraUse === 0) {
      return;
    }

    room.syncGameCommonRules(from.Id, user => {
      room.CommonRules.addCardUsableTimes(new CardMatcher({ generalName: ['slash'] }), -extraUse, user);
      user.removeInvisibleMark(this.GeneralName);
    });
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.toStage === PlayerPhaseStages.PlayCardStageEnd && owner.getInvisibleMark(this.GeneralName) > 0;
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    this.clearChouTaoHistory(room, room.getPlayerById(event.fromId));

    return true;
  }
}
