/////////////// snake game \\\\\\\\\\\\\\\



/////// types \\\\\\\

/*
* possible tile states
* grid should start with an apple in the center, all other tiles empty
*/
const TILE_EMPTY = Symbol.for("empty");
const TILE_APPLE = Symbol.for("apple");
const TILE_SNAKE = Symbol.for("snake");

/*
 * Represents the edge of the game screen.
 * Used to indicate that the snake has crashed into a wall.
 */
const TILE_WALL = Symbol.for("wall");

/////// constants \\\\\\\

// background color of game screen
// should get obscured by tiles
const BG_COLOR = '#1099bb';

// width & height of game screen
const PIXEL_WIDTH = 400;
const PIXEL_HEIGHT = 400;


// rows and columns of game grid
const GRID_ROWS = 9; // y
const GRID_COLUMNS = 9; // x

console.log(`game grid no. columns: ${GRID_COLUMNS} no. rows: ${GRID_ROWS}`)

//number of pixels in a single tile
const UNIT_HEIGHT = Math.floor(PIXEL_HEIGHT / GRID_ROWS);
const UNIT_WIDTH = Math.floor(PIXEL_WIDTH / GRID_COLUMNS);

const HALF_UNIT_WIDTH = UNIT_WIDTH / 2;
const HALF_UNIT_HEIGHT = UNIT_HEIGHT / 2;

// center of game grid; ceil used to yield integral value
// [x,y] array
const GRID_CENTER = [Math.ceil(GRID_COLUMNS / 2) - 1, Math.ceil(GRID_ROWS / 2) - 1]



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



/////// global mutable variables \\\\\\\

/**
 * should be updated to [x,y] when player hits direction key. 
 * 
 */
let g_current_direction = [0,1];

/**
 * momentarily set to true when direction key is pressed down.
 * after the change in direction is made, it's reset to false;
 */
let g_changed_direction = false;

let g_score = 0;


/////// global logical objects \\\\\\\

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
let g_state_grid = Array.from(Array(GRID_ROWS),
  () => new Array(GRID_COLUMNS));

/**
 * array of background sprites for each game tile
 */
let g_sprite_grid = Array.from(Array(GRID_ROWS),
  () => Array.from({length: GRID_COLUMNS}, () => PIXI.Sprite.from(bg_tile_texture)));

/**
 * list of snake segments
 * each segment should take up a tile on the screen.
 * 
 * 
 * each element of the list should be a tuple: [sprite container, coordinates]
 * 
 * sprite container: PIXI.Container that has a snake segment sprite as its only child
 * coordinates: [x,y]
 * 
 * the first element of the list should be the snakehead
 */
let g_snake = [];


/////// game logic and graphics helper functions \\\\\\\

/**
 * increases the score counter and displays the new core
 */
function increase_score() { 
  g_score++;
  //! display score here
}

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


function rotate_segment(sprite, direction) {
  // The Math.atan2() static method  returns the angle in the plane(in radians) between the positive x-axis
  // and the ray from (0, 0) to the point (x, y), for Math.atan2(y, x).
  let angle = Math.atan2(direction[1], direction[0]);

  sprite.rotation = -angle + Math.PI / 2;
  g_changed_direction = false;
}


// direction should be an (x,y) array
function move_grid_sprite(sprite, direction) {
  //x gets larger as it goes right, smaller as it goes left
  sprite.x = sprite.x + direction[0] * UNIT_WIDTH;

  // y gets smaller as it goes up, larger as it goes down
  sprite.y = sprite.y - direction[1] * UNIT_HEIGHT;
}

