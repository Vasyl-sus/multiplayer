var ScreenGame = function(config)
{
  config.sizeType = 'relative';
  config.widthRelative = 1;
  config.heightRelative = 1;
  Gui.BasePanel.call(this, config);


  var self = this;

  this.initBlockInputBg(1000, 1000, function()
  {

  });
  this.invisibleBg.interactive = false;

  this.state = 'hide';
  this.visible = false;
  this.gameState = 'none';

  this.buttonHome = Gui.createSimpleButton({name: 'button_home', parentPanel: this.parentPanel, width: 70, height: 70, positionType: 'left-top', xRelative: 0, yRelative: 10},
  {
    pathToSkin: 'button_home.png',
    onClick: function()
    {
      if(self.state != 'show') return;

      self.toMainMenu();
    }
  });
  this.buttonHome.visible = false;

  this.panelLetters = new PanelLetters({parentPanel: this, x: -240, y: -150});
  this.panelWord = new PanelWord({parentPanel: this, x: 0, y: -300});

  this.balloonsCount = 0;
  this.lettersLeft = 0;

  this.on('letter_guess', function()
  {
    // app.setScore(app.gameData.currentScore + 1);
    // app.playAudio('sounds', 'sound_correct_letter');

    this.lettersLeft --;

    if(this.lettersLeft == 0) this.gameWin();
    else app.gameScene.action({name: 'hero_right_word'});
  }, this);

  this.on('letter_miss', function()
  {
    this.balloonsCount --;
    if(this.balloonsCount > 0) app.gameScene.action({name: 'burst', balloonsCount: this.balloonsCount});
    else this.gameLose();
  }, this);

  this.textHint = Util.setParams(new Gui.TextBmp('Hint text',  constsManager.getData('text_configs/hint_text')), {parent: this, aX:0.5, aY:0.5, x: 0, y: -400});

  this.panelLose = new PanelLose({parentPanel: this});
  this.panelWin = new PanelWin({parentPanel: this});

  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(var i = 0; i < alphabet.length; i++)
  {

    createLetterKey(alphabet[i]);

    // var key = Util.keyboard(84);
    // keyT.press = function()
    // {
    //   app.screenGame.timesUp();
    // }
  }

  function createLetterKey(letter)
  {
    var keyCode = letter.charCodeAt(0);
    // console.log(keyCode);

    var key = Util.keyboard(keyCode);
    key.press = function()
    {
      // console.log('KeyPress:', keyCode + ', ' + letter)
      app.screenGame.tryGuessLetter(letter);
      // app.screenGame.solved();
    };
  }

  guiManager.on('orientation_change', this.onOrientationChange, this);
  // this.onOrientationChange({orientation: guiManager.orientation});
}
ScreenGame.prototype = Object.create(Gui.BasePanel.prototype);
ScreenGame.prototype.constructor = ScreenGame;

ScreenGame.prototype.onOrientationChange = function(data)
{
  var orientation = data.orientation;

  if(orientation == 'portrait')
  {

  }
  if(orientation == 'landscape')
  {

  }
}

ScreenGame.prototype.tryGuessLetter = function(letter)
{
  if(this.gameState != 'start' || this.state != 'show') return;

  // console.log(this.gameState);

  var letterButton = this.panelLetters.lettersHash[letter];
  if(!letterButton.isActive) return;

  var openCallback = function()
  {
    app.screenGame.emit('letters_open');
  }

  var isOpen = app.screenGame.panelWord.openLetter(letter, openCallback);
  letterButton.deactivate(isOpen);

  if(isOpen) app.screenGame.emit('letter_guess');
  else app.screenGame.emit('letter_miss');


}

ScreenGame.prototype.initGame = function(data, callback)
{
  var self = this;

  this.gameState = 'init';

  // this.balloonsCount = app.gameData.balloonsCount[app.gameData.dificult];
  // console.log(this.balloonsCount);

  if(data.type == 'first_game')
  {
    initField();

    app.gameScene.action({name: 'init_new_game', balloonsCount: this.balloonsCount}, function()
    {
      TweenMax.delayedCall(0.1, function()
      {
          self.tween({name: 'show_anim'});
      });
    });
  }
  else if(data.type == 'try_again' || data.type == 'play_next')
  {
    TweenMax.to(this.panelWord.whiteOver, 8/30, {alpha: 1, ease: Power2.easeOut});
    TweenMax.to(app.gameScene.whiteOver, 8/30, {alpha: 1, ease: Power2.easeOut, onComplete: function()
    {
      initField();

      app.gameScene.action({name: 'init_new_game_fast', balloonsCount: self.balloonsCount});
      TweenMax.to(self.panelWord.whiteOver, 8/30, {alpha: 0, ease: Power2.easeOut});
      TweenMax.to(app.gameScene.whiteOver, 8/30, {alpha: 0, ease: Power0.easeNone, onComplete: function()
      {
        if(callback) callback();
      }});
    }});
  }

  function initField()
  {
    self.wordData = app.getWord(app.gameData.dificult);
    var word = self.wordData.word;
    self.panelWord.initWord(word);

    self.textHint.text = self.wordData.hint;

    self.lettersLeft = self.panelWord.letters.length;
    self.balloonsCount = app.gameData.balloonsCount[app.gameData.dificult];

    self.panelLetters.reset();

    // console.log('Letters left', self.lettersLeft);
  }


  // console.log('Game Init:', this.balloonsCount, this.lettersLeft);
}

