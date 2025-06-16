var Field = function(config)
{
  config.sizeType = 'absolute';
  config.width = 370;
  config.height = 370;
  Gui.BasePanel.call(this, config);


  var self = this;

  this.state = 'normal';

  // this.CELL_SIZE = (91-2);
  this.CELL_SIZE = (106+15); // 13
  this.MAX_WIDTH_AS_CELLS = 15;
  this.MAX_HEIGHT_AS_CELLS = 15;
  // this.fieldHeightAsCells = 10;
  // this.fieldWidthAsCells = 10;

  this.scaleContainer = new PIXI.Container();
  this.addChild(this.scaleContainer);

  this.fieldContainer = new PIXI.Container();
  this.scaleContainer.addChild(this.fieldContainer);

  this.selectingContainer = new PIXI.Container();
  this.fieldContainer.addChild(this.selectingContainer);

  this.cells = [];
  this.allCells = [];
  for(var j = 0; j < this.MAX_HEIGHT_AS_CELLS; j++)
  {
    this.cells[j] = [];
    for(var i = 0; i < this.MAX_WIDTH_AS_CELLS; i++)
    {
      var cell = new Field.Cell(this, i, j);
      this.cells[j][i] = cell;
      this.allCells.push(cell);
    }
  }

  this.selectingLane = null;
  this.selectingColour = -1;
  this.selectingColoursCount = 11;
  this.selectingColours = [];
  this.selectingLanes = [];

  app.addForUpdate(this.update, this);
}
Field.prototype = Object.create(Gui.BasePanel.prototype);
Field.prototype.constructor = Field;

Field.prototype.revealWords = function(callback)
{
  var self = this;

  this.state = 'reveal';

  var revealWords = 0;
  var notOpenWords = 0;
  var revealDelay = 5/30;
  for(var i = 0; i < this.fieldData.words.length; i++)
  {
    var word = this.fieldData.words[i];
    if(!word.isOpen)
    { 
      revealWord(word, notOpenWords * revealDelay);

      notOpenWords ++;
      // break;
    }
  }

  function revealWord(word, delay)
  {
    // console.log(word);
    TweenMax.delayedCall(delay, function()
    {
      var startCell = self.getCellByIJ(word.cells[0].i, word.cells[0].j);
      // var endCell = self.getCellByIJ(word.cells[word.cells.length-1].i, word.cells[word.cells.length-1].j);
      var selectingLane = new SelectingLane(self, startCell, self.selectingColour);
      self.selectingLanes.push(selectingLane);
      
      var currentCell = startCell;
      var vvv = {value: 0};
      TweenMax.to(vvv, (word.cells.length*1)/30, {value: 1, ease: Power0.easeNone, onUpdate: function()
      {
        var n = Math.floor(vvv.value / (1 / (word.cells.length-1)));
        // console.log(n, word.cells.length);
        var cell = self.getCellByIJ(word.cells[n].i, word.cells[n].j);
        if(currentCell != cell)
        {
          currentCell = cell;
          selectingLane.updateSelecting(currentCell);
        }
      },
      onComplete: function()
      {
        self.emit('word_reveal', word);
        revealWords ++;
        if(revealWords == notOpenWords) revealComplete();
      }});

      self.nextSelectingColour();
    });
  }

  function revealComplete()
  {
    self.state = 'normal';

    if(callback) callback();
  }
}

Field.prototype.getCellXY = function(i, j)
{
  return {x: i * this.CELL_SIZE, y: j * this.CELL_SIZE};
}
Field.prototype.getCellByIJ = function(i, j)
{
  return this.cells[j][i];
}

