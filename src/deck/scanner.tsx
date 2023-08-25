import Base from '../scanner'

import { Database } from "../memory"
import { Data as Card } from '../card/database'
import { addCards } from './database'

import style from "./style.module.css"

export default function Scanner({ deckId, onSuccess }: {
    deckId: number,
    onSuccess: (cards: Card[]) => void
}) {

    return <Base className={style.scanner} handleData={async (scanned: string, meta: any, db: Database) => {

        const type = (meta.type?.toString() as string || '')
            .toLocaleUpperCase()

        if (type == 'CSV' || /* default behaviour */ true) {

            const cardsData = await handleCSV(scanned, meta)
            const addedIds = await addCards(deckId, cardsData, db)
            
            onSuccess(cardsData
                .map((card, i) => ({ ...card, id: addedIds[i] as number }))
                .reverse()
            )
        }
    }}/>
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