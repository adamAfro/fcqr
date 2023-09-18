import { useState, useEffect, createContext, useContext } from 'react'

import { Database, Stores } from '../memory'
import { useTranslation } from '../localisation'
import { useMemory } from '../memory'
import { unregister } from '../registrar'
import { Select as LanguageSelect } from '../localisation'

import * as Deck from '../deck'
import Scanner from './scanner'

import * as Text from './text'
import * as Package from './package'
import Entries from './decks'
import Tags from './tags'

import { Button, Widget } from '../interactions'

import style from './style.module.css'

export enum OptionName { NONE, COPY, WRITE, SAVE, LOAD, PASTE, QR }

export const Context = createContext({

    decks: [] as Deck.Data[],
        setDecks(_:(p:Deck.Data[]) => Deck.Data[]) {},
    
    textInput: '', 
        setTextInput: (_:string) => {},

    fileInput: null as null | Package.Data,
        setFileInput: (_:null | Package.Data) => {},
    
    selection: [] as number[], 
        setSelection(_:(p: number[]) => number[]) {},
    
    activeOption: OptionName.NONE as OptionName, 
        setActiveOption(_: OptionName) {},

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

    const [textInput, setTextInput] = useState('')
    const [fileInput, setFileInput] = useState(null as null | Package.Data)

    const [selection, setSelection] = useState([] as number[])
    const [activeOption, setActiveOption] = useState(OptionName.NONE)
    const [activeTagId, setActiveTagId] = useState(-1)

    const { t } = useTranslation()

    return <Context.Provider value={{ 
        decks, setDecks,

        textInput, setTextInput,
        fileInput, setFileInput, 
        
        selection, setSelection,
        activeOption, setActiveOption,
        activeTagId, setActiveTagId
    }}>

        <header className={style.title}>

           <Widget symbol='Reload' onClick={() => unregister().then(() => window.location.reload())}/>

            <h1 className='title'>{t`flisqs`}</h1>

            <LanguageSelect/>

        </header>

        <OptionsButtons/>

        {{
            [OptionName.NONE]: <><Tags/><Entries/></>,
            [OptionName.COPY]: <><Tags/><Text.Entries/></>,
            [OptionName.PASTE]: <><Tags/><Text.Entries/></>,
            [OptionName.WRITE]: <Text.Input/>,
            [OptionName.SAVE]: <><Tags/><Package.Entries button={<Package.ConfirmSaveButton/>}/></>,
            [OptionName.LOAD]: <><Tags/><Package.Entries button={<Package.ConfirmLoadButton/>}/></>,
            [OptionName.QR]: <Scanner className={style.input} handleData={(txt: string) => {

                try {
    
                    setFileInput(JSON.parse(txt))
                    setActiveOption(OptionName.LOAD)
    
                } catch(er) {
    
                    setTextInput(txt)
                    setActiveOption(OptionName.WRITE)
                }
            }}/>

        }[activeOption]}

    </Context.Provider>
}

function OptionsButtons() {

    const { activeOption, setActiveOption } = useContext(Context)

    return <div className={style.buttons}>

        <Widget symbol='QR' active={activeOption == OptionName.QR} 
            onClick={() => setActiveOption(activeOption == OptionName.QR ? 
                OptionName.NONE : 
                OptionName.QR)}/>

        <Text.CopyButton/> 
        <Text.InputButton/>
        <Package.SaveButton/>
        <Package.LoadButton/>

    </div>
}

function read(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS], 'readonly')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS) 
    }
}