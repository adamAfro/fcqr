import { useState, useEffect, useContext, JSX } from 'react'

import { read } from '../deck/properties'
import { Database, read as readAll, readwrite as readwriteAll } 
    from '../memory'

import { Data as Tag } from './tags'
import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import { Context, OptionName } from '.'

import { Data as Deck } from '../deck'
import { Data as Card } from '../card'

import Button from '../button'

export function ConfirmLoadButton() {
    
    const { database } = useMemory()!

    const { fileInput, setFileInput, setDecks, setActiveOption } = useContext(Context)

    return <Button symbol='Plus' onClick={async () => {

        if (!fileInput) return

        const ids = (await fromPackage(fileInput, database))
            .map(({ deckId }) => deckId)

        const { done, store } = read(database)
        const added = await Promise.all(ids.map(async (id) => await store.get(id) as Deck))

        setDecks(p => [...added.reverse(), ...p])
        setFileInput(null)
        setActiveOption(OptionName.NONE)

        await done

    }}/>
}

export function LoadButton() {

    const { activeOption, setFileInput, setActiveOption } = useContext(Context)

    return <Button symbol='FileFrom' attention='none' active={activeOption == OptionName.LOAD} labeled={<input onChange={async (e) => {

        const input = e.target as HTMLInputElement

        const files = Array.from(input.files!)
        const content = await readFile(files[0])

        let packed = null as any
        try { packed = JSON.parse(content) } catch(er) {}
        if (packed) 
            setFileInput(packed)

        setActiveOption(OptionName.LOAD)

    }} type="file"/>}/>
}

export function ConfirmSaveButton() {

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
        return <Button symbol='FileAdd' disabled/>

    return <Button symbol='FileAdd' href={href} download={t`decks-` + new Date().toString().replaceAll(' ', '-') + '.json'}/>
}

export function SaveButton() {

    const { activeOption, setActiveOption, setFileInput } = useContext(Context)

    return <Button symbol='FileAdd' attention='none'  active={activeOption == OptionName.SAVE} onClick={() => {

        if (activeOption == OptionName.NONE)
            return void setActiveOption(OptionName.SAVE)

        setActiveOption(OptionName.NONE)
        setFileInput(null)

    }}/>
}

export function Entries({ confirmButton }: {confirmButton: JSX.Element}) {

    const { activeOption, activeTagId, decks, fileInput } = useContext(Context)

    const { t } = useTranslation()

    return <div>
        
        {confirmButton}

        {fileInput && activeOption == OptionName.LOAD ? fileInput.decks.reverse()
            .map(({ data }) => <Button key={data.id || 0 + Math.random()} contents={data.name || t`unnamed deck`} attention='primary'/>) : null}

        {(activeTagId >= 0 ? decks.filter(deck => deck.tagId == activeTagId) : decks)
            .map(deck => <Entry key={deck.id} {...deck}/>)}

    </div>
}

function Entry(deck: Deck) {

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

async function createPackage(ids: number[], db: Database) {

    const { done, store, cardStore, tagStore } = readAll(db)

    const cardIndex = cardStore.index('deckId')
    const decks = await Promise.all(ids.map(async (id) => ({
        data: await store.get(id) as Deck,
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

export type Data = Awaited <ReturnType <typeof createPackage>>

async function fromPackage(packed: Data, db: Database) {

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
