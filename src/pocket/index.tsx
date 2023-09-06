import { useState, useEffect, createContext, useContext } 
    from 'react'

import { links, Link } from '../app'
import { useNavigate } from "react-router-dom"   

import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import * as Deck from '../deck'
import Scanner from '../scanner'


import style from './style.module.css'
import ui from '../style.module.css'


const Context = createContext({
    input: '', setInput: (_:string) => {}
})

export default function(props: {
    decks?: Deck.Data[],
    ignoreDatabase?: boolean
}) {

    const navigate = useNavigate()

    const [decks, setDecks] = useState(props.decks || [])

    const { database } = useMemory()!
    useEffect(() => void (props.ignoreDatabase || Deck.getAllData(database)
        .then(decks => setDecks(decks.reverse()))), [database])

    const [input, setInput] = useState('')
    const [showOptions, setShowOptions] = useState(false)

    const { t } = useTranslation()

    return <Context.Provider value={{ input, setInput }}>

        <nav className={ui.quickaccess}>
            <div className={ui.faraccess}>
                <p className={ui.brandname}>FCQR</p>    
                <p><a target='_blank' href="https://github.com/adamAfro/fcqr">
                    by adamAfro
                </a></p>
                <p><Link role="button" data-testid="preferences-btn" to={links.options}>{t`options`}</Link></p>
            </div>

            <div className={ui.thumbaccess}>

                <button className={showOptions ? (input ? ui.removal : '') : ui.primary}
                    onClick={() => {

                        if (!showOptions)
                            return void setShowOptions(true)

                        setShowOptions(false)
                        setInput('')

                    }}>📂</button>

                <button disabled={showOptions} className={ui.primary} onClick={() => {

                    const deck = { name: '', termLang: '', defLang: '' }
                    
                    if (!props.ignoreDatabase)
                        Deck.addData(deck, database)
                            .then(id => navigate(links.decks + id.toString()))
                        
                }} data-testid='add-btn'>➕</button>
            </div>
        </nav>

        <h1 className={ui.title}>{t`your decks`}</h1>

        {showOptions && !input ? <InputOptions/> : null}

        <ul className={style.decklist} data-testid="decks">
            
            {decks.map(deck => <li key={deck.id}>
                
                <Link className={style.deck} onClick={input ? () => {

                    Deck.addCards(deck.id!, handleCSV(input), database)
                        .then(() => navigate(links.decks + deck.id!.toString()))

                } : () => {}} to={links.decks + '/' + deck.id!.toString()}>
                    {deck.name || t`unnamed deck`}
                </Link>

            </li>)}

        </ul>

    </Context.Provider>
}

function InputOptions() {

    const { setInput } = useContext(Context)

    const [scanning, setScanning] = useState(false)
    const [value, setValue] = useState('')

    const { t } = useTranslation()

    return <div className={style.options}>

        <h2>{t`adding cards to deck`}</h2>

        <button disabled={!value} data-testid="cards-input-btn" className={style.secondary} 
            onClick={() => setInput(value)}>{t`click to select deck`}</button>

        {scanning ? <Scanner
            handleData={(txt: string) => {

                setValue(txt)
                setScanning(false)

            }}/> : <textarea data-testid="cards-input-area"
            onChange={e => setValue(e.target.value)}
            placeholder={t`or write cards manually here,\nlike so:\n\n term - definition`}
            className={style.secondary} value={value}></textarea>}

        <button data-testid="scan-btn" onClick={() => setScanning(prev => !prev)}>
            {scanning ? t`close scanner` : t`scan QR`}
        </button>

    </div>
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

function handleCSV(scanned: string, meta?: any) {

    const { endline = '\n' } = meta?.characters || {}
    const lines = scanned.split(endline).filter(line => line.trim())
    const { separator = getProbableSeparator(lines) } = meta?.characters || {}

    let cardsData = lines
        .map(line => line.split(separator) as [string, string])
        .map(([term, ...def]: [string, string]) => ({ term, def: def.join(', ') }))

    return cardsData
}