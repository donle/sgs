import { GameRunningInfo } from 'core/game/game_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from './event';

const enum PrivateTagEnum {
  DamageSignatureInCardUse = 'DamageSignatureInCardUse',
  LosingAllArmorTag = 'LosingAllArmorTag',
}

export class EventPacker {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static wrapGameRunningInfo<T extends GameEventIdentifiers>(
    event: ServerEventFinder<T>,
    info: GameRunningInfo,
  ): ServerEventFinder<T> {
    return { ...event, ...info };
  }

  static getGameRunningInfo<T extends GameEventIdentifiers>(event: ServerEventFinder<T>): GameRunningInfo {
    const { numberOfDrawStack, numberOfDropStack, circle, currentPlayerId } = event as any;

    return {
      numberOfDrawStack,
      numberOfDropStack,
      circle,
      currentPlayerId,
    };
  }

  static minifyPayload = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => {
    const { middlewares, ...paylod } = event as any;
    return paylod;
  };

  static setTimestamp = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>): void => {
    (event as any).timestamp = Date.now();
  };

  static getTimestamp = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>): number | undefined =>
    (event as any).timestamp;

  static isDisresponsiveEvent = <T extends GameEventIdentifiers>(
    event: ServerEventFinder<T>,
    includeUnoffsetable?: boolean,
  ): boolean => (event as any).disresponsive || (includeUnoffsetable && (event as any).unoffsetable);

  static setDisresponsiveEvent = <T extends GameEventIdentifiers>(
    event: ServerEventFinder<T>,
  ): ServerEventFinder<T> => {
    (event as any).disresponsive = true;
    return event;
  };

  static setUnoffsetableEvent = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>): ServerEventFinder<T> => {
    (event as any).unoffsetable = true;
    return event;
  };

  static addMiddleware = <T extends GameEventIdentifiers>(
    middleware: {
      tag: string;
      data: any;
    },
    event: ServerEventFinder<T>,
  ): ServerEventFinder<T> => {
    (event as any).middlewares = (event as any).middlewares || {};
    (event as any).middlewares[middleware.tag] = middleware.data;
    return event;
  };
  static getMiddleware = <DataType>(
    tag: string,
    event: ServerEventFinder<GameEventIdentifiers>,
  ): DataType | undefined => (event as any).middlewares && (event as any).middlewares[tag];

  static removeMiddleware = <T extends GameEventIdentifiers>(
    tag: string,
    event: ServerEventFinder<T>,
  ): ServerEventFinder<T> => {
    if ((event as any).middlewares && (event as any).middlewares[tag]) {
      delete (event as any).middlewares[tag];
    }
    return event;
  };

  static createUncancellableEvent = <T extends GameEventIdentifiers>(
    event: ServerEventFinder<T>,
  ): ServerEventFinder<T> => {
    (event as any).uncancellable = true;
    return event;
  };

  static createIdentifierEvent = <
    T extends GameEventIdentifiers,
    E extends ServerEventFinder<T> | ClientEventFinder<T>,
  >(
    identifier: T,
    event: E,
  ): E => {
    (event as any).identifier = identifier;
    return event;
  };

  static hasIdentifier = <T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>): boolean =>
    (event as any).identifier === identifier;

  static getIdentifier = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>): T | undefined =>
    (event as any).identifier;

  static isUncancellableEvent = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) =>
    !!(event as any).uncancellable;

  static terminate<T extends GameEventIdentifiers>(event: ServerEventFinder<T>): ServerEventFinder<T> {
    (event as any).terminate = true;
    return event;
  }

  static recall<T extends GameEventIdentifiers>(event: ServerEventFinder<T>): ServerEventFinder<T> {
    (event as any).terminate = false;
    return event;
  }

  static isTerminated(event: ServerEventFinder<GameEventIdentifiers>) {
    return !!(event as any).terminate;
  }
  static copyPropertiesTo<T extends GameEventIdentifiers, Y extends GameEventIdentifiers>(
    fromEvent: ServerEventFinder<T>,
    toEvent: ServerEventFinder<Y>,
    configuration: {
      copyTerminate?: boolean;
      copyUncancellable?: boolean;
      copyMiddlewares?: boolean;
      copyDisresponsive?: boolean;
      copyUnoffsetable?: boolean;
    } = {},
  ) {
    const {
      copyTerminate = false,
      copyUncancellable = true,
      copyMiddlewares = true,
      copyDisresponsive = true,
      copyUnoffsetable = true,
    } = configuration;

    if (copyTerminate && (fromEvent as any).terminate !== undefined) {
      (toEvent as any).terminate = (fromEvent as any).terminate;
    }
    if (copyUncancellable && (fromEvent as any).uncancellable !== undefined) {
      (toEvent as any).uncancellable = (fromEvent as any).uncancellable;
    }
    if (copyMiddlewares && (fromEvent as any).middlewares !== undefined) {
      (toEvent as any).middlewares = { ...(toEvent as any).middlewares, ...(fromEvent as any).middlewares };
    }
    if (copyDisresponsive && (fromEvent as any).disresponsive !== undefined) {
      (toEvent as any).disresponsive = (fromEvent as any).disresponsive;
    }
    if (copyUnoffsetable && (fromEvent as any).unoffsetable !== undefined) {
      (toEvent as any).unoffsetable = (fromEvent as any).unoffsetable;
    }
  }

  public static setDamageSignatureInCardUse(
    content:
      | ServerEventFinder<GameEventIdentifiers.CardUseEvent>
      | ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
    sign: boolean = true,
  ): void {
    EventPacker.addMiddleware<GameEventIdentifiers.CardEffectEvent>(
      { tag: PrivateTagEnum.DamageSignatureInCardUse, data: sign },
      content,
    );
  }

  public static getDamageSignatureInCardUse(
    content:
      | ServerEventFinder<GameEventIdentifiers.CardUseEvent>
      | ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ): boolean {
    return !!EventPacker.getMiddleware<boolean>(PrivateTagEnum.DamageSignatureInCardUse, content);
  }

  public static setLosingAllArmorTag(
    content: ServerEventFinder<GameEventIdentifiers.ArmorChangeEvent>,
    data: number,
  ): void {
    EventPacker.addMiddleware({ tag: PrivateTagEnum.LosingAllArmorTag, data }, content);
  }

  public static getLosingAllArmorTag(content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): number | undefined {
    return EventPacker.getMiddleware<number>(PrivateTagEnum.LosingAllArmorTag, content);
  }
}
