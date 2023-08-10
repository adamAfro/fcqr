import { useState }  from 'react'

import { ChangeEvent, MouseEvent, useEffect }  from 'react'

import { links, Link } from '../app'

import { useTranslation } from '../localisation'
import { useDatabase, Type as Database, Stores } from "../database"

import * as Card from '../card'

import LanguageSelect from './languages'

import style from "./style.module.css"


export function Route() {

    const { t } = useTranslation()

    const path = window.location.pathname.split('/').pop()
    const id = Number(path?.split('$').pop())

    return <main className={style.route}>
        <Link role='button' to={links.pocket}>{t`go back`}</Link>
        <h1>{t`your deck`}</h1>
        <Entry id={id}/>
    </main>
}

export interface Data {
    id?: number
    name: string
    termLang: string
    defLang: string
}

export function Entry(props: { id: number }) {

    const { t } = useTranslation()

    const database = useDatabase()

    const [data, setData] = useState<Data | null>(null)
    const [cards, setCards] = useState<Card.Data[]>([])

    useEffect(() => void get(props.id, database!).then(({deck, cards}) => {

        setData(deck)
        setCards(cards)

    }), [])

    const removal = (event: MouseEvent <HTMLButtonElement>) => {

        if (!database)
            throw new Error('no database')

        remove(props.id!, database)
        setData(null)
    }

    return <>{data ? 
        
        <Deck data={data} removal={removal}>{cards}</Deck> : 
        
        /** @TODO loading screen */
        <p>{t`removed deck`}</p>

    }</>
}

export function Deck(props: {
    data: Data, children: Card.Data[], removal: (event: MouseEvent <HTMLButtonElement>) => void 
}) {

    const { t } = useTranslation()

    const database = useDatabase()

    const [data, setData] = useState <Data | undefined> (props.data)
    const [extend, setExtend] = useState(false)
    const [cards, setCards] = useState([
        ...props.children
    ].sort((a, b) => a.order! - b.order!).reverse() as Card.Data[])
    
    const additon = (event: MouseEvent <HTMLButtonElement>) => {

        if (!database)
            throw new Error('no database')

        addCards(data?.id!, [{ term: '', def: '' }], database)
            .then(ids => setCards([{ 
                id: Number(ids[0]), term: '', def: '', 
                deckId: data?.id! 
            }, ...cards]))
    }

    const remove = (event: MouseEvent <HTMLElement>) => {

        const element = event.target as HTMLElement
        const id = Number(element.dataset.id)
        
        setCards(prev => prev.filter(card => card.id != id))
        Card.removeData(id, database!)
    }

    const shuffle = (event: MouseEvent <HTMLButtonElement>) => {

        if (!database)
            throw new Error('no database')

        const shuffled = cards.map(card => ({ ...card, order: Math.random() }))
            .sort((a, b) => a.order! - b.order!).reverse()

        modify(data!, shuffled, database)
        setCards(shuffled)
    }

    // needed for rerendering Card's Speech after changing languages
    const CardWrapper = (card: Card.Data) => 
        <Card.Editor {...card} termLang={data?.termLang!}/>

    return <div className={style.deck}>
        <div className={style.editor}>
            <Editor data={data!} setData={setData}/>
            <div className={style.buttons}>
                <button data-testid="deck-remove-btn" onClick={props.removal}>{t`remove deck`}</button>
                <button data-testid="shuffle-cards-btn" onClick={shuffle}>{t`shuffle`}</button>
                <button data-testid="extend-cards-btn" onClick={() => setExtend(x => !x)}>{
                    extend ? t`shrink` : t`extend`
                }</button>
            </div>
            <button data-testid="add-card-btn" onClick={additon}>{t`add card`}</button>
        </div>
        <ul className={style.cardlist} data-testid='cards' data-extend={extend}>
            {cards.map((card, i) => <li key={card.id}>
                <CardWrapper {...card}/>
                <button className={style.removal} data-id={card.id} onClick={remove}>{t`remove card`}</button>
            </li>)}
        </ul>
    </div>
}

function Editor({data, setData}: { data: Data, 
    setData: ReturnType <typeof useState <Data> >[1],
}) {

    const { t } = useTranslation()

    const database = useDatabase()

    const change = (event: ChangeEvent) => {

        if (!database)
            throw new Error('no database')

        const target = event.target as HTMLInputElement | HTMLSelectElement
        const key = target.name, value = target.value

        modifyData({ ...data, [key]: value } as Data, database)
        setData({ ...data, [key]: value })
    }

    return <p data-testid={`deck-${data.id}`}>
        <input placeholder={t`unnamed deck`} name="name" type="text" value={data.name} onChange={change}/>
        <LanguageSelect name="termLang" defaultValue={data.termLang} onChange={change}/>
        <LanguageSelect name="defLang" defaultValue={data.defLang} onChange={change}/>
    </p>
}

export async function add(deck: Data, cards: Card.Data[], db: Database) {

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

export async function addCards(deckId: number, card: Card.Data[], db: Database) {

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
    const cards = await index.getAll(IDBKeyRange.only(deckId)) as Card.Data[]
    
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

export async function modify(modified: Data, cards: Card.Data[], db: Database) {
    
    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)
    const cardStore = transaction.objectStore(Stores.CARDS)

    await deckStore.put(modified)

    const modifications = cards.map(card => cardStore.put(card))
    await Promise.all(modifications)

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