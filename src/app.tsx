import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams }
    from 'react-router-dom'

import { default as localise, t } from './localisation'
import { Provider as MemoryProvider } from './memory'

import Pocket from './pocket'
import Deck from './deck'

import './default.css'

localise()

export { Link }
export const links = {
    pocket: '/',
    decks: `/${t`deck`}/`
}

export default (props: { basename?: string }) => {

    React.useEffect(() => void (document.title = t`fliscs`), [])

    return <React.StrictMode>
        <MemoryProvider>

            <Router basename={props.basename || '/'}><Routes>

                <Route path={links.pocket} element={<main className='panel'>
                    <Pocket />
                </main>} />

                <Route path={links.decks + ':id'} Component={() => {

                    const { id } = useParams()

                    return <main className='panel'>
                        <Deck id={Number(id)} />
                    </main>

                }} />

            </Routes></Router>

        </MemoryProvider>
    </React.StrictMode>
}