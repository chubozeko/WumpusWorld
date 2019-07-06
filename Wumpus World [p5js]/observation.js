function Observation(i, j, smell, breeze, glitter, pit, wumpus){
  this.i = i; this.j = j;
  this.smell = smell;
  this.breeze = breeze;
  this.glitter = glitter;
  this.pit = pit;
  this.wumpus = wumpus;
}

Observation.prototype.showSentence = function () {
  let sentence = `In [` + this.i + `,` + this.j + `] there is: \n`;
  if(this.smell) sentence += `smell\n`;
  if(this.breeze) sentence += `breeze\n`;
  if(this.glitter) sentence += `gold\n`;
  if(this.pit) sentence += `pit\n`;
  if(this.wumpus) sentence += `wumpus\n`;
  if (!this.breeze && !this.smell && !this.glitter
     && !this.wumpus && !this.pit)
     sentence += `nothing\n`;
  return sentence;
};
