import { useState, useEffect, createContext, useContext } from 'react'

import { Database, Stores } from '../memory'
import { useTranslation } from '../localisation'
import { useMemory } from '../memory'
import { unregister } from '../registrar'
import { Select as LanguageSelect } from '../localisation'

import * as Deck from '../deck'
import Scanner from '../scanner'

import { default as TextPopup, Entries as TextEntries } from './text'
import { default as PackagePopup, Entries as PackageEntries, Packed } from './package'
import Entries from './entries'
import Tags from './tags'

import { Button, Widget } from '../interactions'

import style from './style.module.css'

export enum Popup { NONE, TEXT, PACKAGE, QR }

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
    
    popup: Popup.NONE as Popup, 
        setPopup(_: Popup) {},

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
    const [popup, setPopup] = useState(Popup.NONE)
    const [activeTagId, setActiveTagId] = useState(-1)
    const [selecting, setSelecting] = useState(Selecting.NONE)

    const { t } = useTranslation()

    return <Context.Provider value={{ 
        decks, setDecks,

        textInput, setTextInput,
        fileInput, setFileInput, 
        
        selection, setSelection,
        popup, setPopup,
        activeTagId, setActiveTagId,
        selecting, setSelecting
    }}>

        <header className={style.title}>

           <Widget symbol='Reload' onClick={() => unregister().then(() => window.location.reload())}/>

            <h1 className='title'>{t`flisqs`}</h1>

            <LanguageSelect/>

        </header>

        <section className={style.tags}>
            <Tags/>
        </section>

        {popup == Popup.NONE || popup == Popup.QR ? <Entries/> : null}
        {popup == Popup.PACKAGE ? <PackageEntries/> : null}
        {popup == Popup.TEXT ? <TextEntries/> : null}

        {popup != Popup.NONE ?<div className='popup'>
 
            <Button symbol='Up' attention='none' onClick={() => setPopup(Popup.NONE)} style={{
                width: '100%'
            }}/>

            <PopupPopup/>

        </div> : <Button symbol='Down' className='popup' attention='none' onClick={() => setPopup(Popup.TEXT)}/>}

    </Context.Provider>
}

function PopupPopup() {

    const { popup, setTextInput, setFileInput, setPopup } = useContext(Context)

    const { t } = useTranslation()

    return <>

        <div className={style.buttons}>

            <Button contents={t`scanner`} active={popup == Popup.QR} 
                onClick={() => setPopup(Popup.QR)}/>
            <Button contents={t`text`} active={popup == Popup.TEXT} 
                onClick={() => setPopup(Popup.TEXT)}/>
            <Button contents={t`packages`} active={popup == Popup.PACKAGE} 
                onClick={() => setPopup(Popup.PACKAGE)}/>
    
        </div>

        {popup == Popup.TEXT ? <TextPopup/> : null}

        {popup == Popup.PACKAGE ? <PackagePopup/> : null}

        {popup == Popup.QR ? <>
            
            <div className={style.buttons}>
                <Button contents={t`scan QR`} active/>
                <Button contents={t`create QR`} disabled/>
            </div>
            <Scanner className={style.input} handleData={(txt: string) => {

                try {

                    setFileInput(JSON.parse(txt))
                    setPopup(Popup.PACKAGE)

                } catch(er) {

                    setTextInput(txt)
                    setPopup(Popup.TEXT)
                }

            }}/>
        
        </> : null}

    </>
}

function read(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS], 'readonly')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS) 
    }
}