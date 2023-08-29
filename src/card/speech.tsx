import { ButtonHTMLAttributes } from 'react'

import { useTranslation } from 'react-i18next'
import { useMemory } from '../memory'

import { speak } from "../languages"

export default function Speech({
	term, termLang, def, defLang, ...attrs
}: { 
	term: string, termLang: string, 
	def?: string, defLang?: string,
} & ButtonHTMLAttributes<HTMLButtonElement>) {

	const { t } = useTranslation()

    const { languages } = useMemory()!

	return <button onClick={() => speak(term, { 
		
		voice: languages
			.find(lang => lang.name == termLang)?.voice

	})} {...attrs}>🔈</button>
}