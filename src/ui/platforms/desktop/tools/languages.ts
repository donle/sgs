export const enum Language {
  EN_US,
  ZH_CN,
}

const zhCnTranslations = {
  Yes: '确定',
  Cancel: '取消',
  MismatchVersionTitle: '录像版本不匹配',
  MismatchVersionMessage: (replayVersion: string, currentVersion: string) =>
    `录像版本 ${replayVersion}，客户端版本 ${currentVersion}。播放不同版本录像可能会出现不可预知的问题导致客户端崩溃，是否继续播放？`,
};

const enTranslations = {
  Yes: 'Yes',
  Cancel: 'Cancel',
  MismatchVersionTitle: 'Mismatched replay version',
  MismatchVersionMessage: (replayVersion: string, currentVersion: string) =>
    `replay version ${replayVersion}, client version ${currentVersion}. An unexpected issue might happen if playing a mismatched replay, do you want to continue?`,
};

const Translations: { [K in Language]: typeof zhCnTranslations } = {
  [Language.ZH_CN]: zhCnTranslations,
  [Language.EN_US]: enTranslations,
};

export function getTranslations(lang: Language = Language.EN_US) {
  return Translations[lang];
}
