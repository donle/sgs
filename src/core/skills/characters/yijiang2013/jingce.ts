import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import { 
  AllStage,
  PhaseStageChangeStage, 
  PlayerPhaseStages, 
  CardUseStage, 
  PlayerPhase,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jingce', description: 'jingce_description' })
export class JingCe extends TriggerSkill {
  public static suit_marks: string[] = [
    "jingce_NoSuit",
    "jingce_Spade",
    "jingce_Heart",
    "jingce_Club",
    "jingce_Diamond"
  ]

  isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PrepareStage;
  }

  whenRefresh(room: Room, owner: Player) {
    room.syncGameCommonRules(owner.Id, user => {
      let extraHold: number = 0;
      for (let i: number = 0; i < 5; i += 1) {
        if (user.getInvisibleMark(JingCe.suit_marks[i]) === 1) {
          extraHold += 1;
        };
        user.removeInvisibleMark(JingCe.suit_marks[i]);
      }
      user.removeInvisibleMark("jingce_type_basic");
      user.removeInvisibleMark("jingce_type_equip");
      user.removeInvisibleMark("jingce_type_trick");
      GameCommonRules.addAdditionalHoldCardNumber(user, -extraHold);
    });
    
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.PlayCardStageEnd &&
      owner.getInvisibleMark("jingce_type_trick") + owner.getInvisibleMark("jingce_type_equip")
       + owner.getInvisibleMark("jingce_type_basic") > 0
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const player = room.getPlayerById(event.fromId);
    let drawNum: number = player.getInvisibleMark("jingce_type_trick") +
    player.getInvisibleMark("jingce_type_equip") + player.getInvisibleMark("jingce_type_basic");
    await room.drawCards(drawNum, event.fromId, undefined, event.fromId, this.Name);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JingCe.GeneralName, description: JingCe.Description })
export class JingCeShadow extends TriggerSkill {
  
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: CardUseStage) {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return room.CurrentPlayer.Id === owner.Id &&
           content.fromId === owner.Id;
  }

  isAutoTrigger() {
    return true;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const CardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>
    room.syncGameCommonRules(event.fromId, user => {
          const card = Sanguosha.getCardById(CardUseEvent.cardId);
          if (card.is(CardType.Basic) && user.getInvisibleMark("jingce_type_basic") === 0) {
            user.addInvisibleMark("jingce_type_basic", 1);
          } else if (card.is(CardType.Equip) && user.getInvisibleMark("jingce_type_equip") === 0) {
            user.addInvisibleMark("jingce_type_equip", 1);
          } else if (card.is(CardType.Trick) && user.getInvisibleMark("jingce_type_trick") === 0) {
            user.addInvisibleMark("jingce_type_trick", 1);
          }
          if (user.getInvisibleMark(JingCe.suit_marks[card.Suit]) === 0){
            user.addInvisibleMark(JingCe.suit_marks[card.Suit], 1);
            // console.log('maxcard++');
            GameCommonRules.addAdditionalHoldCardNumber(user, 1);
          };
        });
    return true;
  }
}