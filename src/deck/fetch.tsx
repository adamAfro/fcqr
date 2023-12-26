import { useContext } from 'react'

import { useMemory } from "../memory"
import { Context, State } from '.'

import { handleText } from '../parsing'
import { Data as Card} from '../card'
import { readwrite as readwriteCards } from './'

import Button from '../button'

export default function() {

    const { database } = useMemory()!

    const { id, resource, state, setCards } = useContext(Context)

    if (state != State.EDITION)
        return <Button symbol="Reload" disabled/>

    return <Button symbol="Reload" onClick={async () => {

        try {

            const url = handleGSheetUrl(resource)
            const res = await fetch(url)
            const data = await res.text() as string
            const cards = handleText(data)

            if (cards.length == 0) 
                return

            setCards(cards)

            const { done, cardStore } = readwriteCards(database)
   
            const index = cardStore.index('deckId')
            const removals = (await index.getAll(IDBKeyRange.only(id)) as Card[])
                .map(card => cardStore.delete(card.id!))

            const additions = cards.reverse()
                .map(card => cardStore.add({ ...card, deckId: id }))
            
            await Promise.all([additions, removals].flat())
            await done

        } catch (e) {}

    }}/>
}

// about GSheet links: https://stackoverflow.com/a/33727897
function handleGSheetUrl(urlText: string) {

    if (!urlText.startsWith('https://docs.google.com/spreadsheets/d/'))
        return urlText

    const url = new URL(urlText)
    const key = url.pathname.split('/')[3]
    const gid = url.hash.split('=')[1]
    if (!gid)
        return `https://docs.google.com/spreadsheets/d/${key}/gviz/tq?tqx=out:csv`

    return `https://docs.google.com/spreadsheets/d/${key}/gviz/tq?tqx=out:csv&gid=${gid}`
}