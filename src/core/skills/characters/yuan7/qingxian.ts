import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, RecoverEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qingxian', description: 'qingxian_description' })
export class QingXian extends TriggerSkill {
  private readonly QingXianOptions = ['qingxian:loseHp', 'qingxian:recover'];

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === RecoverEffectStage.AfterRecoverEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent>,
  ): boolean {
    if (content.toId !== owner.Id || room.AlivePlayers.find(player => player.Dying)) {
      return false;
    }

    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.DamageEvent) {
      const source = (content as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId;
      return !!source && !room.getPlayerById(source).Dead;
    }

    return true;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent
    >;
    const isDamageEvent = EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.DamageEvent;

    let toId: PlayerId | undefined;
    if (isDamageEvent) {
      toId = (unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId;
    } else {
      const { selectedPlayers } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: room.getOtherPlayers(event.fromId).map(player => player.Id),
          toId: event.fromId,
          requiredAmount: 1,
          conversation: 'qingxian: do you want to choose a target to use this skill?',
          triggeredBySkills: [this.Name],
        },
        event.fromId,
      );

      if (selectedPlayers && selectedPlayers.length > 0) {
        toId = selectedPlayers[0];
      }
    }

    if (!toId) {
      return false;
    }

    const options = [this.QingXianOptions[0]];
    room.getPlayerById(toId).LostHp > 0 && options.push(this.QingXianOptions[1]);
    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose qingxian options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      isDamageEvent,
    );

    isDamageEvent && (resp.selectedOption = resp.selectedOption || this.QingXianOptions[0]);

    if (resp.selectedOption) {
      EventPacker.addMiddleware({ tag: this.Name, data: resp.selectedOption }, event);
      event.toIds = [toId];
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }
    const toId = event.toIds[0];

    let isClub = false;
    if (EventPacker.getMiddleware<string>(this.Name, event) === this.QingXianOptions[0]) {
      await room.loseHp(toId, 1);
      const equips = room.findCardsByMatcherFrom(new CardMatcher({ type: [CardType.Equip] }));
      if (equips.length > 0) {
        const randomEquip = equips[Math.floor(Math.random() * equips.length)];
        await room.useCard({
          fromId: toId,
          targetGroup: [[toId]],
          cardId: randomEquip,
          customFromArea: CardMoveArea.DrawStack,
        });

        isClub = Sanguosha.getCardById(randomEquip).Suit === CardSuit.Club;
      }
    } else {
      await room.recover({
        toId,
        recoveredHp: 1,
        recoverBy: event.fromId,
      });

      const playerEquips = room
        .getPlayerById(toId)
        .getPlayerCards()
        .filter(cardId => Sanguosha.getCardById(cardId).is(CardType.Equip));
      if (playerEquips.length > 0) {
        const randomEquip = playerEquips[Math.floor(Math.random() * playerEquips.length)];
        await room.dropCards(CardMoveReason.SelfDrop, [randomEquip], toId, toId, this.Name);
        isClub = Sanguosha.getCardById(randomEquip).Suit === CardSuit.Club;
      }
    }

    isClub && (await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name));

    return true;
  }
}
