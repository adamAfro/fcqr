import { useEffect, useState } from 'react'
import { ChangeEvent, MouseEvent, HTMLAttributes }  from 'react'

import { useSettings } from '../settings/context'
import { useTranslation } from '../localisation'
import { useDatabase, Type as Database, Stores } from "../database"
import { Data, get, modify, remove, addCards, modifyData, getData } 
    from './database'


import Scanner from '../scanner'
import * as Card from '../card'


import ui from "../style.module.css"
import style from "./style.module.css"


function getIdFromPath() {

    const path = window.location.pathname.split('/').pop()
        
    return Number(path?.split('$').pop())
}

function orderLoadedCards(array: any[]) {

    return array.sort((a, b) => a.order! - b.order!).reverse()
}

export function Entry(props: { id?: number }) {

    const id = props.id || getIdFromPath()

    const { t } = useTranslation()
    const database = useDatabase()

    const [data, setData] = useState<Data | undefined>(undefined)
    useEffect(() => void getData(id, database!)
        .then((data) => setData(data)), [])

    const [cards, setCards] = useState<Card.Data[] | undefined>(undefined)
    useEffect(() => void get(id, database!)
        .then(({ cards }) => setCards(orderLoadedCards(cards) as Card.Data[])), [data])

    const removal = () => { remove(id, database!); setData(undefined) }

    return <>{data ? 
        
        /** @TODO loading screen */
        <Deck data={data} cards={cards} removal={removal}
            setCards={setCards} setData={setData}/> :
        <p data-testid="loading-deck">{t`removed deck`}</p>

    }</>
}

export function Deck({ cards, data, setData, setCards, removal }: {
    
    data: Data, setData: ReturnType<typeof useState <Data>>[1],
    cards?: Card.Data[], setCards: ReturnType<typeof useState <Card.Data[]>>[1],
    removal: (event: MouseEvent <HTMLButtonElement>) => void
}) {

    const { t } = useTranslation()
    const database = useDatabase()

    const [spread, setSpread] = useState(false)
    const [scanning, setScanning] = useState(false)
    
    const additon = () => addCards(data?.id!, [{ term: '', def: '' }], database!)
        .then(ids => setCards([{ 
            id: Number(ids[0]), term: '', def: '', deckId: data?.id! 
        }, ...cards!]))

    const remove = (event: MouseEvent <HTMLElement>) => {

        const element = event.target as HTMLElement
        const id = Number(element.dataset.id)
        
        setCards(prev => prev?.filter(card => card.id != id))
        Card.removeData(id, database!)
    }

    const shuffle = () => {

        const shuffled = cards?.map(card => ({ ...card, order: Math.random() }))
            .sort((a, b) => a.order! - b.order!).reverse()

        modify(data!, shuffled!, database!)
        setCards(shuffled)
    }

    async function handleScannerData(scanned: string, meta: any, db: Database) {

        setScanning(false)
        const type = (meta.type?.toString() as string || '')
            .toLocaleUpperCase()

        if (type == 'CSV' || /* default behaviour */ true) {
   
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

        <Editor className={style.properties} data={data!} setData={setData}/>
        
        {scanning ? <Scanner handleData={handleScannerData}/> : null}

        <button data-testid="scan-btn" onClick={() => setScanning(prev => !prev)}>
            {scanning ? t`close scanner` : t`scan QR`}
        </button>

        <button className={ui.removal} data-testid="deck-remove-btn" onClick={removal}>
            {t`remove deck`}
        </button>

        {cards ? <div className={ui.quickaccess}>
            
            <button className={style.shuffle} data-testid="shuffle-cards-btn" 
                onClick={shuffle}>{t`shuffle`}</button>

            <button className={style.spread}data-testid="spread-cards-btn" onClick={() => setSpread(x => !x)}>{
                spread ? t`shrink` : t`spread`
            }</button>
            
            <button className={style.additon} data-testid="add-card-btn" 
                onClick={additon}>{t`add card`}</button>
        </div> : null}
        
        {cards ? <Cards entries={cards}/> : null}
        
    </div>
}

const separators = [
    ' — ', ' - ', ' | ', ' , ', ' ; ', 
    '—', '-', '|', ',', ';', '\t', ' ']
function getProbableSeparator(lines: string[]) {

    return separators.find(separator => {

        let count = 0;
        for (const line of lines)
            if (line.includes(separator)) count++

        if (count >= 0.80 * lines.length)
            return true

    }) || ','
}

function Editor({data, setData}: { data: Data, 
    setData: ReturnType <typeof useState <Data> >[1],
} & HTMLAttributes <HTMLParagraphElement>) {

    const { t } = useTranslation()

    const { languages } = useSettings() 
    const database = useDatabase()

    const change = (event: ChangeEvent) => {

        const target = event.target as HTMLInputElement | HTMLSelectElement
        const key = target.name, value = target.value

        modifyData({ ...data, [key]: value } as Data, database!)
        setData({ ...data, [key]: value })
    }

    return <p data-testid={`deck-${data.id}`}>
        <input placeholder={t`unnamed deck`} name="name" type="text" value={data.name} onChange={change}/>
        <span className={style.buttons}>

            <select name="termLang" defaultValue={data.termLang} onChange={change}>
                {languages.map(({ language }, i) => <option key={i} value={language}>{language}</option>)}
            </select>

            <select name="defLang" defaultValue={data.defLang} onChange={change}>
                {languages.map(({ language }, i) => <option key={i} value={language}>{language}</option>)}    
            </select>
        
        </span>
    </p>
}