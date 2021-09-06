import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FilterSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jilei', description: 'jilei_description' })
export class JiLei extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return content.toId === owner.Id && content.fromId !== undefined && !room.getPlayerById(content.fromId).Dead;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to make {1} jilei until the start of his next turn?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId!)),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const source = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!;

    const options = ['basic card', 'trick card', 'equip card'];
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose jilei options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(source)),
        ).extract(),
        toId: fromId,
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    const originalTypes = room.getFlag<CardType[]>(source, this.Name) || [];
    const typeNameMapper = {
      [options[0]]: CardType.Basic,
      [options[1]]: CardType.Trick,
      [options[2]]: CardType.Equip,
    };
    const type = typeNameMapper[response.selectedOption];
    if (!originalTypes.includes(type)) {
      originalTypes.push(type);
      room.setFlag<CardType[]>(source, this.Name, originalTypes, this.Name);
      room.getPlayerById(source).hasShadowSkill(JiLeiBlocker.Name) ||
        (await room.obtainSkill(source, JiLeiBlocker.Name));
      room.getPlayerById(source).hasShadowSkill(JiLeiRemove.Name) || (await room.obtainSkill(source, JiLeiRemove.Name));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_jilei_blocker', description: 's_jilei_blocker_description' })
export class JiLeiBlocker extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    const types = room.getFlag<CardType[]>(owner, JiLei.Name);
    if (!types) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? true
      : room.getPlayerById(owner).cardFrom(cardId) !== PlayerCardsArea.HandArea ||
          !types.includes(Sanguosha.getCardById(cardId).BaseType);
  }

  public canDropCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    const types = room.getFlag<CardType[]>(owner, JiLei.Name);
    if (!types) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? true
      : room.getPlayerById(owner).cardFrom(cardId) !== PlayerCardsArea.HandArea ||
          !types.includes(Sanguosha.getCardById(cardId).BaseType);
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_jilei_remove', description: 's_jilei_remove_description' })
export class JiLeiRemove extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    room.removeFlag(player.Id, JiLei.Name);
    await room.loseSkill(player.Id, this.Name);
    player.hasShadowSkill(JiLeiBlocker.Name) && (await room.loseSkill(player.Id, JiLeiBlocker.Name));
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.toPlayer &&
      event.to === PlayerPhase.PhaseBegin &&
      owner.getFlag<number>(JiLei.Name) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, JiLei.Name);

    await room.loseSkill(event.fromId, this.Name);
    room.getPlayerById(event.fromId).hasShadowSkill(JiLeiBlocker.Name) &&
      (await room.loseSkill(event.fromId, JiLeiBlocker.Name));

    return true;
  }
}