ScreenGame.prototype.startGame = function()
{
  this.gameState = 'start';

  this.panelLetters.interactive = this.panelLetters.interactiveChildren = true;
}

document.addEventListener("adBreakStart", () => {
  console.log("AdBreak Started");
  //TODO:  Developer needs to add the logic to pause the game and sound here
});
// To trigger the event Listener  adBreakComplete
document.addEventListener("adBreakComplete", () => {
  console.log("adBreak Complete");
  soundsManager.switchSoundState();
  //TODO:  Developer needs to add the logic to resume the game and sound here
});

ScreenGame.prototype.gameWin = function()
{
  var self = this;
  // console.log('Game Win!');

  this.gameState = 'waiting';

  this.panelLetters.interactive = this.panelLetters.interactiveChildren = false;

  this.once('letters_open', function()
  {
    TweenMax.delayedCall(5/30, function()
    {
      app.gameScene.action({name: 'win', balloonsCount: self.balloonsCount}, function()
      {
        app.playAudio('sounds', 'sound_solved');
        self.panelWin.tween({name: 'show_anim', balloonsCount: self.balloonsCount}, function()
        {
          // app.gameScene.hero.stop();
          self.gameState = 'win';
        });
      });
    });
  }, this);

  app.gameData.usedWordsId.push(app.wordsList.indexOf(this.wordData));
  app.gameData.gamePlayed ++;
  if(app.gameData.gamePlayed > 9999) app.gameData.gamePlayed = 9999;

  app.apiCallback('statistics', {result: 'success', score: app.getScore() + this.balloonsCount, word: this.wordData.word});
  // console.log(app.gameData.usedWordsId);

  // app.save();

  // app.setScore(app.gameData.currentScore + 10);
}

ScreenGame.prototype.gameLose = function()
{
  var self = this;
  // console.log('Game Lose!');
  this.gameState = 'waiting';

  this.panelLetters.interactive = this.panelLetters.interactiveChildren = false;

  var score = app.getScore();
  app.gameScene.action({name: 'lose'}, function()
  {
    self.panelWord.reviveWord(function()
    {
      TweenMax.delayedCall(10/30, function()
      {
        app.playAudio('sounds', 'sound_lose');
        self.panelLose.tween({name: 'show_anim', score: score}, function()
        {
          self.gameState = 'lose';
        });
      });
    });
  });

  app.gameData.gamePlayed ++;
  if(app.gameData.gamePlayed > 9999) app.gameData.gamePlayed = 9999;
  app.setScore(0);

  app.apiCallback('statistics', {result: 'failture', score: app.getScore(), word: this.wordData.word});
}

ScreenGame.prototype.toMainMenu = function()
{
  // if(this.state != 'show' || this.gameState != 'start' || this.panelWin.state != 'hide' || this.panelLose.state != 'hide') return;
  if(this.state != 'show' || this.gameState == 'waiting') return;


  if(this.panelWin.state == 'hide' && this.panelLose.state == 'hide')
  {
    this.tween({name: 'hide_anim'}, function()
    {
      app.screenMainMenu.tween({name: 'show_anim'});
    });
  }
  else if(this.panelWin.state == 'show' || this.panelLose.state == 'show')
  {
    this.tween({name: 'hide_anim'}, function()
    {
      app.screenMainMenu.tween({name: 'show_anim'});
    });

    if(this.panelWin.state == 'show') this.panelWin.tween({name: 'hide_anim'});
    if(this.panelLose.state == 'show') this.panelLose.tween({name: 'hide_anim'});
  }
}

