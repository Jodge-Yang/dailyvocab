// quiz.js - 答题核心逻辑
const QuizEngine = {

  // 打乱数组
  shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  },

  // 随机出题
  generateRandomQuestions(count) {
    const words = window.WORDS || []
    const shuffled = this.shuffle(words)
    return shuffled.slice(0, Math.min(count, shuffled.length)).map(w => this.buildQuestion(w))
  },

  // 按期数出题
  generateQuestionsByIssue(issue, count) {
    const words = (window.WORDS || []).filter(w => String(w.issue) === String(issue))
    if (words.length === 0) return []
    const shuffled = this.shuffle(words)
    return shuffled.slice(0, Math.min(count, shuffled.length)).map(w => this.buildQuestion(w))
  },

  // 随机选一期出题
  generateQuestionsByRandomIssue(count) {
    const words = window.WORDS || []
    const issues = [...new Set(words.map(w => w.issue))]
    const randomIssue = issues[Math.floor(Math.random() * issues.length)]
    return this.generateQuestionsByIssue(randomIssue, count)
  },

  // 从错题本出题
  generateQuestionsFromWrong(count) {
    const wrongList = Storage.getWrongQuestions()
    if (wrongList.length === 0) return []

    // 从错题本中找到对应的完整单词数据
    const allWords = window.WORDS || []
    const wrongWords = wrongList.map(wq => {
      const fullWord = allWords.find(w => w.word === wq.word)
      if (fullWord) return fullWord
      // 如果找不到完整数据，用错题本中的信息构建
      return {
        word: wq.word,
        issue: wq.issue || '',
        phonetic: '',
        definition: wq.definition_cn || '',
        definition_cn: wq.definition_cn || '',
        example_en: wq.example_en || '',
        example_cn: wq.example_cn || '',
        memory_tip: wq.memory_tip || ''
      }
    })

    const shuffled = this.shuffle(wrongWords)
    return shuffled.slice(0, Math.min(count, shuffled.length)).map(w => this.buildQuestion(w))
  },

  // 构建一道题
  buildQuestion(word) {
    // 生成4个选项：1个正确 + 3个干扰
    const allWords = window.WORDS || []
    const correctAnswer = word.definition_cn || word.definition || ''

    // 随机取3个干扰项
    const distractors = allWords
      .filter(w => w.word !== word.word && (w.definition_cn || w.definition) !== correctAnswer)
    const shuffledDistractors = this.shuffle(distractors)
    const wrongOptions = shuffledDistractors.slice(0, 3).map(w => ({
      text: w.definition_cn || w.definition || '',
      isCorrect: false
    }))

    const correctOption = { text: correctAnswer, isCorrect: true }
    const options = this.shuffle([correctOption, ...wrongOptions])

    return {
      word: word.word,
      phonetic: word.phonetic || '',
      issue: word.issue || '',
      topic: word.topic || '',
      definition: word.definition || '',
      definition_cn: word.definition_cn || '',
      example_en: word.example_en || '',
      example_cn: word.example_cn || '',
      memory_tip: word.memory_tip || '',
      options: options
    }
  },

  // 获取所有期数列表
  getAllIssues() {
    const words = window.WORDS || []
    const issueMap = {}
    words.forEach(w => {
      const issue = String(w.issue || '')
      if (issue && !issueMap[issue]) {
        issueMap[issue] = w.topic || ''
      }
    })
    return Object.keys(issueMap).sort((a, b) => parseInt(a) - parseInt(b)).map(issue => ({
      issue: issue,
      topic: issueMap[issue]
    }))
  }
}
