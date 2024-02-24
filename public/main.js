/////////////// snake game \\\\\\\\\\\\\\\



/////// types \\\\\\\

/*
* possible tile states
* grid should start with an apple in the center, all other tiles empty
*/
const TILE_EMPTY = Symbol.for("empty");
const TILE_APPLE = Symbol.for("apple");
const TILE_SNAKE = Symbol.for("snake");
const TILE_BODY  = Symbol.for("body");


// background color of game screen
// should get obscured by tiles
const BG_COLOR = '#1099bb';

/////// constants \\\\\\\

// width & height of game screen
const PIXEL_WIDTH = 400;
const PIXEL_HEIGHT = 400;


// rows and columns of game grid
const GRID_ROWS = 9; // y
const GRID_COLUMNS = 9; // x

const UNIT_HEIGHT = Math.floor(PIXEL_HEIGHT / GRID_ROWS);
const UNIT_WIDTH = Math.floor(PIXEL_WIDTH / GRID_COLUMNS);

const HALF_UNIT_WIDTH = UNIT_WIDTH / 2;
const HALF_UNIT_HEIGHT = UNIT_HEIGHT / 2;

// center of game grid; ceil used to yield integral value
const GRID_CENTER = [Math.ceil(GRID_COLUMNS / 2) - 1, Math.ceil(GRID_ROWS / 2) - 1]



/////// global mutable variables \\\\\\\

/**
 * should be updated to [x,y] when player hits direction key. 
 * 
 */
let current_direction = [0,1];

/**
 * momentarily set to true when direction key is pressed down.
 * after the change in direction is made, it's reset to false;
 */
let changed_direction = false;


/////// assets \\\\\\\

/*
 * reminder:
 * "A sprite is basically a position at which to draw a texture.
 * Just make separate sprites for each tile that share the same texture instance"
 * from https://github.com/pixijs/pixijs/issues/5378#issuecomment-456147317
 */


// Magically load PNGs asynchronously
const snake_head_texture = PIXI.Texture.from('snake head.png');
const snake_body_texture = PIXI.Texture.from('snake body.png');
const bg_tile_texture = PIXI.Texture.from('generic tile.png');
const apple_texture = PIXI.Texture.from('apple.png');


/////// logical objects \\\\\\\

/**
 * by logical objects, I mean data structures to be used by the snake game
 * which may but don't necessarily directly represent on-screen objects.
 */

const app = new PIXI.Application({
  background: BG_COLOR, width: PIXEL_WIDTH, height: PIXEL_HEIGHT});
document.body.appendChild(app.view);

const snake_head_sprite = PIXI.Sprite.from(snake_head_texture);
const snake_head = new PIXI.Container();
snake_head.addChild(snake_head_sprite);

const apple_sprite = PIXI.Sprite.from(apple_texture);
const apple = new PIXI.Container();
apple.addChild(apple_sprite);

// stores state of each grid (empty, apple, snake, body)
let state_grid = Array.from(Array(GRID_ROWS),
  () => new Array(GRID_COLUMNS));

/**
 * array of background sprites for each game tile
 */
let sprite_grid = Array.from(Array(GRID_ROWS),
  () => Array.from({length: GRID_COLUMNS}, () => PIXI.Sprite.from(bg_tile_texture)));

/**
 * list of snake segments
 * each segment should take up a tile on the screen.
 * each element of the list should be a tuple: (sprite container, coordinates)
 * sprite container: PIXI.Container that has a snake segment sprite as its only child
 * coordinates: (x,y)
 * 
 * the first element of the list should be the snakehead
 */
let snake = [];


/////// game logic and graphics helper functions \\\\\\\

/**
 * as of writing 2/11/2024 far all sprites use the same pivot point, width, and height
 * 
 */
function configure_sprite(sprite) {
  
  // set rotation pivots to center of sprite
  sprite.anchor.set(0.5);

  // scale sprites to one unit of the game grid
  sprite.height = UNIT_HEIGHT;
  sprite.width = UNIT_WIDTH;
}

// rotate snake segment
function rotate_segment(sprite, direction) {
  // The Math.atan2() static method  returns the angle in the plane(in radians) between the positive x-axis
  // and the ray from (0, 0) to the point (x, y), for Math.atan2(y, x).
  let angle = Math.atan2(direction[1], direction[0]);

  sprite.rotation = -angle + Math.PI / 2;
  changed_direction = false;
}

// direction should be an (x,y) array
function move_grid_spite(sprite, direction) {
  //x gets larger as it goes right, smaller as it goes left
  sprite.x = sprite.x + direction[0] * UNIT_WIDTH;

  // y gets smaller as it goes up, larger as it goes down
  sprite.y = sprite.y - direction[1] * UNIT_HEIGHT;
}


/**
 * moves the segment, and then updates the state grid
 * current: start coordinates on state grid, [x,y]
 * future: final coordinates on state grid, [x,y]
 */
function move_snake_segment(current, future, segment) {
  state_grid[current[0]][current[1]] = TILE_EMPTY;
  state_grid[future[0]][future[1]] = TILE_SNAKE;
  move_grid_spite(segment, [future[0] - current[0],future[1] - current[1]]);
}

/**
 * Checks whether the snake would eiher go out of bounds or crash into itself
 * direction: [x,y] array
 * 
 * return: false = collision, true = evasion
 */
