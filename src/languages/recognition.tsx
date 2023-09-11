
export const Recognition = (() => {

	if (window.SpeechRecognition)
		return window.SpeechRecognition

	if (window.webkitSpeechRecognition)
		return window.webkitSpeechRecognition

	return null
})()

export async function listen(callback: (result: string[]) => void, options: {
	langCode: string
}) {

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