Field.prototype.initField = function(fieldData)
{
  this.fieldData = fieldData;

  for(var j = 0; j < this.MAX_HEIGHT_AS_CELLS; j++)
  {
    for(var i = 0; i < this.MAX_WIDTH_AS_CELLS; i++)
    {
      var cell = this.cells[j][i];

      if(j < fieldData.height && i < fieldData.width)
      {
        cell.activete();
        var char = fieldData.cells[j][i];
        if(char == null) char = '-';        
        cell.setChar(char);
      }
      else
      {
        cell.deactivate();
      }
    }
  }

  var fieldWidth = fieldData.width*this.CELL_SIZE;
  var fieldHeight = fieldData.height*this.CELL_SIZE;
  var fieldSize = Math.max(fieldWidth, fieldHeight);

  this.fieldContainer.x = -fieldWidth/2 + this.CELL_SIZE/2;
  this.fieldContainer.y = -fieldHeight/2 + this.CELL_SIZE/2;

  // console.log('Field Size:', fieldSize);

  var scale = (760) / fieldSize;
  this.scaleContainer.scale.x = this.scaleContainer.scale.y = scale;


  this.selectingColours = [];
  for(var colour = 1; colour <= this.selectingColoursCount; colour ++) this.selectingColours.push('color_'+colour);
  // console.log('FieldColours:', this.selectingColours);

  this.selectingLanes = [];

  this.nextSelectingColour();
}
Field.prototype.clear = function()
{
  this.fieldData = null;

  for(var i = 0; i < this.selectingLanes.length; i++) this.selectingLanes[i].destroy();
  this.selectingLanes = [];
}
Field.prototype.nextSelectingColour = function()
{
  this.selectingColour = Util.randomElement(this.selectingColours);

  var n = this.selectingColours.indexOf(this.selectingColour);
  this.selectingColours.splice(n, 1);

  if(this.selectingColours.length == 0) for(var colour = 1; colour <= this.selectingColoursCount; colour ++) this.selectingColours.push('color_'+colour);
}

Field.prototype.startSelecting = function(cell)
{
  if(this.selectingLane != null) return;

  this.selectingLane = new SelectingLane(this, cell, this.selectingColour);
}
Field.prototype.endSelecting = function()
{
  if(this.selectingLane == null) return;

  var wordData = this.selectingLane.endSelecting();

  if(wordData == null) this.selectingLane.destroy();
  else
  {
    wordData.isOpen = true;

    this.emit('word_open', wordData);

    this.selectingLanes.push(this.selectingLane);

    this.nextSelectingColour();

    var notOpenWords = [];
    for(var i = 0; i < this.fieldData.words.length; i++)
    {
      if(!this.fieldData.words[i].isOpen) notOpenWords.push(this.fieldData.words[i]);
    }
    if(notOpenWords.length == 0) this.emit('field_complete');
    // console.log('Not opened:', notOpenWords);
  }

  this.selectingLane = null;
}

Field.prototype.update = function()
{
  if(this.selectingLane != null)
  {
    var local = this.fieldContainer.toLocal(app.mouse);

    var minD = -1;
    var cell = null;

    for(var i = 0; i < this.allCells.length; i++)
    {
      var c = this.allCells[i];
      if(!c.isActive) continue;
      if(!(Math.abs(c.i - this.selectingLane.startCell.i) == Math.abs(c.j - this.selectingLane.startCell.j) || c.i == this.selectingLane.startCell.i && c.j != this.selectingLane.startCell.j || c.j == this.selectingLane.startCell.j && c.i != this.selectingLane.startCell.i)) continue;

      var d = Util.distance(c.position.x, c.position.y, local.x, local.y);

      if(cell == null || d < minD)
      {
        cell = c;
        minD = d;
      }
    }

    this.selectingLane.updateSelecting(cell);
  }
}

