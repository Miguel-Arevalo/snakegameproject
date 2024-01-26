/////////////// snake game ///////////////
const app = new PIXI.Application({ background: '#1099bb', width: 640, height: 360 });
document.body.appendChild(app.view);

// Magically load the PNG asynchronously
const snake_head_sprite = PIXI.Sprite.from('snake head.png');
const snake_body_sprite = PIXI.Sprite.from('snake body.png');

const snake_head = new PIXI.Container();

app.stage.addChild(snake_head);

snake_head.addChild(snake_head_sprite);


// (x,y) coordinate point
let direction = (1,0);

// Add a variable to count up the seconds our demo has been running
let elapsed = 0.0;
// Tell our application's ticker to run a new callback every frame, passing
// in the amount of time that has passed since the last tick
app.ticker.add((delta) => {
  // Add the time to our total elapsed time
  elapsed += delta;
  // Update the sprite's X position based on the cosine of our elapsed time.  We divide
  // by 50 to slow the animation down a bit...
  snake_head.x = 100.0 + Math.cos(elapsed/50.0) * 100.0;
});

/////////////// listeners ///////////////

// map directional arrow keys to direction
function map_arrow_press(press) {
  if (press.defaultPrevented) {
    return;
  }

  switch (press.key) {
    case "ArrowDown":
      direction = (0,-1); //down
      break;
    case "ArrowUp":
      direction = (0,1);  //up
      break;
    case "ArrowLeft":
      direction = (-1,0); //left
      break;
    case "ArrowRight":
      direction = (1,0); //right
      break;
    default:
      return;
  }

  press.preventDefault();
}

window.addEventListener("keydown", map_arrow_press);