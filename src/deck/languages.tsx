import { SelectHTMLAttributes } from 'react'

const Languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 
    'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 
    'Polish'
]

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {

    return <select {...props}>{Languages.map((lang) =>
        <option key={lang} value={lang}>{lang}</option>
    )}</select>
}