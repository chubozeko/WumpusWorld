function Player(i, j){
  this.i = i; this.j = j; this.pSize = 40;
  this.x = (this.i-1) * this.pSize;
  this.y = size - ((this.j) * this.pSize);
  this.isArrowShot = false;
  this.arrow = { i: this.i, j: this.j };
  this.hasFallenIntoPit = false;
  this.isHitByWumpus = false;
  this.hasShotWumpus = false;
  this.facing = 0; this.direction = 'right';

  this.faceLeft = function(){ this.facing = 180; this.direction = 'left'; }
  this.faceRight = function(){ this.facing = 0; this.direction = 'right'; }
  this.faceUp = function(){ this.facing = 270; this.direction = 'up'; }
  this.faceDown = function(){ this.facing = 90; this.direction = 'down'; }
  this.moveForward = function(){
    switch (this.facing) {
      case 0:
        if( this.x + w < size ){
          this.x += w;
          this.i++;
        } break;
      case 90:
        if( this.y + w < size ){
          this.y += w;
          this.j--;
        } break;
      case 180:
        if( this.x - w >= 0 ){
          this.x -= w;
          this.i--;
        } break;
      case 270:
        if( this.y - w >= 0 ){
          this.y -= w;
          this.j++;
        } break;
      default:
    }
    stepCounter++;
    this.checkEnvironment();
    this.arrow.i = this.i;  this.arrow.j = this.j;
  }
  this.show = function(){
    translate(this.x+(this.pSize), this.y);
    if (this.direction == 'right') {
      image(img_hunter_r, 0-this.pSize*(4/5), 0-this.pSize/5, this.pSize, this.pSize);
    } else if (this.direction == 'left') {
      image(img_hunter_l, 0-this.pSize*(4/5), 0-this.pSize/5, this.pSize, this.pSize);
    } else if (this.direction == 'up') {
      image(img_hunter_u, 0-this.pSize*(4/5), 0-this.pSize/5, this.pSize, this.pSize);
    } else if (this.direction == 'down') {
      image(img_hunter_d, 0-this.pSize*(4/5), 0-this.pSize/5, this.pSize, this.pSize);
    }
  }
  this.checkEnvironment = function(){
    // SHOW / HIDE GRID IF IT IS VISITED
    for (let l=0; l<grid.length; l++) {
      if(grid[l].i == this.i && grid[l].j == this.j) grid[l].visited = true;
    }
    // Check for PITS
    for (let l=0; l<pits.length; l++) {
      if( (pits[l].i == this.i) && (pits[l].j == this.j) ){
        pits[l].visited = true;
        this.hasFallenIntoPit = true;
        console.log('You have fallen into the ENDLESS PIT!');
        console.log('GAME OVER!!');
        let finalScore = pointCounter - stepCounter - 1000;
        console.log('Steps Taken: ' + stepCounter);
        console.log('SCORE: ' + finalScore);
      }
    }
    // Check for WUMPUS
    if( (wi == this.i) && (wj == this.j) && !this.hasShotWumpus ){
      this.isHitByWumpus = true;
      console.log('The WUMPUS has attacked!');
      console.log('GAME OVER!!');
      let finalScore = pointCounter - stepCounter - 1000;
      console.log('Steps Taken: ' + stepCounter);
      console.log('SCORE: ' + finalScore);
    }
    // Check for GOLD
    if( (gold.i == this.i) && (gold.j == this.j) ){
      gold.visited = true;
      console.log('I like GOLD!');
    }
    // Check for PERCEPTS: SMELL, BREEZE, GLITTER
    let currentBlock;
    for (let l=0; l<grid.length; l++) {
      if(grid[l].i == this.i && grid[l].j == this.j) {
        currentBlock = grid[l];
        grid[l].visited = true;
      }
    }
    let p = currentBlock.percepts;
    for (let k=0; k<p.length; k++) {
      switch (p[k].type) {
        case 'Smell': this.detectSmell = true; break;
        case 'Breeze': this.detectBreeze = true; break;
        case 'Glitter': this.detectGlitter = true; break;
        default:
          this.detectSmell = false;
          this.detectBreeze = false;
          this.detectGlitter = false;
      }
      p[k].visited = true;
    }
  }
  this.grab = function(gold, grid){
    if( (gold.i == this.i) && (gold.j == this.j) && !this.stopGame ){
      gold.grabbed = true;
      this.goldGrabbed = true;
      console.log('GOLD grabbed!');
      // Remove GLITTER
      for (let l=0; l<grid.length; l++) {
        if(grid[l].i == gold.i && grid[l].j == gold.j){
          let p = grid[l].percepts;
          for (let k=0; k<p.length; k++) {
            if (p[k].type == 'Glitter') p.splice(k, 1);
          }
        }
      }
      for (let l=0; l<this.grid.length; l++) {
        if(grid[l].i == gold.i && grid[l].j == gold.j){
          this.grid[l].containsGold = false;
        }
      }
    }
    this.returnToOrigin();
  };
  this.drop = function(gold){
    if( gold.grabbed ){
      gold.i = this.i;
      gold.j = this.j;
      gold.updatePosition();
      gold.grabbed = false;
      if( gold.i == 1 && gold.j == 1 ){
        return true;
      } else return false;
    }
  };
  this.shootArrow = function(grid){
    // 1. Get the direction Player is facing
    //    and move the arrow to the square the Player is facing
    if(this.direction == 'left'){ this.arrow.i--; }
    if(this.direction == 'right'){ this.arrow.i++; }
    if(this.direction == 'up'){ this.arrow.j++; }
    if(this.direction == 'down'){ this.arrow.j--; }

    for (let x=0; x<grid.length; x++) {
      for (let u=0; u<grid[x].percepts.length; u++) {
        if( grid[x].percepts[u].isWumpus ){
          // 3. Check if the Wumpus and the arrow are in the same square
          if(grid[x].percepts[u].i == this.arrow.i && grid[x].percepts[u].j == this.arrow.j){
            this.hasShotWumpus = true;
            // 4. Remove Wumpus
            grid[x].percepts.splice(u, 1);
            wi = 0; wj = 0;
          }
        }
      }
    }
    // 5. Remove adjacent Smells
    if( this.hasShotWumpus ){
      for (let x=0; x<grid.length; x++) {
        for (let u=0; u<grid[x].percepts.length; u++) {
          if( grid[x].percepts[u].type == 'Smell' ){
            grid[x].percepts.splice(u, 1);
          }
        }
      }
    }
    // 6. Remove Arrow
    this.isArrowShot = true;
    return grid;
  };
}
