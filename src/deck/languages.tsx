import { SelectHTMLAttributes } from 'react'

import { useTranslation } from '../localisation'

import { useSettings } from '../settings/context'

export default function(props: SelectHTMLAttributes<HTMLSelectElement>) {

    const languages = useSettings().languages

    return <select {...props}>{languages.map(({ language }, i) =>
        <option key={i} value={language}>{language}</option>
    )}</select>
}