/**
 * Moves the apple sprite to a *new* random tile that isn't occupied by a snake and updates the state grid
 * with the new location.
 * 
 */
  function relocate_apple() {

    let overlap = true;
    let x = 0;
    let y = 0;
    let future_tile;

    // loop until apple lands on a tile not occupied by either a snake or the previous apple
    do {

      // set the apple's position to a random tile
      x = Math.floor((Math.random()*GRID_COLUMNS));
      y = Math.floor((Math.random()*GRID_ROWS));

      console.log(`testing new apple location: ${x}, ${y}`);

      // check if the tile is occupied; break loop if it's not
      future_tile = g_state_grid[x][y];
      if (future_tile != TILE_SNAKE) overlap = false;

    } while (overlap);

    g_state_grid[x][y] = TILE_APPLE;

    apple.x = x * UNIT_WIDTH + HALF_UNIT_WIDTH;
    apple.y = y * UNIT_HEIGHT + HALF_UNIT_HEIGHT;
}


/**
 * Moves the segment from current to future, and then updates the state grid
 * 
 * current: start coordinates on state grid, [x,y]
 * future: final coordinates on state grid, [x,y]
 * segment: sprite object
 */
function move_snake_segment(current, future, segment) {
  g_state_grid[current[0]][current[1]] = TILE_EMPTY;
  g_state_grid[future[0]][future[1]] = TILE_SNAKE;
  move_grid_sprite(segment, [future[0] - current[0],current[1] - future[1]]);
}




/**
 * Moves the head of the snake one tile forward.
 * 
 * Checks whether the snake would eiher go out of bounds or crash into itself.
 * Also checks whether it's hit an apple, and relocates it if it has.
 * 
 * direction: [x,y] vector
 * 
 * return: the state held by the next tile
 */
function move_snake_head(direction) {
  // the snakehead is the first element of the snake
  // retrieve the current location of the snake head
  let current = g_snake[0][1];

  // compute the snakehead's future location
  // future: [x,y]
  let future = [current[0] + direction[0],current[1] - direction[1]]; 

  console.log(`direction: ${direction}`);
  console.log(`current snakehead coords: ${current}`); 
  console.log(`future snakehead coords: ${future}`);


  let x_bounds = (future[0] < 0 || future[0] >= GRID_COLUMNS);
  let y_bounds = (future[1] < 0 || future[1] >= GRID_ROWS);
  let out_of_bounds = (x_bounds || y_bounds);

  if(out_of_bounds) {
    console.log("out of bounds"); 
    return TILE_WALL;
  }
  let next_tile_state = g_state_grid[future[0]][future[1]];

  if(next_tile_state == TILE_SNAKE) {
    console.log("collided with snake");
    console.log(g_state_grid);
    return TILE_SNAKE;
  }

  // g_snake[0][0]: sprite container of snake head
  move_snake_segment(current, future, g_snake[0][0]);

  // relocate head segment to future tile
  g_snake[0][1] = future;
  

  return next_tile_state;
}


/**
 * This function checks if there's an obstacle in front of the snake. If there is, then the game ends;
 * otherwise, the snake moves forward one tile.
 * 
 * Obstacles are the edge and the snake's own body. Empty tiles and tiles that hold the apple are not obstacles.
 * 
 * If the snake encounters an apple, then the snake lengthens, the apple moves, and the player's score increases.
 * 
 * direction: [x,y] vector
 * returns false if the snake collided; otherwise true
 */
function move_snake(direction) {

  // [x,y] previous location of the last tile to move
  // Must capture the head's starting location here, because it will be updated in move_snake_head.
  let previous_tile = g_snake[0][1];

  // Returns the state of the tile the snake head wants to move into.
  let next_tile = move_snake_head(direction);

  // if the snake head collided, abort the program.
  if (next_tile == TILE_SNAKE || next_tile == TILE_WALL) return false;

  // after moving the head, move the rest of the body
  if(g_snake.length > 1) {
    for(let segment of g_snake.slice(1)) {

      // coordinates of current segment
      let current_tile = segment[1];

      // capture the sprite of this segment
      let sprite = segment[0];

      // update g_state_grid with snake movement here
      move_snake_segment(current_tile, previous_tile, sprite);

      segment[1] = previous_tile;
      previous_tile = current_tile;
    }
  }

  // lengthen the snake by adding a segment to the end of the snake after it moves
  if(next_tile == TILE_APPLE) {
    let new_segment = PIXI.Sprite.from(snake_body_texture);
    
    configure_sprite(new_segment);

    new_segment.x = previous_tile[0] * UNIT_WIDTH + HALF_UNIT_WIDTH;
    new_segment.y = previous_tile[1] * UNIT_HEIGHT + HALF_UNIT_HEIGHT;

    g_snake.push([new_segment, previous_tile]);

    g_state_grid[previous_tile[0]][previous_tile[1]] = TILE_SNAKE;
    
    app.stage.addChild(new_segment);

    relocate_apple();
    increase_score();
  }
  
  return true;
}



