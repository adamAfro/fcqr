import { useState } from 'react'

import { Link } from 'react-router-dom'
import { links } from '../app'

import { add } from "../deck"
import { Type as Database } from "../database"
import { useContext } from "../context"
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

        const ids = await add(deck, cardsData, db)

        return ids.deckId
    }
}

export default (props: {}) => {

    const { database } = useContext()
    
    let data: Chunk[] = [], meta: any = {}
    const indices: number[] = []
    const 
        [checkPoints, setChecks] = useState([] as boolean[]),
        [link, setLink] = useState(null as null | string)

    const onScan = (decodedText = '') => {
        
        const dataChunk = Chunk.FromDecodedText(decodedText)
        if (!dataChunk)
            return
  
        const hasBeenRead = indices.includes(dataChunk.index)
        if (hasBeenRead)
            return

        Object.assign(meta, ...dataChunk.meta)
        data.push(dataChunk.data)

        setChecks(() => {

            const checkPoints = [] as boolean[]
            for (let i = 0; i < dataChunk.total; i++)
                checkPoints.push(indices.includes(i))

            return checkPoints
        })

        indices.push(dataChunk.index)
        if (indices.length == dataChunk.total) {

            handleData(data, meta, database!)
                .then(id => setLink(links.decks + '$' + id))

            data = []
            meta = {}
        }
    }

    return <div className={style.scanner}>

        <QR onScan={onScan} onError={(e) => console.error(e)}/>
        
        {checkPoints.map((state, i) => <div style={{display: 'flex'}}>
            <span key={i} className={style.checkpoint} data-checked={state}></span>
        </div>)}

        {link ? <p><Link data-testid='link' to={link}>Done!</Link></p> : null}

    </div>
}