ScreenGame.prototype.tween = function(data, callback)
{
  var self = this;

  if(data.name == 'show_anim' && this.state == 'hide')
  {
    this.state = 'show_anim';

    this.visible = true;
    this.alpha = 0;

    var time = 25/30;
    var showDelay = 5/30;

    TweenMax.to(this, time, {alpha: 1, x: 0, y: 0, ease: Power2.easeOut, delay: showDelay, onComplete: function()
    {
      self.tween({name: 'show'}, callback);

      self.startGame();
    }});

    // console.log(this.alpha);

    TweenMax.to(app.gameScene, 1, {x: 300, y: 320, roadWidth: 250, ease: Power1.easeInOut});

    this.panelWord.y = -300 - 100;
    TweenMax.to(this.panelWord, time, {y: -300, ease: Power2.easeOut, delay: showDelay});
    this.panelLetters.x = -240 - 100;
    TweenMax.to(this.panelLetters, time, {x: -240, ease: Power2.easeOut, delay: showDelay});
    this.textHint.y = -400-100;
    TweenMax.to(this.textHint, time, {y: -400, ease: Power2.easeOut, delay: showDelay});

    // TweenMax.to(app.buttonAudio, time, {xRelative: 90, ease: Power2.easeOut, delay: showDelay});

    this.buttonHome.visible = true;
    this.buttonHome.alpha = 0;
    this.buttonHome.xRelative = -80;
    TweenMax.to(this.buttonHome, time, {alpha: 1, xRelative: 10, ease: Power2.easeOut, delay: showDelay});

    this.panelLose.visible = false;
    this.panelWin.visible = false;
  }

  if(data.name == 'hide_anim' && this.state == 'show')
  {
    this.state = 'hide_anim';
    this.interactiveChildren = false;

    var time = 25/30;
    var showDelay = 0/30;

    TweenMax.to(app.gameScene, time, {x: 300+100, ease: Power2.easeOut});
    TweenMax.to(app.gameScene.whiteOver, time, {alpha: 1, ease: Power2.easeOut});

    TweenMax.to(this.panelWord, time, {y: -300-100, ease: Power2.easeOut, delay: showDelay});
    TweenMax.to(this.panelLetters, time, {x: -240-100, ease: Power2.easeOut, delay: showDelay});
    TweenMax.to(this.textHint, time, {y: -400-100, ease: Power2.easeOut, delay: showDelay});

    // TweenMax.to(app.buttonAudio, time, {xRelative: 10, ease: Power2.easeOut, delay: showDelay});

    TweenMax.to(this.buttonHome, time, {alpha: 0, xRelative: -80, ease: Power2.easeOut, delay: showDelay, onComplete: function()
    {
      self.buttonHome.visible = false;
    }});

    TweenMax.to(this, time, {alpha: 0, x: 0, y: 0, ease: Power2.easeOut, delay: showDelay, onComplete: function()
    {
      self.tween({name: 'hide'}, callback);
    }});
  }

  if(data.name == 'show' && this.state != 'show')
  {
    this.state = 'show';
    this.visible = true;
    this.interactiveChildren = true;

    if(callback) callback();
  }
  if(data.name == 'hide' && this.state != 'hide')
  {
    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    if(callback) callback();
  }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelLetters = function(config)
{
  config.sizeType = 'absolute';
  config.width = 525;
  config.height = 460;
  Gui.BasePanel.call(this, config);


  var self = this;

  var letterSize = 90;

  this.letters = [];
  this.lettersHash = {};

  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var letterX = letterSize * -2.5;
  var letterY = 0;
  for(var i = 0; i < alphabet.length; i++)
  {
    var char = alphabet[i];
    var letter = new Letter({parentPanel: this, x: letterX, y: letterY, letterN: i, char: char});

    if((i+1)%6 == 0)
    {
      letterX = letterSize * -2.5;
      letterY += letterSize+10;
    }
    else letterX += letterSize;

    this.letters.push(letter);
    this.lettersHash[char] = letter;
  }
}
PanelLetters.prototype = Object.create(Gui.BasePanel.prototype);
PanelLetters.prototype.constructor = PanelLetters;

PanelLetters.prototype.reset = function()
{
  for(var i = 0; i < this.letters.length; i++)
  {
    this.letters[i].activate();
  }
}

Letter = function(config)
{
  Gui.BaseButton.call(this, config);


  this.char = config.char;
  this.letterN = config.letterN;

  this.sprite = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'ScreenGame/letters/letter_'+Util.getSpriteN(this.letterN+1)+'.png'));
  this.addChild(this.sprite);
  this.sprite.anchor.set(0.5, 0.5);

  this.letterCross = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'ScreenGame/letter_cross.png'));
  this.addChild(this.letterCross);
  this.letterCross.anchor.set(0.5, 0.5);
  this.letterCross.visible = false;

  this.addClickListener(function(e)
  {
    // if(app.gameScene.hero.state != 'idle') return;
    app.screenGame.tryGuessLetter(this.char);

    // var openCallback = function()
    // {
    //   // console.log("OOOOOO");
    //   app.screenGame.emit('letters_open');
    // }
    // var isOpen = app.screenGame.panelWord.openLetter(this.char, openCallback);

    // if(isOpen) app.screenGame.emit('letter_guess');
    // else app.screenGame.emit('letter_miss');

    // this.deactivate(isOpen);
  }, this);

  this.isClickSound = false;

  this.isActive = false;
}
Letter.prototype = Object.create(Gui.BaseButton.prototype);
Letter.prototype.constructor = Letter;