/////// initialization \\\\\\\

// create grid of empty tiles with apple in the middle, snake on a random tile
{
  g_state_grid.forEach((row) => row.fill(TILE_EMPTY));

  /*
   * GRID_CENTER[0]: x
   * GRID_CENTER[1]: y
   */
  g_state_grid[GRID_CENTER[0]][GRID_CENTER[1]] = TILE_APPLE;

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
  console.log(`center coordinates of state grid: center x: ${GRID_CENTER[0]} and center y: ${GRID_CENTER[1]}`);
  do {

    // Remember that x is measured over columns, y over rows
    // This formula prevents the snake head from spawning on the outside edges of the grid
    snake_start_x = Math.floor(Math.random() * (GRID_COLUMNS - 3)) + 1;
    snake_start_y = Math.floor(Math.random() * (GRID_ROWS - 3)) +  1;

    console.log(`snake start x: ${snake_start_x}, y: ${snake_start_y}`);

    center_start = (snake_start_x == GRID_CENTER[0] && snake_start_y == GRID_CENTER[1]);
  } while(center_start);
  
  snake_head.x = snake_start_x * UNIT_WIDTH + HALF_UNIT_WIDTH;
  snake_head.y = snake_start_y * UNIT_HEIGHT + HALF_UNIT_HEIGHT;

  //!set apple x,y
  apple.x = GRID_CENTER[0] * UNIT_WIDTH + HALF_UNIT_WIDTH;
  apple.y = GRID_CENTER[1] * UNIT_HEIGHT + HALF_UNIT_HEIGHT;

  g_state_grid[snake_start_x][snake_start_y] = TILE_SNAKE;
  g_snake.push([snake_head, [snake_start_x, snake_start_y]]);

  console.log("printing state grid");
  console.log(g_state_grid);
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
  g_sprite_grid.forEach((row, y) => row.forEach( (tile, x) => {

    configure_sprite(tile);
    tile.x = Math.floor(x * PIXEL_WIDTH / GRID_COLUMNS + HALF_UNIT_WIDTH);
    tile.y = Math.floor(y * PIXEL_HEIGHT / GRID_ROWS + HALF_UNIT_HEIGHT);
    app.stage.addChild(tile);
  }));

  console.log("printing sprite grid");
  console.log(g_sprite_grid);


  //! add apple and snake here
  app.stage.addChild(apple);
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

    if(g_changed_direction) rotate_segment(snake_head_sprite, g_current_direction);

    //! add movement behaviour here
    //console.log(app.ticker.deltaMS);

    elapsed_time += app.ticker.deltaMS;

    if(elapsed_time >= SNAKE_SPEED) {
      elapsed_time = 0;

      /*
       * move_snake either moves the snake both on-screen and in the state grid and returns true,
       * or returns false without moving, indicating a collision.
       */
      let collided = !move_snake(g_current_direction);

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
      g_current_direction = [0,-1]; //down
      break;
    case "ArrowUp":
      g_current_direction = [0,1];  //up
      break;
    case "ArrowLeft":
      g_current_direction = [-1,0]; //left
      break;
    case "ArrowRight":
      g_current_direction = [1,0]; //right
      break;
    default:
      return;
  }

  g_changed_direction = true;
  press.preventDefault();
  app.start();
}

window.addEventListener("keydown", map_arrow_press);