import { CardType, VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import {
  CommonSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  ShadowSkill,
  TriggerSkill,
  ViewAsSkill,
} from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { WuKu } from './wuku';

@CommonSkill({ name: 'miewu', description: 'miewu_description' })
export class MieWu extends ViewAsSkill {
  public canViewAs(): string[] {
    return Sanguosha.getCardNameByType(types => types.includes(CardType.Basic) || types.includes(CardType.Trick));
  }

  isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PhaseBegin;
  }

  public canUse(room: Room, owner: Player): boolean {
    const wuku = owner.getFlag<number>(WuKu.Name) || 0;
    return !owner.hasUsedSkill(this.Name) && wuku > 0 && owner.getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea];
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown miewu card');
    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: MieWu.Name, description: MieWu.Description })
export class MieWuShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.PreCardUse || stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    const card = Sanguosha.getCardById(content.cardId);
    const canUse =
      content.fromId === owner.Id &&
      card.isVirtualCard() &&
      (card as VirtualCard).findByGeneratedSkill(this.GeneralName);

    if (canUse && stage) {
      owner.setFlag<AllStage>(this.GeneralName, stage);
    }

    return canUse;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const stage = room.getPlayerById(fromId).getFlag<AllStage>(this.GeneralName);

    if (stage === CardUseStage.CardUseFinishedEffect) {
      await room.drawCards(1, fromId, 'top', fromId, this.GeneralName);
    } else {
      let wuku = room.getFlag<number>(fromId, WuKu.Name);
      if (wuku && wuku > 0) {
        wuku--;
        if (wuku > 0) {
          room.setFlag<number>(
            fromId,
            WuKu.Name,
            wuku,
            TranslationPack.translationJsonPatcher('wuku: {0}', wuku).toString(),
          );
        } else {
          room.removeFlag(fromId, WuKu.Name);
        }
      }
    }

    return true;
  }
}
