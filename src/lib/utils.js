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

module.exports = { userExists, shuffleArray };
