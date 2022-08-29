import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardColor, CardId, CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { FilterSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhente', description: 'zhente_description' })
export class ZhenTe extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.toId === owner.Id &&
      content.fromId !== owner.Id &&
      !owner.hasUsedSkill(this.Name) &&
      !room.getPlayerById(content.fromId).Dead &&
      Sanguosha.getCardById(content.byCardId).Color !== CardColor.None &&
      (Sanguosha.getCardById(content.byCardId).is(CardType.Basic) ||
        Sanguosha.getCardById(content.byCardId).isCommonTrick())
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to use this skill to {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const options = ['zhente:ban', 'zhente:nullify'];

    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const user = aimEvent.fromId;
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose zhente options: {1} {2} {3}',
          this.Name,
          Functional.getCardColorRawText(Sanguosha.getCardById(aimEvent.byCardId).Color),
          TranslationPack.patchCardInTranslation(aimEvent.byCardId),
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        ).extract(),
        toId: user,
        triggeredBySkills: [this.Name],
      },
      user,
      true,
    );

    response.selectedOption = response.selectedOption || options[1];

    if (response.selectedOption === options[0]) {
      const bannedColors = room.getFlag<CardColor[]>(user, this.Name) || [];
      const newColor = Sanguosha.getCardById(aimEvent.byCardId).Color;
      if (!bannedColors.includes(newColor)) {
        bannedColors.push(newColor);
        room.getPlayerById(user).setFlag<CardColor[]>(this.Name, bannedColors);
      }

      for (const skillName of [ZhenTeBlocker.Name, ZhenTeRemover.Name]) {
        room.getPlayerById(user).hasShadowSkill(skillName) || (await room.obtainSkill(user, skillName));
      }
    } else {
      aimEvent.nullifiedTargets = aimEvent.nullifiedTargets || [];
      aimEvent.nullifiedTargets.push(event.fromId);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_zhente_blocker', description: 's_zhente_blocker_description' })
export class ZhenTeBlocker extends FilterSkill {
  public canUseCard(
    cardId: CardId | CardMatcher,
    room: Room,
    owner: PlayerId,
    onResponse?: ServerEventFinder<GameEventIdentifiers>,
    isCardResponse?: boolean,
  ): boolean {
    const colors = room.getFlag<CardColor[]>(owner, ZhenTe.Name);
    if (colors === undefined || isCardResponse) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      const suits = colors.includes(CardColor.Black) ? [CardSuit.Spade, CardSuit.Club] : [];
      colors.includes(CardColor.Red) && suits.push(CardSuit.Diamond, CardSuit.Heart);
      return !cardId.match(new CardMatcher({ suit: suits }));
    } else {
      return !colors.includes(Sanguosha.getCardById(cardId).Color);
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_zhente_remover', description: 's_zhente_remover_description' })
export class ZhenTeRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    room.removeFlag(player.Id, ZhenTe.Name);
    await room.loseSkill(player.Id, this.Name);
    player.hasShadowSkill(ZhenTeBlocker.Name) && (await room.loseSkill(player.Id, ZhenTeBlocker.Name));
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
    return event.from === PlayerPhase.PhaseFinish && owner.getFlag<CardColor[]>(ZhenTe.Name) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, ZhenTe.Name);
    await room.loseSkill(event.fromId, this.Name);
    room.getPlayerById(event.fromId).hasShadowSkill(ZhenTeBlocker.Name) &&
      (await room.loseSkill(event.fromId, ZhenTeBlocker.Name));

    return true;
  }
}
