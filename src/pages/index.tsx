import { GetStaticProps } from 'next';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {


  //   <main className={styles.container}>
  //   <div className={styles.posts}>
  //       {posts.map(post => (
  //           <Link href={`/posts/preview/${post.slug}`} key={post.slug}>
  //               <a >
  //                   <time>{post.updatedAt}</time>
  //                   <strong>{post.title}</strong>
  //                   <p>{post.excerpt}</p>
  //               </a>
  //           </Link>
  //       ))}
  //   </div>
  // </main>




  return (
    <>
      <main className={styles.container}>
        <img src="/Logo.svg" alt="logo" />
        <div className={styles.posts}>
          {postsPagination.results.map(post => (
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>{post.first_publication_date}</time>
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {postsPagination.next_page && <div> Carregar mais posts</div>}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 100,
  });

  const results = postsResponse.results.map((post: Post) => {
    return {
      uid: post.uid,
      first_publication_date: new Date(post.first_publication_date).toLocaleDateString(
        'pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results
      }
    }
  }
};
