import { useEffect, useState } from 'react'

import { useTranslation } from '../localisation'
import { useMemory, Database } from "../memory"
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
    EXERCISES,
    REMOVED
}

export * from './database'

export { default as Editor } from './editor'

export default function Deck(props: { id?: number }) {

    const { t } = useTranslation()
    const { database } = useMemory()!

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

    const [addedCards, setAddedCards] = useState([] as  Card.Data[])
    const [initialcards, setInitialCards] = useState<Card.Data[] | undefined>(undefined)
    useEffect(() => void get(id, database!).then(({ cards }) => {

        if (state != State.PARTIAL_LOADED)
            return

        setInitialCards(orderLoadedCards(cards) as Card.Data[])
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

                setAddedCards(prev => [...cardsData.reverse(), ...prev!])
            }

        }}/> : null}

        {state >= State.LOADED ? <button 
            className={style.play} data-testid="play-btn" onClick={() => {

                state != State.EXERCISES ? setState(State.EXERCISES) : setState(State.LOADED)

                setAddedCards([])
                get(id, database)
                    .then(({ cards }) => setInitialCards(orderLoadedCards(cards) as Card.Data[]))
            }}>   
            
            {state != State.EXERCISES ? t`exercises` : t`edition`}

        </button> : null}

        <button data-testid="scan-btn" onClick={() => setScanning(prev => !prev)}>
            {scanning ? t`close scanner` : t`scan QR`}
        </button>

        <button className={ui.removal} data-testid="deck-remove-btn" onClick={() => { 
        
            remove(id, database!)
            setState(State.PARTIAL_LOADED)

        }}>{t`remove deck`}</button>

        {state >= State.LOADED ? <div className={ui.quickaccess}>
            
            <button className={style.shuffle} data-testid="shuffle-cards-btn" onClick={() => {

                const shuffled = initialcards?.map(card => ({ ...card, order: Math.random() }))
                    .sort((a, b) => a.order! - b.order!).reverse()
        
                modifyCards(id, shuffled!, database!)
                setInitialCards(shuffled)

            }}>{t`shuffle`}</button>

            <button className={style.spread}data-testid="spread-cards-btn" onClick={() => setSpread(x => !x)}>{
                spread ? t`shrink` : t`spread`
            }</button>
            
            <button className={style.addition} data-testid="add-card-btn" onClick={() => {

                addCards(id, [{ term: '', def: '' }], database!)
                    .then(ids => setAddedCards([{ 
                        id: Number(ids[0]), term: '', def: '', deckId: id 
                    }, ...addedCards!]))

            }}>{t`add card`}</button>

        </div> : null}

        <ul className={style.cardlist} 
            data-testid="added-cards"
            data-spread={spread}>

            {addedCards.map(card => <li key={card.id}>
                {state == State.EXERCISES ?
                    <Card.Exercise {...card} 
                        termLang={termLang!} defLang={defLang}/> :
                    
                    <Card.Editor {...card} 
                        termLang={termLang!} defLang={defLang} />
                }
            </li>)}

        </ul>
        
        {state >= State.LOADED ? <ul className={style.cardlist} 
            data-testid='cards'
            data-spread={spread}>

            {initialcards?.map(card => <li key={card.id}>
                {state == State.EXERCISES ?
                    <Card.Exercise {...card} 
                        termLang={termLang!} defLang={defLang}/> :
                    
                    <Card.Editor {...card} 
                        termLang={termLang!} defLang={defLang} />
                }
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