# FcQR :black_joker:

Flashcards app for language learning

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

## Dependencies

Built with [react JS](https://reactjs.org/) and some other Node dependencies (see `package.json`); QR scanner is [mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode) as provided under Apache-2.0 license; style is based on [pico.css](https://picocss.com/) originally provided under MIT license.

See `src/readme.md` for development help. 

## Making QR codes for scanner

App provides QR reader for reading data from other devices and environment. QR codes should be provided as a slideshow or a set of codes in which every code has following data structure as `JSON` code:

```ts
{ 
    index: number, // index of QR code among others
    total: number, // total number of codes to scan
    data: string, // data in supported format
    meta: any // additional informations (not in use for now)
}
```

**Format**: For now only CSV is supported with separator being dash `— `, hyphen-minus `-`, tab, vertical line `|`, comma, semicolon or space. Additionally they may be surrounded with spaces for clarity like so ` — `.