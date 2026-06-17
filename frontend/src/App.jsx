import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Nav from './components/Nav'

export default function App(){
  return (
    <div>
      <Nav />
      <main style={{padding:'1rem'}}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About/>} />
        </Routes>
      </main>
    </div>
  )
}