Field.prototype.tween = function(data, callback)
{
  var self = this;
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
Field.Cell = function(field, i, j)
{
  this.field = field;
  this.i = i;
  this.j = j;

  this.isActive = true;

  this.position = this.field.getCellXY(this.i, this.j);

  this.bg = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'white_rect.png'));
  this.field.fieldContainer.addChild(this.bg);
  this.bg.width = this.bg.height = this.field.CELL_SIZE;
  this.bg.anchor.set(0.5, 0.5);
  this.bg.x = this.position.x;
  this.bg.y = this.position.y;
  this.bg.alpha = 0;
  // this.bg.tint = 0x000000;

  this.interactiveElement = this.bg;

  this.char = '-';
  this.charText = Util.setParams(new Gui.TextBmp(this.char,  constsManager.getData('text_configs/field_char_text')), {parent: this.field.fieldContainer, aX:0.5, aY:0.5, x: this.position.x-2, y: this.position.y+14});
}
Field.Cell.prototype.setChar = function(char)
{
  this.char = char.toUpperCase();

  this.charText.text = this.char;

  // console.log('SetChar:', char);
}
Field.Cell.prototype.deactivate = function()
{
  this.isActive = false;

  this.bg.visible = false;
  this.charText.visible = false;
}
Field.Cell.prototype.activete = function()
{
  this.isActive = true;

  this.bg.visible = true;
  this.charText.visible = true;

  this.interactiveElement.interactive = true;
  this.interactiveElement.buttonMode = true;

  // console.log(this.cell);
  // this.addListener('click', this.onClickListener, this);
  // this.addListener('tap', this.onClickListener, this);

  this.interactiveElement.addListener('pointerdown', onInputDown, this);
  this.interactiveElement.addListener('pointerup', onInputUp, this);   
  this.interactiveElement.addListener('pointerupoutside', onInputUp, this);  

  function onInputDown(e)
  {
    app.mouse = e.data.global;

    this.field.startSelecting(this);
  }

  function onInputUp(e)
  {
    this.field.endSelecting();
  }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var SelectingLane = function(field, startCell, colour)
{
  this.field = field;
  this.startCell = startCell;
  this.endCell = null;
  this.colour = colour;

  this.lane = [];

  this.circleStart = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'Selecting/sphere_'+this.colour+'.png'));
  this.field.selectingContainer.addChild(this.circleStart);
  this.circleStart.anchor.set(1, 0.5);
  this.circleStart.x = this.startCell.position.x;
  this.circleStart.y = this.startCell.position.y;

  this.circleEnd = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'Selecting/sphere_'+this.colour+'.png'));
  this.field.selectingContainer.addChild(this.circleEnd);
  this.circleEnd.anchor.set(1, 0.5);
  this.circleEnd.x = this.startCell.position.x;
  this.circleEnd.y = this.startCell.position.y;

  this.rectJoint = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'Selecting/rect_'+this.colour+'.png'));
  this.field.selectingContainer.addChild(this.rectJoint);
  this.rectJoint.anchor.set(0.0, 0.5);
  this.rectJoint.x = this.startCell.position.x;
  this.rectJoint.y = this.startCell.position.y;
  // this.rectJoint.height = 75;
  this.rectJoint.height = 85;

  this.tweenCircleEnd = null;
  this.tweenRectJoint = null;

  this.updateSelecting(this.startCell);

  // console.log('Start selecting:', this.startCell.char);
}

