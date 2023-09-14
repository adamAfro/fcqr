import { useMemory } from '../memory'
import { useTranslation, supported } from '../localisation'
import { unregister } from '../registrar'

import Quickaccess from '../quickaccess'

import { version } from '../meta'

export default function Options() {

    const { t } = useTranslation()

    const { language, setLanguage } = useMemory()!

    return <>

        <Quickaccess/>

        <h1 className='title'>{t`options`}</h1>

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

    </>
}