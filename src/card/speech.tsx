import { ButtonHTMLAttributes } from 'react'

import { useTranslation } from 'react-i18next'
import { useMemory } from '../memory'

import { speak } from "../languages"

export default function Speech(props: { 
	term: string, termLang: string, def?: string, defLang?: string 
} & ButtonHTMLAttributes<HTMLButtonElement>) {

	const { t } = useTranslation()

    const { languages } = useMemory()!

	const { term, termLang, ...rest } = props

	const readAloud = () => speak(term, { 
		voice: languages.find(lang => lang.name == termLang)?.voice
	})

	return <button onClick={readAloud} {...rest}>
		{t`read aloud`}
	</button>
}