import Link from "next/link";
import styles from './navegation.module.scss'

export default function Navegation({ title, path, label }) {
    return (
        <div className={styles.container}>
            <div>{title}</div>
            <Link href={`/post/${path}`}>
                <a> {label}</a>
            </Link>
        </div>
    )
}