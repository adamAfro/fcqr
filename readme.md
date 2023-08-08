# FCQR :black_joker:

(serverless) Flashcards with :camera: QR code scanning

It complements 
[firefox extension :desktop_computer:](https://github.com/adamAfro/browser-fc-maker)
for making flashcards

## Howto?

- Last scanned set will load automatically
- Scanning:
    1. click *scan button*
    2. ask for camera permissions, click scan button, ignore the error :sweat_smile: and click once more
    3. scan until all words all scanned

## Features&TODOs

- [x] :iphone: scan words and display them, save :floppy_disk: the last loaded set
- [x] :evergreen_tree: make app avaible to load completly offline
- [x] :floppy_disk: save multiple sets and make it avaible to choose between them
- [ ] :loud_sound: read words [aloud](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [ ] :8ball: simple gamefication of flashcards to memorize better
- [x] :flags:

## Dev and deps

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