import { HTMLAttributes } from 'react'

import { useTranslation } from '../localisation'
import { unregister } from '../registrar'

import Languages from './languages'

import { Link, links } from "../app"

import ui from '../style.module.css'

import { version } from '../meta'

export default function Settings(props: HTMLAttributes<HTMLDivElement>) {

    const { t } = useTranslation()

    return <>

        <nav className={ui.quickaccess}>
            <p className={ui.faraccess}>
                <Link role="button" data-testid="preferences-btn" to={links.pocket}>{t`go back`}</Link>
            </p>
        </nav>

        <h1 className={ui.title}>{t`settings`}</h1>

        <section>

            v{version}

            <button style={{display:'inline-block',margin: '0 1em'}} onClick={() => 
                unregister().then(() => window.location.reload())
            }>{t`refresh`}</button>

        </section>

        <Languages />

    </>
}