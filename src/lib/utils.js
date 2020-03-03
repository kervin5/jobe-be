const userExists = ctx => {
  return !!(typeof ctx.request.user !== "undefined" && ctx.request.user.id);
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function findKeywords(text, keywords) {
  const cleanText = text.toLowerCase();
  let result = [];
  keywords.forEach(word => {
    if (cleanText.includes(word.toLowerCase().trim())) {
      result = result.concat(word);
    }
  });
  return result;
}

module.exports = { userExists, shuffleArray, findKeywords };
