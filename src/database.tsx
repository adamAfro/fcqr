import { createContext, useContext, ReactNode } from 'react'

import { useState, useEffect }  from 'react'

import { openDB } from 'idb'


export const NAME = 'db'
export enum Stores {
    DECKS = 'decks',
    CARDS = 'cards'
}

export const open = () => openDB(NAME, 1, {

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

type Unwrap <T> = T extends Promise<infer U> ? U : T
export type Type = Unwrap <ReturnType<typeof open>>

const Context = createContext <Type | null> (null)

export function useDatabase() { return useContext(Context) }

export function Provider({ children }: { children: ReactNode }) {
    
    const [database, setDatabase] = useState(null as Type | null)

    useEffect(() => void open().then(setDatabase), [])

    return <>{database ? 
        
        <Context.Provider value={ database }>{children}</Context.Provider> : 
        'no db'
        
    }</>
}