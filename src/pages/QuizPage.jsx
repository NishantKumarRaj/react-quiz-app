import React, {useEffect, useState, useCallback} from 'react'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import Timer from '../components/Timer'
import {useNavigate, useSearchParams} from 'react-router-dom'
import localData from '../data/questions.json'

function shuffle(arr){
  const a = [...arr]
  for (let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1))
    ;[a[i],a[j]] = [a[j],a[i]]
  }
  return a
}

function decodeHTMLEntities(text){
  const txt = document.createElement('textarea')
  txt.innerHTML = text
  return txt.value
}

export default function QuizPage(){
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const useApi = searchParams.get('api') === '1' // optional: ?api=1 to use Open Trivia DB
  const amount = parseInt(searchParams.get('amount') || '10', 10)

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([]) // {selected, correct}
  const [locked, setLocked] = useState(false)

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      setError(null)
      try{
        if (useApi){
          const res = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple`)
          if (!res.ok) throw new Error('API error')
          const data = await res.json()
          if (!data.results || data.results.length === 0) throw new Error('No questions from API')
          const norm = data.results.map((it, idx)=>{
            const q = decodeHTMLEntities(it.question)
            const correct = decodeHTMLEntities(it.correct_answer)
            const opts = shuffle([...it.incorrect_answers.map(decodeHTMLEntities), correct])
            return { id: idx+1, question: q, options: opts, answer: correct, difficulty: it.difficulty }
          })
          if (mounted) setQuestions(norm)
        } else {
          const slice = localData.questions.slice(0, amount || localData.questions.length)
          const norm = slice.map((it, idx)=>({
            id: it.id || idx+1,
            question: it.question,
            options: shuffle(it.options),
            answer: it.answer,
            difficulty: it.difficulty || 'medium'
          }))
          if (mounted) setQuestions(norm)
        }
      }catch(err){
        console.error(err)
        setError(err.message || 'Failed to load')
      }finally{
        if (mounted) setLoading(false)
      }
    }
    load()
    return ()=>{mounted=false}
  }, [useApi, amount])

  // initialize answers when questions loaded
  useEffect(()=>{
    if (questions.length){
      setAnswers(Array(questions.length).fill(null))
      setCurrent(0)
      setLocked(false)
    }
  }, [questions])

  const handleSelect = useCallback((opt)=>{
    setAnswers(prev => {
      const copy = [...prev]
      copy[current] = { selected: opt, correct: questions[current].answer }
      return copy
    })
    setLocked(true)
  }, [current, questions])

  const goNext = ()=>{
    if (current < questions.length - 1){
      setCurrent(c => c+1)
      setLocked(false)
    }
  }
  const goPrev = ()=>{
    if (current > 0){
      setCurrent(c => c-1)
      // lock if that previous question already had answer
      setLocked(answers[current-1] ? true : false)
    }
  }

  const handleSkip = ()=>{
    // record as skipped (null selected)
    setAnswers(prev=>{
      const copy = [...prev]
      copy[current] = { selected: null, correct: questions[current].answer }
      return copy
    })
    setLocked(true)
  }

  const computeScore = (ansArr)=>{
    return ansArr.reduce((acc, a)=> acc + (a && a.selected === a.correct ? 1 : 0), 0)
  }

  const handleFinish = ()=>{
    const finalScore = computeScore(answers)
    const result = {
      score: finalScore,
      total: questions.length,
      answers,
      questions,
      timestamp: Date.now()
    }
    // persist latest result
    try{ localStorage.setItem('quiz_latest_result', JSON.stringify(result)) }catch(e){}

    // save high scores
    try{
      const hs = JSON.parse(localStorage.getItem('quiz_high_scores') || '[]')
      hs.push({ score: finalScore, total: questions.length, ts: Date.now() })
      localStorage.setItem('quiz_high_scores', JSON.stringify(hs))
    }catch(e){}

    navigate('/results')
  }

  const handleTimeUp = useCallback(()=>{
    // if unanswered, mark skipped and move next/finish
    if (!answers[current]){
      setAnswers(prev=>{
        const copy = [...prev]
        copy[current] = { selected: null, correct: questions[current].answer }
        return copy
      })
    }
    setLocked(true)
    // move forward after brief pause to show locked state
    setTimeout(()=>{
      if (current < questions.length - 1) goNext()
      else handleFinish()
    }, 700)
  }, [answers, current, questions])

  if (loading) return <div className="app-wrapper"><div className="card">Loading questions…</div></div>
  if (error) return <div className="app-wrapper"><div className="card">Error: {error}</div></div>
  if (!questions.length) return <div className="app-wrapper"><div className="card">No questions available.</div></div>

  const q = questions[current]
  const currentAnswer = answers[current]
  const selected = currentAnswer ? currentAnswer.selected : null
  const allAnswered = answers.every(a => a !== null && a !== undefined)

  return (
    <div className="app-wrapper">
      <div className="header">
        <div className="brand">
          <h1>Quiz App</h1>
          <div className="small" style={{marginLeft:8}}>Test your knowledge</div>
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div className="small">Mode: {useApi ? 'OpenTriviaAPI' : 'Local JSON'}</div>
        </div>
      </div>

      <ProgressBar current={current} total={questions.length} />

      <div style={{height:12}} />

      <QuestionCard
        qIndex={current}
        total={questions.length}
        question={q.question}
        options={q.options}
        selected={selected}
        locked={!!currentAnswer}
        onSelect={handleSelect}
        revealedAnswer={currentAnswer ? currentAnswer.correct : null}
      />

      <div style={{height:12}} />

      <div className="card" style={{display:'flex',flexDirection:'column',gap:10}}>
        <Timer keyWatch={current} duration={30} onTimeUp={handleTimeUp} />

        <div className="controls">
          <div style={{display:'flex',gap:8}}>
            <button className="btn ghost" onClick={goPrev} disabled={current===0}>Previous</button>
            <button className="btn ghost" onClick={handleSkip} disabled={!!currentAnswer}>Skip</button>
          </div>

          <div className="footer-actions">
            {current < questions.length -1 ? (
              <button className="btn" onClick={goNext} disabled={!currentAnswer}>Next</button>
            ) : (
              <button className="btn" onClick={handleFinish} disabled={!allAnswered}>Submit</button>
            )}
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div className="small">Score so far: {computeScore(answers)} / {questions.length}</div>
          <div className="small">Progress: {current+1}/{questions.length}</div>
        </div>
      </div>

    </div>
  )
}
