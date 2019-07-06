// Wumpus World
let cols, rows, size = 400, w = size/4, grid = [];
let player, gold, pits = [], pitNr, wi, wj;
let breeze = [], smell = [], glitter;
let pointCounter = 0, stepCounter = 0;
let gameOver = false, gameOverFlag = 0, gameWon = false, gameWonFlag = 0;

function reloadGame() { window.location.reload(); }

function preload(){
   // img_ = loadImage('sprites/.png');
   img_breeze = loadImage('sprites/breeze_0.png');
   img_gold = loadImage('sprites/gold_1.png');
   img_pit = loadImage('sprites/pit.png');
   img_smell = loadImage('sprites/smell_0.png');
   img_wumpus = loadImage('sprites/wumpus_1.png');

   img_hunter_r = loadImage('sprites/hunter_r.png');
   img_hunter_l = loadImage('sprites/hunter_l.png');
   img_hunter_u = loadImage('sprites/hunter_r_up.png');
   img_hunter_d = loadImage('sprites/hunter_r_down.png');
}

function setup() {
  createCanvas(size, size);
  frameRate(5);
  angleMode(DEGREES);
  cols = floor(width/w);
  rows = floor(height/w);
  pitNr = floor(random(2,4));

  // Creating WUMPUS WORLD Grid
  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) { grid.push(new Cell(x, y)); }
  }
  // Adding PITS
  let c, r;
  for (let i=0; i<pitNr; i++) {
    c = floor(random(1,4)); r = floor(random(1,4));
    while( c==1 && r==1 ){ c = floor(random(1,4)); r = floor(random(1,4)); }
    let pit = new Pit(c,r);
    for (let l=0; l<grid.length; l++) {
      if (grid[l].i == c && grid[l].j == r){
        pits.push(pit);
        grid[l].percepts.push(pit);
      }
    }
    // Adding BREEZE
    for (let l=0; l<grid.length; l++) {
      if (grid[l].i == c && grid[l].j == r+1)
        grid[l].percepts.push(new Percept(c,r+1,'Breeze'));
      if (grid[l].i == c && grid[l].j == r-1)
        grid[l].percepts.push(new Percept(c,r-1,'Breeze'));
      if (grid[l].i == c-1 && grid[l].j == r)
        grid[l].percepts.push(new Percept(c-1,r,'Breeze'));
      if (grid[l].i == c+1 && grid[l].j == r)
        grid[l].percepts.push(new Percept(c+1,r,'Breeze'));
    }
  }
  // Adding WUMPUS
  wi = floor(random(1,4)); wj = floor(random(1,4));
  while( wi==1 && wj==1 ){ wi = floor(random(1,4)); wj = floor(random(1,4)); }
  for (let l=0; l<grid.length; l++) {
    if (grid[l].i == wi && grid[l].j == wj){
      grid[l].percepts.push(new Wumpus(wi,wj));
    }
  }
  // Adding SMELL
  for (let l=0; l<grid.length; l++) {
    if (grid[l].i == wi && grid[l].j == wj+1)
      grid[l].percepts.push(new Percept(wi,wj+1,'Smell'));
    if (grid[l].i == wi && grid[l].j == wj-1)
      grid[l].percepts.push(new Percept(wi,wj-1,'Smell'));
    if (grid[l].i == wi-1 && grid[l].j == wj)
      grid[l].percepts.push(new Percept(wi-1,wj,'Smell'));
    if (grid[l].i == wi+1 && grid[l].j == wj)
      grid[l].percepts.push(new Percept(wi+1,wj,'Smell'));
  }
  // Adding GOLD (& Glitter)
  let gi, gj;
  gi = floor(random(1,4)); gj = floor(random(1,4));
  for (let l=0; l<pits.length; l++) {
    if( (gi==1 && gj==1) || (pits[l].i == gi && pits[l].j == gj) ){
      gi = floor(random(1,4));
      gj = floor(random(1,4));
      continue;
    }
  }
  gold = new Gold(gi, gj);
  // Adding PLAYER
  player = new Agent(1,1);
  // player = new Player(1,1);
  player.checkEnvironment();

}

