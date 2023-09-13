import { useState, useEffect, createContext, useContext } from 'react'

import { Database, Stores } from '../memory'
import { links, Link } from '../app'
import { useNavigate } from "react-router-dom"   

import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import * as Deck from '../deck'
import { readwrite } from '../deck/properties'

import { InputButton, InputOptions } from './input'
import { OutputSelectionButton, OutputOptions } from './output'


import style from './style.module.css'
import ui from '../style.module.css'


enum Options {
    NONE, INPUT, OUTPUT
}

export const Context = createContext({
    input: '', setInput: (_:string) => {},
    selection: [] as number[], 
        setSelection(_:(p: number[]) => number[]) {},
    showOptions: Options.NONE as Options, 
        setShowOptions(_: Options) {}
})

export default function(props: {
    decks?: Deck.Data[],
    ignoreDatabase?: boolean
}) {

    const [decks, setDecks] = useState(props.decks || [])

    const { database } = useMemory()!
    useEffect(() => {

        if (props.ignoreDatabase) return

        const { done, store } = read(database)
        store.getAll()
            .then(decks => void setDecks(decks.reverse()))
            .then(() => done)
        
        return

    }, [database])

    const [input, setInput] = useState('')
    const [selection, setSelection] = useState([] as number[])
    const [showOptions, setShowOptions] = useState(Options.NONE)

    const { t } = useTranslation()

    return <Context.Provider value={{ 
        input, setInput, 
        selection, setSelection,
        showOptions, setShowOptions
    }}>

        <Quickaccess/>

        <h1 className={ui.title}>{t`your decks`}</h1>

        <ul className={style.decklist} data-testid="decks">
            
            {decks.map(deck => <li key={deck.id}><DeckButton {...deck}/></li>)}

        </ul>

    </Context.Provider>
}

function Quickaccess() {

    const { showOptions, input } = useContext(Context)

    const { t } = useTranslation()

    return <nav className={ui.quickaccess}>

        <div className={ui.faraccess}>

            {showOptions == Options.NONE ? <>    
                <a className={ui.brandname} target='_blank' href="https://github.com/adamAfro/flisqs">
                    {t`flisqs`}
                </a>
                <p><Link role="button" data-testid="preferences-btn" to={links.options}>{t`options`}</Link></p>
            </> : null}

            {showOptions == Options.INPUT && !input ? <InputOptions/> : null}
            {showOptions == Options.OUTPUT && !input ? <OutputOptions/> : null}
        
        </div>

        <div className={ui.thumbaccess}>

            <p className={ui.buttonstack}>

                <ImportButton/>
                
                <ExportButton/>
                
            </p>

            <AddButton/>

        </div>
    </nav>
}

function AddButton() {

    const navigate = useNavigate()

    const { database } = useMemory()!

    return <button className={ui.widget} onClick={async () => {

        const { done, store } = readwrite(database)
        
        const deckId = Number(await store.add({ name: '' }))
    
        await done
        return void navigate(links.decks + deckId.toString())
            
    }} data-testid='add-btn'>➕</button>
}

function ExportButton() {

    const { showOptions, setShowOptions } = useContext(Context)

    return <button className={ui.widget} onClick={() => {

        if (showOptions != Options.OUTPUT)
            return void setShowOptions(Options.OUTPUT)

        setShowOptions(Options.NONE)

    }}>⏏️</button>
}

function ImportButton() {

    const { showOptions, setShowOptions, setInput } = useContext(Context)

    return <button className={ui.widget} onClick={() => {

        if (showOptions != Options.INPUT)
            return void setShowOptions(Options.INPUT)

        setShowOptions(Options.NONE)
        setInput('')

    }}>📝</button>
}

function DeckButton(deck: Deck.Data) {

    const { showOptions } = useContext(Context)

    const { t } = useTranslation()

    if (showOptions == Options.INPUT)
        return <InputButton {...deck}/>

    if (showOptions == Options.OUTPUT)
        return <OutputSelectionButton {...deck}/>

    return <Link key={deck.id} role="button" 
        to={links.decks + '/' + deck.id!.toString()}>
        {deck.name || t`unnamed deck`}
    </Link>
}

function read(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS], 'readonly')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS) 
    }
}