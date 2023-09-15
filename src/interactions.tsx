import { 
    ButtonHTMLAttributes,
    AnchorHTMLAttributes,
    LabelHTMLAttributes,
    ReactNode, JSX 
} from "react";

import { Link } from 'react-router-dom'

type ButtonAttrs = ButtonHTMLAttributes <HTMLButtonElement>
type AnchorAttrs = AnchorHTMLAttributes <HTMLAnchorElement>
type LinkAttrs = AnchorAttrs & {to: string}
type LabelAttrs = LabelHTMLAttributes <HTMLLabelElement>
type Attrs = ButtonAttrs | AnchorAttrs | LinkAttrs | LabelAttrs

interface Props {

    contents?: ReactNode,

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
export function Button({ active, attention, contents, href, to, labeled, ...props }: Props & Attrs) {

    if (to) return <Link {...props as AnchorAttrs}    
        role='button' to={to} 
        data-attention={attention}
        data-active={active} >{contents}</Link>

    if (href) return <a {...props as AnchorAttrs}    
        role='button' href={href} 
        data-attention={attention}
        data-active={active} >{contents}</a>

    if (labeled) return <label role='button' {...props as LabelAttrs}
        data-attention={attention} 
        data-active={active}>{contents}{labeled}</label>

    return <button {...props as ButtonHTMLAttributes <HTMLButtonElement>}
        data-attention={attention} 
        data-active={active} >{contents}</button>
}

interface WidgetProps extends Props {
    big?: boolean,
    symbol: string
}

export function Widget(props: WidgetProps & ButtonAttrs): JSX.Element
export function Widget(props: WidgetProps & AnchorAttrs): JSX.Element
export function Widget(props: WidgetProps & LinkAttrs): JSX.Element
export function Widget(props: WidgetProps & LabelAttrs): JSX.Element
export function Widget({ big, symbol, ...props }: WidgetProps & Attrs) {

    return <Button className={big ? 'widget' : 'box'} contents={symbol} {...props as Props & ButtonAttrs}/>
}