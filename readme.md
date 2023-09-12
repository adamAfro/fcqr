# [Flisqs](flisqs.devadam.pl) :black_joker:

Free and offline flashcards app for language learning



It can be installed as progressive web app, using Chrome, Firefox or other modern browser. Note that Firefox does not support web recognition.

## Dependencies

Built with [create-react-app](https://reactjs.org/) and some other Node dependencies (see `package.json`); QR scanner is [mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode) as provided under Apache-2.0 license.

`npm run` commands:

- `start` - run development build;
- `host` - run development build with HTTPS;
- `build` - build app into `dist/beta`;
- `deploy` - deploy app to netlify;
- `dev` - deploy app to netlify for testing;

## Decks and cards

Decks with cards are stored in the pocket - home screen. Deck has it's name and language, which can be modified, as well as all cards inside.

Cards can be easily edited and viewed in exercise mode which provides some minigames, which may include voice input, thanks to [speech recognition API]([SpeechRecognition - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)). Cards are also optionally read aloud thanks to [speech synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

Pocket provides functionalities for importing and exporting cards, decks and languages. There are 3 methods:

- save as a file / read from file;

- copy to clipboard / copy or write cards manually;

- using QR code scanner [mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode) (input only)

### Import/Export using QR scanner and/or text input

For now, QR scanner and text input support only CSV with separator being dash `— `, hyphen-minus `-`, tab, vertical line `|`, comma, semicolon or space. Additionally they may be surrounded with spaces for clarity like so ` — `.

QR codes should be provided as a slideshow or a set of codes in which every code has following data structure as `JSON` code:

```ts
{ 
    index: number, // index of QR code among others
    total: number, // total number of codes to scan
    data: string, // data in supported format
    meta: any // additional informations (not in use for now)
}
```

### Import/Export using files

Saving and copying uses packages: `.json` files with raw data:

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
  },

  language: {
      id?: number,
      name: string,
      voice?: string,
      code?: string  
  }

}[]
```