export interface LanguageConfig {
    id: number,
    name: string,
    voice?: string,
	code?: string
}

interface SpeakOptions {

	voice?: string
	volume?: number
	rate?: number
	pitch?: number
}

export async function getVoices(): Promise <SpeechSynthesisVoice[]> {

	if (!speechSynthesis)
		return []
	
	const voices = speechSynthesis.getVoices()
	if (voices.length > 0)
		return voices

	return new Promise((ok, er) => {

		let i = 0
		const checkout = setInterval(() => {

			if (i < 10)
				return void i++

			er("No were voices found")
			clearInterval(checkout)

		}, 250)

		const resolve = () => {

			const voices = speechSynthesis.getVoices() as SpeechSynthesisVoice[]
			if (voices.length > 0)
				ok(voices)
			else
				er(voices)
		}
		
		speechSynthesis.addEventListener("voiceschanged", resolve, {once: true})
	})
}

export async function speak(text: string, options: SpeakOptions) {

	if (!speechSynthesis) return void Promise
		.reject("Speech synthesis is not supported in this browser.")
	
	const msg = new SpeechSynthesisUtterance(text)
		msg.volume = options.volume || 1.0
		msg.rate = options.rate || 1.0
		msg.pitch = options.pitch || 1.0
		msg.voice = getVoiceByName(options.voice!)
		msg.lang = msg.voice.lang

	window.speechSynthesis.speak(msg)

	return new Promise((ok, er) => {
		msg.onend = () => ok(true)
		msg.onerror = () => er(false)
	})
}

interface ListenOptions {
	langCode: string
}

export const Recognition = (() => {

	if (window.SpeechRecognition)
		return window.SpeechRecognition

	if (window.webkitSpeechRecognition)
		return window.webkitSpeechRecognition

	return null
})()

export async function listen(callback: (result: string[]) => void, options: ListenOptions) {

	if (!Recognition)
		return Promise.reject("Speech recognition is not supported in this browser.")

    const recognition = new Recognition()
		recognition.lang = options.langCode
		recognition.continuous = true
		recognition.interimResults = true

	recognition.onresult = (event) => {

		const alternatives = Array
			.from(event.results[event.results.length - 1])
			.sort((a, b) => b.confidence - a.confidence)
		
		callback(alternatives.map(({transcript}) => transcript))
	}

	recognition.start()
	return new Promise((ok, er) => {

		recognition.onspeechend = ok
		recognition.onerror = er
	})
}

export function getVoiceByName(name: string) {

	const voices = speechSynthesis.getVoices()
	if (voices.length == 0)
		throw new Error("No voices available.")

	const voice = voices.find((voice) => voice.name == name)
	if (!voice) 
		throw `Speech synthesis "${name}" not found among ${voices.map(({name}) => name).join(', ')}`

	return voice
}