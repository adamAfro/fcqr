import { useContext } from 'react'

import { Data, read, readwrite } from '../deck'
import { Data as Card } from '../card'

import { links, Link } from '../app'
import { useNavigate } from "react-router-dom"   

import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import { Context, Selecting } from '.'

import { Button, Widget } from '../interactions'

import style from './style.module.css'

export default function() {

    const { textInput, setTextInput, selecting, setSelecting } = useContext(Context)

    const { t } = useTranslation()

    return <>

        <div className={style.buttons}>
            <Button contents={t`select deck to copy`} 
                active={selecting == Selecting.COPY}
                onClick={() => setSelecting(selecting == Selecting.COPY ? Selecting.NONE : Selecting.COPY)}/>

            <Button contents={t`add to selected deck`} 
                active={selecting == Selecting.PASTE} disabled={!textInput}
                onClick={() => { setSelecting(Selecting.PASTE); setTextInput(textInput)}}/>
        </div>

        <textarea className={style.input} value={textInput}
            onClick={() => setSelecting(Selecting.NONE)}
            onChange={e => setTextInput(e.target.value)}
            placeholder={`${t`term`} - ${t`definition`}`}
            data-attention='none'/>

    </>
}

export function Entries() {

    const { activeTagId, decks } = useContext(Context)

    return <ul className={style.decks}>

        <li><Widget symbol='Plus' attention='primary' disabled/></li>
        
        {(activeTagId >= 0 ? decks.filter(deck => deck.tagId == activeTagId) : decks)
            .map(deck => <li key={deck.id}><Entry {...deck}/></li>)}

    </ul>
}

function Entry(deck: Data) {

    const navigate = useNavigate()

    const { database } = useMemory()!

    const { textInput, setTextInput, selecting, setSelecting } = useContext(Context)

    const { t } = useTranslation()

    return <Button contents={deck.name || t`unnamed deck`} onClick={async () => {

        if (selecting == Selecting.COPY) {

            setSelecting(Selecting.NONE)

            const { done, cardStore } = read(database)

            const index = cardStore.index('deckId')
            const cards = await index.getAll(IDBKeyRange.only(deck.id)) as Card[]

            setTextInput(cards.map(({ term, def }) => term + ' - ' + def).join('\n'))            

            await done
            return
        }

        if (selecting == Selecting.PASTE) {

            setSelecting(Selecting.NONE)

            const { done, cardStore } = readwrite(database)
    
            const cards = handleText(textInput)
            const additions = cards
                .map(card => cardStore.add({ ...card, deckId: deck.id }))
            
            await Promise.all(additions)
            await done
            return void navigate(links.decks + deck.id!.toString())
        }

    }}/>
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

function handleText(text: string, meta?: any) {

    const { endline = '\n' } = meta?.characters || {}
    let lines = text.split(endline)
        .filter(line => line.trim() || line == endline)
    const { separator = getProbableSeparator(lines) } = meta?.characters || {}

    lines.filter(line => line.length <= 2 || line == separator)

    let cardsData = lines
        .map(line => line.split(separator) as [string, string])
        .map(([term, ...def]: [string, string]) => ({ term, def: def.join(', ') }))

    return cardsData
}