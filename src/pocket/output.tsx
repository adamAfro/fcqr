import { useState, useEffect, useContext } from 'react'

import { Database, read as readAll } from '../memory'
import { Data as Tag } from '../tags'
import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import { Context } from '.'

import { Data } from '../deck'
import { Data as Card } from '../card'


import style from './style.module.css'
import ui from '../style.module.css'


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
            
            <a role='button' href={href} download={t`decks` + '.json'}>
                {t`save`}
            </a>
            
            <button onClick={async () => {

                const packed = await createPackage([...selection], database)
                
                navigator.clipboard.writeText(JSON.stringify(packed))

                setSelection(_ => [])

            }}>{t`copy`}</button>
        </div>

    </div>
}

export function OutputSelectionButton(deck: Data) {

    const { selection, setSelection } = useContext(Context)
    
    const [selected, setSelected] = useState(false)
    useEffect(() => setSelected(selection.includes(deck.id!)), [selection])

    const { t } = useTranslation()

    return <>{selected ? 
    
        <button key={deck.id} data-attention='correct'
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