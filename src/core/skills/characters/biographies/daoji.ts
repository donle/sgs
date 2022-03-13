import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FilterSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'daoji', description: 'daoji_description' })
export class DaoJi extends TriggerSkill implements OnDefineReleaseTiming {
  private DaoJiOptions = ['daoji:prey', 'daoji:block'];

  public async whenObtainingSkill(room: Room, owner: Player) {
    const players = owner.getFlag<PlayerId[]>(this.Name) || [];
    for (const other of room.getOtherPlayers(owner.Id)) {
      if (
        !players.includes(other.Id) &&
        room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
          event =>
            EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent &&
            event.fromId === other.Id &&
            Sanguosha.getCardById(event.cardId).is(CardType.Weapon),
          undefined,
          undefined,
          undefined,
          1,
        ).length > 0
      ) {
        players.push(other.Id);
      }
    }

    owner.setFlag<PlayerId[]>(this.Name, players);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === CardUseStage.BeforeCardUseEffect;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing || stage === CardUseStage.BeforeCardUseEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    const players = owner.getFlag<PlayerId[]>(this.Name) || [];
    if (
      stage === CardUseStage.BeforeCardUseEffect &&
      content.fromId !== owner.Id &&
      Sanguosha.getCardById(content.cardId).is(CardType.Weapon) &&
      !players.includes(content.fromId)
    ) {
      players.push(content.fromId);
      owner.setFlag<PlayerId[]>(this.Name, players);
      EventPacker.addMiddleware({ tag: this.Name, data: true }, content);
    }

    return stage === CardUseStage.CardUsing && EventPacker.getMiddleware<boolean>(this.Name, content) === true;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const options = this.DaoJiOptions.slice();
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    !room.isCardOnProcessing(cardUseEvent.cardId) && options.shift();

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose daoji options: {1} {2}',
          this.Name,
          TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(cardUseEvent.fromId)),
        ).extract(),
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
    const chosen = EventPacker.getMiddleware<string>(this.Name, event);

    if (chosen === this.DaoJiOptions[0]) {
      await room.moveCards({
        movingCards: [
          {
            card: (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId,
            fromArea: CardMoveArea.ProcessingArea,
          },
        ],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        proposer: event.fromId,
        moveReason: CardMoveReason.ActivePrey,
        triggeredBySkills: [this.Name],
      });
    } else {
      const user = room.getPlayerById(
        (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId,
      );
      user.hasShadowSkill(DaoJiDebuff.Name) || (await room.obtainSkill(user.Id, DaoJiDebuff.Name));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_daoji_debuff', description: 's_daoji_debuff_description' })
export class DaoJiDebuff extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    return cardId instanceof CardMatcher
      ? !cardId.match(new CardMatcher({ generalName: ['slash'] }))
      : Sanguosha.getCardById(cardId).GeneralName !== 'slash';
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_daoji_remover', description: 's_daoji_remover_description' })
export class DaoJiRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, owner: Player) {
    owner.hasShadowSkill(DaoJiDebuff.Name) && (await room.loseSkill(owner.Id, DaoJiDebuff.Name));
    await room.loseSkill(owner.Id, this.Name);
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
    return event.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.getPlayerById(event.fromId).hasShadowSkill(DaoJiDebuff.Name) &&
      (await room.loseSkill(event.fromId, DaoJiDebuff.Name));
    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}
