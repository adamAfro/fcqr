import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import { Provider as ContextProvider } from './context'

import Pocket from './pocket'
import { Route as Card } from './card'
import { Route as Deck } from './deck'

import './globals.css'


export default () => <React.StrictMode>
    <ContextProvider>
        <Router><Routes>
            <Route path="/" element={<Pocket/>} />
            <Route path="/deck/*" element={<Deck />} />
            <Route path="/card/*" element={<Card />} />
        </Routes></Router>
    </ContextProvider>
</React.StrictMode>