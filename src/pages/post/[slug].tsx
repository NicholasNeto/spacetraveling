import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import React from 'react';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

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
    <div>
      <Header></Header>
      <img src="/Logo.svg" alt="logo" />
      teste
    </div>
  )
}

export const getStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);


  return {
    paths: [],
    fallback: 'blocking'
  }
  // TODO
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
