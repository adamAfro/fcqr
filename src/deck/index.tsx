import { useEffect, useState } from 'react'

import { useTranslation } from '../localisation'
import { useDatabase, Type as Database } from "../database"
import { get, modifyCards, remove, addCards, getData } 
    from './database'

import Scanner from '../scanner'
import * as Card from '../card'
import Editor from './editor'

import ui from "../style.module.css"
import style from "./style.module.css"

enum State {
    LOADING,
    PARTIAL_LOADED,
    LOADED,
    REMOVED
}

export default function Deck(props: { id?: number }) {

    const { t } = useTranslation()
    const database = useDatabase()

    const id = props.id || getIdFromPath()

    const [state, setState] = useState(State.LOADING)
    
    const [name, setName] = useState(undefined as string | undefined)
    const [termLang, setTermLang] = useState(undefined as string | undefined)
    const [defLang, setDefLang] = useState(undefined as string | undefined)
    useEffect(() => void getData(id, database!).then(data => {

        setState(State.PARTIAL_LOADED)
        setName(data.name)
        setTermLang(data.termLang)
        setDefLang(data.defLang)
        
    }), [])

    const [cards, setCards] = useState<Card.Data[] | undefined>(undefined)
    useEffect(() => void get(id, database!).then(({ cards }) => {

        if (state != State.PARTIAL_LOADED)
            return

        setCards(orderLoadedCards(cards) as Card.Data[])
        setState(State.LOADED)

    }), [state])

    const [spread, setSpread] = useState(false)
    const [scanning, setScanning] = useState(false)

    return <div className={style.deck}>

        {state > State.LOADING ? <Editor className={style.properties}
            deckId={id!} initalName={name!} termLang={termLang!} defLang={defLang!}
            setTermLang={setTermLang} setDefLang={setDefLang}/> : null}
        
        {scanning ? <Scanner handleData={async (scanned: string, meta: any, db: Database) => {

            setScanning(false)
            const type = (meta.type?.toString() as string || '')
                .toLocaleUpperCase()

            if (type == 'CSV' || /* default behaviour */ true) {

                const cardsData = await handleCSV(scanned, meta)
                const addedIds = await addCards(id, cardsData, db)
                cardsData.map((card, i) => ({ ...card, id: addedIds[i] }))

                setCards(prev => [...cardsData.reverse(), ...prev!])
            }

        }}/> : null}

        <button data-testid="scan-btn" onClick={() => setScanning(prev => !prev)}>
            {scanning ? t`close scanner` : t`scan QR`}
        </button>

        <button className={ui.removal} data-testid="deck-remove-btn" onClick={() => { 
        
            remove(id, database!)
            setState(State.PARTIAL_LOADED)

        }}>{t`remove deck`}</button>

        {cards ? <div className={ui.quickaccess}>
            
            <button className={style.shuffle} data-testid="shuffle-cards-btn" onClick={() => {

                const shuffled = cards?.map(card => ({ ...card, order: Math.random() }))
                    .sort((a, b) => a.order! - b.order!).reverse()
        
                modifyCards(id, shuffled!, database!)
                setCards(shuffled)

            }}>{t`shuffle`}</button>

            <button className={style.spread}data-testid="spread-cards-btn" onClick={() => setSpread(x => !x)}>{
                spread ? t`shrink` : t`spread`
            }</button>
            
            <button className={style.addition} data-testid="add-card-btn" onClick={() => addCards(id, [{ term: '', def: '' }], database!)
                .then(ids => setCards([{ 
                    id: Number(ids[0]), term: '', def: '', deckId: id 
                }, ...cards!]))
            }>{t`add card`}</button>

        </div> : null}
        
        {cards ? <ul 
            className={style.cardlist} 
            data-testid='cards'
            data-spread={spread}>

            {cards.map(card => <li key={card.id}>

                <Card.Editor {...card} termLang={termLang!}/>            
                <button className={ui.removal} data-id={card.id} onClick={() => {

                    setCards(prev => prev?.filter(rm => rm.id != card.id))
                    Card.removeData(id, database!)

                }}>{t`remove card`}</button>

            </li>)}

        </ul> : null}
        
    </div>
}

function getIdFromPath() {

    const path = window.location.pathname.split('/').pop()
        
    return Number(path?.split('$').pop())
}

function orderLoadedCards(array: any[]) {

    return array.sort((a, b) => a.order! - b.order!).reverse()
}

const separators = [
    ' — ', ' - ', ' | ', ' , ', ' ; ', 
    '—', '-', '|', ',', ';', '\t', ' '
]

function getProbableSeparator(lines: string[]) {

    return separators.find(separator => {

        let count = 0;
        for (const line of lines)
            if (line.includes(separator)) count++

        if (count >= 0.80 * lines.length)
            return true

    }) || ','
}

async function handleCSV(scanned: string, meta: any) {

    const { endline = '\n' } = meta?.characters || {}
    const lines = scanned.split(endline)
    const { separator = getProbableSeparator(lines) } = meta?.characters || {}

    let cardsData = lines
        .map(line => line.split(separator) as [string, string])
        .map(([term, ...def]: [string, string]) => ({ term, def: def.join(', ') }))

    console.debug({ size: scanned.length,
        n: cardsData.length,
        meta, endline, separator, 
    })

    return cardsData
}