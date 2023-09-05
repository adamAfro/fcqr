import { HTMLAttributes, useState } from 'react'

import { useTranslation } from '../localisation'
import { unregister } from '../registrar'

import Languages from './languages'

import { Link, links } from "../app"
import { version } from '../meta'

import ui from '../style.module.css'
import style from './style.module.css'

enum Pane { NONE, APP, LANGUAGES }

export default function Settings(props: HTMLAttributes<HTMLDivElement>) {

    const { t } = useTranslation()

    const [pane, setPane] = useState(Pane.NONE)

    const options = [
        [Pane.APP, t`settings`],
        [Pane.LANGUAGES, t`languages and voices`]
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

        {pane == Pane.APP ?<section>

            <p>FcQR - {t`version`} {version}</p>

            <button style={{display:'inline-block',margin: '0 1em'}} onClick={() => 
                unregister().then(() => window.location.reload())
            }>{t`refresh`}</button>

        </section> : null}

        {pane == Pane.LANGUAGES ? <Languages/> : null}

    </>
}