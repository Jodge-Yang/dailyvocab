// storage.js - 本地存储工具
const Storage = {
  // 答题记录
  getQuizRecords() {
    try {
      return JSON.parse(localStorage.getItem('quizRecords') || '[]')
    } catch (e) {
      return []
    }
  },

  addQuizRecord(record) {
    const records = this.getQuizRecords()
    records.push({
      ...record,
      timestamp: Date.now()
    })
    // 最多保留500条
    if (records.length > 500) {
      records.splice(0, records.length - 500)
    }
    localStorage.setItem('quizRecords', JSON.stringify(records))
  },

  // 错题本
  getWrongQuestions() {
    try {
      return JSON.parse(localStorage.getItem('wrongQuestions') || '[]')
    } catch (e) {
      return []
    }
  },

  addWrongQuestion(question) {
    const list = this.getWrongQuestions()
    const existing = list.find(q => q.word === question.word)
    if (existing) {
      existing.wrongCount = (existing.wrongCount || 1) + 1
      existing.lastWrongTime = Date.now()
      // 更新详细信息
      if (question.definition_cn) existing.definition_cn = question.definition_cn
      if (question.example_en) existing.example_en = question.example_en
      if (question.example_cn) existing.example_cn = question.example_cn
      if (question.memory_tip) existing.memory_tip = question.memory_tip
    } else {
      list.push({
        ...question,
        wrongCount: 1,
        addTime: Date.now(),
        lastWrongTime: Date.now()
      })
    }
    localStorage.setItem('wrongQuestions', JSON.stringify(list))
  },

  removeWrongQuestion(word) {
    const list = this.getWrongQuestions().filter(q => q.word !== word)
    localStorage.setItem('wrongQuestions', JSON.stringify(list))
  },

  clearWrongQuestions() {
    localStorage.setItem('wrongQuestions', '[]')
  },

  // 学习统计
  getStats() {
    const records = this.getQuizRecords()
    const wrongList = this.getWrongQuestions()
    const total = (window.WORDS || []).length

    // 统计每个单词的答题情况
    const wordMap = {}
    records.forEach(r => {
      if (!wordMap[r.word]) {
        wordMap[r.word] = { correct: 0, total: 0 }
      }
      wordMap[r.word].total += 1
      if (r.isCorrect) wordMap[r.word].correct += 1
    })

    let mastered = 0
    let reviewNeeded = 0
    let unlearned = 0

    ;(window.WORDS || []).forEach(w => {
      const stat = wordMap[w.word]
      if (stat) {
        const rate = stat.correct / stat.total
        if (rate >= 0.8 && stat.total >= 3) {
          mastered++
        } else {
          reviewNeeded++
        }
      } else {
        unlearned++
      }
    })

    const totalAnswered = records.length
    const totalCorrect = records.filter(r => r.isCorrect).length
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    return {
      totalWords: total,
      mastered,
      reviewNeeded,
      unlearned,
      wrongCount: wrongList.length,
      totalAnswered,
      totalCorrect,
      accuracy
    }
  },

  // 清空所有数据
  clearAll() {
    localStorage.removeItem('quizRecords')
    localStorage.removeItem('wrongQuestions')
  }
}
