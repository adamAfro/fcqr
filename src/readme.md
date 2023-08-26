# It's a Node and React app

Integral components are put in their locations, whilst main files and utilities are in `src` root directory. Tests may be found appropriately as `test.tsx`.

`npm run` commands:

- `start` - run development build;
- `host` - run development build with HTTPS;
- `build` - build app into `dist/beta`;
- `deploy` - deploy app to netlify;
- `dev` - deploy app to netlify for testing;
- `test` - run tests;

## :flower_playing_cards: Decks and cards

Decks are stored in pocket - home screen, and each deck has some cards in it that can be easily added, arranged (shuffle) and deleted.

- [x] Store decks and cards: cards are made with term and definition strings, decks provide them with term's language and definition's language file. They can be seamlessly edited in deck's view and are saved offline in indexed database in a browser: see proper `database.ts` file - there are few;

- [x] Decks can be imported using QR code scanner [mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode) which at this point behaves as react component but can be tested only manually;

- [x] Decks can be imported and exported using clipboard API and input text;

- [x] Cards can be read aloud :loud_sound: using [:speech synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) - no idea how widely it is supported. Setup of voices is rather custom - user can set a language for a deck and each language has it's own voice. Deck's could actually have their own voices but but that would complicate interface.

- [x] import and export with :iphone: scanner or text input and clipboard

## :brain: Exercise mode

Exercise mode is another way of viewing deck:

- [x] user either gets definition or audio of a term;

- [ ] what user gets is based on what cards has to offer - ex. if there is no deck's language set then audio should not be provided, and without definition it should;

- [x] user can respond with text and/or voice;

- [ ] text and voice input should be completely separate so that user may (not must) have 2 input methods;

- [x] if answer is supplied correctly, then it's color is rather green, otherwise red, based on `string-similarity-js`;

- [x] supplying correct answer gives some look that it was indeed correct

## :writing_hand: User experience

For better experience user may install app as PWA, which needs a browser. Main focus is on Chrome and less on Firefox, since it does not support speech recognition. Having the app a need for a browser provides issues:

- [x] Firefox and Chrome have slightly different implementations of speech synthesis - in chrome you need to specify `(msg as SpeechSynthesisUtterance).lang` which is not needed in Firefox. Another thing is about language codes - Chrome uses `pl_PL` and Firefox `pl-PL` - a matter of `(code as string).replace('_', '-')`

- [ ] chrome provides unwanted bottom bar for input elements with saved passwords and other utilities

- [ ] window size may not be stable - sometimes app shrinks vertically by few percentages

### :evergreen_tree: Offline access

Using service workers may provide some native functionalities and offline usage:

- [ ] create service worker (it's not directly executed in app) which will save assets

- [x] register service worker from app (directly)

- [ ] provide option to reload assets from app (without it you either need developer tools or clear cache)

:warning: Manual testing of offline access should be done after completely closing app and opening it once again - refreshing will often work, but that is unless app is closed. Then, in Chrome `You are offline` would show up and app would not load, similarly in Firefox.   

### :art: Interface

- [ ] it looks nice!

For now app uses slightly modified, classless `pico.css`, it looks rather bad and does not have any design or look manifest:

- [x] use `pico.css` and provide some basic, easy layout

- [ ] make `src/demo` with important components together, where they can be easily tested manually and their look may be modified in wider context for CSS design purposes.

## :flags: Localisations

Localisations are in `src/localisation`, which one is chosen is based on user's device or browser (see `i18next-browser-languagedetector` package's documentation).

Translations should be `JSON` files named `[language name in short].json`, ex. `en.json`. Then they need to be imported and added to `src/localisation/index.ts`, as others:

- [x] basics for translations;

- [ ] let user select interface language manually;

- [x] choose language based on browser, see `i18next-browser-languagedetector` package;

- [ ] translate QR scanner ([html5-qrcode]([GitHub - mebjas/html5-qrcode: A cross platform HTML5 QR code reader. See end to end implementation at: https://scanapp.org](https://github.com/mebjas/html5-qrcode)) it does not support that, but it seems easy to implement);

---

This file should provide instructions and progress needs and track.
