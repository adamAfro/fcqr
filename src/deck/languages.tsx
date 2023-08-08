import { SelectHTMLAttributes } from 'react'

import { useTranslation } from 'react-i18next'

const Languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 
    'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 
    'Polish'
]

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {

    const { t } = useTranslation()

    return <select {...props}>{Languages.map((lang) =>
        <option key={lang} value={lang}>{t(lang)}</option>
    )}</select>
}