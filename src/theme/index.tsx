import { useTranslation } from "../localisation"

import style from './style.module.css'

const attention = [
    '', 'primary', 'error', 'removal', 'correct', 'weak'
]

export default function Theme() {

    const { t } = useTranslation()

    return <>

        <h2>{t`theme`}</h2>

        <h3>{t`buttons`}</h3>
        <div className='row'>

            {attention.map(attention => <>
                <button data-attention={attention}>{t(attention)}</button>
                <button data-active data-attention={attention}>{t(attention)}</button>
                <button disabled data-attention={attention}>{t(attention)}</button>
            </>)}
        
        </div>

        <h3>{t`widgets`}</h3>
        <div className='row'>

            {attention.map(attention => <>
                <button className='widget' data-attention={attention}>a</button>
                <button className='widget' data-active data-attention={attention}>a</button>
                <button className='widget' disabled data-attention={attention}>a</button>
            </>)}
        
        </div>

        <h3>{t`icons`}</h3>
        <div className='row'>

            {attention.map(attention => <>
                <button className='icon' data-attention={attention}>a</button>
                <button className='icon' data-active data-attention={attention}>a</button>
                <button className='icon' disabled data-attention={attention}>a</button>
            </>)}

        </div>

        <h3>{t`inputs`}</h3>
        <div className='row'>
            
            <input type="text" placeholder={t`text`}/>
            <input type="number" placeholder={t`number`}/>
            <input type="range"/>
            <input type="checkbox"/>

            <select>
                <option value="a">a</option>
                <option value="option">option</option>
            </select>

            <textarea></textarea>

        </div>

        <h3>{t`disabled inputs`}</h3>
        <div className='row'>
            
            <input disabled type="text" placeholder={t`text`}/>
            <input disabled type="number" placeholder={t`number`}/>
            <input disabled type="range"/>
            <input disabled type="checkbox"/>

            <select disabled>
                <option value="a">a</option>
                <option value="option">option</option>
            </select>

            <textarea></textarea>

        </div>

    </>
}