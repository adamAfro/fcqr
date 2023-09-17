import { useContext, useEffect, useState } from 'react'

import { Database, Stores } from "../memory"

import { useTranslation } from '../localisation'
import { Data as Language, read as readLanguages } from '../tags'
import { useMemory } from "../memory"
import { Data } from './'

import { Context } from './'

import { Dangerzone } from './actions'

import { Widget, Input } from '../interactions'

import style from "./style.module.css"

export default function Properties() {

    const { id } = useContext(Context)

    return <header className={style.properites} data-testid={`deck-${id}`}>
        
        <h1 className='title'><Name/></h1>

        <div className={style.sounds}>

            <TagSelect/>

            <MuteButton/>

            <SilenceButton/>

        </div>

        <Reference/>

        <Dangerzone/>

    </header>
}

function Name() {

    const context = useContext(Context)
    const { id } = context

    const { t } = useTranslation()
    const { database } = useMemory()!

    const [name, setName] = useState(context.name)

    return <Input attention={name ? 'none' : 'primary'} onChange={async (e) => {
        
        setName(e.target.value)
        
        if (!id) return

        const { done, store } = readwrite(database)

        const deck = await store.get(id) as Data

        await store.put({ ...deck, name: e.target.value })        
        return await done
        
    }} placeholder={t`unnamed deck`} type="text" value={name}/>
}

function TagSelect() {

    const { database } = useMemory()!

    const { id, tag, setTag } = useContext(Context)

    const [tags, setTags] = useState([] as Language[])
    useEffect(() => void (async function() {

        const { done, store } = readLanguages(database)

        const tags = await store.getAll() as Data[]
        
        await done
        return tags

    })().then(ls => setTags(ls)), [])

    const { t } = useTranslation()

    return <select className={style.tag} data-attention={tag ? 'none' : 'primary'} onChange={async (e) => {

        const tagId = Number(e.target.value)
        const tag = tags
            .find(({ id }) => id == tagId)

        setTag(prev => tag)
        
        const { done, store } = readwrite(database)
        const deck = await store.get(id) as Data
        
        await store.put({ ...deck, tagId })
        return await done
        
    }} value={tag?.id}>
        <option key={-1}>{t`no tag`}</option>
        {tags.map(({ id, name }) => 
            <option key={id} value={id}>{name}</option>)
        }
    </select>
}

function MuteButton() {

    const { database } = useMemory()!

    const { id, muted, setMuted, tag } = useContext(Context)

    return <Widget symbol='SpeakerOff' attention='none' labeled={<input onChange={async () => {

        const { done, store } = readwrite(database)
        const deck = await store.get(id) as Data
        
        await store.put({ ...deck, muted: !muted })
        await done
        
        setMuted(p => !p)
    
    }} type="checkbox" checked={muted} disabled={!tag || !tag.code}/>}/>
}

function SilenceButton() {

    const { database } = useMemory()!

    const { id, silent, setSilent, tag } = useContext(Context)

    return <Widget symbol='MicrophoneOff' attention='none' labeled={<input onChange={async () => {

        const { done, store } = readwrite(database)
        const deck = await store.get(id) as Data
        
        await store.put({ ...deck, silent: !silent })
        await done
        
        setSilent(p => !p)
    
    }} type="checkbox" checked={silent} disabled={!tag || !tag.code}/>}/>
}

function Reference() {

    const { database } = useMemory()!

    const { id, reference, setReference } = useContext(Context)

    const [edition, setEdition] = useState(false)

    const { t } = useTranslation()

    return <p className={style.reference}>

        {edition ? <input placeholder={t`reference link`} className='widget'
            spellCheck={false} type="text" value={reference} onChange={async (e) => {

            const reference = e.target.value
            
            setReference(reference)
            
            const { done, store } = readwrite(database)
            const deck = await store.get(id) as Data
            
            await store.put({ ...deck, reference })
            await done

        }}/> : (reference ? <Widget big symbol='Link' target='_blank' href={reference}/> :
            <Widget big symbol='Link' disabled/>)}

        <div className={style.edit}>
            <Widget symbol='Pencil' attention={!reference ? undefined : 'weak'} active={edition}
                onClick={() => setEdition(p => !p)}/>
        </div>

    </p>
}

export function readwrite(db: Database) {

    const t = db.transaction(Stores.DECKS, 'readwrite')
    return { done: t.done, store: t.objectStore(Stores.DECKS) }
}

export function read(db: Database) {

    const t = db.transaction(Stores.DECKS, 'readonly')
    return { done: t.done, store: t.objectStore(Stores.DECKS) }
}