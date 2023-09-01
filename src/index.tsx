/// <reference types="react-scripts" />

import ReactDOM from 'react-dom/client'
import React from 'react'

import App from './app'

import reportWebVitals from './report'

import { register } from './registrar'
register().then(x => console.log(x))
    .catch(e => console.error(e))

ReactDOM
    .createRoot(document.getElementById('root') as Element)
    .render(React.createElement(App, { basename: '/beta/' }))

reportWebVitals()