import { useState, useEffect, createContext, useContext, useTransition } from 'react'

import { Database, Stores } from '../memory'

import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import Quickaccess from '../quickaccess'
import Tags from './tags'

import * as Deck from '../deck'

import { Options as TextOptions, Entries as TextEntries } from './text'
import { Options as PackageOptions, Entries as PackageEntries, Packed } from './package'
import Entries from './entries'

import { Button, Widget } from '../interactions'

import style from './style.module.css'

import Scanner from '../scanner'


export enum Options { NONE, TEXT, PACKAGE, QR }

export enum Selecting { NONE = 0, ADD, COPY, PASTE }

export const Context = createContext({

    decks: [] as Deck.Data[],
        setDecks(_:(p:Deck.Data[]) => Deck.Data[]) {},
    
    textInput: '', 
        setTextInput: (_:string) => {},

    fileInput: null as null | Packed,
        setFileInput: (_:null | Packed) => {},
    
    selection: [] as number[], 
        setSelection(_:(p: number[]) => number[]) {},
    
    options: Options.NONE as Options, 
        setOptions(_: Options) {},

    activeTagId: -1,
        setActiveTagId(_:number) {},

    selecting: Selecting.NONE, setSelecting: (_:Selecting) => {},
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

    const [textInput, setTextInput] = useState('')
    const [fileInput, setFileInput] = useState(null as null | Packed)

    const [selection, setSelection] = useState([] as number[])
    const [options, setOptions] = useState(Options.NONE)
    const [activeTagId, setActiveTagId] = useState(-1)
    const [selecting, setSelecting] = useState(Selecting.NONE)

    const { t } = useTranslation()

    return <Context.Provider value={{ 
        decks, setDecks,

        textInput, setTextInput,
        fileInput, setFileInput, 
        
        selection, setSelection,
        options, setOptions,
        activeTagId, setActiveTagId,
        selecting, setSelecting
    }}>

        <Quickaccess home={true} popup={options != Options.NONE ? <OptionsPopup/> : null}>

            <OptionsButton/>

        </Quickaccess>

        <h1 className='title'>{t`flisqs`}</h1>

        <section className={style.tags}>
            <Tags/>
        </section>

        {options == Options.NONE || options == Options.QR ? <Entries/> : null}
        {options == Options.PACKAGE ? <PackageEntries/> : null}
        {options == Options.TEXT ? <TextEntries/> : null}

    </Context.Provider>
}

function OptionsButton() {

    const { options, setOptions } = useContext(Context)

    const { t } = useTranslation()

    return <Widget big symbol='FileWrite' contents={t`scanner`} active={options == Options.QR} onClick={() => {

        if (options != Options.QR)
            return void setOptions(Options.QR)

        setOptions(Options.NONE)

    }}/>
}

function OptionsPopup() {

    const { options, setTextInput, setFileInput, setOptions } = useContext(Context)

    const { t } = useTranslation()

    return <>

        <div className={style.buttons}>

            <QRButton/>
            <TextButton/>
            <PackageButton/>
    
        </div>

        {options == Options.TEXT ? <TextOptions/> : null}

        {options == Options.PACKAGE ? <PackageOptions/> : null}

        {options == Options.QR ? <>
            
            <div className={style.buttons}>
                <Button contents={t`scan QR`} active/>
                <Button contents={t`create QR`} disabled/>
            </div>
            <Scanner className={style.input} handleData={(txt: string) => {

                try {

                    setFileInput(JSON.parse(txt))
                    setOptions(Options.PACKAGE)

                } catch(er) {

                    setTextInput(txt)
                    setOptions(Options.TEXT)
                }

            }}/>
        
        </> : null}

    </>
}

function QRButton() {

    const { options, setOptions } = useContext(Context)

    const { t } = useTranslation()

    return <Button contents={t`scanner`} active={options == Options.QR} onClick={() => {

        if (options != Options.QR)
            return void setOptions(Options.QR)

        setOptions(Options.NONE)

    }}/>
}

function PackageButton() {

    const { options, setOptions } = useContext(Context)

    const { t } = useTranslation()

    return <Button contents={t`packages`} active={options == Options.PACKAGE} onClick={() => {

        if (options != Options.PACKAGE)
            return void setOptions(Options.PACKAGE)

        setOptions(Options.NONE)

    }}/>
}

function TextButton() {

    const { options, setOptions, setTextInput } = useContext(Context)

    const { t } = useTranslation()

    return <Button contents={t`text`} active={options == Options.TEXT} onClick={() => {

        if (options != Options.TEXT)
            return void setOptions(Options.TEXT)

        setOptions(Options.NONE)
        setTextInput('')

    }}/>
}

function read(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS], 'readonly')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS) 
    }
}