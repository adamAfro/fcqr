import { HTMLAttributes, useState } from 'react'

import { useMemory } from '../memory'
import { useTranslation, supported } from '../localisation'
import { unregister } from '../registrar'

import Languages from '../languages'

import { Link, links } from "../app"
import { version } from '../meta'

import ui from '../style.module.css'
import style from './style.module.css'

enum Pane { APP, LANGUAGES }

export default function Settings(props: HTMLAttributes<HTMLDivElement>) {

    const { t } = useTranslation()

    const { language, setLanguage } = useMemory()!

    const [pane, setPane] = useState(Pane.APP)

    const options = [
        [Pane.APP, t`application`],
        [Pane.LANGUAGES, t`decks' languages and voices`]
    ] as [Pane, string][]

    return <>

        <nav className={ui.quickaccess}>
            <p className={ui.faraccess}>
                <Link role="button" data-testid="preferences-btn" to={links.pocket}>{t`go back`}</Link>
            </p>
        </nav>

        <h1 className={ui.title}>{t`options`}</h1>

        <nav className={style.panes}>

            {options.map(([p, text]) => <button 
                onClick={() => setPane(p)}
                className={p == pane ? '' : ui.primary}
            >{text}</button>)}

        </nav>

        {pane == Pane.APP ? <section>

            <p>FcQR - {t`version`} {version}</p>

            <button style={{display:'inline-block',margin: '0 1em'}} onClick={() => 
                unregister().then(() => window.location.reload())
            }>{t`update`}</button>

            <p>Language of interface:<select value={language} onChange={e => { setLanguage(e.target.value) }}>
                <option key={-1} value=''>{t`of the device`}</option>
                {supported.map(([code, name], i) => 
                    <option key={i} value={code}>{name}</option>
                )}
            </select></p>

        </section> : null}

        {pane == Pane.LANGUAGES ? <Languages/> : null}

    </>
}