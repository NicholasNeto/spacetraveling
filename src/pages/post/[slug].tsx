import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import PrismicDOM from 'prismic-dom';

import Link from 'next/link';

import { useRouter } from 'next/router'

import React from 'react';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';


import Prismic from '@prismicio/client'
import { AiOutlineCalendar } from 'react-icons/ai';
import { BsPerson } from 'react-icons/bs';
import { BiTime } from 'react-icons/bi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { getAllPostIds } from './lib/slug';
import Navegation from '../../components/Navegation';
import Comments from '../../components/Comments';

interface NavegationPostType {
  next: { href: string, title: string },
  previous: { href: string, title: string },
}
interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date?: string | null;
  data: {
    subtitle: string;
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
  navegationPost: NavegationPostType;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { next, previous } = post.navegationPost

  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  const resultContent = post.data.content.map(it => {
    let bodyHtml = PrismicDOM.RichText.asHtml(it.body)
    return {
      heading: it.heading,
      body: bodyHtml
    }
  })

  const readingTime = post.data.content.reduce((acc, current) => {
    const bodyText = RichText.asText(current.body)
    const textLength = bodyText.split(/\s/g).length
    const time = Math.ceil(textLength / 200)

    return acc + time
  }, 0)

  return (
    <>
      <Header />

      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <main className={styles.main}>
        <h1>{post.data.title}</h1>

        <div>
          <div className={styles.info}>
            <div>
              <AiOutlineCalendar />
              <time>{format(new Date(post.first_publication_date), 'd MMM yyyy', { locale: ptBR })}</time>
            </div>
            <div>
              <BsPerson />
              <span>{post.data.author}</span>
            </div>
            <div>
              <BiTime />
              <span>{`${readingTime} min`}</span>
            </div>
          </div>
          {post.last_publication_date === null || post.last_publication_date === post.first_publication_date ?
            null :
            <div className={styles.secondaryInfo}>
              {"* editado em " + format(new Date(post.last_publication_date), 'PPpp', { locale: ptBR })}
            </div>
          }
        </div>

        {resultContent.map(it => {
          return (
            <div key={it.heading}>
              <h2 >{it.heading}</h2>
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{ __html: it.body }} />
            </div>
          )
        })}
      </main>


      <div className={styles.footer}>
        <div className={styles.border} />

        <div className={styles.footerConteiner}>
          <div className={styles.footerContent} >
            {previous && <Navegation title={previous.title} path={previous.href} label='Post anterior' />}
          </div>

          <div className={styles.footerContent}>
            {next && <Navegation title={next.title} path={next.href} label='Proximo post' />}
          </div>
        </div>

        <div >
          <Comments />
        </div>
      </div>

    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllPostIds()
  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const nextPosts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    'fetch': 'posts.title',
    'after': response.id,
    orderings: '[document.first_publication_date]',
  });

  const previousPosts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    'fetch': 'posts.title',
    'after': response.id,
    orderings: '[document.first_publication_date desc]',
  });

  const next = nextPosts.results.length > 0 ? {
    title: nextPosts.results[0].data.title,
    href: nextPosts.results[0].uid
  } : null

  const previous = previousPosts.results.length > 0 ? {
    title: previousPosts.results[0].data.title,
    href: previousPosts.results[0].uid
  } : null

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
    navegationPost: {
      next,
      previous
    }
  }

  return {
    props: {
      post,
    },
    redirect: 60 * 30 // 30 minutos
  }
};
