import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, LevelBeginStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { System } from 'core/shares/libs/system';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, LimitSkill, SideEffectSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'pve_longshen_qifu', description: 'pve_longshen_qifu_description' })
export class PveLongShenQiFu extends TriggerSkill implements OnDefineReleaseTiming {
  isAutoTrigger() {
    return true;
  }

  isFlaggedSkill() {
    return true;
  }

  async whenLosingSkill(room: Room) {
    room.uninstallSideEffectSkill(System.SideEffectSkillApplierEnum.PveLongShenQiFu);
  }

  async whenObtainingSkill(room: Room, owner: Player) {
    room.installSideEffectSkill(System.SideEffectSkillApplierEnum.PveLongShenQiFu, PveLongShenQiFu.Name, owner.Id);
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.LevelBeginEvent>, stage?: AllStage) {
    return stage === LevelBeginStage.LevelBegining;
  }

  canUse() {
    return true;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    event.translationsMessage = undefined;
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    console.log('pve longsheng qifu trigger');
    room.installSideEffectSkill(
      System.SideEffectSkillApplierEnum.PveLongShenQiFu,
      PveLongShenQiFuReward.Name,
      event.fromId,
    );

    room
      .getOtherPlayers(event.fromId)
      .map(player => room.refreshPlayerOnceSkill(player.Id, PveLongShenQiFuReward.Name));

    return true;
  }
}

@SideEffectSkill
@LimitSkill({ name: PveLongShenQiFu.Name, description: PveLongShenQiFu.Description })
export class PveLongShenQiFuReward extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    console.log(`owner is ${owner.Name}`);
    return true;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget() {
    return false;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const skills = room
      .getPlayerById(event.fromId)
      .getPlayerSkills()
      .filter(skill => !skill.isShadowSkill());

    if (skills.length > 3) {
      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: skills.map(skill => skill.Name),
        toId: event.fromId,
        conversation: 'please announce a skill',
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          askForChoosingOptionsEvent,
        ),
        event.fromId,
      );

      const chooseResp = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        event.fromId,
      );
      room.loseSkill(event.fromId, chooseResp.selectedOption!);
    }

    const characters = room.getRandomCharactersFromLoadedPackage(5);
    room.notify(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      {
        amount: 1,
        characterIds: characters,
        toId: event.fromId,
        byHuaShen: true,
        triggeredBySkills: [this.Name],
        translationsMessage: TranslationPack.translationJsonPatcher(
          'Please choose a character for get a skill',
        ).extract(),
      },
      event.fromId,
    );

    const { chosenCharacterIds } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      event.fromId,
    );

    const options = Sanguosha.getCharacterById(chosenCharacterIds[0])
      .Skills.filter(skill => !(skill.isShadowSkill() || skill.isLordSkill()))
      .map(skill => skill.GeneralName);

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: event.fromId,
      conversation: 'please announce a skill',
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
      event.fromId,
    );

    const chooseResp = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      event.fromId,
    );
    room.obtainSkill(event.fromId, chooseResp.selectedOption!);

    return true;
  }
}
