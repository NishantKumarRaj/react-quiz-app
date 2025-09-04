import React from 'react'

export default function QuestionCard({
  qIndex,
  total,
  question,
  options,
  selected,
  locked,
  onSelect,
  revealedAnswer
}){
  return (
    <div className="card question-area" role="region" aria-labelledby={`q-${qIndex}`}>
      <div className="small">Question {qIndex + 1} of {total}</div>
      <div id={`q-${qIndex}`} className="question-text" dangerouslySetInnerHTML={{__html: question}} />

      <div className="options" role="list">
        {options.map((opt, i) => {
          const isSelected = selected === opt
          const isCorrect = revealedAnswer && opt === revealedAnswer
          const isWrong = revealedAnswer && isSelected && opt !== revealedAnswer

          const cls = ["option"]
          if (locked) cls.push('locked')
          if (isCorrect) cls.push('correct')
          if (isWrong) cls.push('wrong')

          return (
            <button
              key={i}
              className={cls.join(' ')}
              onClick={() => !locked && onSelect(opt)}
              disabled={locked}
              aria-pressed={isSelected}
              aria-label={`Option ${i+1}: ${opt}`}
            >
              <span dangerouslySetInnerHTML={{__html: opt}} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
