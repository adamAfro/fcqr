import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } 
    from 'react-router-dom'

import { default as localise, t} from './localisation'
import { Provider as MemoryProvider } from './memory'

import Pocket from './pocket'
import Deck from './deck'
import Settings from './settings'


import './globals.css'
import style from './style.module.css'


localise()


export { Link }
export const links = {
    pocket: '/',
    decks: `/${t`deck`}/`,
    settings: `/${t`settings`}`
}

export default (props: { basename?: string }) => <React.StrictMode>
    <MemoryProvider>

        <Router basename={props.basename || '/'}><Routes>

            <Route path={links.pocket} element={<main className={style.panel}>
                <Pocket/>
            </main>} />
            
            <Route path={links.decks + '*'} element={<main className={style.panel}>  
                <Deck/>
            </main>}/>

            <Route path={links.settings} element={<main className={style.panel}>
                <Settings/>
            </main>}/>
        
        </Routes></Router>
    
    </MemoryProvider>
</React.StrictMode>
