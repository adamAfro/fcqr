import { useContext, useState } from 'react'

import { useMemory } from "../memory"
import { readwrite } from '.'

import { Data as CardData } from '../card'

import { links } from '../app'

import { Context, State } from '.'

import { Widget, Button } from '../interactions'
import { useTranslation } from '../localisation'

export function Dangerzone() {

    const { database } = useMemory()!

    const { id, setState } = useContext(Context)

    const [show, setShow] = useState(false)

    const { t } = useTranslation()

    return <p className='row'>

        <Button symbol={show ? 'ArrowBack' : 'Danger'} contents={t`remove deck`} attention='removal' active={show}
            onClick={() => setShow(p => !p)}/>

        {show ? <Widget symbol='Bin' attention='removal' onClick={async () => {

            setState(State.REMOVED)

            if (!id) return 

            const { done, store, cardStore } = readwrite(database)

            await store.delete(id)

            const index = cardStore.index('deckId')
            const cards = await index.getAll(IDBKeyRange.only(id)) as CardData[]
            const removals = cards.map(card => cardStore.delete(card.id!))

            await Promise.all(removals)

            return await done

        }} to={links.pocket}/> : null}

    </p>
}

export function AddButton() {

    const { id, state, setCards } = useContext(Context)

    const { database } = useMemory()!

    const { t } = useTranslation()

    return <Button symbol='Plus' contents={t`add card`} disabled={state != State.EDITION} onClick={async () => {

        if (!id) 
            return void setCards(prev => [{ ...card, id: -1 }, ...prev])

        const card = { term: '', def: '', deckId: id } as CardData

        const { done, cardStore } = readwrite(database)
        
        const cardId = await cardStore.add({ ...card, deckId: id })
        
        await done
        setCards(prev => [{ ...card, id: Number(cardId) }, ...prev])

    }}/>
}