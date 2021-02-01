import { Sanguosha } from 'core/game/engine';
import * as fs from 'fs-extra';
import { CharacterLoader } from 'core/game/package_loader/loader.characters';
import { TranslationModule } from 'core/translations/translation_module';
import { Languages } from 'core/translations/translation_json_tool';
import { Functional } from 'core/shares/libs/functional';
import { SimplifiedChinese } from 'languages/zh_CN'; // 该问题大可忽略

Sanguosha.initialize();
var translator = TranslationModule.setup(Languages.ZH_CN, [Languages.ZH_CN, SimplifiedChinese]);

let indexBuffer: string = `# 武将一览\n\n> [DSanguosha](../index.md) > 武将一览\n\n___\n\n## 索引\n\n`;
for (let extension of Sanguosha.getGameCharacterExtensions()) {
    indexBuffer = indexBuffer.concat(`+ [${translator.tr(extension)}](./${extension}.md)\n`)
}
fs.writeFileSync('characters/characters-index.md', indexBuffer);

for (let extension of Sanguosha.getGameCharacterExtensions()) {
    let buffer: string = `# ${translator.tr(extension)}\n\n> [DSanguosha](../index.md) > [武将一览](./characters-index.md) > ${translator.tr(extension)}\n\n___\n\n- [${translator.tr(extension)}](#${translator.tr(extension)})\n\n___\n\n`;
    let characters = CharacterLoader.getInstance().getPackages(extension);
    for (let character of characters) {
        buffer = buffer.concat(`## ${translator.tr(character.Name)} ${translator.tr(Functional.getPlayerNationalityText(character.Nationality))} ${character.Hp}/${character.MaxHp}\n\n[查看源代码...](../../src/core/characters/${extension}/${character.Name}.ts)\n\n`);
        for (let skill of character.Skills) {
            if (!skill.Name.startsWith('#'))
                buffer = buffer.concat(`### ${translator.tr(skill.Name)}\n\n[查看源代码...](../../src/core/skills/characters/${extension}/${skill.Name}.ts)\n\n${translator.tr(skill.Name.concat('_description'))}\n\n`);
        }
        if (character !== characters[characters.length-1])
            buffer = buffer.concat('___\n\n');
    }

    fs.writeFileSync(`characters/${extension}.md`, buffer);
}

