import { HTMLAttributes } from 'react'

import { useTranslation } from '../localisation'

import { links, Link } from '../app'


import Voices from './voices'

import style from './style.module.css'


export { useSettings, Provider } from './context'

export function Settings(props: HTMLAttributes<HTMLDivElement>) {

    const {t} = useTranslation()

    return <main className={style.panel} {...props}>

        <Link role='button' to={links.pocket}>{t`go back`}</Link>

        <h1>{t`settings`}</h1>

        <Voices/>

    </main>
}