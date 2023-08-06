import { ChangeEvent, MouseEvent, useEffect }  from 'react'
import { useState }  from 'react'

import { useContext } from '../context'

import { Select as LanguageSelect} from './languages'


import { Type as Database, Stores } from '../database'

import { Editor as CardEditor, Data as CardData } from '../card'

import { Link } from 'react-router-dom'

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

    const removal = (event: MouseEvent <HTMLButtonElement>) => {

        if (!database)
            throw new Error('no database')

        remove(props.id!, database)
        setInfo(null)
    }

    return <>{info ? 
        
        <Deck info={info} removal={removal}>{cards}</Deck> : 
        
        <p>No deck here - <Link to='/'>go back</Link></p>

    }</>
}

export function Deck(props: {info: Data, children: CardData[]} & { removal: (event: MouseEvent <HTMLButtonElement>) => void }) {

    const { database } = useContext()

    const [addedCards, setAddedCards] = useState([] as CardData[])
    const additon = (event: MouseEvent <HTMLButtonElement>) => {

        if (!database)
            throw new Error('no database')

        addCards(props.info.id!, [{ term: '', def: '' }], database)
            .then(ids => setAddedCards([...addedCards, { 
                id: Number(ids[0]), term: '', def: '', 
                deckId: props.info.id! 
            }]))
    }

    return <div>
        <Editor {...props.info}/>
        <button data-testid="deck-remove-btn" onClick={props.removal}>remove deck</button>
        <button data-testid="add-card-btn" onClick={additon}>Add</button>
        <ul data-testid='added-cards'>
            {addedCards.map(card => <CardEditor key={card.id} {...card}/>)}
        </ul>
        <ul data-testid='cards'>
            {props.children.map(card => <CardEditor key={card.id} {...card}/>)}
        </ul>
    </div>
}

/** @BUG modifing 2 languages at once makes only 2nd saved */
function Editor(props: Data) {

    const { database } = useContext()

    const 
        [name, setName] = useState(props.name),
        [termLang, setTermLang] = useState(props.termLang),
        [defLang, setDefLang] = useState(props.defLang)
    const setters = new Map([
        ['name', setName],
        ['termLang', setTermLang],
        ['defLang', setDefLang]
    ])

    const change = (event: ChangeEvent) => {

        if (!database)
            throw new Error('no database')

        const target = event.target as HTMLInputElement | HTMLSelectElement
        const key = target.name, value = target.value

        modifyData({ ...props, [key]: value } as Data, database)
        setters.get(key)!(value)
    }

    return <p data-testid={`deck-${props.id}`}>
        <input name="name" type="text" value={name} onChange={change}/>
        <LanguageSelect name="termLang" defaultValue={termLang} onChange={change}/>
        <LanguageSelect name="defLang" defaultValue={defLang} onChange={change}/>
    </p>
}

export async function add(deck: Data, cards: CardData[], db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)
    const cardStore = transaction.objectStore(Stores.CARDS)

    const deckId = Number(await deckStore.add(deck))

    cards = cards.map(card => ({ ...card, deckId }))
    
    const additions = cards.map(card => cardStore.add(card))

    const cardsIds = await Promise.all(additions)
    await transaction.done

    return { deckId, cardsIds: cardsIds as number[] }
}

export async function addData(deck: Data, db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)

    const deckId = Number(await deckStore.add(deck))
    await transaction.done

    return deckId
}

export async function addCards(deckId: number, card: CardData[], db: Database) {

    const transaction = db.transaction([Stores.CARDS], 'readwrite')
    const cardStore = transaction.objectStore(Stores.CARDS)

    card = card.map(card => ({ ...card, deckId }))
    
    const additions = card.map(card => cardStore.add(card))

    const ids = await Promise.all(additions)
    await transaction.done

    return ids
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

export async function getData(deckId: number, db: Database) {

    const transaction = db.transaction([Stores.DECKS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)

    const deck = await deckStore.get(deckId) as Data
    await transaction.done

    return deck
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

export async function getLast(db: Database) {
    
    const transaction = db.transaction(Stores.DECKS, 'readonly')
    const store = transaction.objectStore(Stores.DECKS)

    const cursor = await store.openCursor(null, "prev")
    await transaction.done
    
    return cursor ? cursor.value : null
}