function move_snake_head(direction) {
  // the snakehead is the first element of the snake;
  // retrieve the current location of the snake head
  let current = snake[0][1];

  // compute the snakehead's future location
  // future: [x,y]
  let future = [current[0] + direction[0],current[1] + direction[1]];


  let x_bounds = (future[0] < 0 || future[0] >= GRID_COLUMNS);
  let y_bounds = (future[1] < 0 || future[0] >= GRID_ROWS);
  let out_of_bounds = (x_bounds || y_bounds);

  if(out_of_bounds) return false;

  let next_tile_state = state_grid[future[0]][future[1]];
  if(next_tile_state == TILE_SNAKE) return false;

  move_snake_segment(current, future, snake[0][0]);
  
  return true;
}

/**
 * returns false if the snake collided; otherwise true
 */
function move_snake(direction) {

  // if evaded, then the snake did not crash this turn
  let evaded = move_snake_head(direction);

  if (!evaded) return false;

  //! move the rest of the segments

  for(let segment of snake.slice(1)) {

  }

  return true;
}

/////// initialization \\\\\\\

// create grid of empty tiles with apple in the middle, snake on a random tile
{
  state_grid.forEach((row) => row.fill(TILE_EMPTY));

  /*
   * GRID_CENTER[0]: x
   * GRID_CENTER[1]: y
   */
  state_grid[GRID_CENTER[0]][GRID_CENTER[1]] = TILE_APPLE;

  // choose a random, non-center starting point for the snake head
 
  // note, may wanna modify later to add a new state for the head of the snake!
  let snake_start_x = 1;
  let snake_start_y = 1;

  /*
   * On average, loops about 1/(GRID_COLUMNS*GRID_ROWS) times.
   * so this will only loop if the snake head happens to land on the apple.
   * formula makes sure that the snake head doesn't spawn on the edge of the grid.
   */
  let center_start;
  console.log(`center x: ${GRID_CENTER[0]} and center y: ${GRID_CENTER[1]}`);
  do {

    // remember that x is measured over columns, y over rows
    snake_start_x = Math.floor(Math.random() * (GRID_COLUMNS - 3)) + 1;
    snake_start_y = Math.floor(Math.random() * (GRID_ROWS - 3)) +  1;
    console.log(`x: ${snake_start_x}, y: ${snake_start_y}`);

    center_start = (snake_start_x == GRID_CENTER[0] && snake_start_y == GRID_CENTER[1]);
  } while(center_start);
  
  state_grid[snake_start_x][snake_start_y] = TILE_SNAKE;
  snake.push([snake_head, [snake_start_x, snake_start_y]]);
  
  snake_head.x = snake_start_x * UNIT_WIDTH + HALF_UNIT_WIDTH;
  snake_head.y = snake_start_y * UNIT_HEIGHT + HALF_UNIT_HEIGHT;

  console.log(snake);
}



// configure evergreen sprites
{
  //these sprites get moved around, but are reused continuously
  let sprites = [snake_head_sprite, apple_sprite];

  for(let sprite of sprites) {
    configure_sprite(sprite);
  }
}



/* 
 * create game screen
 *
 */
{
  // arrange the tiles onto the screen
  //? note, may want to refactor this later, because for loops are faster than forEach
  sprite_grid.forEach((row, y) => row.forEach( (tile, x) => {

    configure_sprite(tile);
    tile.x = Math.floor(x * PIXEL_WIDTH / GRID_COLUMNS + HALF_UNIT_WIDTH);
    tile.y = Math.floor(y * PIXEL_HEIGHT / GRID_ROWS + HALF_UNIT_HEIGHT);
    app.stage.addChild(tile);
  }));



  //! add apple and snake here
  // app.stage.addChild(apple);
  app.stage.addChild(snake_head); 

}

/////// main loop \\\\\\\



{
  await new Promise(a => setTimeout(a, 200));
  app.stop();

  /**
   * speed in milliseconds at which the snake should move one tile.
   */
  const SNAKE_SPEED = 100;
  
  /**
   * time elapsed since last updated.
   */
  let elapsed_time = 0;
  // tell our application's ticker to run a new callback every frame, passing
  // in the amount of time that has passed since the last tick
  app.ticker.add(() => {

    if(changed_direction) rotate_segment(snake_head_sprite, current_direction);

    //! add movement behaviour here
    console.log(app.ticker.deltaMS);

    elapsed_time += app.ticker.deltaMS;

    if(elapsed_time >= SNAKE_SPEED) {
      elapsed_time = 0;

      /*
       * move_snake either moves the snake both on-screen and in the state grid and returns true,
       * or returns false without moving, indicating a collision.
       */
      let collided = !move_snake();

      /*
       * if there's a collision, the game should end here
       */
      if (collided) {
        cleanup();
        app.stop();
      }
    }

  });
}

/////// user input listeners ///////

// map directional arrow keys to direction
function map_arrow_press(press) {
  if (press.defaultPrevented) {
    return;
  }

  switch (press.key) {
    case "ArrowDown":
      current_direction = [0,-1]; //down
      break;
    case "ArrowUp":
      current_direction = [0,1];  //up
      break;
    case "ArrowLeft":
      current_direction = [-1,0]; //left
      break;
    case "ArrowRight":
      current_direction = [1,0]; //right
      break;
    default:
      return;
  }

  changed_direction = true;
  press.preventDefault();
  app.start();
}

window.addEventListener("keydown", map_arrow_press);