import {
  CardUseEvent,
  DamageEvent,
  PinDianEvent,
  SkillUseEvent,
  SocketUserMessageEvent,
} from 'core/event';

export abstract class Socket {
  constructor(
    protected socketUrl: string,
    protected protocol: 'http' | 'https',
  ) {}
}

export const enum SocketMessageTypes {
  UserMessage,
  CardUseEvent,
  SkillUseEvent,
  PinDianEvent,
  DamageEvent,
}

export type SocketMessage =
  | {
      type: SocketMessageTypes.UserMessage;
      content: SocketUserMessageEvent;
    }
  | {
      type: SocketMessageTypes.CardUseEvent;
      content: CardUseEvent;
    }
  | {
      type: SocketMessageTypes.SkillUseEvent;
      content: SkillUseEvent;
    }
  | {
      type: SocketMessageTypes.PinDianEvent;
      content: PinDianEvent;
    }
  | {
      type: SocketMessageTypes.DamageEvent;
      content: DamageEvent;
    };
