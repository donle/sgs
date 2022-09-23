import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yusui', description: 'yusui_description' })
export class YuSui extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      event.fromId !== owner.Id &&
      event.toId === owner.Id &&
      !owner.hasUsedSkill(this.Name) &&
      owner.Hp > 0 &&
      Sanguosha.getCardById(event.byCardId).isBlack()
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.loseHp(event.fromId, 1);

    const from = room.getPlayerById(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).fromId,
    );
    if (!from.Dead) {
      const options: string[] = [];

      from.getCardIds(PlayerCardsArea.HandArea).length >
        room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea).length && options.push('yusui:discard');
      from.Hp > room.getPlayerById(event.fromId).Hp && options.push('yusui:loseHp');

      if (options.length > 0) {
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          {
            options,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please choose yusui options: {1}',
              this.Name,
              TranslationPack.patchPlayerInTranslation(from),
            ).extract(),
            toId: event.fromId,
            triggeredBySkills: [this.Name],
          },
          event.fromId,
          true,
        );

        response.selectedOption = response.selectedOption || options[0];

        if (response.selectedOption === 'yusui:discard') {
          const resp = await room.askForCardDrop(
            from.Id,
            from.getCardIds(PlayerCardsArea.HandArea).length -
              room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea).length,
            [PlayerCardsArea.HandArea],
            true,
            undefined,
            this.Name,
          );
          resp.droppedCards.length > 0 &&
            (await room.dropCards(CardMoveReason.SelfDrop, resp.droppedCards, from.Id, from.Id, this.Name));
        } else {
          await room.loseHp(from.Id, from.Hp - room.getPlayerById(event.fromId).Hp);
        }
      }
    }

    return true;
  }
}