SelectingLane.prototype.updateSelecting = function(cell)
{
  if(this.endCell == cell) return;

  this.endCell = cell;

  if(this.startCell == this.endCell)
  {
    // this.circleEnd.visible = false;
    this.rectJoint.visible = false;

    this.circleEnd.x = this.endCell.position.x;
    this.circleEnd.y = this.endCell.position.y;

    this.circleStart.rotation = 0;
    this.circleEnd.rotation = 180*Util.TO_RADIANS;
  }
  else
  {
    // this.circleEnd.visible = true;
    this.rectJoint.visible = true;

    // var time = 10/30;
    // var ease = Power2.easeOut;
    this.circleEnd.x = this.endCell.position.x;
    this.circleEnd.y = this.endCell.position.y;
    // this.tweenCircleEnd = TweenMax.to(this.circleEnd, time, {x: this.endCell.position.x, y: this.endCell.position.y, ease: ease});

    var angle = Util.angle(this.startCell.position.x, this.startCell.position.y, this.endCell.position.x, this.endCell.position.y);
    var distance = Util.distance(this.startCell.position.x, this.startCell.position.y, this.endCell.position.x, this.endCell.position.y);

    this.circleStart.rotation = angle;
    this.circleEnd.rotation = angle-180*Util.TO_RADIANS;

    this.rectJoint.rotation = angle;
    this.rectJoint.width = distance;

    // this.tweenRectJoint = TweenMax.to(this.rectJoint, time, {rotation: angle, width: distance, ease: ease});
  }

  // console.log('Update selecting:', this.endCell.char);
}

SelectingLane.prototype.endSelecting = function()
{
  var cellsCount = Math.max(Math.abs(this.startCell.i - this.endCell.i), Math.abs(this.startCell.j - this.endCell.j)) + 1;

  var shiftI = (this.endCell.i == this.startCell.i)?0:Util.sign(this.endCell.i - this.startCell.i);
  var shiftJ = (this.endCell.j == this.startCell.j)?0:Util.sign(this.endCell.j - this.startCell.j);

  this.lane = [];
  for(var i = 0; i < cellsCount; i++)
  {
    var cI = this.startCell.i + shiftI*i;
    var cJ = this.startCell.j + shiftJ*i;
    var c = this.field.cells[cJ][cI];
    this.lane.push(c);
  }

  var word = '';
  for(var i = 0; i < this.lane.length; i++) word += this.lane[i].char;

  // Check word
  var words = this.field.fieldData.words;
  var resultWordData = null;
  for(var i = 0; i < words.length; i++)
  {
    var wordData = words[i];
    if(wordData.word.toUpperCase() == word.toUpperCase())
    {
      var firstChar = wordData.chars[0];
      var lastChar = wordData.chars[wordData.chars.length-1];

      if(firstChar.i == this.startCell.i && firstChar.j == this.startCell.j && lastChar.i == this.endCell.i && lastChar.j == this.endCell.j)
      {
        resultWordData = wordData;
        break;
      }
    }
  }

  if(resultWordData != null && resultWordData.isOpen) resultWordData = null;

  // if(resultWordData == null) this.destroy();

  // console.log('End selecting!', resultWordData);

  return resultWordData;
}

