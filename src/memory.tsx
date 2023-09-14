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
    TAGS = 'tags'
}

export const openDatabase = () => openDB(DB_NAME, 200, {

    async upgrade(db, oldVersion, newVersion, transaction, event) {
        
        if (!db.objectStoreNames.contains(Stores.DECKS)) 
            db.createObjectStore(Stores.DECKS, { keyPath: 'id', autoIncrement: true })
    
        if (!db.objectStoreNames.contains(Stores.CARDS))
            db.createObjectStore(Stores.CARDS, { keyPath: 'id', autoIncrement: true })
                .createIndex('deckId', 'deckId')

        if (!db.objectStoreNames.contains(Stores.TAGS))
            db.createObjectStore(Stores.TAGS, { keyPath: 'id', autoIncrement: true })
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

export function read(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS, Stores.TAGS], 'readonly')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS),
        tagStore: t.objectStore(Stores.TAGS) 
    }
}

export function readwrite(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS, Stores.TAGS], 'readwrite')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS),
        tagStore: t.objectStore(Stores.TAGS) 
    }
}