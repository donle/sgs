import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { getImageLoader } from 'image_loader/image_loader_util';
import { ClientFlavor } from 'props/config_props';
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
  flavor: ClientFlavor,
  translator: ClientTranslationModule,
  store: RoomStore,
): RoomBaseService {
  return {
    Animation: {
      GuideLineAnimation: new GuideLine(store, 500, 2000),
      MoveCardAnimation: new MoveCard(store, translator, getImageLoader(flavor)),
    },
  };
}
