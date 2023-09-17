import { ReactNode } from "react"

import { useTranslation } from "../localisation"
import { Link, links } from '../app'

import { Button } from '../interactions'

import style from './style.module.css'

export default function Quickaccess({ home, popup, children }: { 
    home?: boolean,
    popup?: ReactNode | null,
    children?: ReactNode
}) {

    const { t } = useTranslation()

    return <div className={style.root}>

        {popup ? <div className={style.popup}>{popup}</div> : <div className={style.left}>

            <nav className={style.nav}>{home ?
                <Button contents={t`options`} to={links.options}/> :
                <Button contents={t`go back`} to={links.pocket}/>
            }</nav>

        </div>}

        <div className={style.right}>{children}</div>

    </div>
}