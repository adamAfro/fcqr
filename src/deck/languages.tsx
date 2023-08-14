import { SelectHTMLAttributes } from 'react'

import { useTranslation } from '../localisation'

import { useSettings } from '../settings/context'

export default function(props: SelectHTMLAttributes<HTMLSelectElement>) {

    const languages = useSettings().languages
    if (props.defaultValue) {

        const selected = props.defaultValue?.toString()
        if (!languages.find(({language}) => language == selected))
            languages.push({ id: -1, language: selected! })
    }

    return <select {...props}>{languages.map(({ language }, i) =>
        <option key={i} value={language}>{language}</option>
    )}</select>
}