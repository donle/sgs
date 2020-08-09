import { Character } from 'core/characters/character';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { uniq } from 'lodash';
import React, {useMemo} from 'react';
import styles from './search.module.css';

type SearchBarProps = {
    translator: ClientTranslationModule;
    totalCharacters: Character[];
};

export const SearchBar = (props: SearchBarProps) => {
    const {translator, totalCharacters} = props;
    const filterButtons = useMemo(() => {
        const packages: string[] = uniq(['All Characters', ...totalCharacters.map(character => character.Package as string)]);
        return packages.map(pkg => {
            return (
                <div key={pkg} className={styles.filterButton}>
                    {translator.tr(pkg)}
                </div>
            );
        })
    }, [totalCharacters, translator]);

    return (
        <>
            <div className={styles.searchBar}>
                <div className={styles.searchWrapper}>
                    <input type="text" className={styles.input} placeholder={translator.tr('Please input character info:')} />
                    <div className={styles.searchButton}>
                        <span className={styles.icon}></span>
                    </div>
                    <div className={styles.closeButton}>
                        <span className={styles.icon}></span>
                    </div>
                </div>
                {filterButtons}
            </div>
        </>
    );
}

export default SearchBar;
