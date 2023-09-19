import { 
    ButtonHTMLAttributes,
    AnchorHTMLAttributes,
    LabelHTMLAttributes,
    ReactNode, JSX, createElement, 
} from "react";

import * as Icons from './icons'

import { Link } from 'react-router-dom'

type ButtonAttrs = ButtonHTMLAttributes <HTMLButtonElement>
type AnchorAttrs = AnchorHTMLAttributes <HTMLAnchorElement>
type LinkAttrs = AnchorAttrs & {to: string}
type LabelAttrs = LabelHTMLAttributes <HTMLLabelElement>
type Attrs = ButtonAttrs | AnchorAttrs | LinkAttrs | LabelAttrs

type IconName = keyof typeof Icons

interface Props {

    contents?: ReactNode,
    symbol?: IconName,

    active?: boolean,
    attention?: 'primary' | 'removal' | 'error' | 'weak' | 'none',

    href?: string
    to?: string
    labeled?: ReactNode
}

export default function Button(props: Props & ButtonAttrs): JSX.Element
export default function Button(props: Props & AnchorAttrs): JSX.Element
export default function Button(props: Props & LinkAttrs): JSX.Element
export default function Button(props: Props & LabelAttrs): JSX.Element
export default function Button({ active, symbol, attention, contents, href, to, labeled, ...props }: Props & Attrs) {

    if (to) return <Link {...props as AnchorAttrs}
        className={symbol && !contents ? 'icon' : undefined}
        role='button' to={to}
        data-attention={attention}
        data-active={active} >{(symbol && symbol in Icons) ?
            createElement(Icons[symbol as IconName]) : symbol
        } {contents}</Link>

    if (href) return <a {...props as AnchorAttrs}
        className={symbol && !contents ? 'icon' : undefined}
        role='button' href={href}
        data-attention={attention}
        data-active={active} >{(symbol && symbol in Icons) ?
            createElement(Icons[symbol as IconName]) : symbol
        } {contents}</a>

    if (labeled) return <label role='button' {...props as LabelAttrs}
        className={symbol && !contents ? 'icon' : undefined}
        data-attention={attention} 
        data-active={active}>{(symbol && symbol in Icons) ?
            createElement(Icons[symbol as IconName]) : symbol
        } {contents}{labeled}</label>

    return <button {...props as ButtonAttrs}
        className={symbol && !contents ? 'icon' : undefined}
        data-attention={attention} 
        data-active={active} >{(symbol && symbol in Icons) ?
            createElement(Icons[symbol as IconName]) : symbol
        } {contents}</button>
}