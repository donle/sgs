import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardLostReason,
  CardObtainedReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, CompulsorySkill, FilterSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class YiJue extends ActiveSkill {
  constructor() {
    super('yijue', 'yijue_description');
  }

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.name);
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, cardIds } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    const to = room.getPlayerById(toIds![0]);

    await room.dropCards(CardLostReason.ActiveDrop, cardIds!, fromId, fromId, this.name);

    const askForDisplayCardEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardDisplayEvent>({
      cardMatcher: new CardMatcher({}).toSocketPassenger(),
      cardAmount: 1,
      toId: to.Id,
      triggeredBySkills: [this.name],
      conversation: TranslationPack.translationJsonPatcher(
        '{0} used skill {1} to you, please present a hand card',
        TranslationPack.patchPlayerInTranslation(from),
        this.name,
      ).extract(),
    });
    room.notify(GameEventIdentifiers.AskForCardDisplayEvent, askForDisplayCardEvent, to.Id);
    const { selectedCards } = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForCardDisplayEvent,
      to.Id,
    );

    room.broadcast(GameEventIdentifiers.CardDisplayEvent, {
      displayCards: selectedCards,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1} from {2}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(...selectedCards),
        TranslationPack.patchPlayerInTranslation(to),
      ).extract(),
    });

    const card = Sanguosha.getCardById(selectedCards[0]);
    if (card.isBlack()) {
      room.obtainSkill(to.Id, `#${this.name}Blocker`);
      from.addInvisibleMark(this.name, 1);
      room.setFlag(to.Id, this.name, true);
    } else {
      await room.moveCards(
        selectedCards,
        to.Id,
        from.Id,
        CardLostReason.PassiveMove,
        PlayerCardsArea.HandArea,
        PlayerCardsArea.HandArea,
        CardObtainedReason.ActivePrey,
        from.Id,
        this.name,
      );

      const askForChooseEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: ['yijue:recover', 'yijue:cancel'],
        toId: from.Id,
        conversation: TranslationPack.translationJsonPatcher(
          'recover {0} hp for {1}',
          1,
          TranslationPack.patchPlayerInTranslation(to),
        ).extract(),
      };
      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, from.Id);
      const { selectedOption } = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        from.Id,
      );
      if (selectedOption === 'yijue:recover') {
        await room.recover({
          recoveredHp: 1,
          recoverBy: from.Id,
          toId: to.Id,
        });
      }
    }

    return true;
  }
}

@CompulsorySkill
@ShadowSkill({ remainStatus: true })
export class YiJueShadow extends TriggerSkill {
  constructor() {
    super('yijue', 'yijue_description');
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ) {
    return stage === DamageEffectStage.DamageEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      return owner.Id === (content as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return owner.Id === content.fromPlayer && content.from === PlayerPhase.FinishStage;
    }
    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId } = skillUseEvent;
    const identifier = EventPacker.getIdentifier(
      triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
    );
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const content = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      const card = content.cardIds && Sanguosha.getCardById(content.cardIds[0]);
      if (card?.GeneralName === 'slash' && card.isRed()) {
        content.damage = content.damage + 1;
      }
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      room.getPlayerById(fromId).removeInvisibleMark(this.GeneralName);
      for (const player of room.AlivePlayers) {
        room.removeFlag(player.Id, this.GeneralName);
        if (player.hasSkill(`${this.name}Blocker`)) {
          room.loseSkill(player.Id, `${this.name}Blocker`);
        }
      }
    }
    return true;
  }
}

@CompulsorySkill
@ShadowSkill()
export class YiJueBlocker extends FilterSkill {
  constructor() {
    super('yijueBlocker', 'yijueBlocker_description');
  }

  canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId) {
    return false;
  }
}
