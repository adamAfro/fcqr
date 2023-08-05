import { SelectHTMLAttributes } from 'react'

const Languages = ['en', 'pl']

interface SelectProps
    extends SelectHTMLAttributes<HTMLSelectElement> { selection: string }

export function Select(props: SelectProps) {

    const { selection, ...otherProps } = props

    return <select {...otherProps}>{Languages.map((lang) => lang == props.selection ? 
        <option key={lang} value={lang} selected>{lang}</option> :
        <option key={lang} value={lang}>{lang}</option>
    )}</select>
}