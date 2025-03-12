
"use client"
import { useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AuthProvider, { AuthContext } from "./contexts/AuthContext";

// ①useclient serverside うまく切り分けられない。
// import React from 'react';
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';

interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// サーバーサイドでデータを取得する非同期関数 serverside
// async function getNewsArticles(): Promise<Article[]> {
//   const apiKey = process.env.NEWS_API_KEY;
//   const language = 'en';
//   const q = 'crypto';
//   const pageSize = '10';
//   const url = `https://newsapi.org/v2/everything?language=${language}&pageSize=${pageSize}&q=${q}&apiKey=${apiKey}`;
//   const res = await fetch(url, {
//     next: { revalidate: 60 }
//   });
//   if (!res.ok) {
//     throw new Error('記事の取得に失敗しました');
//   }
//   const data = await res.json();
//   return data.articles;
// }

// nafe ショートカット
export default function HomePage() {
  // 実行 serverside
  // const articles = await getNewsArticles();

  // ②api 変数化するとエラーするのは何故か
  const apiKey = process.env.NEWS_API_KEY;
  const language = 'en';
  const q = 'crypto';
  const pageSize = '10';
  const API_URL = `https://newsapi.org/v2/everything?language=${language}&pageSize=${pageSize}&q=${q}&apiKey=b3525f00389c4c6884d04c85ee038c20`;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { session } = useContext(AuthContext);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(API_URL);
        setArticles(response.data.articles);
      } catch (err) {
        setError("Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    // ③ログイン管理　全体に持たせるならやっぱりcontext??
    // const fetchUser = async () => {
    //   const { data, error } = await supabase.auth.getUser();
    //   if (error) {
    //     alert('ユーザー情報取得エラー:signin画面よりログインしてください');
    //     router.push('/signin');
    //   } else {
    //     setUser(data.user);
    //   }
    //   setLoading(false);
    // };
    // fetchUser();
    // const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    //   setUser(session?.user ?? null);
    // });
    // return () => {
    //   authListener.subscription.unsubscribe();
    // };
  }, []);

  if (loading) return <p className='text-center mt-10'>読み込み中...</p>;
  // if (!user) return <p className='text-center mt-10'>ログインしていません。</p>;

  return (
    <>
    <div className="px-6 py-10">
      <div>ログイン状況 : {session ? <span>ログイン中</span> : <span>未ログイン</span> }</div>
      <h1 className="text-3xl font-bold">NEWS一覧</h1>
      <div className='grid-cols-2 gap-6 grid md:grid-cols-3 md:gap-8'>

        {/* <Articles articles={articles}/> */}

        {articles.length > 0 ? (
          articles.map( (article, index) => (
            <div key={index} className="mt-4 border-b pb-4">
              <h2 className="text-xl font-semibold line-clamp-2">{article.title}</h2>
              {article.urlToImage && <img src={article.urlToImage} alt={article.title} className="mt-2 h-48 w-full object-cover" />}
              <p className="mt-2 line-clamp-3">{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                Read more
              </a>
            </div>
          ))
        ) : (
          <p>記事は見つかりません。</p>
        ) }
      </div>
    </div>
    </>
  );
}
