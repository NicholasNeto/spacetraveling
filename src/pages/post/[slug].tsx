import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
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

interface Post {
  first_publication_date: string | null;
  data: {
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

  return (
    <>
      <Header />
      <div>
        <img src={post.data.banner.url} alt="banner" />
        <h1>{post.data.title}</h1>
        <div>
          <time>{post.first_publication_date}</time>
          <span>{post.data.author}</span>

        </div>

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
            <span>Tempo de leitura</span>
          </div>
        </div>

        <div>
          <h2>{post.data.content[0].heading}</h2>
          <p>{post.data.content[0].body}</p>
        </div>

      </div>

    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
    //Prismic.Predicates.at('my.article.release_date', new Date('2021-04-24'))
  ]);

  const { results } = posts
  console.log('posts', posts);

  const list = results.map(it => {
    return {
      params: {
        slug: it.uid
      }
    }
  })

  console.log('list', list);

  return {
    paths: [...list],
    fallback: true
  }

  // Busca dos ultimos posts ou algum post especifico.
  // paths: [
  //     { params: {slug: 'TypeScript: Vantagens, mitos, dicas e conceitos fundamentais'}}
  // ],


  // { orderings : '[document.first_publication_date]' }
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const resultContent = response.data.content.map(it => {
    return {
      heading: it.heading,
      body: it.body.map(item => item.text)
    }
  })

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: resultContent,
    }
  }

  // console.log('888888', JSON.stringify(post, null, 2))

  return {
    props: {
      post
    },
    redirect: 60 * 30 // 30 minutos
  }
};
