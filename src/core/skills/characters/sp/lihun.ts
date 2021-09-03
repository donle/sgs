import { CommonSkill, ActiveSkill, TriggerSkill } from "core/skills/skill";
import { Room } from "core/room/room";
import { Player } from "core/player/player";
import { AllStage, PhaseChangeStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from "core/game/stage_processor";
import { CardId } from "core/cards/libs/card_props";
import { PlayerCardsArea, PlayerId } from "core/player/player_props";
import { CharacterGender } from "core/characters/character";
import { CardMoveArea, CardMoveReason, ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from "core/event/event";
import { TranslationPack } from "core/translations/translation_json_tool";
import { PersistentSkill, ShadowSkill } from "core/skills/skill_wrappers";
import { OnDefineReleaseTiming } from "core/skills/skill_hooks";

@CommonSkill({name: "lihun", description: "lihun_description"})
export class Lihun extends ActiveSkill {
    public canUse(room: Room, owner: Player) {
        return !owner.hasUsedSkill(this.Name);
    }

    public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
        return phase === PlayerPhase.PlayCardStage;
    }

    public numberOfTargets() {
        return 1;
    }

    public cardFilter(room: Room, owner: Player, cards: CardId[]) {
        return cards.length === 1;
    }

    public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
        return room.getPlayerById(owner).cardFrom(cardId) !== undefined;
    }

    public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId, selectedCards: CardId[]) {
        return room.getPlayerById(target).Gender === CharacterGender.Male
            && target !== owner
            && selectedCards.length === 1;
    }

    async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
        return true;
    }

    async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
        const { cardIds, toIds, fromId } = event;

        await room.dropCards(CardMoveReason.SelfDrop, cardIds!, fromId, fromId, this.Name);
        await room.turnOver(fromId);

        const handcards = room.getPlayerById(toIds![0]).getCardIds(PlayerCardsArea.HandArea);
        await room.moveCards({
            movingCards: handcards.map(card => ({card, fromArea: CardMoveArea.HandArea})),
            fromId: toIds![0],
            toId: fromId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActivePrey,
            movedByReason: this.Name,
        });

        room.setFlag<PlayerId>(
            fromId,
            this.Name,
            toIds![0],
            TranslationPack.translationJsonPatcher(
                'lihun target: {0}',
                TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds![0]))
            ).toString()
        );

        return true;
    }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: Lihun.Name, description: Lihun.Description })
export class LihunShadow extends TriggerSkill implements OnDefineReleaseTiming {
    public afterLosingSkill(
        room: Room,
        owner: PlayerId,
        content: ServerEventFinder<GameEventIdentifiers>,
        stage?: AllStage,
      ) {
        return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage 
            && stage === PhaseChangeStage.PhaseChanged;
      }
    
    public async whenDead(room: Room, player: Player) {
        if (player.getFlag<PlayerId>(this.GeneralName)) {
            room.removeFlag(player.Id, this.GeneralName);
        }
    }
    
    public isAutoTrigger() {
        return true;
    }
    
    public isFlaggedSkill() {
        return true;
    }
    
    public isTriggerable(
        event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
        stage?: AllStage,
    ) {
        return stage === PhaseStageChangeStage.StageChanged;
    }
    
    public canUse(
        room: Room,
        owner: Player,
        content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    ) {
        return (
            content.playerId === owner.Id &&
            content.toStage === PlayerPhaseStages.PlayCardStageEnd
        );
    }

    public async onTrigger() {
        return true;
    }
    
    public async onEffect(
        room: Room,
        event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
    ): Promise<boolean> {
        const { fromId } = event;
        const toId = room.getPlayerById(fromId).getFlag<PlayerId>(this.GeneralName);
        if (room.getPlayerById(toId).Dead) {
            room.removeFlag(fromId, this.GeneralName);
            return true;
        }

        const hp = room.getPlayerById(toId).Hp;
        const from = room.getPlayerById(fromId);
        let cards = from.getPlayerCards();
        if (cards.length > hp) {
            const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
                GameEventIdentifiers.AskForCardEvent,
                {
                cardAmount: hp,
                toId: fromId,
                reason: this.Name,
                conversation: 'lihun: please give the targets some cards',
                fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
                triggeredBySkills: [this.Name],
                },
                fromId, true
            );

            cards = resp.selectedCards;
        }

        await room.moveCards({
            movingCards: cards.map(card =>
                ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card)})),
            fromId,
            toId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: fromId,
        });
        
        room.removeFlag(fromId, this.GeneralName);
    
        return true;
    }
}
