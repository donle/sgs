import classNames from 'classnames';
import { Character} from 'core/characters/character';
import { Skill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { debounce, uniq } from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import styles from './search.module.css';

type FilterFunction = (character: Character) => boolean;
type FilterObject = {
    key: string,
    actived: boolean,
    handler: FilterFunction;
}

type SearchBarProps = {
    translator: ClientTranslationModule;
    totalCharacters: Character[];
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>
};

const packageFilterFactory = (pkg: string) => ({
    key: pkg,
    actived: false,
    handler: (character: Character) => character.Package as string === pkg
});
const keywordFilterFactory = (keyword: string, translator: ClientTranslationModule) => (character: Character) => {
        const { Name, Skills } = character;
        return translator.tr(Name).indexOf(keyword) !== -1 ||
            Skills.some((skill: Skill) => 
                translator.tr(skill.Name).indexOf(keyword) !== -1 ||
                translator.tr(skill.Description).indexOf(keyword) !== -1
            );
};
const defaultKeywordFilter: FilterFunction = (character: Character) => true;

export const SearchBar = (props: SearchBarProps) => {
    const { translator, totalCharacters, setCharacters } = props;

    const [filters, setFilters] = useState<FilterObject[]>([]);
    const [keywordFilter, setKeywordFilter] = useState<FilterFunction>(() => defaultKeywordFilter);

    useEffect(() => {
        setFilters(uniq(totalCharacters.map(character => character.Package as string)).map(packageFilterFactory));
    }, [totalCharacters]);
    useEffect(() => {
        const actived = filters.filter(filter => filter.actived);
        if(actived.length === 0){
            setCharacters(totalCharacters.filter(keywordFilter));
        }else{
            setCharacters(totalCharacters.filter(character => 
                actived.map(filter => filter.handler).some(handler => handler(character))
            ).filter(keywordFilter));
        }
    }, [filters, keywordFilter, setCharacters, totalCharacters])

    const filterButtons = useMemo(() => {
        const toggleFilter = (filter: FilterObject) => {
            setFilters((filters: FilterObject[]) => {
                return filters.map(obj => {
                    if(obj.key === filter.key){
                        obj.actived = !obj.actived;
                    }
                    return obj;
                })
            });
        };
        return filters.map((filterObject: FilterObject) => {
            return (
                <div 
                    key={filterObject.key} 
                    className={classNames(styles.filterButton, {[styles.actived]: filterObject.actived})} 
                    onClick={() => toggleFilter(filterObject)}
                >
                    {translator.tr(filterObject.key)}
                </div>
            );
        })
    }, [filters, translator]);

    const setKeyword = useMemo(() => debounce(value => {
        if(value){
            setKeywordFilter(() => keywordFilterFactory(value, translator));
        }else{
            setKeywordFilter(() => defaultKeywordFilter);
        }
    }, 300), [translator]);

    return (
        <>
            <div className={styles.searchBar}>
                <div className={styles.searchWrapper}>
                    <input 
                        type="text" 
                        className={styles.input} 
                        placeholder={translator.tr('Please input character info:')} 
                        onChange={e => setKeyword(e.target.value)}
                    />
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
