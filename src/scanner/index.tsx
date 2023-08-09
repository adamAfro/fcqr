import { useState } from 'react'

import { links, Link } from '../app'

import { useTranslation } from '../localisation'
import { useDatabase, Type as Database } from "../database"

import * as Deck from "../deck"


import Chunk from './chunk'
import QR from './html5qr'

import style from './style.module.css'


async function handleData(data: any[], meta: any, db: Database) {

    const type = (meta.type?.toString() as string || '')
        .toLocaleUpperCase()
    if (type == 'CSV' || /* default behaviour */ true) {

        const cardsData = data
            .map(chunk => chunk.split('\n')).flat()
            .map(line => line.split(','))
            .map(([term, def]: [string, string]) => ({ term, def }))

        const deck = {
            name: meta.name?.toString() as string || 
                cardsData[0].term + ' - ' + 
                cardsData[0].def.substring(0, 5) + '...',
            termLang: meta.termLang?.toString() as string || '',
            defLang: meta.termLang?.toString() as string || ''
        }

        const ids = await Deck.add(deck, cardsData, db)

        return ids.deckId
    }
}

export default (props: {}) => {

    const { t } = useTranslation()

    const database = useDatabase()
    const 
        [checkPoints, setCheckpoints] = useState([] as boolean[]),
        [link, setLink] = useState(null as null | string),
        [status, setStatus] = useState(t`no scans yet`)

    let data: Chunk[] = [], 
        meta: any = {}, 
        indices: number[] = []
    
    const onScan = (decodedText = '') => {

        setStatus(t`scanned QR code`)
        
        const dataChunk = Chunk.FromDecodedText(decodedText)
        if (!dataChunk)
            return

        setStatus(t`scanned QR chunk with data` + ` ${dataChunk.index}/${dataChunk.total} `)

        const hasBeenRead = indices.includes(dataChunk.index)
        if (hasBeenRead)
            return

        setStatus(t`scanned QR chunk with new data` + ` ${indices.toString()} `)

        indices.push(dataChunk.index)
        if (dataChunk.meta)
            meta = { ...meta, ...dataChunk.meta }
        
        data.push(dataChunk.data)

        if (indices.length == dataChunk.total) {

            handleData(data, meta, database!)
                .then(id => setLink(links.decks + '$' + id))

            data = []
            meta = {}
            indices = []
        }

        setCheckpoints(prev => {

            const checkPoints = [] as boolean[]
            for (let i = 0; i < dataChunk.total; i++)
                checkPoints.push(indices.includes(i))

            return checkPoints
        })
    }

    const onError = () => void ({}) // setStatus(t`could not find QR`)

    return <main className={style.scanner}>

        <Link role='button' to='/'>{t`go back`}</Link>

        <h2>{t`QR scanner`}</h2>

        {!link ? <>

            <p>{status}</p>
        
            <QR onScan={onScan} onError={onError}/>
        
            <div className={style.checkpoints}>
                {checkPoints.map((state, i) => <div style={{display: 'flex'}}>
                    <span key={i} className={style.checkpoint} data-checked={state}></span>
                </div>)}
            </div>
            
        </> : <p><Link data-testid='link' to={link}>{t`scanning is done`}</Link></p>}

    </main>
}