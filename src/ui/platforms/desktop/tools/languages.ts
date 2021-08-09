export const enum Language {
  EN_US = 'en-US',
  ZH_TW = 'zh-TW',
  ZH_CN = 'zh-CN',
}

const zhCnTranslations = {
  Yes: '是',
  Cancel: '取消',
  ReplayFile: '新神杀录像文件',
  ReadReplayExceptions: (errorCode: string) => `录像解析异常，无法打开录像文件。错误代码：${errorCode}`,
  MismatchVersionTitle: '录像版本不匹配',
  MismatchVersionMessage: (replayVersion: string, currentVersion: string) =>
    `录像版本 ${replayVersion}，客户端版本 ${currentVersion}。播放不同版本录像可能会出现不可预知的问题导致客户端崩溃，是否继续播放？`,
  UpdateTitle: '游戏正在更新中',
  UpdateMessage: '游戏正在更新中，退出游戏会停止更新，是否继续退出游戏？',
  UpdateFailed: '更新失败',
};

const enTranslations = {
  Yes: 'Yes',
  Cancel: 'Cancel',
  ReplayFile: 'DSanguosha Replay File',
  ReadReplayExceptions: (errorCode: string) =>
    `Exceptions on parsing replay files, cannot open the replay file. Error code: ${errorCode}`,
  MismatchVersionTitle: 'Mismatched replay version',
  MismatchVersionMessage: (replayVersion: string, currentVersion: string) =>
    `replay version ${replayVersion}, client version ${currentVersion}. An unexpected issue might happen if playing a mismatched replay, do you want to continue?`,
  UpdateTitle: 'Game Updating',
  UpdateMessage:
    'Game is updating, the update will be cancelled if the application had been closed, do you want to quit now?',
  UpdateFailed: 'Update failed with some exceptions!',
};

const Translations: { [K in Language]: typeof zhCnTranslations } = {
  [Language.ZH_CN]: zhCnTranslations,
  [Language.EN_US]: enTranslations,
  [Language.ZH_TW]: zhCnTranslations,
};

export function getTranslations(lang: Language = Language.EN_US) {
  return Translations[lang] || Translations[Language.EN_US];
}
