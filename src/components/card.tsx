import style from "./card.module.css"



export default function Card(props: { issue: string, comment: string }) {

    return <p className={style.card} data-testid='card'>
        <span className={style.issue}>{props.issue}</span>
        <span className={style.comment}>{props.comment}</span>
    </p>
}