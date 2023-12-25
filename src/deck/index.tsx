import { useContext, useEffect, useState, createContext } from 'react'

import { Database, Stores, read as readAll } from "../memory"

import { Data as Language } from '../pocket/tags'
import { useMemory } from "../memory"

import { Name, TagSelect, MuteButton, SilenceButton } from './properties'

import { default as Card, Data as CardData } from '../card'

import { links } from '../app'

import { useTranslation } from '../localisation'

import Button from '../button'

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

export default function Deck({ id }: { id: number }): JSX.Element | null {

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

    if (state < State.EDITION)
        return null

    return <Context.Provider value={{ 
        id, 
        state, setState,
        name, setName,
        tag, setTag,
        cards, setCards,
        muted, setMuted,
        silent, setSilent
    }}>

        <header id='headline'>
            <h1><Name/></h1>

            <TagSelect/>
        </header>

        <div id='interactions'>

            <EditCardsButton/>

            <AddButton/>

            <MuteButton />

            <SilenceButton />

            <Dangerzone />

        </div>

        <div style={{display:"flex", flexFlow: "wrap row", justifyContent: "center" }}>
            <Cards/>
        </div>

    </Context.Provider>
}

function EditCardsButton() {

    const { state, setState } = useContext(Context)

    return <Button symbol='Pencil' active={state == State.EDITION}
        onClick={() => setState(state == State.EDITION ? State.EXERCISES : State.EDITION)}/>
}

function Dangerzone() {

    const { database } = useMemory()!

    const { id, setState } = useContext(Context)

    const [show, setShow] = useState(false)

    return <div style={{ position: 'relative' }}>

        <Button symbol={show ? 'ArrowBack' : 'Danger'} attention='none' active={show}
            onClick={() => setShow(p => !p)}/>

        {show ? <Button symbol='Bin' attention='removal' onClick={async () => {

            setState(State.REMOVED)

            if (!id) return 

            const { done, store, cardStore } = readwrite(database)

            await store.delete(id)

            const index = cardStore.index('deckId')
            const cards = await index.getAll(IDBKeyRange.only(id)) as CardData[]
            const removals = cards.map(card => cardStore.delete(card.id!))

            await Promise.all(removals)

            return await done

        }} to={links.pocket} style={{ position:"absolute", top: '100%', left: '0', zIndex: '100' }}/> : null}

    </div>
}

function AddButton() {

    const { id, state, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <Button symbol='Plus' disabled={state != State.EDITION} onClick={async () => {

        if (!id) 
            return void setCards(prev => [{ ...card, id: -1 }, ...prev])

        const card = { term: '', def: '', deckId: id } as CardData

        const { done, cardStore } = readwrite(database)
        
        const cardId = await cardStore.add({ ...card, deckId: id })
        
        await done
        setCards(prev => [{ ...card, id: Number(cardId) }, ...prev])

    }}/>
}

function Cards() {

    const { cards, state } = useContext(Context)

    const { t } = useTranslation()

    if (cards.length == 0)
        return <p>{t`empty deck`}</p>

    return <>

        {[...cards].sort((a, b) => {

            if (state == State.EXERCISES && a.order !== undefined && b.order !== undefined)
                return a.order - b.order

            return b.id! - a.id!

        }).map(card => <Card key={card.id} {...card}/>)}
    
    </>
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