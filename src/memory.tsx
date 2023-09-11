import { useContext, useState, useEffect }  from 'react'
import { createContext, ReactNode, Dispatch, SetStateAction } 
    from 'react'

import { openDB } from 'idb'
import { changeLanguage } from './localisation'


type Unwrap <T> = T extends Promise<infer U> ? U : T
export type Database = Unwrap <ReturnType<typeof openDatabase>>


const Context = createContext <{ 

    database: Database,
    language: string
        setLanguage: Dispatch <SetStateAction <string>>

} | null> (null)

export function useMemory() { return useContext(Context) }


export const DB_NAME = 'db'
export enum Stores {
    DECKS = 'decks',
    CARDS = 'cards',
    LANGUAGES = 'languages'
}

export const openDatabase = () => openDB(DB_NAME, 106, {

    async upgrade(db, oldVersion, newVersion, transaction, event) {
        
        if (!db.objectStoreNames.contains(Stores.DECKS)) {

            const deckStore = db.createObjectStore(Stores.DECKS, { keyPath: 'id', autoIncrement: true })
        }
    
        if (!db.objectStoreNames.contains(Stores.CARDS)) {

            const cardStore = db.createObjectStore(Stores.CARDS, { keyPath: 'id', autoIncrement: true })
            cardStore.createIndex('deckId', 'deckId')
        }

        if (!db.objectStoreNames.contains(Stores.LANGUAGES)) {

            const languageStore = db.createObjectStore(Stores.LANGUAGES, { keyPath: 'id', autoIncrement: true })
        }
    }
})


export function Provider({ children }: { children: ReactNode }) {
    
    const [database, setDatabase] = useState(null as Database | null)
    const [language, setLanguage] = useState(restoreLanguage() || '')

    useEffect(() => {

        storeLanguage(language)
        if (language) 
            changeLanguage(language)
        else 
            changeLanguage()

    }, [language])

    useEffect(() => void openDatabase().then(setDatabase), [])

    return <>{database ? 
        
        <Context.Provider value={{ 
            database, 
            language, setLanguage
        }}>{children}</Context.Provider> : 
        <div data-testid="database-unloaded">no db</div>
        
    }</>
}

export const LANGUAGE_KEY = 'language'
function storeLanguage(language: string) {
    
    localStorage.setItem(LANGUAGE_KEY, language)
}

function restoreLanguage() {

    const language = localStorage.getItem(LANGUAGE_KEY)
    
    return language
}