import { VirtualCard } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shuimeng', description: 'shuimeng_description' })
export class ShuiMeng extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PlayCardStageEnd &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.canPindian(owner, target);
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to pindian?',
      this.Name,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    if (!event.toIds) {
      return false;
    }

    const pindianEvent = await room.pindian(fromId, event.toIds, this.Name);
    if (pindianEvent.pindianRecord[0].winner === fromId) {
      const from = room.getPlayerById(fromId);
      const virtualWuZhong = VirtualCard.create({ cardName: 'wuzhongshengyou', bySkill: this.Name }).Id;
      room.canUseCardTo(virtualWuZhong, from, from) &&
        (await room.useCard({
          fromId,
          cardId: virtualWuZhong,
        }));
    } else {
      const virtualGuoHe = VirtualCard.create({ cardName: 'guohechaiqiao', bySkill: this.Name }).Id;
      room.getPlayerById(event.toIds[0]).canUseCardTo(room, virtualGuoHe, fromId) &&
        (await room.useCard({
          fromId: event.toIds[0],
          targetGroup: [[fromId]],
          cardId: virtualGuoHe,
        }));
    }

    return true;
  }
}
