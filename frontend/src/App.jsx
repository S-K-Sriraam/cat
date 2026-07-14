import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import About from './pages/About'
import DebugInfo from './components/DebugInfo'

export default function App(){
  return (
    <div>
      <DebugInfo />
      <main>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/about" element={<About/>} />
        </Routes>
      </main>
    </div>
  )
}
