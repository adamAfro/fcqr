import { useState, useEffect} 
    from 'react'

import { useContext } from '../context'

import { Link } from 'react-router-dom'
import { links } from '../app'

import style from './style.module.css'


import { Data as DeckData, getAllData as getAllDecksData, addData as addDeckData } 
    from '../deck'


export default function(props: any) {

    const [decks, setDecks] = useState([] as DeckData[])

    const { database } = useContext()
    useEffect(() => void getAllDecksData(database!).then(setDecks), [database])

    const [addedDecks, setAddedDecks] = useState([] as DeckData[])
    const addDeck = () => {

        const deck = { name: '', termLang: '', defLang: '' }
        addDeckData(deck, database!)
            .then(id => setAddedDecks(prev => [...prev, { id, ...deck}]))
    }

    const Deck = (props: DeckData) => <p>

        <Link to={'/deck/' + props.name + '$' + props.id!.toString()}>
            {props.name || 'unnamed deck'}
        </Link>

    </p>


    return <main className={style.view} {...props} data-testid="pocket">

        <header>
            <h1>FCQR</h1>
            <Link data-testid="scanner-link" to={links.scanner}>Scan QR</Link>
            <button data-testid='add-btn' onClick={addDeck}>Add</button>
        </header>

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