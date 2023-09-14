import { useState, useEffect, createContext, useContext } from 'react'

import { Database, Stores } from '../memory'
import { links, Link } from '../app'
import { useNavigate } from "react-router-dom"   

import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import Quickaccess from '../quickaccess'
import Tags from '../tags'

import * as Deck from '../deck'
import { readwrite } from '../deck/properties'

import { InputButton, InputOptions } from './input'
import { OutputSelectionButton, OutputOptions } from './output'


import style from './style.module.css'


enum Options {
    NONE, INPUT, OUTPUT
}

export const Context = createContext({
    input: '', setInput: (_:string) => {},
    selection: [] as number[], 
        setSelection(_:(p: number[]) => number[]) {},
    showOptions: Options.NONE as Options, 
        setShowOptions(_: Options) {},

    activeTagId: -1,
        setActiveTagId(_:number) {}
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
    const [activeTagId, setActiveTagId] = useState(-1)

    const { t } = useTranslation()

    return <Context.Provider value={{ 
        input, setInput, 
        selection, setSelection,
        showOptions, setShowOptions,
        activeTagId, setActiveTagId
    }}>

        <Quickaccess home={true} popup={showOptions == Options.INPUT && !input ? 
            <InputOptions/> : (showOptions == Options.OUTPUT && !input ? 
            <OutputOptions/> : null)
        }>

            <p className='stack'>

                <ImportButton/>

                <ExportButton/>

            </p>

            <AddButton/>

        </Quickaccess>

        <h1 className='title'>{t`your decks`}</h1>

        <Tags/>

        <ul className={style.decks} data-testid="decks">
            
            {(activeTagId >= 0 ? decks.filter(deck => deck.tagId == activeTagId) : decks)
                .map(deck => <li key={deck.id}><DeckButton {...deck}/></li>)}

        </ul>

    </Context.Provider>
}

function AddButton() {

    const navigate = useNavigate()

    const { database } = useMemory()!

    return <button className='widget' data-attention='primary' onClick={async () => {

        const { done, store } = readwrite(database)
        
        const deckId = Number(await store.add({ name: '' }))
    
        await done
        return void navigate(links.decks + deckId.toString())
            
    }} data-testid='add-btn'>➕</button>
}

function ExportButton() {

    const { showOptions, setShowOptions } = useContext(Context)

    return <button className='widget' data-active={showOptions == Options.OUTPUT} onClick={() => {

        if (showOptions != Options.OUTPUT)
            return void setShowOptions(Options.OUTPUT)

        setShowOptions(Options.NONE)

    }}>⏏️</button>
}

function ImportButton() {

    const { showOptions, setShowOptions, setInput } = useContext(Context)

    return <button className='widget' data-active={showOptions == Options.INPUT} onClick={() => {

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