import { useContext, useEffect, useState, createContext } from 'react'

import { Database, Stores, read as readAll } from "../memory"

import { Data as Language } from '../pocket/tags'
import { useMemory } from "../memory"

import { Dangerzone, AddButton } from './actions'
import { Name, TagSelect, MuteButton, SilenceButton } from './properties'

import { default as Card, Data as CardData } from '../card'

import { links } from '../app'

import { useTranslation } from '../localisation'

import { Button } from '../interactions'

import style from "./style.module.css"

export interface Data {
    id?: number
    name: string
    tagId?: number
    muted?: boolean
    silent?: boolean
}

export enum State {
    NOT_FOUND,
    REMOVED,
    LOADING,
    EDITION,
    EXERCISES
}

export const Context = createContext({ 

    id: -1,

    state: State.LOADING, 
    setState(c:State | ((p:State) => State)) {},

    name: undefined as string | undefined,
    setName(c:string|((p:string | undefined) => string)) {},

    tag: undefined as Language | undefined | null,
    setTag(c:Language|((p:Language | undefined) => Language)) {},

    cards: [] as CardData[], 
    setCards(c:CardData[]|((p:CardData[]) => CardData[])) {},

    muted: false,
    setMuted(c:boolean|((p:boolean) => boolean)) {},

    silent: false,
    setSilent(c:boolean|((p:boolean) => boolean)) {}
})

export default function Deck({ id }: { id: number }): JSX.Element {

    const { database } = useMemory()!

    const [state, setState] = useState(State.LOADING)
    const [name, setName] = useState <string | undefined> (undefined)
    const [tag, setTag] = useState <Language | undefined | null> (undefined)

    const [muted, setMuted] = useState(false)
    const [silent, setSilent] = useState(false)

    const [cards, setCards] = useState <CardData[]> ([])

    useEffect(() => void (async (ok) => {

        const { done, store, cardStore, tagStore } = readAll(database)

        const index = cardStore.index('deckId')

        const data = await store.get(id) as Data
        const cards = await index.getAll(IDBKeyRange.only(id)) as CardData[]

        const tag = data.tagId ?
            await tagStore.get(data.tagId) as Language :
            null

        await done

        return { data, cards, tag }

    })().then(({ data, cards, tag }) => {

        setName(data.name)
        setTag(tag)
        setCards(cards?.map(card => ({ ...card, order: Math.random() }))
            .sort((a, b) => a.order! - b.order!).reverse() as CardData[])
        if (data.muted || !(tag && tag.voice))
            setMuted(true)
        if (data.silent || !(tag && tag.code))
            setSilent(true)

        setState(cards.length > 0 ? State.EXERCISES : State.EDITION)

    }), [])

    return <Context.Provider value={{ 
        id, 
        state, setState,
        name, setName,
        tag, setTag,
        cards, setCards,
        muted, setMuted,
        silent, setSilent
    }}>

        {state == State.EDITION ? <div className='popup'>

            <Options/>

            <Button symbol='Up' attention='none' onClick={() => setState(State.EXERCISES)} style={{
                width: '100%'
            }}/>

        </div> : <Button symbol='Down' className='popup' attention='none' 
            onClick={() => setState(State.EDITION)}/>}

        <Cards/>

    </Context.Provider>
}

function Cards() {

    const { cards, state } = useContext(Context)

    const { t } = useTranslation()

    if (cards.length == 0)
        return <p>{t`empty deck`}</p>

    return <ul className={style.cards}>

        {[...cards].sort((a, b) => {

            if (state == State.EXERCISES && a.order !== undefined && b.order !== undefined)
                return a.order - b.order
            
            return b.id! - a.id!

        }).map((card,i) => <li key={card.id}>
            {<Card {...card}/>}
        </li>)}

    </ul>
}

function Options() {

    const { t } = useTranslation()

    return <header className='column'>

        <h1 className='title'><Name/></h1>

        <div className='row'>

            <TagSelect/>

            <MuteButton/>

            <SilenceButton/>

        </div>
        
        <Dangerzone/>

        <p><AddButton/></p>

    </header>
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