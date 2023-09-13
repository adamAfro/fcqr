import { ReactNode } from "react"

import { useTranslation } from "../localisation"
import { Link, links } from '../app'

import style from './style.module.css'

export default function Quickaccess({ home, popup, children }: { 
    home?: boolean,
    popup?: ReactNode | null,
    children?: ReactNode
}) {

    const { t } = useTranslation()

    return <div className={style.root}>

        <div className={style.left}>

            {popup ? <div className={style.popup}>{popup}</div> : null}

            <nav className={style.nav}>{home ? <>  
                <a className={style.brandname} target='_blank' href="https://github.com/adamAfro/flisqs">
                    {t`flisqs`}
                </a>
                <Link role="button" to={links.options}>{t`options`}</Link>
            </> : 
                <Link role="button" to={links.pocket}>{t`go back`}</Link>
            }</nav>
            
        </div>

        <div className={style.right}>{children}</div>

    </div>
}