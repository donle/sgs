import { CardType } from 'core/cards/card';
import { CharacterEquipSections } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerDyingStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zuici', description: 'zuici_description' })
export class ZuiCi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PlayerDyingEvent>,
    stage?: AllStage,
  ): boolean {
    if (stage === PhaseStageChangeStage.StageChanged) {
      return (
        (event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).toStage ===
        PlayerPhaseStages.PrepareStage
      );
    }

    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PlayerDyingEvent>,
    stage?: AllStage,
  ): boolean {
    if (owner.getCardIds(PlayerCardsArea.EquipArea).length === 0) {
      return false;
    }

    if (stage === PhaseStageChangeStage.StageChanged) {
      return room.CurrentPlayer.Id === owner.Id;
    }

    return (content as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).dying === owner.Id;
  }

  public async onTrigger() {
    return true;
  }

  private readonly equipSectionToCardTypeMapper = {
    [CharacterEquipSections.Weapon]: CardType.Weapon,
    [CharacterEquipSections.Shield]: CardType.Shield,
    [CharacterEquipSections.DefenseRide]: CardType.DefenseRide,
    [CharacterEquipSections.OffenseRide]: CardType.OffenseRide,
    [CharacterEquipSections.Precious]: CardType.Precious,
  };

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const identifier = GameEventIdentifiers.AskForChoosingOptionsEvent;
    const options = from.AvailableEquipSections.filter(
      section => from.getEquipment(this.equipSectionToCardTypeMapper[section]) !== undefined,
    );

    const askforAbortions: ServerEventFinder<typeof identifier> = {
      options,
      toId: fromId,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose and abort an equip section',
        this.Name,
      ).extract(),
      triggeredBySkills: [this.Name],
    };
    room.notify(identifier, askforAbortions, fromId);
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(identifier, fromId);

    if (!selectedOption) {
      return false;
    }

    await room.abortPlayerEquipSections(fromId, selectedOption as CharacterEquipSections);
    await room.recover({
      toId: fromId,
      recoveredHp: 2,
      recoverBy: fromId,
      triggeredBySkills: [this.Name],
    });

    const markedPlayer = room.getOtherPlayers(fromId).find(player => player.getMark(MarkEnum.Fu) > 0);
    const players = room
      .getOtherPlayers(fromId)
      .filter(player => player !== markedPlayer)
      .map(player => player.Id);

    if (players.length === 0) {
      return true;
    }

    const askForTransferMark: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      toId: fromId,
      players,
      requiredAmount: 1,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose another player to transfer the "fu" mark',
        this.Name,
      ).extract(),
      triggeredBySkills: [this.Name],
    };

    room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, askForTransferMark, fromId);
    const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      fromId,
    );

    if (selectedPlayers?.[0]) {
      if (markedPlayer) {
        await room.removeMark(markedPlayer.Id, MarkEnum.Fu);
      }
      await room.addMark(selectedPlayers[0], MarkEnum.Fu, 1);
    }

    return true;
  }
}
