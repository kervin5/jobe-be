// const userExists = (ctx) => {
//   return !!(typeof ctx.request.user !== 'undefined' && ctx.request.user.id)
// }

export function shuffleArray(arrayToShuffle: Array<any>) {
  for (let i = arrayToShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arrayToShuffle[i], arrayToShuffle[j]] = [
      arrayToShuffle[j],
      arrayToShuffle[i],
    ]
  }

  return arrayToShuffle
}

export function findKeywords(text: string, keywords: Array<string>) {
  const cleanText = text.toLowerCase()
  let result: string[] = []
  keywords.forEach((word) => {
    if (cleanText.includes(word.toLowerCase().trim())) {
      result = result.concat(word)
    }
  })
  return result
}