Letter.prototype.activate = function()
{
  this.isActive = true;

  this.sprite.alpha = 1;

  this.interactive = true;

  this.letterCross.visible = false;
}
Letter.prototype.deactivate = function(isOpen)
{
  this.isActive = false;

  this.sprite.alpha = 0.2;

  this.interactive = false;

  if(!isOpen) this.letterCross.visible = true;
  else this.letterCross.visible = false;
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelWord = function(config)
{
  config.sizeType = 'absolute';
  config.width = 800;
  config.height = 100;
  Gui.BasePanel.call(this, config);


  var self = this;

  this.containerWord = new PIXI.Container();
  this.addChild(this.containerWord);

  this.word = null;
  this.displayedWord = null;
  // this.textWord = Util.setParams(new Gui.TextBmp('A___V__ _AXC_S_D',  constsManager.getData('text_configs/game_word')), {parent: this, aX:0.5, aY:0.5, x: 0, y: 0});
  this.wordChars = [];
  this.letters = [];

  this.CHAR_W = 54;
  this.CHAR_H = 90;

  this.whiteOver = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'white_rect.png'));
  this.addChild(this.whiteOver);
  this.whiteOver.width = 1000;
  this.whiteOver.height = 200;
  this.whiteOver.anchor.set(0.5, 0.5);
  this.whiteOver.alpha = 0;
  // this.whiteOver.y = -200;
  this.autofillChars = [' ', '\'', '\"', '!', '?', '&', '.', ',', '-'];
  this.alphabet = [];
  var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(var i = 0; i < s.length; i++) this.alphabet.push(s[i]);
  this.avaiableChars = this.autofillChars.concat(this.alphabet);
  // console.log(this.avaiableChars);
}
PanelWord.prototype = Object.create(Gui.BasePanel.prototype);
PanelWord.prototype.constructor = PanelWord;

PanelWord.prototype.initWord = function(word)
{
  var self = this;

  this.word = word.toUpperCase();
  this.displayedWord = '';

  this.letters = [];
  for(var i = 0; i < this.word.length; i++)
  {
    var char = this.word[i];
    if(this.avaiableChars.indexOf(char) == -1) continue;

    if(this.autofillChars.indexOf(char) == -1)
    {
      // console.log('Char:', char);

      if(this.letters.indexOf(char) == -1) this.letters.push(char);
    }
  }

  //

  for(var i = 0; i < this.wordChars.length; i++) this.wordChars[i].destroy();
  this.wordChars = [];

  var lettersLeft = 0;

  for(var i = 0; i < this.word.length; i++)
  {
    var char = this.word[i];
    if(this.avaiableChars.indexOf(char) == -1) continue;

    var wordChar = new PIXI.Sprite();
    this.containerWord.addChild(wordChar);
    wordChar.anchor.set(0.5, 0.5);

    if(this.autofillChars.indexOf(char) == -1)
    {
      wordChar.texture = assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0027.png');
      this.displayedWord += '_';

      lettersLeft ++;
    }
    else
    {
      wordChar.texture = getAutofillTexture(char);
      this.displayedWord += char;
      // console.log(char, wordChar.texture);
    }

    wordChar.x = i * this.CHAR_W;
    wordChar.y = 0;

    this.wordChars.push(wordChar);
  }
  this.containerWord.x = -this.containerWord.width / 2 + this.CHAR_W/2;
  // this.containerWord.x = this.CHAR_W*this.word.length/2 + this.CHAR_W/2;

  function getAutofillTexture(char, wordChar)
  {
    if(char == ' ') return assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0036.png');
    if(char == '\'') return assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0028.png');
    if(char == '\"') return assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0029.png');
    if(char == '?') return assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0030.png');
    if(char == '!') return assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0031.png');
    if(char == '&') return assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0032.png');
    if(char == '.') return assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0033.png');
    if(char == ',') return assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0034.png');
    if(char == '-') return assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_0035.png');

    return null;
  }

  return lettersLeft;

  // this.updateDisplay();

  // console.log('Word inti:', this.word, this.letters);
}

PanelWord.prototype.openChar = function(charN, delay, callback, isSound)
{
  if(delay == undefined) delay = 0;
  if(callback == undefined) callback = null;
  if(isSound == undefined) isSound = false;

  var wordChar = this.wordChars[charN];

  this.displayedWord = this.displayedWord.replaceAt(charN, this.word[charN]);
  // console.log(this.displayedWord);

  var char = this.word[charN];
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var charTexture = assetsManager.getTexture('texture_atlas', 'ScreenGame/word_letters/letter_'+Util.getSpriteN(alphabet.indexOf(char) + 1)+'.png');

  if(delay == 0)
  {
    switchChar();
  }
  else
  {
    TweenMax.delayedCall(delay, function()
    {
      switchChar();
    });
  }

  function switchChar()
  {
    wordChar.texture = charTexture;
    wordChar.y = -15;
    wordChar.alpha = 0;
    TweenMax.to(wordChar, 10/30, {y: 0, alpha: 1, ease: Power2.easeOut, onComplete: function()
    {
      if(callback) callback();
    }});

    if(isSound) app.playAudio('sounds', 'sound_correct_letter');
  }
}

