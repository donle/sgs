export const enum Language {
  EN_US,
  ZH_CN,
}

const zhCnTranslations = {
  Yes: '是',
  Cancel: '取消',
  ReplayFile: '新神杀录像文件',
  MismatchVersionTitle: '录像版本不匹配',
  MismatchVersionMessage: (replayVersion: string, currentVersion: string) =>
    `录像版本 ${replayVersion}，客户端版本 ${currentVersion}。播放不同版本录像可能会出现不可预知的问题导致客户端崩溃，是否继续播放？`,
  UpdateTitle: '游戏正在更新中',
  UpdateMessage: '游戏正在更新中，退出游戏会停止更新，是否继续退出游戏？',
};

const enTranslations = {
  Yes: 'Yes',
  Cancel: 'Cancel',
  ReplayFile: 'DSanguosha Replay File',
  MismatchVersionTitle: 'Mismatched replay version',
  MismatchVersionMessage: (replayVersion: string, currentVersion: string) =>
    `replay version ${replayVersion}, client version ${currentVersion}. An unexpected issue might happen if playing a mismatched replay, do you want to continue?`,
    UpdateTitle: 'Game Updating',
    UpdateMessage: 'Game is updating, the update will be cancelled if the application had been closed, do you want to quit now?',
};

const Translations: { [K in Language]: typeof zhCnTranslations } = {
  [Language.ZH_CN]: zhCnTranslations,
  [Language.EN_US]: enTranslations,
};

export function getTranslations(lang: Language = Language.EN_US) {
  return Translations[lang];
}
