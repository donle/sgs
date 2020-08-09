import classNames from 'classnames';
import { Character} from 'core/characters/character';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { uniq } from 'lodash';
import React, {useMemo} from 'react';
import styles from './search.module.css';

type FilterFunction = (character: Character) => boolean;
type FilterObject = {
    key: string,
    actived: boolean,
    handler: FilterFunction;
}
type FilterFactory = (name: string) => FilterObject;

type SearchBarProps = {
    translator: ClientTranslationModule;
    totalCharacters: Character[];
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>
};

const packageFilterFactory: FilterFactory = (pkg: string) => ({
    key: pkg,
    actived: false,
    handler: (character: Character) => character.Package as string === pkg
});

export const SearchBar = (props: SearchBarProps) => {
    const { translator, totalCharacters, setCharacters } = props;

    const filters: FilterObject[] = useMemo(
        () => {
            const packages: string[] = uniq(totalCharacters.map(character => character.Package as string));
            return packages.map(packageFilterFactory);
        },
        [totalCharacters]
    );

    const filterButtons = useMemo(() => {
        const toggleFilter = (filter: FilterObject) => {
            filter.actived = !filter.actived;
            const actived = filters.filter(filter => filter.actived);
            console.log(actived.map(filter => filter.key));
            if(actived.length === 0){
                setCharacters(totalCharacters);
            }else{
                setCharacters(totalCharacters.filter(character => 
                    actived.map(filter => filter.handler).some(handler => handler(character))
                ));
            }
        };

        return filters.map(filterObject => {
            return (
                <div 
                    key={filterObject.key} 
                    className={classNames(styles.filterButton, {
                        [styles.actived]: filterObject.actived
                    })} 
                    onClick={() => toggleFilter(filterObject)}
                >
                    {translator.tr(filterObject.key)}
                </div>
            );
        })
    }, [filters, translator, setCharacters, totalCharacters]);

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
