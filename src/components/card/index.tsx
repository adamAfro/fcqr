import style from "./style.module.css"



export default function Card(props: { issue: string, comment: string }) {

    return <p className={style.card} data-testid='card'>
        <span className={style.issue}>
            <Letters text={props.issue}/>
        </span>
        <span className={style.comment}>    
            <Letters text={props.comment}/>
        </span>
    </p>
}

function Letters(props: { text: string }) {
    
        return <span className={style.letters}>
            {Array.from(props.text).map(tagCharRandomly)}
        </span>
}

function tagCharRandomly(letter: string, index = 0) {

    return tagChar(letter, index, Math.random(), randInt(1, 5))
}

function tagChar(letter: string, index = 0, seed = 0, variant = 0) {

    return <span key={index} className={style.letter} style={{
        transform: `translate(${.25*seed}em, ${1.25*seed}em)`
    }} data-variant={variant}>
        {letter}
    </span>
}

function randInt(min = 0, max = 1) {

    return Math.floor(Math.random() * (max - min + 1)) + min
}