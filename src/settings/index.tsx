import { HTMLAttributes } from 'react'

import { useTranslation } from '../localisation'

import Languages from './languages'

import { Link, links } from "../app"

import ux from '../style.module.css'

export default function Settings(props: HTMLAttributes<HTMLDivElement>) {

    const { t } = useTranslation()

    return <>

        <nav className={ux.quickaccess}>
            <p className={ux.faraccess}>
                <Link role="button" data-testid="preferences-btn" to={links.pocket}>{t`go back`}</Link>
            </p>
        </nav>

        <h1 className={ux.title}>{t`settings`}</h1>

        <Languages />

    </>
}