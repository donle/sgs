import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterEquipSections } from 'core/characters/character';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jueyan', description: 'jueyan_description' })
export class JueYan extends ActiveSkill {
  public get RelatedSkills(): string[] {
    return ['jizhi'];
  }

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.AvailableEquipSections.length > 0;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);

    const options = from.AvailableEquipSections.filter(
      section => !(section === CharacterEquipSections.DefenseRide || section === CharacterEquipSections.OffenseRide),
    ).map(section => String(section));
    if (options.length < from.AvailableEquipSections.length) {
      const index = options.findIndex(section => section === CharacterEquipSections.Precious);
      index !== -1 ? options.splice(options.length - 1, 0, 'ride section') : options.push('ride section');
    }

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options,
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose and abort an equip section',
          this.Name,
        ).extract(),
      }),
      fromId,
    );

    response.selectedOption = response.selectedOption || options[0];

    let setFlag = true;
    if (response.selectedOption === 'ride section') {
      await room.abortPlayerEquipSections(
        fromId,
        CharacterEquipSections.DefenseRide,
        CharacterEquipSections.OffenseRide,
      );
    } else {
      await room.abortPlayerEquipSections(fromId, response.selectedOption as CharacterEquipSections);
      if (response.selectedOption === CharacterEquipSections.Shield) {
        await room.drawCards(3, fromId, 'top', fromId, this.Name);
      } else if (response.selectedOption === CharacterEquipSections.Precious) {
        if (!from.hasSkill('jizhi')) {
          await room.obtainSkill(fromId, 'jizhi', true);
        } else {
          setFlag = false;
        }
      }
    }

    if (setFlag) {
      const originalBuff = from.getFlag<string[]>(this.Name) || [];
      originalBuff.push(response.selectedOption);
      room.setFlag<string[]>(fromId, this.Name, originalBuff);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JueYan.Name, description: JueYan.Description })
export class JueYanBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    return owner.getFlag<string[]>(this.GeneralName)?.includes('ride section') ? INFINITE_DISTANCE : 0;
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!owner.getFlag<string[]>(this.GeneralName)?.includes(CharacterEquipSections.Weapon)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return 3;
    } else {
      return 0;
    }
  }

  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    return owner.getFlag<string[]>(this.GeneralName)?.includes(CharacterEquipSections.Shield) ? 3 : 0;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JueYanBuff.Name, description: JueYanBuff.Description })
export class JueYanRemove extends TriggerSkill implements OnDefineReleaseTiming {
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
    const sections = owner.getFlag<string[]>(this.GeneralName);
    if (!sections || sections.length === 0) {
      return false;
    }

    return (
      (owner.Id === event.fromPlayer &&
        event.from === PlayerPhase.PlayCardStage &&
        sections.find(section => section !== CharacterEquipSections.Shield) !== undefined) ||
      (event.from === PlayerPhase.PhaseFinish && sections.includes(CharacterEquipSections.Shield))
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const phaseFrom = (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).from;
    const sections = room.getFlag<string[]>(fromId, this.GeneralName);

    let newSections: string[];
    if (phaseFrom === PlayerPhase.PlayCardStage) {
      newSections = sections.filter(section => section === CharacterEquipSections.Shield);
      if (newSections.length === 0) {
        room.removeFlag(fromId, this.GeneralName);
      } else {
        room.setFlag<string[]>(fromId, this.GeneralName, newSections);
      }
      if (sections.includes(CharacterEquipSections.Precious) && room.getPlayerById(fromId).hasSkill('jizhi')) {
        await room.loseSkill(fromId, 'jizhi', true);
      }
    } else {
      room.removeFlag(fromId, this.GeneralName);
    }

    return true;
  }
}
