import { Card, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { CharacterNationality } from 'core/characters/character';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, LordSkill, ShadowSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jijiang', description: 'jijiang_description' })
@LordSkill
export class JiJiang extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['slash'];
  }
  public canUse(room: Room, owner: Player) {
    return (
      owner.canUseCard(room, new CardMatcher({ generalName: ['slash'] })) &&
      room.getAlivePlayersFrom().filter(player => player.Nationality === CharacterNationality.Shu && player !== owner)
        .length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }
  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return false;
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<Slash>({
      cardName: 'slash',
      bySkill: this.Name,
    });
  }
}

@ShadowSkill
@LordSkill
@CommonSkill({ name: JiJiang.Name, description: JiJiang.Description })
export class JiJiangShadow extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === CardUseStage.PreCardUse || stage === CardResponseStage.PreCardResponse) &&
      Card.isVirtualCardId(event.cardId)
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    return (
      content.fromId === owner.Id &&
      Sanguosha.getCardById<VirtualCard>(content.cardId).findByGeneratedSkill(this.GeneralName)
    );
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const jijiangEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;

    const from = room.getPlayerById(event.fromId);
    let success = false;
    for (const player of room.getAlivePlayersFrom()) {
      if (player.Id === event.fromId || player.Nationality !== CharacterNationality.Shu) {
        continue;
      }

      const response = await room.askForCardResponse(
        {
          cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
          toId: player.Id,
          conversation: TranslationPack.translationJsonPatcher(
            'do you wanna response a {0} card for skill {1} from {2}',
            'slash',
            this.Name,
            TranslationPack.patchPlayerInTranslation(from),
          ).extract(),
        },
        player.Id,
      );

      if (response.cardId !== undefined) {
        await room.responseCard({
          fromId: player.Id,
          cardId: response.cardId,
          triggeredBySkills: [this.Name],
          skipDrop: true,
        });

        jijiangEvent.cardId = response.cardId;
        success = true;
        break;
      }
    }

    if (!success) {
      EventPacker.terminate(jijiangEvent);
    }

    return true;
  }
}
