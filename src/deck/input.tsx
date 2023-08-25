import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Base from '../scanner'

import { Database, useMemory } from "../memory"
import { Data as Card } from '../card/database'
import { addCards } from './database'

import style from "./style.module.css"

export function Scanner({ deckId, onSuccess }: {
    deckId: number,
    onSuccess: (cards: Card[]) => void
}) {

    const { database } = useMemory()!

    return <Base className={style.scanner} handleData={async (scanned: string, meta: any) => {

        const type = (meta.type?.toString() as string || '')
            .toLocaleUpperCase()

        if (type == 'CSV' || /* default behaviour */ true) {

            const cardsData = await handleCSV(scanned, meta)
            const addedIds = await addCards(deckId, cardsData, database)
            
            onSuccess(cardsData
                .map((card, i) => ({ ...card, id: addedIds[i] as number }))
                .reverse()
            )
        }
    }}/>
}

export function Text({ deckId, onSuccess }: { 
    deckId: number,
    onSuccess: (cards: Card[]) => void
}) {

    const { database } = useMemory()!

    const [value, setValue] = useState('')

    const { t } = useTranslation()
    
    return <section>

        <button data-testid="cards-input-btn" className={style.secondary} onClick={async () => {
            
            const cardsData = await handleCSV(value)
            const addedIds = await addCards(deckId, cardsData, database)

            setValue('')
            onSuccess(cardsData
                .map((card, i) => ({ ...card, id: addedIds[i] as number }))
                .reverse()
            )
            
        }}>
            {t`add written cards`}
        </button>

        <textarea data-testid="cards-input-area"
            onChange={e => setValue(e.target.value)} 
            placeholder={'...' + t`place for text input`}
            className={style.secondary} value={value}></textarea>

    </section>
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

async function handleCSV(scanned: string, meta?: any) {

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