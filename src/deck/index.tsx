import { useContext, useEffect, useState, createContext } from 'react'

import { Database, Stores, read as readAll } from "../memory"

import { Data as Language } from '../pocket/tags'
import { useMemory } from "../memory"

import Quickaccess from '../quickaccess'
import * as Actions from './actions'
import Properties from './properties'

import { default as Card, Data as CardData } from '../card'

import style from "./style.module.css"
import { useTranslation } from 'react-i18next'

export interface Data {
    id?: number
    name: string
    tagId?: number
    muted?: boolean
    silent?: boolean
    reference?: string
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
    setSilent(c:boolean|((p:boolean) => boolean)) {},

    reference: '',
    setReference(c:string|((p:string) => string)) {}
})

export default function Deck({ id }: { id: number }): JSX.Element {

    const { database } = useMemory()!

    const [state, setState] = useState(State.LOADING)
    const [name, setName] = useState <string | undefined> (undefined)
    const [tag, setTag] = useState <Language | undefined | null> (undefined)
    const [reference, setReference] = useState('')

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

    })().then(({ data, tag, cards }) => {

        setName(data.name)
        setReference(data.reference || '')
        setTag(tag)
        setCards(cards as CardData[])
        if (data.muted || !(tag && tag.voice))
            setMuted(true)
        if (data.silent || !(tag && tag.code))
            setSilent(true)

        setState(State.EXERCISES)

    }), [])

    return <Context.Provider value={{ 
        id, 
        state, setState,
        name, setName,
        tag, setTag,
        cards, setCards,
        muted, setMuted,
        silent, setSilent,
        reference, setReference
    }}>

        <Quickaccess popup={state == State.EDITION ? <Properties/> : null}>

            <div className='stack'>

                {state == State.EXERCISES ? 
                    (cards.length > 1 ? <Actions.ShuffleButton/> : null) :
                    <Actions.AddButton/>}

            </div>

            <Actions.EditButton/>

        </Quickaccess>

        {state >= State.EDITION ? <Cards/> : null}

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