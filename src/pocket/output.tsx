import { useState, useEffect, useContext } from 'react'

import { Database, read as readAll } from '../memory'
import { Data as Tag } from '../tags'
import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import { Context } from '.'

import { Data } from '../deck'
import { Data as Card } from '../card'

import { Button, Widget } from '../interactions'

import style from './style.module.css'

export function OutputOptions() {

    const { database } = useMemory()!

    const { t } = useTranslation()

    const { selection, setSelection } = useContext(Context)

    const [href, setHref] = useState('')
    useEffect(() => void createPackage(selection, database).then(p => {

        const x = 'data:text/plain;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(p))

        setHref(x)

    }), [selection])

    return <div className={style.options}>

        <h2>{t`exporting decks`}</h2>

        <p>{t`select decks by clicking on them`}</p>

        <div className={style.buttons}>
            
            <Widget symbol='FileAdd' href={href} download={t`decks` + '.json'}/>
            
            <Button contents={t`copy`} onClick={async () => {

                const packed = await createPackage([...selection], database)
                
                navigator.clipboard.writeText(JSON.stringify(packed))

                setSelection(_ => [])

            }}/>
        </div>

    </div>
}

export function OutputSelectionButton(deck: Data) {

    const { selection, setSelection } = useContext(Context)
    
    const [selected, setSelected] = useState(false)
    useEffect(() => setSelected(selection.includes(deck.id!)), [selection])

    const { t } = useTranslation()

    return <>{selected ? 
    
        <Button contents={deck.name || t`unnamed deck`} attention='correct'
            key={deck.id} onClick={() => setSelection(selection => selection.filter(id => id != deck.id!))}/>        
        :
        <Button contents={deck.name || t`unnamed deck`} 
            key={deck.id} onClick={() => setSelection(prev => [...prev, deck.id!])}/>
    }</>
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