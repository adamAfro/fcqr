import React from 'react'
import { initReactI18next as ReactLocalisation } from "react-i18next"
import { BrowserRouter as Router, Routes, Route } 
    from 'react-router-dom'

import { default as Localisation } from "i18next"

import LanguageDetector from 'i18next-browser-languagedetector'

import { pl, en } from './localisation'


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


Localisation.use(ReactLocalisation).use(LanguageDetector).init({

    fallbackLng: "en",
    resources: {
        en: { translation: en },
        pl: { translation: pl }
    }
})


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