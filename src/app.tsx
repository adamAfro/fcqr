import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams } 
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
    settings: `/${t`settings`}`,
    demo: '/demo'
}

export default (props: { basename?: string }) => <React.StrictMode>
    <MemoryProvider>

        <Router basename={props.basename || '/'}><Routes>

            <Route path={links.pocket} element={<main className={style.panel}>
                <Pocket/>
            </main>} />
            
            <Route path={links.decks + ':id'} Component={() => { 

                const { id } = useParams()

                return <main className={style.panel}>
                    <Deck id={Number(id)}/>
                </main>

            }}/>

            <Route path={links.settings} element={<main className={style.panel}>
                <Settings/>
            </main>}/>

            <Route path={links.demo} element={<main style={{
                display:"flex", gap: 'min(10vw, 10vh)'
            }}>

                <div>
                    <div className={style.panel} 
                        style={{marginBottom:'20vh', gridArea: '1 / 1 / 2 / 2', boxShadow: '0 0 1em'}}>
                    
                        <Pocket ignoreDatabase decks={[
                            { name: 'Science Quiz', termLang: 'English', defLang: 'French' },
                            { name: 'Francese', termLang: 'fr', defLang: 'it' },
                            { name: 'Math', termLang: '', defLang: '' },
                            { name: '', termLang: '', defLang: '' },
                            { name: 'Que et que', termLang: 'fr', defLang: 'it' },
                            { name: 'Trebien', termLang: '', defLang: '' }
                        ]}/>
                            
                    </div>
                    

                    <div className={style.panel} 
                        style={{marginBottom:'20vh', gridArea: '1 / 2 / 3 / 3', boxShadow: '0 0 1em'}}>
                            
                        <Settings/>
                    
                    </div>
                </div>
                

                <div className={style.panel} 
                    style={{marginBottom:'20vh', gridArea: '2 / 1 / 3 / 2', boxShadow: '0 0 1em'}}>
                        
                    <Deck name={'demo'} defLang='pl' termLang='en' cards={[
                        { term: 'Physics', def: 'Physique' },
                        { term: 'Chemistry', def: 'Chimie' },
                        { term: 'Biology', def: 'Biologie' },
                    ]}/>
                    
                </div>

            </main>}/>
        
        </Routes></Router>
    
    </MemoryProvider>
</React.StrictMode>