import { 
    ButtonHTMLAttributes,
    AnchorHTMLAttributes,
    LabelHTMLAttributes,
    InputHTMLAttributes,
    ReactNode, JSX, createElement, 
} from "react";

import * as Icons from './icons'

import { Link } from 'react-router-dom'

type ButtonAttrs = ButtonHTMLAttributes <HTMLButtonElement>
type AnchorAttrs = AnchorHTMLAttributes <HTMLAnchorElement>
type LinkAttrs = AnchorAttrs & {to: string}
type LabelAttrs = LabelHTMLAttributes <HTMLLabelElement>
type InputAttrs = InputHTMLAttributes <HTMLInputElement>
type Attrs = ButtonAttrs | AnchorAttrs | LinkAttrs | LabelAttrs

interface Props {

    contents?: ReactNode,
    symbol?: IconName,

    active?: boolean,
    attention?: 'primary' | 'removal' | 'error' | 'correct' | 'weak' | 'none',

    href?: string
    to?: string
    labeled?: ReactNode
}

export function Button(props: Props & ButtonAttrs): JSX.Element
export function Button(props: Props & AnchorAttrs): JSX.Element
export function Button(props: Props & LinkAttrs): JSX.Element
export function Button(props: Props & LabelAttrs): JSX.Element
export function Button({ active, symbol, attention, contents, href, to, labeled, ...props }: Props & Attrs) {

    if (to) return <Link {...props as AnchorAttrs}    
        role='button' to={to} 
        data-attention={attention}
        data-active={active} >{(symbol && symbol in Icons) ?
            createElement(Icons[symbol as IconName]) : symbol
        } {contents}</Link>

    if (href) return <a {...props as AnchorAttrs}
        role='button' href={href}
        data-attention={attention}
        data-active={active} >{(symbol && symbol in Icons) ?
            createElement(Icons[symbol as IconName]) : symbol
        } {contents}</a>

    if (labeled) return <label role='button' {...props as LabelAttrs}
        data-attention={attention} 
        data-active={active}>{(symbol && symbol in Icons) ?
            createElement(Icons[symbol as IconName]) : symbol
        } {contents}{labeled}</label>

    return <button {...props as ButtonAttrs}
        data-attention={attention} 
        data-active={active} >{(symbol && symbol in Icons) ?
            createElement(Icons[symbol as IconName]) : symbol
        } {contents}</button>
}

type IconName = keyof typeof Icons
interface WidgetProps extends Props {
    big?: boolean,
    symbol: IconName
}

export function Widget(props: WidgetProps & ButtonAttrs): JSX.Element
export function Widget(props: WidgetProps & AnchorAttrs): JSX.Element
export function Widget(props: WidgetProps & LinkAttrs): JSX.Element
export function Widget(props: WidgetProps & LabelAttrs): JSX.Element
export function Widget({ big, symbol, ...props }: WidgetProps & Attrs) {

    return <Button {...props as Props & ButtonAttrs}
        className={big ? 'widget' : 'box'} symbol={symbol}/>
}

export function Input({ active, attention, contents, ...props }: Props & InputAttrs) {

    return <input {...props as InputAttrs}
        data-attention={attention} 
        data-active={active}/>
}