import { useContext, useState, useEffect }  from 'react'
import { createContext, ReactNode, Dispatch, SetStateAction } 
    from 'react'

import { openDB } from 'idb'

import { LanguageConfig } from './languages'


type Unwrap <T> = T extends Promise<infer U> ? U : T
export type Database = Unwrap <ReturnType<typeof openDatabase>>


const Context = createContext <{ 
    database: Database, 
    languages: LanguageConfig[],
    setLanguages: Dispatch <SetStateAction <LanguageConfig[]>>
} | null> (null)

export function useMemory() { return useContext(Context) }


export const DB_NAME = 'db'
export enum Stores {
    DECKS = 'decks',
    CARDS = 'cards',
    LANG_CONFIG = 'lang_config'
}

export const openDatabase = () => openDB(DB_NAME, 1, {

    async upgrade(db, oldVersion, newVersion, transaction, event) {
        
        if (!db.objectStoreNames.contains(Stores.DECKS)) {

            const deckStore = db.createObjectStore(Stores.DECKS, { keyPath: 'id', autoIncrement: true })
        }
    
        if (!db.objectStoreNames.contains(Stores.CARDS)) {

            const cardStore = db.createObjectStore(Stores.CARDS, { keyPath: 'id', autoIncrement: true })
            cardStore.createIndex('deckId', 'deckId')
        }
    }
})


export function Provider({ children }: { children: ReactNode }) {
    
    const [database, setDatabase] = useState(null as Database | null)
    const [languages, setLanguages] = useState(restoreLanguages())

    useEffect(() => void storeLanguages(languages), [languages])

    useEffect(() => void openDatabase().then(setDatabase), [])

    return <>{database ? 
        
        <Context.Provider value={{ database, languages, setLanguages }}>{children}</Context.Provider> : 
        <div data-testid="database-unloaded">no db</div>
        
    }</>
}


export const LANGUAGES_KEY = 'languages'
function storeLanguages(languages: LanguageConfig[]) {

    console.debug('storing languages', languages)
    
    localStorage.setItem(LANGUAGES_KEY, JSON.stringify(languages))
}

function restoreLanguages() {

    const languages = localStorage.getItem(LANGUAGES_KEY)
    const parsed = languages ? JSON.parse(languages) as LanguageConfig[] : []

    console.debug('restoring languages', parsed)
    
    return parsed
}