PanelWord.prototype.reviveWord = function(callback)
{
  // console.log(this.displayedWord);
  var count = 0;
  for(var i = 0; i < this.displayedWord.length; i++)
  {
    if(this.displayedWord[i] != '_') continue;

    this.openChar(i, 5/30*count, charOpened);
    count ++;
  }

  var openCount = 0;
  function charOpened()
  {
    openCount ++;

    if(openCount == count) callback();
  }
}

PanelWord.prototype.clearDisplay = function()
{

}

PanelWord.prototype.openLetter = function(char, callback)
{
  char = char.toUpperCase();
  var n = this.letters.indexOf(char);

  if(n == -1) return false;

  this.letters.splice(n, 1);

  var count = 0;
  for(var i = 0; i < this.word.length; i++)
  {
    if(this.word[i] == char)
    {
      this.openChar(i, 8/30*count, charOpened, true);
      count ++;
    }
  }

  var openCount = 0;
  function charOpened()
  {
    openCount ++;
    if(openCount == count && callback) callback();
  }

  return true;
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelLose = function(config)
{
  config.sizeType = 'absolute';
  config.width = 800;
  config.height = 100;
  Gui.BasePanel.call(this, config);


  var self = this;

  this.initBlockInputBg(1500, 1500, function()
  {

  });
  this.invisibleBg.alpha = 0.7;
  // this.invisibleBg.interactive = false;

  this.bg = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'ScreenGame/panel_lose_bg.png'));
  this.addChild(this.bg);
  this.bg.anchor.set(0.5, 0.5);

  this.textScore = Util.setParams(new Gui.TextBmp('BEST: 33',  constsManager.getData('text_configs/lose_score_text')), {parent: this, aX:0.5, aY:0.5, x: 0, y: 80});

  this.iconBalloon = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'icon_balloon.png'));
  this.addChild(this.iconBalloon);
  this.iconBalloon.anchor.set(0.5, 0.5);
  this.iconBalloon.y = 85;

  this.buttonPlay = Gui.createSimpleButton({parentPanel: this.parentPanel, width: 308, height: 112, x: 0, y: 240},
  {
    pathToSkin: 'ScreenGame/button_play_again.png',
    onClick: function()
    {
      app.playAudio('sounds', 'sound_button_play');

      if(self.state != 'show') return;

      app.screenGame.initGame({type: 'try_again'}, function()
      {

      });

      self.tween({name: 'hide_anim'}, function()
      {
        app.screenGame.startGame();
      });

      app.apiCallback('start');
    }
  });
  this.buttonPlay.isClickSound = false;
  this.buttonPlay.interactive = this.buttonPlay.interactiveChildren = false;
  this.buttonPlay.visible = false;
  this.buttonPlay.alpha = 0;


  function keyCallback()
  {
    if(self.state != 'show') return;

    app.playAudio('sounds', 'sound_button_play');

    app.screenGame.initGame({type: 'try_again'}, function()
    {

    });

    self.tween({name: 'hide_anim'}, function()
    {
      app.screenGame.startGame();
    });

    app.apiCallback('start');
  }

  var keyCode = ' '.charCodeAt(0);
  var key = Util.keyboard(keyCode);
  key.press = keyCallback;

  keyCode = 13;
  key = Util.keyboard(keyCode);
  key.press = keyCallback;



  this.state = 'hide';
  this.visible = false;
  this.interactive = false;
}
PanelLose.prototype = Object.create(Gui.BasePanel.prototype);
PanelLose.prototype.constructor = PanelLose;

