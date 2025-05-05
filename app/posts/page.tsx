import Link from "next/link";
import React from 'react'
import ViewUserButton from '../components/Posts/ViewUserButton'
import CardList from '../components/Posts/CardList'

const base_url = 'https://jsonplaceholder.typicode.com/posts'

interface Iposts {
  userId: number
  id: number
  title: string
  body: string
}

const Posts = async() => {
  const response = await fetch(base_url)
  const posts: Iposts[] = await response.json()

  return (
    <>
    <h1 className='text-fuchsia-600'>Postingan Page</h1>
    <p>{posts[0].userId}</p>
    <nav className="flex justify-items-start">
    <Link href="/" className="mx-2">Home</Link>
    <Link href="/posts" className="mx-2">Input Data</Link>
    <Link href="/datas" className="mx-2">Data Pohon</Link>
    </nav>
    <CardList>
      {posts.map((post) => (
        <div key={post.id} className='border-2 border-fuchsia-600 p-4 m-2 rounded-lg'>
          <h1>{post.id}</h1>
          <h2 className='text-xl font-bold'>{post.title}</h2>
          <p>{post.body}</p>
          <ViewUserButton userID={post.userId}/>
        </div>
      ))}
    </CardList>
    </>
  )
}

export default Posts