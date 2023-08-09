import { useState, useEffect} from 'react'

import { links, Link } from '../app'
    
import { useTranslation } from '../localisation'
import { useDatabase } from '../database'

import * as Deck from '../deck'


import style from './style.module.css'


export default function(props: any) {

    const { t } = useTranslation()

    const [decks, setDecks] = useState([] as Deck.Data[])

    const database = useDatabase()
    useEffect(() => void Deck.getAllData(database!)
        .then(decks => setDecks(decks.reverse())), [database])

    const [addedDecks, setAddedDecks] = useState([] as Deck.Data[])
    const addDeck = () => {

        const deck = { name: '', termLang: '', defLang: '' }
        Deck.addData(deck, database!)
            .then(id => setAddedDecks(prev => [...prev, { id, ...deck}]))
    }

    const Entry = (props: Deck.Data) => <p>

        <Link role='button' to={'/deck/' + props.name + '$' + props.id!.toString()}>
            {props.name || t`unnamed deck`}
        </Link>

    </p>


    return <main className={style.pocket} {...props} data-testid="pocket">

        <header>
            <h1>FCQR</h1>
            <Link role="button" data-testid="scanner-link" to={links.scanner}>{t`scan QR`}</Link>
            <button data-testid='add-btn' onClick={addDeck}>{t`add deck`}</button>
        </header>

        <h2>{t`your decks`}</h2>

        <ul data-testid="added-decks">
            {addedDecks.map(deck => <li key={deck.id}><Entry {...deck}/></li>)}
        </ul>

        <ul data-testid="decks">
            {decks.map(deck => <li key={deck.id}><Entry {...deck}/></li>)}
        </ul>

        <footer>
            <a target='_blank' href="https://github.com/adamAfro/fcqr">github.com/adamAfro</a>
        </footer>

    </main>
}