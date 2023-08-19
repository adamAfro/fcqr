# FCQR :black_joker:

(serverless) Flashcards with :camera: QR code scanning

It complements 
[firefox extension :desktop_computer:](https://github.com/adamAfro/browser-fc-maker)
for making flashcards

## Features&TODOs

- [x] :iphone: scan words
- [x] :evergreen_tree: make app avaible offline after initial entry
- [x] :floppy_disk: save multiple sets and let to choose between them
- [x] :loud_sound: read words [aloud](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) with custom voices setup

- [ ] fix voices' setting - they cannot be removed properly and often get default settings
- [ ] changing deck's name requires full rerender - it is slow
- [ ] removing cards is not optimal


### Locations

- [x] :england: English (base)
- [x] :poland: Polish
- [ ] :it: Italian
- [ ] :fr: French
- [ ] :es: Spanish

## Dev&Deps

- [react JS](https://reactjs.org/)
    - `npm start`
    - `npm test` ([running tests](https://facebook.github.io/create-react-app/docs/running-tests))
        - all t[(j)est](https://jestjs.io/)s' should pass except todo's
    - `npm run build` ([deployment](https://facebook.github.io/create-react-app/docs/deployment))
    - `npm run eject`
- [mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode) as provided under Apache-2.0 license 
    - testing QR code reader on a mobile requires serving over HTTPS,
        curretly done with VS Code `live server` extension 
        with [self-signed cert.](https://www.akadia.com/services/ssh_test_certificate.html)
        1. `openssl genrsa -des3 -out server.key 1024` - create key
        2. `openssl req -new -key server.key -out server.csr` - request self-sign
        3. `openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt` - certificate
        4. then extension needs to be set up with absolute paths to newly created files
- [pico.css](https://picocss.com/) under MIT license


## QR

QR slideshow is like so:

```ts
{ index: number, total: number, data: string, meta: any }
```

### Data format for QR

For now only CSV with this separators is supported:

```
['—', '-', '\t', '|', ',', ';', ' ']
```

They are either passed in meta of a chunk or the first one from right that is in every line is taken.

### Meta for QR

Example chunk for canonical CSV:

```
{ index: 0, total: 5, data: '...', meta: {
    type: 'CSV', 
    characters: {
        separator: ',',
        endline: '\n'
    }
}}
```