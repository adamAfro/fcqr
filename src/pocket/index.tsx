import { useState, useEffect, createContext, useContext, useMemo } 
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
    input: '', setInput: (_:string) => {},
    selection: [] as number[], 
        setSelection(_:(p: number[]) => number[]) {}
})

enum Options {
    NONE, INPUT, OUTPUT
}

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
    const [selection, setSelection] = useState([] as number[])
    const [showOptions, setShowOptions] = useState(Options.NONE)

    const { t } = useTranslation()

    return <Context.Provider value={{ input, setInput, selection, setSelection }}>

        <nav className={ui.quickaccess}>
            <div className={ui.faraccess}>

                {showOptions == Options.NONE ? <>
                    <p className={ui.brandname}>FCQR</p>    
                    <p><a target='_blank' href="https://github.com/adamAfro/fcqr">
                        by adamAfro
                    </a></p>
                    <p><Link role="button" data-testid="preferences-btn" to={links.options}>{t`options`}</Link></p>
                </> : null}

                {showOptions == Options.INPUT && !input ? <InputOptions/> : null}
                {showOptions == Options.OUTPUT && !input ? <OutputOptions/> : null}
            
            </div>

            <div className={ui.thumbaccess}>

                <p className={ui.buttonstack}>
                    
                    <button className={input ? ui.removal : ''} onClick={() => {

                        if (showOptions != Options.INPUT)
                            return void setShowOptions(Options.INPUT)

                        setShowOptions(Options.NONE)
                        setInput('')

                    }}>📝</button>

                    <button onClick={() => {

                        if (showOptions != Options.OUTPUT)
                            return void setShowOptions(Options.OUTPUT)

                        setShowOptions(Options.NONE)

                    }}>⏏️</button>
                </p>

                <button className={ui.primary} onClick={() => {

                    const deck = { name: '', termLang: '', defLang: '' }
                    
                    if (!props.ignoreDatabase)
                        Deck.addData(deck, database)
                            .then(id => navigate(links.decks + id.toString()))
                        
                }} data-testid='add-btn'>➕</button>
            </div>
        </nav>

        <h1 className={ui.title}>{t`your decks`}</h1>

        <ul className={style.decklist} data-testid="decks">
            
            {decks.map(deck => <li key={deck.id}>

                {showOptions == Options.NONE ? 
                    <DeckLink {...deck}/> : null}

                {showOptions == Options.INPUT ?
                    <InputButton {...deck}/> : null}

                {showOptions == Options.OUTPUT ?
                    <OutputSelectionButton {...deck}/> : null}

            </li>)}

        </ul>

    </Context.Provider>
}

function DeckLink(deck: Deck.Data) {

    const { t } = useTranslation()

    return <Link key={deck.id} role="button" className={ui.primary} 
        to={links.decks + '/' + deck.id!.toString()}>
        {deck.name || t`unnamed deck`}
    </Link>
}

function OutputSelectionButton(deck: Deck.Data) {

    const { selection, setSelection } = useContext(Context)
    
    const [selected, setSelected] = useState(false)
    useEffect(() => setSelected(selection.includes(deck.id!)), [selection])

    const { t } = useTranslation()

    return <>{selected ? 
    
        <button key={deck.id} className={ui.primary} 
            onClick={() => setSelection(selection => selection.filter(id => id != deck.id!))}>    
            {deck.name || t`unnamed deck`}
        </button> 
        
        :

        <button key={deck.id} 
            onClick={() => setSelection(prev => [...prev, deck.id!])}>
            {deck.name || t`unnamed deck`}
        </button>
    }</>
}

function OutputOptions() {

    const { database } = useMemory()!

    const { t } = useTranslation()

    const { selection, setSelection } = useContext(Context)

    const [href, setHref] = useState('')
    useEffect(() => void Deck.createPackage(selection, database).then(p => {

        const x = 'data:text/plain;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(p))

        setHref(x)

    }), [selection])

    return <div className={style.options}>

        <h2>{t`exporting decks`}</h2>

        <p>{t`select decks by clicking on them`}</p>

        <div className={style.buttons}>
            
            <a role='button' href={href} download={t`decks` + '.json'}>
                {t`save`}
            </a>
            
            <button onClick={async () => {

                const packed = await Deck.createPackage([...selection], database)
                
                navigator.clipboard.writeText(JSON.stringify(packed))

                setSelection(_ => [])

            }}>{t`copy`}</button>
        </div>

    </div>
}

function InputButton(deck: Deck.Data) {

    const navigate = useNavigate()

    const { database } = useMemory()!

    const { input } = useContext(Context)

    const { t } = useTranslation()

    return <Link key={deck.id} role="button" className={ui.primary} onClick={() => {

        Deck.addCards(deck.id!, handleCSV(input), database)
            .then(() => navigate(links.decks + deck.id!.toString()))

    }} to={links.decks + '/' + deck.id!.toString()}>
        {deck.name || t`unnamed deck`}
    </Link>
}

/** @TODO make it reload all decks instead of window */
function InputOptions() {

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

                        await Deck.fromPackage(packed, database)

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

    lines.filter(line => line.length <= 1 || line == separator)

    let cardsData = lines
        .map(line => line.split(separator) as [string, string])
        .map(([term, ...def]: [string, string]) => ({ term, def: def.join(', ') }))

    return cardsData
}