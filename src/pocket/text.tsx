import { useContext } from 'react'

import { Data, read, readwrite } from '../deck'
import { Data as Card } from '../card'

import { links } from '../app'
import { useNavigate } from "react-router-dom"   

import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import { Context, OptionName } from '.'

import { Button, Widget } from '../interactions'

import style from './style.module.css'

export function Input() {

    const { textInput, setTextInput, setActiveOption } = useContext(Context)

    const { t } = useTranslation()

    return <>
        
        <textarea className={style.input} value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder={`${t`term`} - ${t`definition`}`}
            data-attention='none'/>

        <p>
            <Button contents={t`paste to selected deck`}
                onClick={() => setActiveOption(OptionName.PASTE)}/>
        </p>
    
    </>
}

export function InputButton() {

    const { activeOption, setActiveOption } = useContext(Context)

    return <Widget symbol='Pencil'
        active={activeOption == OptionName.WRITE}
        onClick={() => setActiveOption(activeOption == OptionName.WRITE ? OptionName.NONE : OptionName.WRITE)}/>
}

export function CopyButton() {

    const { activeOption, setActiveOption } = useContext(Context)

    return <Widget symbol='Copy'
        active={activeOption == OptionName.COPY}
        onClick={() => setActiveOption(activeOption == OptionName.COPY ? OptionName.NONE : OptionName.COPY)}/>
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

    const { textInput, setTextInput, activeOption, setActiveOption } = useContext(Context)

    const { t } = useTranslation()

    return <Button contents={deck.name || t`unnamed deck`} onClick={async () => {

        if (activeOption == OptionName.COPY) {

            setActiveOption(OptionName.WRITE)

            const { done, cardStore } = read(database)

            const index = cardStore.index('deckId')
            const cards = await index.getAll(IDBKeyRange.only(deck.id)) as Card[]

            setTextInput(cards.map(({ term, def }) => term + ' - ' + def).join('\n'))            

            await done
            return
        }

        if (activeOption == OptionName.PASTE) {

            setActiveOption(OptionName.NONE)

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