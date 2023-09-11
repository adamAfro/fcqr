import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams }
    from 'react-router-dom'

import { default as localise, t } from './localisation'
import { Provider as MemoryProvider } from './memory'

import Pocket from './pocket'
import Deck from './deck'
import Settings from './options'


import './globals.css'
import style from './style.module.css'


localise()


export { Link }
export const links = {
    pocket: '/',
    decks: `/${t`deck`}/`,
    options: `/${t`options`}`
}

export default (props: { basename?: string }) => <React.StrictMode>
    <MemoryProvider>

        <Router basename={props.basename || '/'}><Routes>

            <Route path={links.pocket} element={<main className={style.panel}>
                <Pocket />
            </main>} />

            <Route path={links.decks + ':id'} Component={() => {

                const { id } = useParams()

                return <main className={style.panel}>
                    <Deck id={Number(id)} />
                </main>

            }} />

            <Route path={links.options} element={<main className={style.panel}>
                <Settings />
            </main>} />

        </Routes></Router>

    </MemoryProvider>
</React.StrictMode>