import { VirtualCard } from 'core/cards/card';
import { FireSlash } from 'core/cards/legion_fight/fire_slash';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'lihuo', description: 'lihuo_description' })
export class LiHuo extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardUseDeclared;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return Sanguosha.getCardById(event.cardId).Name === 'slash' && owner.Id === event.fromId;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to transfrom {1} into fire slash?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const { cardId } = cardUseEvent;

    const fireSlash = VirtualCard.create<FireSlash>(
      {
        cardName: 'fire_slash',
        bySkill: this.Name,
      },
      [cardId],
    );
    cardUseEvent.cardId = fireSlash.Id;
    room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, transfrom {2} into {3}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        this.Name,
        TranslationPack.patchCardInTranslation(cardId),
        TranslationPack.patchCardInTranslation(fireSlash.Id),
      ).extract(),
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: LiHuo.Name, description: LiHuo.Description })
export class LiHuoShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardTargetDeclared;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      Sanguosha.getCardById(event.cardId).Name === 'fire_slash' &&
      owner.Id === event.fromId &&
      room.getOtherPlayers(owner.Id).find(player => {
        return room.canAttack(owner, player, event.cardId) && !event.toIds!.includes(player.Id);
      }) !== undefined
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const from = room.getPlayerById(fromId);

    const players = room
      .getAlivePlayersFrom()
      .filter(player => room.canAttack(from, player, cardUseEvent.cardId) && !cardUseEvent.toIds?.includes(player.Id))
      .map(player => player.Id);

    if (players.length < 1) {
      return false;
    }

    const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      toId: fromId,
      players,
      requiredAmount: 1,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose a target to be the additional target of {1}',
        this.GeneralName,
        TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
      ).extract(),
      triggeredBySkills: [this.GeneralName],
    };

    room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, askForPlayerChoose, fromId);

    const resp = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingPlayerEvent, fromId);
    if (!resp.selectedPlayers) {
      return false;
    }

    event.toIds = resp.selectedPlayers;

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds, triggeredOnEvent } = event;
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    cardUseEvent.toIds?.push(toIds![0]);
    room.sortPlayersByPosition(cardUseEvent.toIds!);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: LiHuoShadow.Name, description: LiHuoShadow.Description })
export class LiHuoLoseHp extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    let isLiHuo = false;
    const card = Sanguosha.getCardById(content.cardId);
    if (card.isVirtualCard()) {
      const vCard = card as VirtualCard;
      isLiHuo = vCard.findByGeneratedSkill(this.GeneralName);
    }

    return content.fromId === owner.Id && isLiHuo && EventPacker.getDamageSignatureInCardUse(content);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.loseHp(event.fromId, 1);

    return true;
  }
}
