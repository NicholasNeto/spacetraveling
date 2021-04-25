import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import PrismicDOM from 'prismic-dom';

import React from 'react';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { useRouter } from 'next/router'

import Prismic from '@prismicio/client'
import { AiOutlineCalendar } from 'react-icons/ai';
import { BsPerson } from 'react-icons/bs';
import { BiTime } from 'react-icons/bi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
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
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }



  const resultContent = post.data.content.map(it => {
    let bodyHtml = PrismicDOM.RichText.asHtml(it.body)
    return {
      body: bodyHtml,
      heading: it.heading
    }
  })



  let words = post.data.content.reduce((resultSoFar, current) => {
    return [...resultSoFar, ...PrismicDOM.RichText.asText(current.body).split(" ")]
  }, [])

  let readingTime = Math.round(words.length / 200)


  return (
    <>
      <Header />
      <div>
        <img src={post.data.banner.url} alt="banner" />
        <h1>{post.data.title}</h1>

        <div className={styles.content}>
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

        {resultContent.map(it => {
          return (
            <div key={it.heading}>
              <h2 >{it.heading}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: it.body }} />
            </div>
          )
        })}
      </div>

    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const { results } = posts

  const list = results.map(it => {
    return {
      params: {
        slug: it.uid
      }
    }
  })

  return {
    paths: [...list],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  console.log('response', response)

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    }
  }


  console.log(JSON.stringify(post, null, 2))


  return {
    props: {
      post,
    },
    redirect: 60 * 30 // 30 minutos
  }
};
