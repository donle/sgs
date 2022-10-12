import { ManSi } from './mansi';
import { XiLi } from './xili';
import { CharacterGender } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, CardMoveStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { AwakeningSkill, CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@AwakeningSkill({ name: 'zhanyuan', description: 'zhanyuan_description' })
export class ZhanYuan extends TriggerSkill implements OnDefineReleaseTiming {
  public get RelatedSkills(): string[] {
    return [XiLi.Name];
  }

  public async whenObtainingSkill(room: Room, player: Player) {
    if (player.hasUsedSkill(this.Name)) {
      return;
    }

    const drawnNum = room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        !!event.infos.find(
          info =>
            info.toId === player.Id &&
            info.toArea === PlayerCardsArea.HandArea &&
            info.triggeredBySkills?.includes(ManSi.Name),
        ),
    ).reduce<number>((sum, record) => {
      for (const info of record.infos) {
        sum += info.movingCards.filter(cardInfo => !cardInfo.asideMove).length;
      }

      return sum;
    }, 0);

    drawnNum > 0 &&
      room.setFlag<number>(
        player.Id,
        this.Name,
        drawnNum,
        TranslationPack.translationJsonPatcher('mansi: {0}', drawnNum).toString(),
      );
  }

  public async whenLosingSkill(room: Room, player: Player) {
    room.removeFlag(player.Id, this.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      room.enableToAwaken(this.Name, owner)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.changeMaxHp(event.fromId, 1);
    await room.recover({
      toId: event.fromId,
      recoveredHp: 1,
      recoverBy: event.fromId,
    });

    const targets = room
      .getOtherPlayers(event.fromId)
      .filter(player => player.Gender === CharacterGender.Male)
      .map(player => player.Id);
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: targets,
        toId: event.fromId,
        requiredAmount: 1,
        conversation: 'zhanyuan: do you want to choose another male character to gain ‘Xi Li’ with him?',
        triggeredBySkills: [this.Name],
      },
      event.fromId,
    );

    if (response.selectedPlayers && response.selectedPlayers.length > 0) {
      for (const toId of [event.fromId, response.selectedPlayers[0]]) {
        await room.obtainSkill(toId, this.RelatedSkills[0], true);
      }

      await room.loseSkill(event.fromId, ManSi.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ZhanYuan.Name, description: ZhanYuan.Description })
export class ZhanYuanShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return !!content.infos.find(
      info =>
        info.toId === owner.Id &&
        info.toArea === PlayerCardsArea.HandArea &&
        info.triggeredBySkills?.includes(ManSi.Name),
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    let originalNum = room.getFlag<number>(event.fromId, this.GeneralName) || 0;
    for (const info of (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos) {
      if (
        info.toId === event.fromId &&
        info.toArea === PlayerCardsArea.HandArea &&
        info.triggeredBySkills?.includes(ManSi.Name)
      ) {
        originalNum += info.movingCards.filter(cardInfo => !cardInfo.asideMove).length;
      }
    }

    room.setFlag<number>(
      event.fromId,
      this.GeneralName,
      originalNum,
      TranslationPack.translationJsonPatcher('mansi: {0}', originalNum).toString(),
    );

    return true;
  }
}
