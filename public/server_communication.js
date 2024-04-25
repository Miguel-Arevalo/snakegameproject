export function game_over(e) {
    console.log(`final score: ${e.detail}`);

    let data = { 
        score: e.detail
    }

    fetch("https://snakegameproject.online", {
        method: 'POST',
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(data),
    }).then(() => console.log("score sent!"));
}

export function login(e) {
    e.preventDefault();
    fetch(this.action, {
        method: 'post',
        body: new URLSearchParams(new FormData(this)),
    }).then(() => console.log("logged in!"));
}
