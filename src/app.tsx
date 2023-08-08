import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import { Provider as ContextProvider } from './context'

import Scanner from './scanner'
import Pocket from './pocket'
import { Route as Card } from './card'
import { Route as Deck } from './deck'

import './globals.css'


export const links = {
    pocket: '/',
    decks: '/deck/',
    cards: '/card/',
    scanner: '/scanner'
}


export default () => <React.StrictMode>
    <ContextProvider>
        <Router><Routes>
            <Route path={links.pocket} element={<Pocket/>} />
            <Route path={links.decks + '*'} element={<Deck />} />
            <Route path={links.cards + '*'} element={<Card />} />
            <Route path={links.scanner} element={<Scanner />} />
        </Routes></Router>
    </ContextProvider>
</React.StrictMode>