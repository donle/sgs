import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import { GuideLine } from './animations/guideline/guideline';
import { MoveCard } from './animations/move_card/move_card';
import { RoomStore } from './room.presenter';

export type RoomBaseService = {
  Animation: {
    GuideLineAnimation: GuideLine;
    MoveCardAnimation: MoveCard;
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
      MoveCardAnimation: new MoveCard(store, translator, imageLoader),
    },
  };
}
