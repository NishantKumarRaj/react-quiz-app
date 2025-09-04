import React from 'react'

export default function ProgressBar({current, total}){
  const pct = Math.round(((current+1)/total) * 100)
  return (
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div className="progress">Question {current+1} / {total}</div>
      <div style={{flex:1, height:8, background:'#eef2ff', borderRadius:6}}>
        <div style={{width:`${pct}%`, height:'100%', background:'#6366f1', borderRadius:6}} />
      </div>
    </div>
  )
}
