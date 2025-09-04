import React from 'react'
import {useNavigate} from 'react-router-dom'

export default function ResultsPage(){
  const navigate = useNavigate()
  const raw = localStorage.getItem('quiz_latest_result')
  const result = raw ? JSON.parse(raw) : null

  if (!result) return (
    <div className="app-wrapper">
      <div className="card">No results found. Please take the quiz first.</div>
    </div>
  )

  const {score, total, answers, questions, timestamp} = result

  const handleRestart = ()=>{
    try{ localStorage.removeItem('quiz_latest_result') }catch(e){}
    // go to quiz and reload to reinitialize in-memory state
    navigate('/quiz')
    setTimeout(()=>window.location.reload(), 60)
  }

  return (
    <div className="app-wrapper">
      <div className="header">
        <div className="brand">
          <h1>Quiz Results</h1>
          <div className="small">Summary of your attempt</div>
        </div>
      </div>

      <div className="card">
        <h2>You scored {score} / {total}</h2>
        <div className="small">Taken on: {new Date(timestamp).toLocaleString()}</div>

        <div style={{height:12}} />

        <div className="results-list">
          {questions.map((q, i)=>{
            const ans = answers[i]
            const selected = ans ? ans.selected : null
            const correct = q.answer
            const ok = selected === correct
            return (
              <div className="result-item" key={i}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:600}} dangerouslySetInnerHTML={{__html: q.question}} />
                  <div className="small">{ok ? 'Correct' : 'Incorrect'}</div>
                </div>
                <div className="small">Your answer: <strong>{selected ?? '— Skipped'}</strong></div>
                <div className="small">Correct answer: <strong>{correct}</strong></div>
              </div>
            )
          })}
        </div>

        <div style={{height:12}} />
        <div style={{display:'flex',gap:8}}>
          <button className="btn" onClick={handleRestart}>Restart Quiz</button>
          <button className="btn ghost" onClick={()=>navigate('/quiz')}>Try Again (same questions)</button>
        </div>
      </div>

    </div>
  )
}
