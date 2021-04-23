import { GetStaticProps } from 'next';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'


import { AiOutlineCalendar } from 'react-icons/ai';
import { BsPerson } from 'react-icons/bs';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import styles from './home.module.scss';
import { useState } from 'react';

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


  const [posts, setPosts] = useState(postsPagination.results)
  const [isNextPage, setIsNextPage] = useState(postsPagination.next_page)

  
  async function handleLoadMorePosts() {

    const response = await fetch(postsPagination.next_page)
    const { results, next_page } = await response.json()

    const morePosts = results.map((post: Post) => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })

    setPosts(posts.concat(morePosts));
    setIsNextPage(next_page)
  }

  return (
    <>
      <main className={styles.container}>
        <div className={styles.logo}>
          <img src="/Logo.svg" alt="logo" />
        </div>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.content}>
                  <div>  <AiOutlineCalendar />
                    <time>{format(new Date(post.first_publication_date), 'd MMM yyyy', { locale: ptBR })}</time>
                  </div>
                  <div>
                    <BsPerson />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {isNextPage && <button onClick={handleLoadMorePosts}> Carregar mais posts</button>}
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
    pageSize: 1,
  });

  const results = postsResponse.results.map((post: Post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
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
