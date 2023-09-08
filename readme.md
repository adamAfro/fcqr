# FcQR :black_joker:

Flashcards app for language learning

**TODO**: rename to `fliszki`/`flisks`

`offline + fiszki -> offliszki -> fliszki -> flisks` 

## Features

- :flower_playing_cards: decks and cards
  - [x] save multiple sets and choose between them
  - [x] edit cards' and decks' properties
  - [x] read terms [:loud_sound: aloud](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
  - [x] custom voice setup\*
  - [x] import and export with :iphone: scanner or text input and clipboard
- :brain: exercise mode
  - [x] guess term based on definition or audio
  - [x] guess with voice input
  - [x] get additional hint (definition or audio if not present) 
  - [x] get correct answer
- :writing_hand: user experience
  - [x] act native\*
  - [ ] run offline
  - [ ] update
- :flags: localisations
  - [x] :england: English (base)
  - [x] :poland: Polish
  - [ ] :it: Italian
  - [ ] :fr: French
  - [ ] :es: Spanish

\* may need some fixes (see `src/readme.md`)

### Ideas :bulb: and their drawbacks

- use external services to create flashcards with language models, at some cost :money_with_wings:
  
  - use [recognition of text in images](https://tesseract.projectnaptha.com/) to pass text to model;

- use server to store, sync and share cards and decks, which is what every app does.. :yawning_face:

## Dependencies

Built with [react JS](https://reactjs.org/) and some other Node dependencies (see `package.json`); QR scanner is [mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode) as provided under Apache-2.0 license.

See `src/readme.md` for development help. 

## External utilities

Main idea behind it is to use flashcards created based on websites' content - selected text is passed to GPT, which generates flashcards' data.

- Using only mobile :iphone:: select text and paste to chat.openai.com, then copy output and paste to a deck;

- Using mobile :iphone: and desktop :desktop_computer:: use [firefox Popup GPT addon](https://addons.mozilla.org/pl/firefox/addon/popup-chat-gpt/) for pasting selection to open.ai chat popup, then select output and use [QR Selection addon](https://addons.mozilla.org/pl/firefox/addon/qr-selection/) to create QR slideshow with it and scan it with your phone.

## Import/Export

### Format

For now CSV is supported with separator being dash `— `, hyphen-minus `-`, tab, vertical line `|`, comma, semicolon or space. Additionally they may be surrounded with spaces for clarity like so ` — `.

Decks can be also moved as packages - `.json` files with raw data:

```ts
packed: {
  
  data: {
    id?: number
    name: string
    termLang: string
    defLang: string
  },
  
  cards: {
      id?: number
      deckId?: number
      term: string
      def: string
      order?: number
  }
  
}[]
```

### Making QR codes for scanner

App provides QR reader for reading data from other devices and environment. QR codes should be provided as a slideshow or a set of codes in which every code has following data structure as `JSON` code:

```ts
{ 
    index: number, // index of QR code among others
    total: number, // total number of codes to scan
    data: string, // data in supported format
    meta: any // additional informations (not in use for now)
}
```

## Versioning

```
[concept version].[minor change number].[bug fix number]
```