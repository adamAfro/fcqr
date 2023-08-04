/// <reference types="react-scripts" />

import { register as registerForOffline } 
  from './utilities/serviceWorkerRegistration'

import React from 'react'
import ReactDOM from 'react-dom/client'
import reportWebVitals from './utilities/reportWebVitals'

import View from './components/view'

import { IDBProvider } from './utilities/database'

import './globals.css'

const root = ReactDOM
  .createRoot(document.getElementById('root') as Element)

root.render(<React.StrictMode>
    <IDBProvider>
        <View />
    </IDBProvider>
</React.StrictMode>)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

registerForOffline()