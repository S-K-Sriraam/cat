import React from 'react'
import { Link } from 'react-router-dom'

export default function Nav(){
  return (
    <nav style={{background:'#fff',borderBottom:'1px solid #eee',padding:'12px 16px'}}>
      <Link to="/" style={{marginRight:12,fontWeight:700}}>Home</Link>
      <Link to="/about">About</Link>
    </nav>
  )
}
