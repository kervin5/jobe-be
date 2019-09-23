module.exports = async function fetchData(url = "", data, method = "POST") {
  // Default options are marked with *
  const response = await fetch(url, {
    method: method, // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "include", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json"
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    ...(method == "GET" ? {} : { body: JSON.stringify(data) })
    // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
};
