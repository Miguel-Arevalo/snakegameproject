
import {run_game} from "./snake_game.js";

  function game_wrapper() {

    function game_over(e) {
        console.log(`final score: ${e.detail}`);

        
    }

    document.addEventListener("game_over", game_over);
    run_game();

}

document.getElementById("start button").addEventListener("click", game_wrapper);