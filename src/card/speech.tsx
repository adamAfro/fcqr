import { ButtonHTMLAttributes } from 'react'

import { useTranslation } from '../localisation'

import { useSettings } from '../settings/context'

/** @BUG deck's language change applies only after rerender */
export default function Speech(props: { 
	term: string, termLang: string, def?: string, defLang?: string 
} & ButtonHTMLAttributes<HTMLButtonElement>) {

	const { t } = useTranslation()

	const languages = useSettings().languages

	const { term, termLang, ...rest } = props

	const readAloud = () => speak(term, { 
		voice: languages.find(lang => lang.language == termLang)?.voice
	})

	return <button onClick={readAloud} {...rest}>
		{t`read aloud`}
	</button>
}

interface SpeakOptions {

	voice?: string
	volume?: number
	rate?: number
	pitch?: number
}

async function speak(text: string, options: SpeakOptions) {

	if (!speechSynthesis)
		return Promise.reject(false)
	
	const msg = new SpeechSynthesisUtterance(text)

	msg.volume = options.volume || 1.0
	msg.rate = options.rate || 1.0
	msg.pitch = options.pitch || 1.0

	const voices = speechSynthesis.getVoices()
	if (voices.length == 0)
		return Promise.resolve(false)
	
	msg.voice = voices.find(voice => voice.name == options.voice) ||
		voices[0]

	window.speechSynthesis.speak(msg)

	return new Promise((ok, er) => {
		msg.onend = () => ok(true)
		msg.onerror = () => er(false)
	})
}