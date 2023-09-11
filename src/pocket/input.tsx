import { useState, useContext } from 'react'

import { Database } from '../memory'
import { Packed } from './output'
import { readwrite, Data } from '../deck'

import { links, Link } from '../app'
import { useNavigate } from "react-router-dom"   

import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import { Context } from '.'

import * as Deck from '../deck'
import Scanner from '../scanner'


import style from './style.module.css'
import ui from '../style.module.css'


/** @TODO make it reload all decks instead of window */
export function InputOptions() {

    const { database } = useMemory()!

    const { setInput } = useContext(Context)

    const [scanning, setScanning] = useState(false)
    const [value, setValue] = useState('')

    const { t } = useTranslation()

    return <div className={style.options}>

        <h2>{t`adding cards to deck`}</h2>

        {scanning ? <Scanner
            handleData={(txt: string) => {

                setValue(txt)
                setScanning(false)

            }}/> : <textarea data-testid="cards-input-area"
            onChange={e => setValue(e.target.value)}
            placeholder={`${t`write cards below`}:\n\n${t`term`} - ${t`definition`}\n${t`term`} - ${t`definition`}\n...`}
            className={style.secondary} value={value}></textarea>}

        {!value ? <div className={style.buttons}>

            <button data-testid="scan-btn" onClick={() => setScanning(prev => !prev)}>
                {scanning ? t`close scanner` : t`scan QR`}
            </button>

            <label role="button">
                {t`load file`}<input type="file" onChange={async (e) => {

                    const input = e.target as HTMLInputElement

                    const files = Array.from(input.files!)
                    const content = await readFile(files[0])

                    let packed = null as any
                    try { packed = JSON.parse(content) } catch(er) {}
                    if (packed) {

                        await fromPackage(packed, database)

                        return void window.location.reload()
                    }

                    setValue(content)

                }}/>
            </label>

        </div> : <button data-testid="cards-input-btn" className={style.secondary} 
            onClick={() => setInput(value)}>{t`add to selected deck`}
        </button>}

    </div>
}

export function InputButton(deck: Data) {

    const navigate = useNavigate()

    const { database } = useMemory()!

    const { input } = useContext(Context)

    const { t } = useTranslation()

    return <Link key={deck.id} role="button" className={ui.primary} onClick={async () => {

        const { done, cardStore } = readwrite(database)
    
        const cards = handleCSV(input)
        const additions = cards
            .map(card => cardStore.add({ ...card, deckId: deck.id }))
        
        await Promise.all(additions)
        await done
        return void navigate(links.decks + deck.id!.toString())

    }} to={links.decks + '/' + deck.id!.toString()}>
        {deck.name || t`unnamed deck`}
    </Link>
}

async function readFile(file: Blob): Promise <string> {
    if (!file) {
        console.error('No file provided.')
        return ''
    }
  
    const reader = new FileReader()
    return new Promise((ok, er) => {

        reader.onload = (event) => {

            const fileContent = ArrayBuffer.isView(event.target?.result) ?
                // @ts-ignore
                arrayBufferToString(event.target?.result) :
                event.target?.result as string

            ok(fileContent)
        }
        
        reader.readAsText(file)
    })
}

const separators = [
    ' — ', ' - ', ' | ', ', ', ' , ', ' ; ', '; ',
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

function handleCSV(scanned: string, meta?: any) {

    const { endline = '\n' } = meta?.characters || {}
    let lines = scanned.split(endline)
        .filter(line => line.trim() || line == endline)
    const { separator = getProbableSeparator(lines) } = meta?.characters || {}

    lines.filter(line => line.length <= 2 || line == separator)

    let cardsData = lines
        .map(line => line.split(separator) as [string, string])
        .map(([term, ...def]: [string, string]) => ({ term, def: def.join(', ') }))

    return cardsData
}

export async function fromPackage(packed: Packed, db: Database, { replace = false } = {}) {

    const { done, store, cardStore } = readwrite(db)

    const additions = packed.map(async ({ data, cards }) => {

        if (!replace) {
            if (data.id)
                delete data.id
            for (const card of cards) if (card.id)
                delete card.id
        }
        
        const deckId = Number(await store.add(data))

        cards = cards.map(card => ({ ...card, deckId }))
        
        const additions = cards.map(card => cardStore.add(card))

        const cardsIds = await Promise.all(additions)

        return { deckId, cardsIds: cardsIds as number[] }
    })

    const ids = await Promise.all(additions)
    
    await done
    return ids
}