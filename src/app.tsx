import React from 'react'
import { BrowserRouter as Router, Routes, Route } 
    from 'react-router-dom'

import { Provider as DatabaseProvider } from './database'

import Scanner from './scanner'
import Pocket from './pocket'
import { Route as Deck } from './deck'


import './globals.css'


import { t } from "i18next"

export { Link } from 'react-router-dom' 
export const links = {
    pocket: '/',
    decks: `/${t`deck`}/`,
    scanner: `/${t`scanner`}`
}

export default () => <React.StrictMode>
    <DatabaseProvider>
        <Router><Routes>
            <Route path={links.pocket} element={<Pocket/>} />
            <Route path={links.decks + '*'} element={<Deck />} />
            <Route path={links.scanner} element={<Scanner />} />
        </Routes></Router>
    </DatabaseProvider>
</React.StrictMode>