function draw() {
  background(51);
  // Check for GAME OVER!
  if( player.hasFallenIntoPit || player.isHitByWumpus
   || player.detectPit || player.detectWumpus){
    gameOver = true;
    if(gameOverFlag != 1){
      player.checkEnvironment(gameWon, gameOver);
      createP('GAME OVER!');
      let finalScore = 0;
      if( player.hasFallenIntoPit || player.detectPit ){
        finalScore = pointCounter - stepCounter - 1000;
      }
      if( player.isHitByWumpus || player.detectWumpus ){
        finalScore = pointCounter - stepCounter - 1000;
      }
      createP('STEPS TAKEN: ' + stepCounter);
      createP('SCORE: ' + finalScore);
      gameOverFlag++;
      let btn_NewGame = createButton('NEW GAME');
      btn_NewGame.mousePressed(reloadGame);
    }
  }
  // Check for GAME WON!
  if( gameWon ){
    if( gameWonFlag != 1 ){
      player.checkEnvironment(gameWon, gameOver);
      createP(`YOU'VE WON!`);
      let finalScore = pointCounter - stepCounter + 1000;
      createP('STEPS TAKEN: ' + stepCounter);
      createP('SCORE: ' + finalScore);
      gameWonFlag++;
      let btn_NewGame = createButton('NEW GAME');
      btn_NewGame.mousePressed(reloadGame);
    }
  }

  for (let k=0; k<pits.length; k++) {
    if(pits[k].i == 1 && pits[k].j == 1) pits[k].visited = true;
    if( pits[k].visited || gameOver || gameWon )
      pits[k].show();
  }
  // Check if cells have been visited
  for (let i=0; i<grid.length; i++) {
    if(grid[i].i == 1 && grid[i].j == 1) grid[i].visited = true;
    if(grid[i].visited || gameOver || gameWon){
      grid[i].show();
      let p = grid[i].percepts;
      for (let k=0; k<p.length; k++) {
        p[k].show();
      }
    }
  }

  if(gold.i == 1 && gold.j == 1) gold.visited = true;
  if(gold.visited || gameOver || gameWon){
    if(!gold.grabbed) gold.show();
  }
  if(!gameWon || !gameOver) player.show();

}

function keyPressed(){
    if (keyCode === UP_ARROW){
      player.faceUp();
    } else if (keyCode === DOWN_ARROW){
      player.faceDown();
    } else if (keyCode === LEFT_ARROW){
      player.faceLeft();
    } else if (keyCode === RIGHT_ARROW){
      player.faceRight();
    } else if (key == 'F'){
      player.moveForward(gameWon, gameOver);
    } else if (key == 'G'){
      player.grab(gold, grid);
    } else if (key == 'D'){
      gameWon = player.drop(gold);
    } else if (key == 'S'){
      if( !player.isArrowShot ){
        grid = player.shootArrow(grid);
        pointCounter -= 10;
      } else {
        console.log('You already shot your shot.');
      }
    }
    return false;
}

function Percept(i, j, type){
  this.i = i; this.j = j;
  this.type = type;
  this.pSize = 100;
  this.x = (this.i-1) * this.pSize;
  this.y = size - ((this.j) * this.pSize);
  this.visited = false;

  this.show = function(){
    switch (this.type) {
      case 'Smell':
        image(img_smell, this.x, this.y, this.pSize/2, this.pSize/2);
        break;
      case 'Breeze':
        image(img_breeze, this.x+(this.pSize/2), this.y, this.pSize/2, this.pSize/2);
        break;
      case 'Glitter':
        image(img_gold, this.x, this.y, this.pSize/2, this.pSize/2);
        break;
      default:
    }
  }
}

function Gold(i, j){
  this.i = i; this.j = j;
  this.pSize = 100;
  this.x = (this.i-1) * this.pSize;
  this.y = size - ((this.j) * this.pSize);
  this.grabbed = false; this.visited = false;

  this.updatePosition = function(){
    this.x = (this.i-1) * this.pSize;
    this.y = size - ((this.j) * this.pSize);
  }
  this.show = function(){
    image(img_gold, this.x+(this.pSize/2), this.y+(this.pSize/2), this.pSize/2, this.pSize/2);
  }
}

function Pit(i, j){
  this.i = i; this.j = j;
  this.pSize = 100;
  this.x = (this.i-1) * this.pSize;
  this.y = size - ((this.j) * this.pSize);
  this.visited = false;

  this.show = function(){
    image(img_pit, this.x, this.y, this.pSize, this.pSize);
  }
}

function Wumpus(i, j){
  this.i = i; this.j = j;
  this.pSize = 100;
  this.x = (this.i-1) * this.pSize;
  this.y = size - ((this.j) * this.pSize);
  this.visited = false;
  this.isWumpus = true;

  this.show = function(){
    image(img_wumpus, this.x, this.y, this.pSize, this.pSize);
  }
}

function Cell(i, j){
  this.i = i; this.j = j;
  this.visited = false;
  this.percepts = [];
  this.containsPit = false;

  this.show = function(){
    let x = (this.i-1) * w;
    let y = size - ((this.j) * w);

    stroke(255);
    noFill();
    rect(x, y, w, w);
  }
}
