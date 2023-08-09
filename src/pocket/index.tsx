import { useState, useEffect} 
    from 'react'
    
import { useTranslation } from 'react-i18next'

import { useContext } from '../context'

import { Link } from 'react-router-dom'
import { links } from '../app'

import style from './style.module.css'


import { Data as DeckData, getAllData as getAllDecksData, addData as addDeckData } 
    from '../deck'


export default function(props: any) {

    const { t } = useTranslation()

    const [decks, setDecks] = useState([] as DeckData[])

    const { database } = useContext()
    useEffect(() => void getAllDecksData(database!)
        .then(decks => setDecks(decks.reverse())), [database])

    const [addedDecks, setAddedDecks] = useState([] as DeckData[])
    const addDeck = () => {

        const deck = { name: '', termLang: '', defLang: '' }
        addDeckData(deck, database!)
            .then(id => setAddedDecks(prev => [...prev, { id, ...deck}]))
    }

    const Deck = (props: DeckData) => <p>

        <Link role='button' to={links.decks + props.name + '$' + props.id!.toString()}>
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
            {addedDecks.map(deck => <li key={deck.id}><Deck {...deck}/></li>)}
        </ul>

        <ul data-testid="decks">
            {decks.map(deck => <li key={deck.id}><Deck {...deck}/></li>)}
        </ul>

        <footer>
            <a target='_blank' href="https://github.com/adamAfro/fcqr">github.com/adamAfro</a>
        </footer>

    </main>
}