import fetch from 'node-fetch';
export default async function fetchData(url = '', data, method = 'POST') {
    // Default options are marked with *
    const response = await fetch(url, {
        method: method,
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'include', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        //  referrer: 'no-referrer', // no-referrer, *client
        ...(method == 'GET' ? {} : { body: JSON.stringify(data) }),
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}
