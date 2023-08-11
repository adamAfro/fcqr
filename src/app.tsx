import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } 
    from 'react-router-dom'

import { default as localise, t} from './localisation'
import { Provider as DatabaseProvider } from './database'
import { Provider as SettingsProvider } from './settings'

import Pocket from './pocket'
import { Entry as Deck } from './deck'
import { Settings } from './settings'


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
    <SettingsProvider>
    <DatabaseProvider>

        <Router basename={props.basename || '/'}><Routes>

            <Route path={links.pocket} element={<Pocket/>} />
            
            <Route path={links.decks + '*'} element={<main className={style.panel}>  
                <header className={style.headline}>
                    <h1>{t`your deck`}</h1>
                    <Link role='button' to={links.pocket}>{t`go back`}</Link>
                </header>
                <Deck />
            </main>}/>

            <Route path={links.settings} element={<main className={style.panel}>
                <header className={style.headline}>
                    <h1>{t`settings`}</h1>
                    <Link role='button' to={links.pocket}>{t`go back`}</Link>
                </header>
                <Settings />
            </main>}/>
        
        </Routes></Router>
    
    </DatabaseProvider>
    </SettingsProvider>
</React.StrictMode>
