import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/quiz" replace />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  )
}
