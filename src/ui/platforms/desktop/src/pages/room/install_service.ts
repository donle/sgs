import { GuideLine } from './animations/guideline/guideline';
import { MoveInstantCardAnimation } from './animations/move_card/move_instant_card';
import { RoomStore } from './room.store';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';

export type RoomBaseService = {
  Animation: {
    GuideLineAnimation: GuideLine;
    MoveInstantCardAnimation: MoveInstantCardAnimation;
  };
};

export function installService(
  translator: ClientTranslationModule,
  store: RoomStore,
  imageLoader: ImageLoader,
): RoomBaseService {
  return {
    Animation: {
      GuideLineAnimation: new GuideLine(store, 500, 2000),
      MoveInstantCardAnimation: new MoveInstantCardAnimation(store, translator, imageLoader),
    },
  };
}
