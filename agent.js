function Agent(i, j) {
  this.i = i; this.j = j; this.pSize = 40;
  this.x = (this.i-1) * this.pSize;
  this.y = size - ((this.j) * this.pSize);
  this.isArrowShot = false; this.hasShotWumpus = false;
  this.arrow = { i: this.i, j: this.j };
  this.facing = 0; this.direction = 'right';
  this.observations = []; this.grid = [];
  this.dirs = ['left','right','up','down'];
  this.actionPlan = []; this.action = '', this.safeBlocks = [];
  this.actions = ['moveLeft','moveRight','moveUp','moveDown','shoot'];

  this.detectBreeze = false;
  this.detectSmell = false;
  this.detectGlitter = false;
  this.detectWumpus = false;
  this.detectPit = false;
  this.detectNothing = false;

  this.stopGame = false;
  this.goldGrabbed = false;
  this.neighbors = [];

  // Creating AGENT WUMPUS WORLD Grid
  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) { this.grid.push(new AgentCell(x, y)); }
  }
}

function AgentCell(i, j){
  this.i = i; this.j = j;
  this.visited = false;
  this.containsPit = false;
  this.containsWumpus = false;
  this.containsBreeze = false;
  this.containsSmell = false;
  this.containsGold = false;
  this.isSafe = false;

  this.show = function(){
    let x = (this.i-1) * w;
    let y = size - ((this.j) * w);

    stroke(255);
    noFill();
    rect(x, y, w, w);
  }
}