PanelLose.prototype.tween = function(data, callback)
{
  var self = this;

  if(data.name == 'show_anim' && this.state == 'hide')
  {
    this.state = 'show_anim';

    this.visible = true;
    this.alpha = 0;

    this.textScore.text = 'You saved ' + data.score;
    this.iconBalloon.x = this.textScore.x + this.textScore.width/2 + 30;

    var time = 20/30;

    this.alpha = 0;
    this.y = -30-100;
    TweenMax.to(this, time, {alpha: 1, x: 0, y: -30, ease: Power2.easeOut, onComplete: function()
    {
      self.buttonPlay.interactive = self.buttonPlay.interactiveChildren = true;

      self.tween({name: 'show'}, callback);
    }});

    this.buttonPlay.visible = true;
    this.buttonPlay.alpha = 0;
    this.buttonPlay.y = 210 + 100;
    TweenMax.to(this.buttonPlay, time, {alpha: 1, y: 210, ease: Power2.easeOut});
  }

  if(data.name == 'hide_anim' && this.state == 'show')
  {
    this.state = 'hide_anim';
    this.interactiveChildren = false;

    var time = 20/30;

    TweenMax.to(this, time, {alpha: 0, x: 0, y: -30-100, ease: Power2.easeOut, onComplete: function()
    {
      self.tween({name: 'hide'}, callback);
    }});

    TweenMax.to(this.buttonPlay, time, {alpha: 0, y: 210+100, ease: Power2.easeOut});
    this.buttonPlay.interactive = this.buttonPlay.interactiveChildren = false;

    // TweenMax.to(app, 10/30, {bgSize: 900, ease: Power2.easeOut});
  }

  if(data.name == 'show' && this.state != 'show')
  {
    this.state = 'show';
    this.visible = true;
    this.interactiveChildren = true;

    if(callback) callback();
  }
  if(data.name == 'hide' && this.state != 'hide')
  {
    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    if(callback) callback();
  }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelWin = function(config)
{
  config.sizeType = 'absolute';
  config.width = 800;
  config.height = 100;
  Gui.BasePanel.call(this, config);


  var self = this;

  this.initBlockInputBg(1500, 1500, function()
  {

  });
  this.invisibleBg.alpha = 0.7;
  // this.invisibleBg.interactive = false;

  this.bg = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'ScreenGame/panel_win_bg.png'));
  this.addChild(this.bg);
  this.bg.anchor.set(0.5, 0.5);
  this.bg.y = -5;

  this.titleSolved = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'ScreenGame/title_solved.png'));
  this.addChild(this.titleSolved);
  this.titleSolved.anchor.set(0.5, 0.5);
  this.titleSolved.y = -50;

  this.titlePerfect = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'ScreenGame/title_perfect.png'));
  this.addChild(this.titlePerfect);
  this.titlePerfect.anchor.set(0.5, 0.5);
  this.titlePerfect.y = -50;

  this.containerScore = new PIXI.Container();
  this.addChild(this.containerScore);
  this.containerScore.y = 100;

  this.textScore = Util.setParams(new Gui.TextBmp('+3',  constsManager.getData('text_configs/lose_score_text')), {parent: this.containerScore, aX:0.5, aY:0.5, x: 0, y: 0});

  this.balloonIcon = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'icon_balloon.png'));
  this.containerScore.addChild(this.balloonIcon);
  this.balloonIcon.anchor.set(0.5, 0.5);

  this.buttonPlay = Gui.createSimpleButton({parentPanel: this.parentPanel, width: 308, height: 112, x: 0, y: 240},
  {
    pathToSkin: 'ScreenGame/button_next_puzzle.png',
    onClick: function()
    {
      app.playAudio('sounds', 'sound_button_play');
      if(self.state != 'show') return;
      
      // adbreak
      soundsManager.switchSoundState();
      cmgAdBreak();

      app.screenGame.initGame({type: 'play_next'}, function()
      {

      });

      self.tween({name: 'hide_anim'}, function()
      {
        app.screenGame.startGame();
      });

      app.apiCallback('start');
    }
  });
  this.buttonPlay.isClickSound = false;
  this.buttonPlay.interactive = this.buttonPlay.interactiveChildren = false;
  this.buttonPlay.visible = false;
  this.buttonPlay.alpha = 0;

  function keyCallback()
  {
    if(self.state != 'show') return;

    app.playAudio('sounds', 'sound_button_play');

    // adbreak
    soundsManager.switchSoundState();
    cmgAdBreak();

    app.screenGame.initGame({type: 'play_next'}, function()
    {

    });

    self.tween({name: 'hide_anim'}, function()
    {
      app.screenGame.startGame();
    });

    app.apiCallback('start');
  }

  var keyCode = ' '.charCodeAt(0);
  var key = Util.keyboard(keyCode);
  key.press = keyCallback;

  keyCode = 13;
  key = Util.keyboard(keyCode);
  key.press = keyCallback;

  this.state = 'hide';
  this.visible = false;
  this.interactive = false;
}
PanelWin.prototype = Object.create(Gui.BasePanel.prototype);
PanelWin.prototype.constructor = PanelWin;

PanelWin.prototype.initBalloons = function(count)
{
  var startBalloon = 7 - count + 1;
  this.balloons = [];
  // for(var i = 0; i < count; i++)
  for(var i = count; i > 0; i--)
  {
    var balloon = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'icon_balloon_000'+(startBalloon + (count-i)) + '.png'));
    this.containerScore.addChildAt(balloon, 2);
    balloon.anchor.set(0.5, 0.5);

    balloon.x = this.textScore.x + this.textScore.width/2 + 30;
    balloon.y = 0;

    this.balloons.push(balloon);
  }
}

PanelWin.prototype.startBalloons = function()
{
  app.panelScore.startBalloons(this.balloons);
}

