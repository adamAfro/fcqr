import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams }
    from 'react-router-dom'

import { default as localise, t } from './localisation'
import { Provider as MemoryProvider } from './memory'

import './default.css'

import Pocket from './pocket'
import Deck from './deck'

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

                <Route path={links.pocket}
                    element={<Pocket/>} />

                <Route path={links.decks + ':id'} 
                    Component={() => <Deck id={Number(useParams().id)} />} />

            </Routes></Router>

        </MemoryProvider>
    </React.StrictMode>
}