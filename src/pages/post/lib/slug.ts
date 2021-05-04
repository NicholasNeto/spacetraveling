import { getPrismicClient } from "../../../services/prismic";
import Prismic from '@prismicio/client'

export async function getAllPostIds(post) {

    console.log('POSTTTTT', post)
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


    // return fileNames.map(fileName => {
    //     return {
    //         params: {
    //             id: fileName.replace(/\.md$/, '')
    //         }
    //     }
    // })



}