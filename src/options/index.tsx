import { useState } from 'react'

import { useMemory } from '../memory'
import { useTranslation, supported } from '../localisation'
import { unregister } from '../registrar'

import Quickaccess from '../quickaccess'
import Theme from '../theme'

import { version } from '../meta'

enum Pane { APP, LANGUAGES, THEME }

export default function Options() {

    const { t } = useTranslation()

    const { language, setLanguage } = useMemory()!

    const [pane, setPane] = useState(Pane.APP)

    const options = [
        [Pane.APP, t`application`],
        [Pane.THEME, t`theme`]
    ] as [Pane, string][]

    function PaneButton({ name, text }: { name: Pane, text: string}) {

        return  <button data-attention='primary' data-active={pane == name}
            onClick={() => setPane(name)}
        >{text}</button>
    }

    return <>

        <Quickaccess>
            <span className='stack'>
                {options.map(([name, text], i) => PaneButton({ name, text }))}
            </span>
        </Quickaccess>

        <h1 className='title'>{t`options`}</h1>

        {pane == Pane.APP ? <>

            <h2>{t`settings`}</h2>

            <p>{t`flisqs`} - {t`version`} {version}</p>

            <div className='row'>
                
                <div>

                    <button style={{display:'inline-block',margin: '0 1em'}} onClick={() => 
                        unregister().then(() => window.location.reload())
                    }>{t`update`}</button>
                </div>

                <div>
                    <p>Language of interface:</p>

                    <select value={language} onChange={e => { setLanguage(e.target.value) }}>
                        <option key={-1} value=''>{t`of the device`}</option>
                        {supported.map(([code, name], i) => 
                            <option key={i} value={code}>{name}</option>
                        )}
                    </select>
                </div>
            </div>

        </> : null}

        {pane == Pane.THEME ? <Theme/> : null}

    </>
}