import { HTMLAttributes, useState }  from 'react'

import { ChangeEvent, MouseEvent, useEffect }  from 'react'

import { useTranslation } from '../localisation'
import { useDatabase, Type as Database, Stores } from "../database"


import Scanner from '../scanner'
import * as Card from '../card'

import LanguageSelect from './languages'


import ui from "../style.module.css"
import style from "./style.module.css"


export interface Data {
    id?: number
    name: string
    termLang: string
    defLang: string
}

export function Entry({ id }: { id?: number }) {

    const { t } = useTranslation()

    if (!id) {
        
        const path = window.location.pathname.split('/').pop()
        
        id = Number(path?.split('$').pop())
    }

    const database = useDatabase()

    const [data, setData] = useState<Data | undefined>(undefined)
    const [cards, setCards] = useState<Card.Data[] | undefined>(undefined)

    useEffect(() => void getData(id!, database!).then((data) => setData(data)), [])
    useEffect(() => void get(id!, database!)
        .then((deck) => setCards(deck.cards.sort((a, b) => a.order! - b.order!).reverse() as Card.Data[])), [data])

    const removal = (event: MouseEvent <HTMLButtonElement>) => {

        if (!database)
            throw new Error('no database')

        remove(id!, database)
        setData(undefined)
    }

    return <>{data ? 
        
        <Deck data={data} removal={removal} 
            setCards={setCards} setData={setData}>{cards ? cards : []}</Deck> : 
        
        /** @TODO loading screen */
        <p data-testid="loading-deck">{t`removed deck`}</p>

    }</>
}

export function Deck(props: {
    data: Data, children: Card.Data[], 
    removal: (event: MouseEvent <HTMLButtonElement>) => void,
    setData: ReturnType<typeof useState <Data>>[1]
    setCards: ReturnType<typeof useState <Card.Data[]>>[1]
}) {

    const { t } = useTranslation()

    const database = useDatabase()
    const { data, setData, setCards } = props
    const cards = props.children

    const [spread, setSpread] = useState(false)
    const [scanning, setScanning] = useState(false)
    
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
        
        setCards(prev => prev?.filter(card => card.id != id))
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

    async function handleScannerData(scanned: string, meta: any, db: Database) {

        setScanning(false)
        const type = (meta.type?.toString() as string || '')
            .toLocaleUpperCase()

        if (type == 'CSV' || /* default behaviour */ true) {
    
            const { separator = ',', endline = '\n' } = meta?.characters || {}
    
            let cardsData = scanned.split(endline)
                .map(line => line.split(separator) as [string, string])
                .map(([term, def = '']: [string, string]) => ({ term, def }))
    
            const ids = await addCards(data?.id!, cardsData, db)
            cardsData.map((card, i) => ({ ...card, id: ids[i] }))

            setCards(prev => [...cardsData.reverse(), ...prev!])
        }
    }

    const Cards = ({entries}:{entries:Card.Data[]}) => <ul 
        className={style.cardlist} 
        data-testid='cards' 
        data-spread={spread}>

        {entries.map(card => <li key={card.id}>
            <Card.Editor {...card} termLang={data?.termLang!}/>
            <button className={ui.removal} data-id={card.id} onClick={remove}>{t`remove card`}</button>
        </li>)}

    </ul>

    return <div className={style.deck}>

        <div className={style.properties}>
            <Editor data={data!} setData={setData}/>

            {scanning ? <Scanner handleData={handleScannerData}/> : null}
            <div className={style.buttons}>
                <button data-testid="scan-btn" onClick={() => setScanning(prev => !prev)}>
                    {scanning ? t`close scanner` : t`scan QR`}
                </button>
                <button className={ui.removal} data-testid="deck-remove-btn" 
                    onClick={props.removal}>{t`remove deck`}</button>
            </div>
        </div>

        <div className={ui.quickaccess}>
            
            <button className={style.shuffle} data-testid="shuffle-cards-btn" 
                onClick={shuffle}>{t`shuffle`}</button>

            <button className={style.spread}data-testid="spread-cards-btn" onClick={() => setSpread(x => !x)}>{
                spread ? t`shrink` : t`spread`
            }</button>
            
            <button className={style.additon} data-testid="add-card-btn" 
                onClick={additon}>{t`add card`}</button>
        </div>
        
        <Cards entries={cards}/>
        
    </div>
}

function Editor({data, setData}: { data: Data, 
    setData: ReturnType <typeof useState <Data> >[1],
} & HTMLAttributes <HTMLParagraphElement>) {

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
        <span className={style.buttons}>
            <LanguageSelect name="termLang" defaultValue={data.termLang} onChange={change}/>
            <LanguageSelect name="defLang" defaultValue={data.defLang} onChange={change}/>
        </span>
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

    const data = await deckStore.get(deckId) as Data

    const index = cardStore.index('deckId')
    const cards = await index.getAll(IDBKeyRange.only(deckId)) as Card.Data[]
    
    await transaction.done

    return { data, cards }
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