PanelWin.prototype.tween = function(data, callback)
{
  var self = this;

  if(data.name == 'show_anim' && this.state == 'hide')
  {
    this.state = 'show_anim';

    this.visible = true;
    this.alpha = 0;

    var isPerfect = app.gameData.balloonsCount[app.gameData.dificult] == data.balloonsCount;
    this.titleSolved.visible = this.titlePerfect.visible = false;
    if(isPerfect) this.titlePerfect.visible = true;
    else this.titleSolved.visible = true;

    // this.textScore.text = 'You saved '+data.balloonsCount;
    this.textScore.text = data.balloonsCount;

    this.balloonIcon.x = this.textScore.x + this.textScore.width/2 + 30;
    this.balloonIcon.y = 0;

    this.initBalloons(data.balloonsCount);

    this.containerScore.x = -this.containerScore.width/2 + 10;

    var time = 20/30;

    this.alpha = 0;
    this.y = -30-100;
    TweenMax.to(this, time, {alpha: 1, x: 0, y: -30, ease: Power2.easeOut, onComplete: function()
    {
      self.buttonPlay.interactive = self.buttonPlay.interactiveChildren = true;

      self.tween({name: 'show'}, callback);

      self.startBalloons();
    }});

    this.buttonPlay.visible = true;
    this.buttonPlay.alpha = 0;
    this.buttonPlay.y = 210 + 100;
    TweenMax.to(this.buttonPlay, time, {alpha: 1, y: 210, ease: Power2.easeOut});

    app.panelScore.layerBalloons.alpha = 0;
    TweenMax.to(app.panelScore.layerBalloons, time, {alpha: 1, ease: Power2.easeOut});
  }

  if(data.name == 'hide_anim' && this.state == 'show')
  {
    this.state = 'hide_anim';
    this.interactiveChildren = false;

    var time = 20/30;

    TweenMax.to(this, time, {alpha: 0, x: 0, y: -30-100, ease: Power2.easeOut, onComplete: function()
    {
      self.tween({name: 'hide'}, callback);
    }});

    TweenMax.to(this.buttonPlay, time, {alpha: 0, y: 210+100, ease: Power2.easeOut});
    this.buttonPlay.interactive = this.buttonPlay.interactiveChildren = false;

    app.panelScore.layerBalloons.alpha = 1;
    TweenMax.to(app.panelScore.layerBalloons, time, {alpha: 0, ease: Power2.easeOut});
    // TweenMax.to(app, 10/30, {bgSize: 900, ease: Power2.easeOut});
  }

  if(data.name == 'show' && this.state != 'show')
  {
    this.state = 'show';
    this.visible = true;
    this.interactiveChildren = true;

    if(callback) callback();
  }
  if(data.name == 'hide' && this.state != 'hide')
  {
    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    if(callback) callback();
  }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelScore = function(config)
{
  config.sizeType = 'absolute';
  config.width = 260;
  config.height = 100;
  config.positionType = 'right-top';
  config.xRelative = -35;
  config.yRelative = 10;
  Gui.BasePanel.call(this, config);


  var self = this;

  this.iconBalloon = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'icon_balloon.png'));
  this.addChild(this.iconBalloon);
  this.iconBalloon.anchor.set(0.5, 0.5);

  this.textCurrentScore = Util.setParams(new Gui.TextBmp('SAVED: 12',  constsManager.getData('text_configs/score_panel_text')), {parent: this, aX:0.0, aY:0.5, x: 30, y: -28});
  this.textBestScore = Util.setParams(new Gui.TextBmp('BEST: 33',  constsManager.getData('text_configs/score_panel_text')), {parent: this, aX:0.0, aY:0.5, x: 46, y: 18});

  this.layerBalloons = new PIXI.Container();
  this.addChild(this.layerBalloons);
}
PanelScore.prototype = Object.create(Gui.BasePanel.prototype);
PanelScore.prototype.constructor = PanelScore;

PanelScore.prototype.updateDisplay = function()
{
  var scoreData = app.gameData.score[app.gameData.dificult];
  this.textCurrentScore.text = 'SAVED: '+ scoreData.current;
  this.textBestScore.text = 'BEST: '+ scoreData.best;
}

