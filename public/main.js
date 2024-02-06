/////////////// snake game ///////////////

// constants //

// width & height of game screen
const WIDTH = 640;
const HEIGHT = 360;

// background color of game screen
const BG_COLOR = '#1099bb';

// rows and columns of game grid
const GRID_ROWS = 11; // y
const GRID_COLUMNS = 11; // x

// center of game grid; ceil used to yield integral value
const GRID_CENTER = [Math.ceil(GRID_COLUMNS / 2), Math.ceil(GRID_ROWS / 2)]

/*
* possible tile states
* grid should start with an apple in the center, a 
*/
const TILE_EMPTY = Symbol.for("empty");
const TILE_APPLE = Symbol.for("apple");
const TILE_SNAKE = Symbol.for("snake");
const TILE_BODY  = Symbol.for("body");

const app = new PIXI.Application({ background: BG_COLOR, width: WIDTH, height: HEIGHT });
document.body.appendChild(app.view);

// Magically load the PNG asynchronously
const snake_head_sprite = PIXI.Sprite.from('snake head.png');
const snake_body_sprite = PIXI.Sprite.from('snake body.png');

const snake_head = new PIXI.Container();

// mutable variables //

// should be updated to [x,y] when player hits direction key
let direction = null;

// momentarily set to true when direction key is pressed down
let changed_direction = false;

// stores state of each grid (empty, apple, snake, body)
let state_grid = Array.from(Array(GRID_ROWS), () => new Array(GRID_COLUMNS));
state_grid.forEach((row) => row.fill(TILE_EMPTY));

state_grid[GRID_CENTER[1]][GRID_CENTER[0]] = TILE_APPLE;

state_grid.forEach((row) => row.forEach((x) => console.log(Symbol.keyFor(x))));

// y_grid stores the y value of the top-left corner of each tile
let y_grid = Array.from(Array(GRID_ROWS), () => new Uint16Array(GRID_COLUMNS));
y_grid;

// x_grid stores the x value of the top-left corner of each tile
let x_grid = Array.from(Array(GRID_ROWS), () => new Uint16Array(GRID_COLUMNS));

// want to calculate position of each tile within the game screen
{

}

// rotate snake head
function rotate_head() {
  // The Math.atan2() static method  returns the angle in the plane (in radians) between the positive x-axis
  // and the ray from (0, 0) to the point (x, y), for Math.atan2(y, x).
  let angle = Math.atan2(direction[1], direction[0]);
  snake_head_sprite.rotation = -angle + Math.PI / 2;
  changed_direction = false;
}

// move snake body
// direction should be a (x,y) vector

//going to start 
function move_body (direction) {

}

// set rotation pivot to center of sprite
snake_head_sprite.anchor.set(0.5);

// set starting position of snake head
snake_head.x = app.screen.width / 2;
snake_head.y = app.screen.height / 2;


// scene construction //

app.stage.addChild(snake_head);

snake_head.addChild(snake_head_sprite);

// game/animation logic //

// Tell our application's ticker to run a new callback every frame, passing
// in the amount of time that has passed since the last tick
app.ticker.add((delta) => {
  if(changed_direction) rotate_head();
});

/////////////// listeners ///////////////

// map directional arrow keys to direction
function map_arrow_press(press) {
  if (press.defaultPrevented) {
    return;
  }

  switch (press.key) {
    case "ArrowDown":
      direction = [0,-1]; //down
      break;
    case "ArrowUp":
      direction = [0,1];  //up
      break;
    case "ArrowLeft":
      direction = [-1,0]; //left
      break;
    case "ArrowRight":
      direction = [1,0]; //right
      break;
    default:
      return;
  }

  changed_direction = true;
  press.preventDefault();
}

window.addEventListener("keydown", map_arrow_press);