SelectingLane.prototype.destroy = function()
{
  this.circleStart.destroy();
  this.circleEnd.destroy();
  this.rectJoint.destroy();

  this.field = null;
  this.startCell = this.endCell = null;
  this.lane = null;
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var FieldData = function(width, height, wordsCount, wordsList, directions)
{
  var self = this;

  this.width = width;
  this.height = height;
  this.wordsCount = wordsCount;
  this.wordsList = wordsList;
  this.directions = directions;

  initField();
  function initField()
  {
    self.cells = [];
    for(var j = 0; j < height; j++)
    {
      self.cells[j] = [];
      for(var i = 0; i < width; i++)
      {
        self.cells[j][i] = null;
      }
    }

    self.lanes = initLanes();
    function initLanes()
    {
      var lanes = [];
      for(var i = 0; i < directions.length; i++)
      {
        var direction = directions[i];
        lanes[direction] = [];

        if(direction == 'right')
        {
          for(var cJ = 0; cJ < height; cJ++)
          {
            var lane = [];
            for(var cI = 0; cI < width; cI ++) lane.push({i: cI, j: cJ, n: cI});
            lanes[direction].push(lane);
          }
        }  
        else if(direction == 'down')
        {
          for(var cI = 0; cI < width; cI++)
          {
            var lane = [];
            for(var cJ = 0; cJ < height; cJ ++) lane.push({i: cI, j: cJ, n: cJ});
            lanes[direction].push(lane);
          }
        }
        else if(direction == 'left')
        {
          for(var cJ = 0; cJ < height; cJ++)
          {
            var lane = [];
            for(var cI = width-1; cI >= 0; cI --) lane.push({i: cI, j: cJ, n: width-1-cI});
            lanes[direction].push(lane);
          }
        }  
        else if(direction == 'up')
        {
          for(var cI = 0; cI < width; cI++)
          {
            var lane = [];
            for(var cJ = height-1; cJ >= 0; cJ --) lane.push({i: cI, j: cJ, n: height-1-cJ});
            lanes[direction].push(lane);
          }
        }
        else initDiagonalLane(direction, lanes[direction]);
      }
      // console.log(lanes);

      return lanes;
    }

    function initDiagonalLane(dir, lanes)
    {
      // console.log('Init diagonal:', dir);

      var startCells = [];

      if(dir == 'down_right') 
      {
        for(var cJ = 0; cJ < height; cJ++) startCells.push({i: 0, j: cJ});
        for(var cI = 1; cI < width; cI++) startCells.push({i: cI, j: 0});
      }
      else if(dir == 'down_left') 
      {
        for(var cJ = 0; cJ < height; cJ++) startCells.push({i: width-1, j: cJ});
        for(var cI = 1; cI < width; cI++) startCells.push({i: cI, j: 0});
      }  
      else if(dir == 'up_right') 
      {
        for(var cJ = 0; cJ < height; cJ++) startCells.push({i: 0, j: cJ});
        for(var cI = 1; cI < width; cI++) startCells.push({i: cI, j: height-1});
      }    
      else if(dir == 'up_left') 
      {
        for(var cJ = 0; cJ < height; cJ++) startCells.push({i: width-1, j: cJ});
        for(var cI = 1; cI < width; cI++) startCells.push({i: cI, j: height-1});
      }

      for(var i = 0; i < startCells.length; i++)
      {
        var cell = {i: startCells[i].i, j: startCells[i].j, n: 0};
        var lane = [cell];
        var n = 0;

        cell = getNextDiagonalCell(cell);
        while(cell != null)
        {
          n++;
          cell.n = n;
          lane.push(cell);
          cell = getNextDiagonalCell(cell);
        }

        if(lane.length > 2) lanes.push(lane);
      }

      function getNextDiagonalCell(cell)
      {
        var nextI = cell.i;
        var nextJ = cell.j;

        if(dir == 'down_right')
        {
          nextI ++;
          nextJ ++;
        }  
        else if(dir == 'down_left')
        {
          nextI --;
          nextJ ++;
        }    
        else if(dir == 'up_right')
        {
          nextI ++;
          nextJ --;
        }      
        else if(dir == 'up_left')
        {
          nextI --;
          nextJ --;
        }

        if(nextI < 0 || nextJ < 0 || nextI > width-1 || nextJ > height-1) return null;
        return {i: nextI, j: nextJ};
      }

      // console.log(startCells);
    }
  }

  // console.log(this.lanes);

  this.words = [];
  generateWords();
  function generateWords()
  {
    while(self.words.length < self.wordsCount)
    {
      var wordData = self.generateWord();
      if(wordData == null) 
      {
        console.log('ERROR: Cant generate field, build reset!');
        self.words = [];
        for(var j = 0; j < self.height; j++)
        {
          for(var i = 0; i < self.width; i++)
          {
            self.cells[j][i] = null;
          }
        }
      }
      else self.insertWord(wordData);
    }
  }

  fillFreeCells();
  function fillFreeCells()
  {
    for(var j = 0; j < self.height; j++)
    {
      for(var i = 0; i < self.width; i++)
      {
        // console.log(cells[j][i] == null);
        if(self.cells[j][i] == null) self.cells[j][i] = self.getRandomChar();
      }
    }
  }

  // var str = 'steam';
  // var exp = '\\w{0,0}st\\w{3,4}';
  // console.log('XXXXXXXXXXX:', exp, str.match(exp));

  // var str = 'yo   ursel\' 12  f   ';
  // var exp = '\\s';
  // var exp = /\W/g;
  // console.log('W:', str.replace(exp, ''));
  // console.log('W:', str.match(exp));

  // console.table(this.cells);
  // console.log('Words:');
  // for(var i = 0; i < this.words.length; i++) console.log(this.words[i].word);
}

FieldData.prototype.insertWord = function(wordData)
{
  this.words.push(wordData);

  for(var i = 0; i < wordData.chars.length; i++)
  {
    var char = wordData.chars[i];
    this.cells[char.j][char.i] = wordData.word[i];
  }
}

FieldData.prototype.generateWord = function()
{
  var lastWord = this.words[this.words.length-1];
  var avaiableDirections = Util.clone(this.directions);
  // console.log(avaiableDirections);
  if(lastWord) avaiableDirections.splice(avaiableDirections.indexOf(lastWord.dir), 1);
  avaiableDirections = Util.shuffleElements(avaiableDirections);
  if(lastWord) avaiableDirections.push(lastWord.dir);
  // console.log(avaiableDirections);

  for(var i = 0; i < avaiableDirections.length; i++)
  {
    dir = avaiableDirections[i];

    var wordData = this.getWordByDir(dir);
    if(wordData != null)
    {
      // console.log('WORD:', wordData);    
      return wordData;
    }
  }

  return null;
}

FieldData.prototype.getWordByDir = function(dir)
{
  var self = this;

  var variants = [];

  // GetingAllVariants
  var dirLanes = this.lanes[dir];
  for(var i = 0; i < dirLanes.length; i++)
  {
    var lane = dirLanes[i];
    var laneVariants = this.getLaneVariants(lane, dir);
    variants = variants.concat(laneVariants);
  }

  // Sort Variants By Score
  var vvv = [];
  for(var i = 0; i < variants.length; i++)
  {
    var variant = variants[i];

    if(vvv.length == 0) vvv.push({score: variant.score, variants:[variant]});
    else
    {
      var isFind = false;
      for(var j = 0; j < vvv.length; j++)
      {
        if(vvv[j].score == variant.score) 
        {
          vvv[j].variants.push(variant);
          isFind = true;
          break;
        }            
      }

      if(!isFind) vvv.push({score: variant.score, variants:[variant]});
    }
  }

  vvv = vvv.sort(function(a, b) 
  {
    if (a.score < b.score) return 1;
    else if (a.score > b.score) return -1;
    else return 0;
  });

  for(var i = 0; i < vvv.length; i++)
  {
    variants = vvv[i].variants;
    variants = Util.shuffleElements(variants);
    for(var j = 0; j < variants.length; j++)
    {
      var variant = variants[j];
      var mask = variant.mask;
      var word = this.getRandomWord(mask, 3);

      if(word != null) 
      {
        var wordData = getWordDataByVariant(word, variant);
        return wordData;
      }
    }
  }

  function getWordDataByVariant(word, variant)
  {
    // console.log(word, variant);
    // var dir = '';
    // for(var key in self.lanes)
    // {
    //   for(var i = 0; i < self.lanes[key].length; i++)
    //   {
    //     if(self.lanes[key][i] == variant.lane)
    //     {
    //       dir = key;
    //       break;
    //     }
    //   }
    // }

    // console.log(dir);

    var startN = -1;
    for(var n = variant.cellStart.n; n <= variant.cellEnd.n; n++)
    {
      var isFind = true;
      var intersections = 0;
      for(var i = 0; i < word.length; i++)
      {
        if(n+i > variant.cellEnd.n) continue;

        var char = word[i];
        var cell = variant.lane[n+i];

        if(self.cells[cell.j][cell.i] != null && self.cells[cell.j][cell.i] != char)
        {
          isFind = false;
          break;
        }
        else if(self.cells[cell.j][cell.i] == char) intersections ++;
      }
      if(isFind && intersections != variant.intersections) isFind = false;

      if(isFind)
      {
        startN = n;
        break;
      }
    }

    var startCell = variant.lane[startN];
    var chars = [];
    var cells = [];
    for(var n = startN; n < startN+word.length; n++)
    {
      var cell = variant.lane[n];
      cells.push(cell);
      chars.push({i: cell.i, j: cell.j, char: word[n-startN]});
    }
    // console.log('StartN:', startN, startCell, dir);
    return {word: word, chars: chars, cells: cells, dir: dir, lane: variant.lane, isOpen: false};
  }

  // var word = 'zzz';
  // console.log(vvv);    
  // for(var )

  // console.log('Variants:', variants);
  return null;
}

FieldData.prototype.getLaneVariants = function(lane, laneDir)
{
  var self = this;

  // var dir = '';
  // for(var key in this.lanes)
  // {
  //   if(this.lanes[key] == lane)
  //   {
  //     dirLane = key;
  //     break;
  //   }
  //   console.log(key);
  // }
  // console.log(laneDir);

  // for(var i = 0; i < this.words.length; i++)
  // {
  //   if(this.words[i].lane == lane) return [];
  // }

  var laneVariants = [];
  var laneChars = [];

  var diapasons = [];

  for(var j = 0; j < lane.length; j++)
  {
    var laneCell = lane[j];
    var char = this.cells[laneCell.j][laneCell.i];
    if(char != null) laneChars.push({char: char, cell: laneCell});
  }
  if(laneChars.length == 0 || laneChars[0].cell != lane[0]) laneChars.unshift({char: null, cell: lane[0]});
  if(laneChars.length == 1 || laneChars[laneChars.length-1].cell != lane[lane.length-1]) laneChars.push({char: null, cell: lane[lane.length-1]});

  // GetingDiapasons
  for(var i = 0; i < laneChars.length-1; i++)
  {
    var cellStart = laneChars[i].cell;
    if(laneChars[i].char != null) 
    {
      var n = lane.indexOf(cellStart);
      cellStart = lane[n+1];
    }
    for(var j = i+1; j < laneChars.length; j++)
    {
      var cellEnd = laneChars[j].cell;
      if(laneChars[j].char != null) 
      {
        var n = lane.indexOf(cellEnd);
        cellEnd = lane[n-1];
      }
      // console.log('Diapason: s: ' + cellStart.i + ', '+ cellStart.j + '   e: ' + cellEnd.i + ', ' + cellEnd.j);
      var diapason = {cellStart: cellStart, cellEnd: cellEnd};
      if(checkDiapason(diapason)) diapasons.push(diapason); 
      // ToDo -> Add cheking inner start-end
    }
  }
  function checkDiapason(diapason)
  {
    if(diapason.cellStart.n > diapason.cellEnd.n) return false;

    var isStartBusy = false;
    var isEndBusy = false;
    // var isSX = false;
    // var isEX = false;
    for(var i = 0; i < self.words.length; i++)
    {
      var chars = self.words[i].chars;
      for(var j = 0; j < chars.length; j++)
      {
        if(diapason.cellStart.i == chars[j].i && diapason.cellStart.j == chars[j].j) 
        {
          isStartBusy = true;
          if(self.words[i].dir == laneDir || self.words[i].dir == Util.getAntiDirection(laneDir)) return false;
        }
        if(diapason.cellEnd.i == chars[j].i && diapason.cellEnd.j == chars[j].j) 
        {
          isEndBusy = true;
          if(self.words[i].dir == laneDir || self.words[i].dir == Util.getAntiDirection(laneDir)) return false;
        }
      }

      // console.log(laneDir, Util.getAntiDirection(laneDir));
    }

    if(isStartBusy && isEndBusy) return false;
    return true;
  }
  // console.log(diapasons);
  for(var i = 0; i < diapasons.length; i++)
  {
    var cellStart = diapasons[i].cellStart;
    var cellEnd = diapasons[i].cellEnd;
    if(cellStart == cellEnd || cellStart.n > cellEnd.n) continue;

    // var mask = '\\w{0,';
    var mask = '^';
    var shift = 0;

    var lastChar = null;
    var intersections = 0;
    
    for(var n = cellStart.n; n <= cellEnd.n; n++)
    {
      var laneCell = lane[n];
      var char = this.cells[laneCell.j][laneCell.i];

      if(char != null)
      {
        if(n == cellStart.n) 
        {
          mask += char;
          shift = 0;
          // console.log('ZZZZZ',char);
        }
        else if(lastChar == null)
        {
          mask += '\\w{0,'+shift+'}'+char;
          shift = 0;
        }
        else if(lastChar != null)
        {
          mask += '\\w{'+shift+'}'+char;
          shift = 0;
        }

        lastChar = char;
        intersections ++;
      }
      else if(n == cellEnd.n)
      {
        shift ++;
        mask += '\\w{0,'+shift+'}';
      }
      else shift ++;
    }
    mask +='$';

    var score = 0;
    if(intersections == 1) score = 3;
    else if(intersections == 2) score = 5;
    else if(intersections == 3) score = 10;

    if(intersections == 0 && Util.randomRangeInt(1, 100) <= 8) score = 25;
    if(intersections == 1 && Util.randomRangeInt(1, 100) <= 18) score = 15;
    if(intersections == 2 && Util.randomRangeInt(1, 100) <= 5) score = 35;


    var wordLength = Math.abs(cellEnd.n - cellStart.n)+1;
    if((wordLength == 3 && Util.randomRangeInt(1, 100) < 30) || (wordLength == 2)) continue;
    // if(wordLength == 3) score *= 0.7;
    // if(wordLength == 4) score *= 0.8;
    // console.log(wordLength, mask);
    
    laneVariants.push({lane: lane, cellStart: cellStart, cellEnd: cellEnd, mask: mask, intersections: intersections, score: score});
    // console.log(mask, intersections);
    // console.log('Diapason: s: ' + cellStart.i + ', '+ cellStart.j + '   e: ' + cellEnd.i + ', ' + cellEnd.j);
    // console.log(cellStart, cellEnd);
  }
  // console.log('zzz');

  // console.log(laneVariants);
  return laneVariants;
}

FieldData.prototype.getRandomWord = function(regexp, length)
{
  if(length == undefined) length = 1;

  var avaiableWords;
  if(regexp != undefined)
  {
    avaiableWords = [];
    for(var i = 0; i < this.wordsList.length; i++)
    {
      var word = this.wordsList[i];
      // if(word.match(regexp) && word.length >= length) avaiableWords.push(word);
      if(word.match(regexp) && word.length >= length) avaiableWords.push(word);
    }

    var wordVariants = [];
    if(avaiableWords.length > 0)
    {
      for(var i = 0; i < avaiableWords.length; i++)
      {
        var isAdd = true;
        for(var j = 0; j < this.words.length; j++)
        {
          if(avaiableWords[i] == this.words[j].word)
          {
            isAdd = false;
            break;
          }
        }

        if(isAdd) wordVariants.push({e: avaiableWords[i], c: avaiableWords[i].length * 3})
      }
    }

    if(wordVariants.length == 0) return null;
    // else return Util.randomElement(avaiableWords);
    return Util.getRandomVariant(wordVariants);
  }

  return null;
  // else return Util.randomElement(this.wordsList);
}

FieldData.prototype.getRandomChar = function()
{
  // var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // var char = str[Util.randomRangeInt(0, str.length-1)];
  var char = Util.getRandomVariant(app.gameData.letters);
  // console.log(char);

  return char;
}