PanelScore.prototype.startBalloons = function(balloons)
{
  var self = this;

  var dificult = app.gameData.dificult;

  for(var i = 0; i < balloons.length; i++)
  {
    var balloon = balloons[i];
    var p = balloon.parent.toGlobal(balloon);
    p = this.layerBalloons.toLocal(p);
    this.layerBalloons.addChildAt(balloon, 0);
    balloon.x = p.x;
    balloon.y = p.y;
    tweenBalloon(balloon, 5/30*i);
  }

  function tweenBalloon(balloon, delay)
  {
    // bezier:{type:"quadratic", values:[{x:this.x, y:this.y}, {x:-250, y:0}, {x:app.panelHero.x - 21, y:app.panelHero.y - 100}]}

    // TweenMax.to(balloon, 1.5, {x: 0, y: 0, ease: Power2.easeInOut, delay: delay, onComplete: function()
    TweenMax.to(balloon, 1.0, {bezier:{type:"quadratic", values:[{x:balloon.x, y:balloon.y}, {x:balloon.x + 200, y:balloon.y}, {x: 0, y:0}]}, ease: Power2.easeIn, delay: delay, onComplete: function()
    {
      self.layerBalloons.removeChild(balloon);
      balloon.destroy();

      app.setScore(app.getScore(dificult) + 1, dificult);

      app.playAudio('sounds', 'sound_add_balloon');
    }});
  }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelHelp = function(config)
{
  config.sizeType = 'absolute';
  config.width = 800;
  config.height = 100;
  Gui.BasePanel.call(this, config);


  var self = this;

  this.initBlockInputBg(1500, 1500, function()
  {
    if(self.state == 'show') self.tween({name: 'hide_anim'});
  });
  this.invisibleBg.alpha = 0.7;
  // this.invisibleBg.interactive = false;

  this.bg = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'ScreenGame/panel_help_bg.png'));
  this.addChild(this.bg);
  this.bg.anchor.set(0.5, 0.5);

  // this.textScore = Util.setParams(new Gui.TextBmp('BEST: 33',  constsManager.getData('text_configs/lose_score_text')), {parent: this, aX:0.5, aY:0.5, x: 0, y: 80});

  this.buttonPlay = Gui.createSimpleButton({parentPanel: this.parentPanel, width: 308, height: 112, x: 0, y: 240},
  {
    pathToSkin: 'ScreenGame/button_ok.png',
    onClick: function()
    {
      if(self.state != 'show') return;

      self.tween({name: 'hide_anim'}, function()
      {
        // app.screenGame.startGame();
      });
    }
  });
  this.buttonPlay.interactive = this.buttonPlay.interactiveChildren = false;
  this.buttonPlay.visible = false;
  this.buttonPlay.alpha = 0;

  this.state = 'hide';
  this.visible = false;
  this.interactive = false;
}
PanelHelp.prototype = Object.create(Gui.BasePanel.prototype);
PanelHelp.prototype.constructor = PanelHelp;

PanelHelp.prototype.tween = function(data, callback)
{
  var self = this;

  if(data.name == 'show_anim' && this.state == 'hide')
  {
    this.state = 'show_anim';

    this.visible = true;
    this.alpha = 0;

    // app.setScore(0);
    // app.save();

    var time = 20/30;

    this.alpha = 0;
    this.y = -30-100;
    TweenMax.to(this, time, {alpha: 1, x: 0, y: -30, ease: Power2.easeOut, onComplete: function()
    {
      self.buttonPlay.interactive = self.buttonPlay.interactiveChildren = true;

      self.tween({name: 'show'}, callback);
    }});

    this.buttonPlay.visible = true;
    this.buttonPlay.alpha = 0;
    this.buttonPlay.y = 230 + 100;
    TweenMax.to(this.buttonPlay, time, {alpha: 1, y: 230, ease: Power2.easeOut});
  }

  if(data.name == 'hide_anim' && this.state == 'show')
  {
    this.state = 'hide_anim';
    this.interactiveChildren = false;

    var time = 20/30;

    TweenMax.to(this, time, {alpha: 0, x: 0, y: -30-100, ease: Power2.easeOut, onComplete: function()
    {
      self.tween({name: 'hide'}, callback);
    }});

    TweenMax.to(this.buttonPlay, time, {alpha: 0, y: 230+100, ease: Power2.easeOut});
    this.buttonPlay.interactive = this.buttonPlay.interactiveChildren = false;

    // TweenMax.to(app, 10/30, {bgSize: 900, ease: Power2.easeOut});
  }

  if(data.name == 'show' && this.state != 'show')
  {
    this.state = 'show';
    this.visible = true;
    this.interactiveChildren = true;

    if(callback) callback();
  }
  if(data.name == 'hide' && this.state != 'hide')
  {
    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    if(callback) callback();
  }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelRotate = function(config)
{
  config.sizeType = 'absolute';
  config.width = 800;
  config.height = 100;
  Gui.BasePanel.call(this, config);


  var self = this;

  this.initBlockInputBg(1500, 1500, function()
  {
    // if(self.state == 'show') self.tween({name: 'hide_anim'});
  });
  this.invisibleBg.alpha = 1.0;
  this.invisibleBg.width = this.invisibleBg.height = 5000;
  // this.invisibleBg.interactive = false;

  this.bg = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'rotate_screen.png'));
  this.addChild(this.bg);
  this.bg.anchor.set(0.5, 0.5);

  // this.textScore = Util.setParams(new Gui.TextBmp('BEST: 33',  constsManager.getData('text_configs/lose_score_text')), {parent: this, aX:0.5, aY:0.5, x: 0, y: 80});

  this.state = 'hide';
  this.visible = false;
  this.interactive = false;
}
PanelRotate.prototype = Object.create(Gui.BasePanel.prototype);
PanelRotate.prototype.constructor = PanelRotate;

PanelRotate.prototype.tween = function(data, callback)
{
  var self = this;

  if(data.name == 'show' && this.state != 'show')
  {
    this.state = 'show';
    this.visible = true;
    this.interactiveChildren = true;

    if(callback) callback();
  }
  if(data.name == 'hide' && this.state != 'hide')
  {
    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    if(callback) callback();
  }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
