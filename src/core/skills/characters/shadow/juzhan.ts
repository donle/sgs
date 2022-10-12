import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import {
  CommonSkill,
  GlobalFilterSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  ShadowSkill,
  SwitchSkillState,
  TriggerSkill,
} from 'core/skills/skill';
import { SwitchSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@SwitchSkill()
@CommonSkill({ name: 'juzhan', description: 'juzhan_description' })
export class JuZhan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.toId === owner.Id &&
      content.fromId !== owner.Id &&
      content.byCardId !== undefined &&
      Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' &&
      !room.getPlayerById(content.fromId).Dead &&
      owner.getSwitchSkillState(this.Name, true) === SwitchSkillState.Yang
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw a card with {1} , then he cannot use card to you this round?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const user = (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).fromId;

    const players: PlayerId[] = [fromId, user];
    room.sortPlayersByPosition(players);
    for (const playerId of players) {
      await room.drawCards(1, playerId, 'top', fromId, this.Name);
    }

    const playerIds = room.getFlag<PlayerId[]>(fromId, this.Name) || [];
    if (!playerIds.includes(user)) {
      playerIds.push(user);
      room.setFlag<PlayerId[]>(fromId, this.Name, playerIds);
    }

    return true;
  }
}

@ShadowSkill
@SwitchSkill()
@CommonSkill({ name: JuZhan.Name, description: JuZhan.Description })
export class JuZhanYin extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const allTargets = AimGroupUtil.getAllTargets(content.allTargets);

    const canUse =
      content.fromId === owner.Id &&
      !!content.isFirstTarget &&
      content.byCardId !== undefined &&
      Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' &&
      owner.getSwitchSkillState(this.GeneralName, true) === SwitchSkillState.Yin &&
      allTargets.find(playerId => room.getPlayerById(playerId).getPlayerCards().length > 0) !== undefined;

    if (canUse) {
      room.setFlag<PlayerId[]>(owner.Id, this.Name, allTargets);
    }

    return canUse;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return (
      room.getFlag<PlayerId[]>(owner, this.Name).includes(targetId) &&
      room.getPlayerById(targetId).getPlayerCards().length > 0
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to prey a card from him, then you cannot use card to him this round?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const to = room.getPlayerById(toIds[0]);
    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    if (fromId === toIds[0]) {
      options[PlayerCardsArea.HandArea] = undefined;
    }

    const chooseCardEvent =
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>({
        fromId,
        toId: toIds[0],
        options,
      });

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      chooseCardEvent,
      fromId,
    );

    if (response.selectedCardIndex !== undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    } else if (response.selectedCard === undefined) {
      const cardIds = to.getPlayerCards();
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    await room.moveCards({
      movingCards: [{ card: response.selectedCard, fromArea: response.fromArea }],
      fromId: toIds[0],
      toId: fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      triggeredBySkills: [this.GeneralName],
    });

    const playerIds = room.getFlag<PlayerId[]>(fromId, this.GeneralName) || [];
    if (!playerIds.includes(toIds[0])) {
      playerIds.push(toIds[0]);
      room.setFlag<PlayerId[]>(fromId, this.GeneralName, playerIds);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JuZhanYin.Name, description: JuZhanYin.Description })
export class JuZhanShadow extends GlobalFilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public canUseCardTo(_: CardId | CardMatcher, __: Room, ___: Player, from: Player, to: Player): boolean {
    const fromTargets = from.getFlag<PlayerId[]>(this.GeneralName);
    const toTargets = to.getFlag<PlayerId[]>(this.GeneralName);
    return !(fromTargets && fromTargets.includes(to.Id)) && !(toTargets && toTargets.includes(from.Id));
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JuZhanShadow.Name, description: JuZhanShadow.Description })
export class JuZhanRemove extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.from === PlayerPhase.PhaseFinish && owner.getFlag<PlayerId[]>(this.GeneralName) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