Agent.prototype.returnToOrigin = function(){
  let n, r, r0, r1, r2, r3;
  this.neighbors = [];
  for (var i = 0; i < this.grid.length; i++) {
    if( this.grid[i].isSafe && this.grid[i].visited ){ // && !this.grid[i].visited
      if( (this.grid[i].i == this.i+1 && this.grid[i].j == this.j ) ||
        (this.grid[i].i == this.i-1 && this.grid[i].j == this.j) ||
        (this.grid[i].i == this.i && this.grid[i].j == this.j+1) ||
        (this.grid[i].i == this.i && this.grid[i].j == this.j-1) &&
        (this.grid[i].i != 0 && this.grid[i].j != 0)){
          this.neighbors.push(this.grid[i]);
      }
    }
  }
  if (this.neighbors.length > 0){
    for (let n = 0; n < this.neighbors.length; n++) {
      if(this.neighbors[n].i < this.i)
        r0 = (this.neighbors[n].j - 1)/(this.neighbors[n].i - 1);
      else if(this.neighbors[n].i > this.i)
        r1 = (this.neighbors[n].j - 1)/(this.neighbors[n].i - 1);
      else if(this.neighbors[n].j > this.j)
        r2 = (this.neighbors[n].j - 1)/(this.neighbors[n].i - 1);
      else if(this.neighbors[n].j < this.j)
        r3 = (this.neighbors[n].j - 1)/(this.neighbors[n].i - 1);
    }
    let rs = [r0,r1,r2,r3];
    let minR = min(rs);
    if(minR == r0) r=0;
    else if(minR == r1) r=1;
    else if(minR == r2) r=2;
    else if(minR == r3) r=3;
  } else {
    r = floor(random(0, this.actions.length));
  }
  // this.actions = ['moveLeft','moveRight','moveUp','moveDown','shoot'];
  this.doAction(r);
}
Agent.prototype.agentStep = function(){
  this.checkEnvironment(gameWon, gameOver);
  this.tellKnowledgeBase();
  if( this.actionPlan.length > 0 ){
    //action = actionPlan.pop();
  } else if (!this.detectPit && !this.detectWumpus){
    // A* GRAPH SEARCH FOR PLAN
    //action = actionPlan.pop();
  } else {
    //this.actions = ['moveLeft','moveRight','moveUp','moveDown','shoot'];
    action = floor(random(0, this.dirs.length));
  }
  //this.doAction(action);
  this.askKnowledgeBase();
};
Agent.prototype.doAction = function (r) {
  switch (this.actions[r]) {
    case 'moveLeft': this.faceLeft();
      this.moveForward(gameWon, gameOver); break;
    case 'moveRight': this.faceRight();
      this.moveForward(gameWon, gameOver); break;
    case 'moveUp': this.faceUp();
      this.moveForward(gameWon, gameOver); break;
    case 'moveDown': this.faceDown();
      this.moveForward(gameWon, gameOver); break;
    case 'shoot': this.shootArrow(grid); break;
    default:
  }
};
Agent.prototype.getAgentGridCell = function(i,j){
  for (let l = 0; l < this.grid.length; l++) {
    if( this.grid[l].i == i && this.grid[l].j == j ) return this.grid[l];
  }
}
Agent.prototype.faceLeft = function(){ this.facing = 180; this.direction = 'left'; };
Agent.prototype.faceRight = function(){ this.facing = 0; this.direction = 'right'; };
Agent.prototype.faceUp = function(){ this.facing = 270; this.direction = 'up'; };
Agent.prototype.faceDown = function(){ this.facing = 90; this.direction = 'down'; };
Agent.prototype.moveForward = function(gameWon, gameOver){
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
  this.arrow.i = this.i;  this.arrow.j = this.j;
};
Agent.prototype.grab = function(gold, grid){
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
Agent.prototype.drop = function(gold){
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
Agent.prototype.shootArrow = function(grid){
  // 1. Get the direction Player is facing
  //    and move the arrow to the square the Player is facing
  if(this.direction == 'left'){ this.arrow.i--; }
  if(this.direction == 'right'){ this.arrow.i++; }
  if(this.direction == 'up'){ this.arrow.j++; }
  if(this.direction == 'down'){ this.arrow.j--; }

  console.log('Arrow SHOT!');

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
Agent.prototype.show = function(){
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
  if(!this.stopGame) this.agentStep();
};
Agent.prototype.checkEnvironment = function(gameWon, gameOver){
  this.detectBreeze = false;
  this.detectSmell = false;
  this.detectGlitter = false;
  this.detectWumpus = false;
  this.detectPit = false;
  this.detectNothing = false;
  this.stopGame = gameWon || gameOver;

  if( gameWon || gameOver ){
    for (let l=0; l<grid.length; l++) {
      grid[l].visited = true;
    }
    for (let l=0; l<this.grid.length; l++) {
      this.grid[l].visited = true;
    }
  }
  // Show / Hide block if it is VISITED
  for (let l=0; l<grid.length; l++) {
    if(grid[l].i == this.i && grid[l].j == this.j){
      grid[l].visited = true;
      let g = this.getAgentGridCell(this.i, this.j);
      g.visited = true;
    }
  }
  // Check for PITS
  for (let l=0; l<pits.length; l++) {
    if( (pits[l].i == this.i) && (pits[l].j == this.j) ){
      pits[l].visited = true;
      this.detectPit = true;
      break;
    }
  }
  // Check for WUMPUS
  if( (wi == this.i) && (wj == this.j) && !this.hasShotWumpus ){
    this.detectWumpus = true;
  } else { this.detectWumpus = false; }
  // Check for GOLD
  if( (gold.i == this.i) && (gold.j == this.j) ){
    gold.visited = true;
    this.detectGlitter = true;
  } else { this.detectGlitter = false; }
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
  if(!this.detectSmell && !this.detectBreeze && !this.detectGlitter
    && !this.detectWumpus && !this.detectPit ) this.detectNothing = true;
};
Agent.prototype.detections = function(){
  let obs = new Observation(
    this.i,
    this.j,
    this.detectSmell,
    this.detectBreeze,
    this.detectGlitter,
    this.detectPit,
    this.detectWumpus
  );
  this.observations.push(obs);
  for (var i = 0; i < this.observations.length; i++) {
    console.log(this.observations[i].showSentence());
  }
};
Agent.prototype.tellKnowledgeBase = function() {
  let sentence = 'Detections : ';
  let agentCell;
  // If BREEZE is Detected, this implies that there are PITS in adjacent blocks
  if( this.detectBreeze ){
    (this.i+1 != 0 && this.i+1 <= 4) ? sentence += 'a pit in [' + (this.i+1) + ',' + this.j + '], OR ' : sentence += '';
    (this.i+1 != 0 && this.i+1 <= 4) ? agentCell = this.getAgentGridCell(this.i+1, this.j) : agentCell = null;
    (agentCell != null && !agentCell.visited) ? agentCell.containsPit = true : agentCell = null;
    (this.i-1 != 0 && this.i-1 <= 4) ? sentence += 'a pit in [' + (this.i-1) + ',' + this.j + '], OR ' : sentence += '';
    (this.i-1 != 0 && this.i-1 <= 4) ? agentCell = this.getAgentGridCell(this.i-1, this.j) : agentCell = null;
    (agentCell != null && !agentCell.visited) ? agentCell.containsPit = true : agentCell = null;
    (this.j+1 != 0 && this.j+1 <= 4) ? sentence += 'a pit in [' + this.i + ',' + (this.j+1) + '], OR ' : sentence += '';
    (this.j+1 != 0 && this.j+1 <= 4) ? agentCell = this.getAgentGridCell(this.i, this.j+1) : agentCell = null;
    (agentCell != null && !agentCell.visited) ? agentCell.containsPit = true : agentCell = null;
    (this.j-1 != 0 && this.j-1 <= 4) ? sentence += 'a pit in [' + this.i + ',' + (this.j-1) + '] ' : sentence += '';
    (this.j-1 != 0 && this.j-1 <= 4) ? agentCell = this.getAgentGridCell(this.i, this.j-1) : agentCell = null;
    (agentCell != null && !agentCell.visited) ? agentCell.containsPit = true : agentCell = null;

    sentence += 'a breeze in [' + this.i + ',' + this.j + '] ';
    agentCell = this.getAgentGridCell(this.i, this.j);
    agentCell.containsBreeze = true;
    agentCell.isSafe = true;
    //this.safeBlocks.push(agentCell);

    console.log(sentence);
  } else {
    sentence += 'NOT a pit in [' + this.i + ',' + (this.j) + '] ';
    agentCell = this.getAgentGridCell(this.i, this.j);
    agentCell.containsPit = false;
    agentCell.isSafe = true;
    //this.safeBlocks.push(agentCell);
  }
  // If SMELL is Detected, this implies that there is a WUMPUS in adjacent blocks
  if( this.detectSmell ){
    (this.i+1 != 0 && this.i+1 <= 4) ? sentence += 'a wumpus in [' + (this.i+1) + ',' + this.j + '] OR ' : sentence += '';
    (this.i+1 != 0 && this.i+1 <= 4) ? agentCell = this.getAgentGridCell(this.i+1, this.j) : agentCell = null;
    (agentCell != null && !agentCell.visited) ? agentCell.containsWumpus = true : agentCell = null;
    (this.i-1 != 0 && this.i-1 <= 4) ? sentence += 'a wumpus in [' + (this.i-1) + ',' + this.j + '] OR ' : sentence += '';
    (this.i-1 != 0 && this.i-1 <= 4) ? agentCell = this.getAgentGridCell(this.i-1, this.j) : agentCell = null;
    (agentCell != null && !agentCell.visited) ? agentCell.containsWumpus = true : agentCell = null;
    (this.j+1 != 0 && this.j+1 <= 4) ? sentence += 'a wumpus in [' + this.i + ',' + (this.j+1) + '] OR ' : sentence += '';
    (this.j+1 != 0 && this.j+1 <= 4) ? agentCell = this.getAgentGridCell(this.i, this.j+1) : agentCell = null;
    (agentCell != null && !agentCell.visited) ? agentCell.containsWumpus = true : agentCell = null;
    (this.j-1 != 0 && this.j-1 <= 4) ? sentence += 'a wumpus in [' + this.i + ',' + (this.j-1) + '] ' : sentence += '';
    (this.j-1 != 0 && this.j-1 <= 4) ? agentCell = this.getAgentGridCell(this.i, this.j-1) : agentCell = null;
    (agentCell != null && !agentCell.visited) ? agentCell.containsWumpus = true : agentCell = null;

    sentence += 'a smell in [' + this.i + ',' + this.j + '] ';
    agentCell = this.getAgentGridCell(this.i, this.j);
    agentCell.containsSmell = true;
    agentCell.isSafe = true;
    //this.safeBlocks.push(agentCell);

    console.log(sentence);
  } else {
    sentence += 'NOT a wumpus in [' + this.i + ',' + (this.j) + '] ';
    agentCell = this.getAgentGridCell(this.i, this.j);
    agentCell.containsWumpus = false;
    agentCell.isSafe = true;
    //this.safeBlocks.push(agentCell);
  }
  // If GLITTER is Detected, this implies that there is GOLD in current block
  if( this.detectGlitter && (this.i != 1 && this.j != 1) ){
    sentence += 'GOLD in [' + this.i + ',' + this.j + '] ';
    agentCell = this.getAgentGridCell(this.i, this.j);
    agentCell.containsGold = true;
    agentCell.isSafe = true;
    //this.safeBlocks.push(agentCell);
    console.log(sentence);
  }
  if( this.detectNothing ){
    sentence += 'NOTHING in [' + this.i + ',' + this.j + '] ';
    console.log(sentence);
    sentence = 'Detections ';
    (this.i+1 != 0 && this.i+1 <= 4) ? sentence += 'NOT a wumpus in [' + (this.i+1) + ',' + this.j + '] AND ' : sentence += '';
    (this.i+1 != 0 && this.i+1 <= 4) ? agentCell = this.getAgentGridCell(this.i+1, this.j) : agentCell = null;
    (agentCell != null && !agentCell.visited) ?
      (agentCell.containsWumpus = false, agentCell.isSafe = true  ) : agentCell = null;
    (this.i-1 != 0 && this.i-1 <= 4) ? sentence += 'NOT a wumpus in [' + (this.i-1) + ',' + this.j + '] AND ' : sentence += '';
    (this.i-1 != 0 && this.i-1 <= 4) ? agentCell = this.getAgentGridCell(this.i-1, this.j) : agentCell = null;
    (agentCell != null && !agentCell.visited) ?
      (agentCell.containsWumpus = false, agentCell.isSafe = true  ) : agentCell = null;
    (this.j+1 != 0 && this.j+1 <= 4) ? sentence += 'NOT a wumpus in [' + this.i + ',' + (this.j+1) + '] AND ' : sentence += '';
    (this.j+1 != 0 && this.j+1 <= 4) ? agentCell = this.getAgentGridCell(this.i, this.j+1) : agentCell = null;
    (agentCell != null && !agentCell.visited) ?
      (agentCell.containsWumpus = false, agentCell.isSafe = true  ) : agentCell = null;
    (this.j-1 != 0 && this.j-1 <= 4) ? sentence += 'NOT a wumpus in [' + this.i + ',' + (this.j-1) + '] AND ' : sentence += '';
    (this.j-1 != 0 && this.j-1 <= 4) ? agentCell = this.getAgentGridCell(this.i, this.j-1) : agentCell = null;
    (agentCell != null && !agentCell.visited) ?
      (agentCell.containsWumpus = false, agentCell.isSafe = true  ) : agentCell = null;
    (this.i+1 != 0 && this.i+1 <= 4) ? sentence += 'NOT a pit in [' + (this.i+1) + ',' + this.j + '], AND ' : sentence += '';
    (this.i+1 != 0 && this.i+1 <= 4) ? agentCell = this.getAgentGridCell(this.i+1, this.j) : agentCell = null;
    (agentCell != null && !agentCell.visited) ?
      (agentCell.containsPit = false, agentCell.isSafe = true  ) : agentCell = null;
    (this.i-1 != 0 && this.i-1 <= 4) ? sentence += 'NOT a pit in [' + (this.i-1) + ',' + this.j + '], AND ' : sentence += '';
    (this.i-1 != 0 && this.i-1 <= 4) ? agentCell = this.getAgentGridCell(this.i-1, this.j) : agentCell = null;
    (agentCell != null && !agentCell.visited) ?
      (agentCell.containsPit = false, agentCell.isSafe = true  ) : agentCell = null;
    (this.j+1 != 0 && this.j+1 <= 4) ? sentence += 'NOT a pit in [' + this.i + ',' + (this.j+1) + '], AND ' : sentence += '';
    (this.j+1 != 0 && this.j+1 <= 4) ? agentCell = this.getAgentGridCell(this.i, this.j+1) : agentCell = null;
    (agentCell != null && !agentCell.visited) ?
      (agentCell.containsPit = false, agentCell.isSafe = true  ) : agentCell = null;
    (this.j-1 != 0 && this.j-1 <= 4) ? sentence += 'NOT a pit in [' + this.i + ',' + (this.j-1) + '] ' : sentence += '';
    (this.j-1 != 0 && this.j-1 <= 4) ? agentCell = this.getAgentGridCell(this.i, this.j-1) : agentCell = null;
    (agentCell != null && !agentCell.visited) ?
      (agentCell.containsPit = false, agentCell.isSafe = true  ) : agentCell = null;
    console.log(sentence);
  }
}
Agent.prototype.askKnowledgeBase = function(){
  let agentCell;
  if( this.detectPit || this.detectWumpus ){
    this.moveForward(false, true);
  }
  // If GLITTER is Detected, this implies that there is GOLD in current block
  if( this.detectGlitter ){
    if(!this.goldGrabbed) this.grab(gold, grid);
  }
  if( this.i == 1 && this.j == 1 ){
    if( gold.grabbed ) gameWon = player.drop(gold);
  }
  // If BREEZE is Detected, this implies that there are PITS in adjacent blocks
  if( this.detectBreeze ){
    let n, r;
    this.neighbors = [];
    for (let i = 0; i < this.grid.length; i++) {
      if( this.grid[i].isSafe ){ //&& !this.grid[i].visited
        if( (this.grid[i].i == this.i+1 && this.grid[i].j == this.j) ||
          (this.grid[i].i == this.i-1 && this.grid[i].j == this.j) ||
          (this.grid[i].i == this.i && this.grid[i].j == this.j+1) ||
          (this.grid[i].i == this.i && this.grid[i].j == this.j-1) ){
            this.neighbors.push(this.grid[i]);
          }
      }
    }
    if (this.neighbors.length > 0){
      n = floor(random(0, this.neighbors.length));
      if(this.neighbors[n].i > this.i) r = 1;
      else if(this.neighbors[n].i < this.i) r = 0;
      else if(this.neighbors[n].j > this.j) r = 2;
      else if(this.neighbors[n].j < this.j) r = 3;
    } else {
      r = floor(random(0, this.actions.length));
    }
    // this.actions = ['moveLeft','moveRight','moveUp','moveDown','shoot'];
    this.doAction(r);
  }
  // If SMELL is Detected, this implies that there is a WUMPUS in adjacent blocks
  if( this.detectSmell ){
    this.neighbors = [];
    for (var i = 0; i < this.grid.length; i++) {
      if( this.grid[i].isSafe ){ // && !this.grid[i].visited
        if( (this.grid[i].i == this.i+1 && this.grid[i].j == this.j) ||
          (this.grid[i].i == this.i-1 && this.grid[i].j == this.j) ||
          (this.grid[i].i == this.i && this.grid[i].j == this.j+1) ||
          (this.grid[i].i == this.i && this.grid[i].j == this.j-1) ){
            this.neighbors.push(this.grid[i]);
          }
      }
    }
    let n, r;
    if (this.neighbors.length > 0){
      n = floor(random(0, this.neighbors.length));
      if(this.neighbors[n].i > this.i) r = 1;
      else if(this.neighbors[n].i < this.i) r = 0;
      else if(this.neighbors[n].j > this.j) r = 2;
      else if(this.neighbors[n].j < this.j) r = 3;
    } else {
      r = floor(random(0, this.actions.length));
    }
    // this.actions = ['moveLeft','moveRight','moveUp','moveDown','shoot'];
    this.doAction(r);
  }

  if( this.detectNothing ){
    this.neighbors = [];
    for (var i = 0; i < this.grid.length; i++) {
      if( this.grid[i].isSafe ){ // && !this.grid[i].visited
        if( (this.grid[i].i == this.i+1 && this.grid[i].j == this.j) ||
          (this.grid[i].i == this.i-1 && this.grid[i].j == this.j) ||
          (this.grid[i].i == this.i && this.grid[i].j == this.j+1) ||
          (this.grid[i].i == this.i && this.grid[i].j == this.j-1) ){
            this.neighbors.push(this.grid[i]);
          }
      }
    }
    let n, r;
    if (this.neighbors.length > 0){
      n = floor(random(0, this.neighbors.length));
      if(this.neighbors[n].i > this.i) r = 1;
      else if(this.neighbors[n].i < this.i) r = 0;
      else if(this.neighbors[n].j > this.j) r = 2;
      else if(this.neighbors[n].j < this.j) r = 3;
    } else {
      r = floor(random(0, this.actions.length));
    }
    // this.actions = ['moveLeft','moveRight','moveUp','moveDown','shoot'];
    this.doAction(r);
  }

}
