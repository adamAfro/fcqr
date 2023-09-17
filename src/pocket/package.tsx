import { useState, useEffect, useContext, createContext } from 'react'

import { read } from '../deck/properties'
import { Database, read as readAll, readwrite as readwriteAll } 
    from '../memory'

import { Data as Tag } from './tags'
import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import { Context, Options as CurrentOption } from '.'

import { Data } from '../deck'
import { Data as Card } from '../card'

import { Button, Widget } from '../interactions'

import style from './style.module.css'

const ImportContext = createContext({
    replace: false, setReplace(_:(p:boolean) => boolean) {}
})

export function Options() {

    const { fileInput } = useContext(Context)

    const [replace, setReplace] = useState(false)

    const { t } = useTranslation()

    return <ImportContext.Provider value={{ replace, setReplace }}>

        <div className={style.buttons}>

            <LoadButton/>

            <SaveButton/>

        </div>

        <div className={style.input}>

            {fileInput ? <Changes/> : <>
            
                <p>{t`select decks to save them`}</p>
            
            </>}

        </div>

    </ImportContext.Provider>
}

export function Entries() {

    const { activeTagId, decks } = useContext(Context)

    const { fileInput } = useContext(Context)

    const { t } = useTranslation()

    return <ul className={style.decks}>
        
        {fileInput ? fileInput.decks
            .map(({ data }) => <li key={Math.random()*data.id!}><Button contents={data.name || t`unnamed deck`} attention='correct'/></li>) : null}

        {(activeTagId >= 0 ? decks.filter(deck => deck.tagId == activeTagId) : decks)
            .map(deck => <li key={deck.id}><Option {...deck}/></li>)}

    </ul>
}

function Option(deck: Data) {

    const { selection, setSelection } = useContext(Context)
    
    const [selected, setSelected] = useState(false)
    useEffect(() => setSelected(selection.includes(deck.id!)), [selection])

    const { t } = useTranslation()

    return <>{selected ? 
    
        <Button contents={deck.name || t`unnamed deck`} attention='primary'
            key={deck.id} onClick={() => setSelection(selection => selection.filter(id => id != deck.id!))}/>
        :
        <Button contents={deck.name || t`unnamed deck`} attention='none'
            key={deck.id} onClick={() => setSelection(prev => [...prev, deck.id!])}/>
    }</>
}

function Changes() {

    const { fileInput, setFileInput } = useContext(Context)

    const { t } = useTranslation()

    return <div>

        {t`will add`} {fileInput?.decks.length} {`of decks with respectively`} {fileInput?.decks.map(({cards}) => cards.length).join(',')} {t`of cards`}

        <ConfirmButton/>

        <Button contents={t`cancel`} attention='removal'
            onClick={async () => setFileInput(null)}/>

    </div>
}

function ConfirmButton() {
    
    const { database } = useMemory()!

    const { fileInput, setFileInput, setDecks, setOptions } = useContext(Context)

    const { t } = useTranslation()

    return <Button contents={t`add`} onClick={async () => {

        if (!fileInput) return

        const ids = (await fromPackage(fileInput, database))
            .map(({ deckId }) => deckId)

        const { done, store } = read(database)
        const added = await Promise.all(ids.map(async (id) => await store.get(id) as Data))

        setDecks(p => [...added.reverse(), ...p])
        setFileInput(null)
        setOptions(CurrentOption.NONE)

        await done

    }}/>
}

function LoadButton() {

    const { setFileInput } = useContext(Context)

    const { t } = useTranslation()

    return <Button contents={t`load`} labeled={<input onChange={async (e) => {

        const input = e.target as HTMLInputElement

        const files = Array.from(input.files!)
        const content = await readFile(files[0])

        let packed = null as any
        try { packed = JSON.parse(content) } catch(er) {}
        if (packed) 
            setFileInput(packed)

    }} type="file"/>}/>
}

function SaveButton() {

    const { database } = useMemory()!

    const { t } = useTranslation()

    const { selection } = useContext(Context)

    const [href, setHref] = useState('')
    useEffect(() => void createPackage(selection, database).then(p => {

        const x = 'data:text/plain;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(p))

        setHref(x)

    }), [selection])

    if (selection.length == 0)
        return <Button contents={t`save`} disabled/>

    return <Button contents={t`save`} href={href} download={t`decks-` + new Date().toString().replaceAll(' ', '-') + '.json'}/>
}

async function createPackage(ids: number[], db: Database) {

    const { done, store, cardStore, tagStore } = readAll(db)

    const cardIndex = cardStore.index('deckId')
    const decks = await Promise.all(ids.map(async (id) => ({
        data: await store.get(id) as Data,
        cards: await cardIndex.getAll(IDBKeyRange.only(id)) as Card[]
    })))

    const tags = [] as Tag[]
    for (const { data } of decks) {

        if (!data.tagId)
            continue

        const tag = await tagStore.get(data.tagId) as Tag
        if (!tag)
            continue

        if (tags.some(({ id }) => id == tag.id))
            continue

        tags.push(tag)
    }
    
    await done
    return { tags, decks }
}

export type Packed = Awaited <ReturnType <typeof createPackage>>

async function fromPackage(packed: Packed, db: Database, { replace = false } = {}) {

    const { done, store, cardStore, tagStore } = readwriteAll(db)

    const tagsMappedIds = await Promise.all(packed.tags.map(async ({ id, ...props }) => ({ 
        packed: id, idb: Number(await tagStore.add(props))
    })))

    const additions = packed.decks.map(async ({ data, cards }) => {

        const { id, ...props } = data
        const deckId = Number(await store.add({...props,
            tagId: tagsMappedIds.find(({ packed }) => packed == data.tagId)?.idb
        }))

        const cardsIds = await Promise
            .all(cards.map(({ id, ...props }) => cardStore.add({...props, deckId})))

        return { deckId, cardsIds: cardsIds as number[] }
    })

    const ids = await Promise.all(additions)
    
    await done
    return ids
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
