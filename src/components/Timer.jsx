import React, {useEffect, useState} from 'react'

export default function Timer({keyWatch, duration = 30, onTimeUp}){
  // keyWatch is used so that timer resets when question index changes
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(()=>{
    setTimeLeft(duration)
    const id = setInterval(()=>{
      setTimeLeft(t => t - 1)
    }, 1000)
    return ()=>clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyWatch])

  useEffect(()=>{
    if (timeLeft <= 0){
      onTimeUp()
    }
  }, [timeLeft, onTimeUp])

  const pct = Math.max(0, Math.round((timeLeft/duration)*100))

  return (
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div className="small">Time left: {timeLeft}s</div>
      <div style={{flex:1, height:6, background:'#f3f4f6', borderRadius:6}}>
        <div style={{width:`${pct}%`, height:'100%', borderRadius:6, background:'#ef4444'}} />
      </div>
    </div>
  )
}
