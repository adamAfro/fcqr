import { useContext, useEffect, useState, createContext } from 'react'

import { Database, Stores, read as readAll } from "../memory"

import { Data as Language } from '../languages'
import { useMemory } from "../memory"



import Quickaccess from '../quickaccess'
import * as Actions from './actions'
import Properties from './properties'

import { default as Card, Data as CardData } from '../card'

import style from "./style.module.css"

export interface Data {
    id?: number
    name: string
    languageId?: number
    muted?: boolean
    silent?: boolean
    reference?: string
}

export enum State {
    NOT_FOUND,
    REMOVED,
    LOADING,
    LOADED,
    EXERCISES
}

export const layouts = {
    
    compact: 'compact',
    extended: 'extended',
    quarter: 'quarter',
    grid: 'grid'

} as const

export type Layout = keyof typeof layouts

export const Context = createContext({ 

    id: -1,

    state: State.LOADING, 
    setState(c:State | ((p:State) => State)) {},

    name: undefined as string | undefined,
    setName(c:string|((p:string | undefined) => string)) {},

    language: undefined as Language | undefined | null,
    setLanguage(c:Language|((p:Language | undefined) => Language)) {},

    cards: [] as CardData[], 
    setCards(c:CardData[]|((p:CardData[]) => CardData[])) {},
    
    layout: layouts.compact as Layout,
    setLayout(c:Layout|((p:Layout) => Layout)) {},

    muted: false,
    setMuted(c:boolean|((p:boolean) => boolean)) {},

    silent: false,
    setSilent(c:boolean|((p:boolean) => boolean)) {},

    reference: '',
    setReference(c:string|((p:string) => string)) {}
})

export default function Deck({ id }: { id: number }): JSX.Element {

    const { database } = useMemory()!

    const [state, setState] = useState(State.LOADING)
    const [name, setName] = useState <string | undefined> (undefined)
    const [language, setLanguage] = useState <Language | undefined | null> (undefined)
    const [reference, setReference] = useState('')

    const [muted, setMuted] = useState(false)
    const [silent, setSilent] = useState(false)

    const [cards, setCards] = useState <CardData[]> ([])

    useEffect(() => void (async (ok) => {

        const { done, store, cardStore, languageStore } = readAll(database)

        const index = cardStore.index('deckId')

        const data = await store.get(id) as Data
        const cards = await index.getAll(IDBKeyRange.only(id)) as CardData[]

        const language = data.languageId ?
            await languageStore.get(data.languageId) as Language :
            null

        await done

        return { data, cards, language }

    })().then(({ data, language, cards }) => {

        setName(data.name)
        setReference(data.reference || '')
        setLanguage(language)
        setCards(cards as CardData[])
        if (data.muted || !(language && language.voice))
            setMuted(true)
        if (data.silent || !(language && language.code))
            setSilent(true)

        setState(State.LOADED)

    }), [])
    const [layout, setLayout] = useState <Layout> (layouts.compact)

    return <Context.Provider value={{ 
        id, 
        state, setState,
        name, setName,
        language, setLanguage,
        cards, setCards,
        layout, setLayout,
        muted, setMuted,
        silent, setSilent,
        reference, setReference
    }}>

        <Quickaccess popup={state == State.LOADED ? <Actions.Dangerzone/> : null}>

            <div className='stack'>

                {state == State.EXERCISES ? 
                    <Actions.ShuffleButton/> :
                    <Actions.AddButton/>
                }

                <Actions.LayoutButton/>

            </div>

            {state == State.EXERCISES ? 
                <Actions.EditButton/> : 
                <Actions.ExerciseButton/>
            }

        </Quickaccess>

        {state > State.LOADING ? <Properties/> : null}

        {state >= State.LOADED ? <Cards/> : null}

    </Context.Provider>
}

function Cards() {

    const { cards, state, layout } = useContext(Context)

    return <ul className={style.cards}
        data-testid='cards'
        data-layout={layout}>

        {[...cards].sort((a, b) => {

            if (state == State.EXERCISES && a.order !== undefined && b.order !== undefined)
                return a.order - b.order
            
            return b.id! - a.id!

        }).map((card,i) => <li key={card.id}>
            {<Card {...card}/>}
        </li>)}

    </ul>
}

export function read(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS], 'readonly')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS) 
    }
}

export function readwrite(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS) 
    }
}