import { getPrismicClient } from "../../../services/prismic";
import Prismic from '@prismicio/client'

export async function getAllPostIds() {
    const prismic = getPrismicClient();

    const posts = await prismic.query([
        Prismic.Predicates.at('document.type', 'posts'),
    ]);

    return posts.results.map(it => {
        return {
            params: {
                slug: it.uid
            }
        }
    })
}