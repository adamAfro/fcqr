import { ChangeEvent, MouseEvent, useEffect }  from 'react'
import { useState }  from 'react'

import { useContext } from '../context'

import { Select as LanguageSelect} from '../languages'


import { Type as Database, Stores } from '../database'

import { Card, Data as CardData } from '../card'

import style from "./style.module.css"

export function Route() {

    const path = window.location.pathname.split('/').pop()
    const id = Number(path?.split('$').pop())

    return <Entry id={id}/>
}

export interface Data {
    id?: number
    name: string
    termLang: string
    defLang: string
}

export function Entry(props: { id: number }) {

    const { database } = useContext()

    const [info, setInfo] = useState<Data | null>(null)
    const [cards, setCards] = useState<CardData[]>([])

    useEffect(() => void get(props.id, database!).then(({deck, cards}) => {

        setInfo(deck)
        setCards(cards)

    }), [])

    return <>{info ? <Deck info={info} cards={cards}/> : null}</>
}

export function Deck(props: { info: Data, cards: CardData[]}) {

    return <div>
        <Editor {...props.info}/>
        <button data-testid="add-card-btn">Add</button>
        {props.cards.map(card => <Card key={card.id} {...card}/>)}
    </div>
}

function Editor(props: Data) {

    const { database } = useContext()
    const change = (event: ChangeEvent) => {
        
        if (!database)
            throw new Error('no database')

        const target = event.target as HTMLInputElement | HTMLSelectElement
        const key = target.name, value = target.value

        modifyData({ ...props, [key]: value } as Data, database)
    }

    const removalClick = (event: MouseEvent <HTMLButtonElement>) => {

        if (!database)
            throw new Error('no database')

        remove(props.id!, database)
    }

    return <p data-testid="deck-editor">
        <input name="name" type="text" value={props.name} onChange={change}/>
        <LanguageSelect name="termLang" selection={props.termLang} onChange={change}/>
        <LanguageSelect name="defLang" selection={props.defLang} onChange={change}/>
        <button onClick={removalClick}>remove</button>
    </p>
}

export async function add(deck: Data, cards: CardData[], db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)
    const cardStore = transaction.objectStore(Stores.CARDS)

    const deckId = Number(await deckStore.add(deck))

    cards = cards.map(card => ({ ...card, deckId }))
    
    const additions = cards.map(card => cardStore.add(card))

    await Promise.all(additions)
    await transaction.done

    return deckId
}

export async function addData(deck: Data, db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)

    const deckId = Number(await deckStore.add(deck))
    await transaction.done

    return deckId
}

export async function get(deckId: number, db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)
    const cardStore = transaction.objectStore(Stores.CARDS)

    const deck = await deckStore.get(deckId) as Data

    const index = cardStore.index('deckId')
    const cards = await index.getAll(IDBKeyRange.only(deckId)) as CardData[]
    
    await transaction.done

    return { deck, cards }
}

export async function remove(deckId: number, db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)
    const cardStore = transaction.objectStore(Stores.CARDS)

    await deckStore.delete(deckId)

    const index = cardStore.index('deckId')
    const cards = await index.getAll(IDBKeyRange.only(deckId))

    const removals = cards.map(card => cardStore.delete(card.id))

    await Promise.all(removals)
    await transaction.done

    return
}

export async function modifyData(modified: Data, db: Database) {
    
    const transaction = db.transaction(Stores.DECKS, 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)

    await deckStore.put(modified)
    await transaction.done

    return
}

export async function getAllData(db: Database) {

    const transaction = db.transaction(Stores.DECKS, 'readonly')
    const deckStore = transaction.objectStore(Stores.DECKS)

    const decks = await deckStore.getAll() as Data[]
    await transaction.done

    return decks
}
