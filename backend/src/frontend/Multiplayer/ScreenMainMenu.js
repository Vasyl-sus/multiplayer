var ScreenMainMenu = function(config)
{
  config.sizeType = 'relative';
  config.widthRelative = 1;
  config.heightRelative = 1;
  Gui.BasePanel.call(this, config);


  var self = this;

  this.state = 'hide';
  this.visible = false;
  this.interactiveChildren = false;
  // this.alpha = 0;

  this.logo = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'logo.png'));
  this.addChild(this.logo);
  this.logo.anchor.set(0.5, 0.5);
  this.logo.y = -330;
  // logo.visible = false;

  app.gameScene.y = 230;
  app.gameScene.roadWidth = 100;
  // app.gameScene.action({name: 'main_menu_walk'});

  this.containerDificults = new PIXI.Container();
  this.addChild(this.containerDificults);
  this.containerDificults.y = -157;

  this.buttonEasy = this.createDificultButton('easy', -300);
  this.buttonMedium = this.createDificultButton('medium', 0);
  this.buttonHard = this.createDificultButton('hard', 300);
  this.selectDificult('easy');

  this.buttonHome = Gui.createSimpleButton({name: 'button_home', parentPanel: this, width: 68, height: 68, positionType: 'left-top', xRelative: 10, yRelative: 10},
    {
      pathToSkin: 'button_home.png',
      onClick: function()
      {
        // todo check if this is the correct frontend domain
        window.location.href = "https://Multiplayer-frontend.coolmathgames.com/home";
      }
    });
  this.buttonHome.isClickSound = false;

  this.buttonPlay = Gui.createSimpleButton({name: 'button_play', parentPanel: this, width: 270, height: 116, x: 0, y: 363},
  {
    pathToSkin: 'ScreenMainMenu/button_play.png',
    onClick: function()
    {
      app.playAudio('sounds', 'sound_button_play');

      if(self.state != 'show') return;

      app.apiCallback('start', null);

      self.toGame();
    }
  });
  this.buttonPlay.isClickSound = false;

  function keyCallback()
  {
    if(self.state != 'show') return;

    app.playAudio('sounds', 'sound_button_play');

    app.apiCallback('start', null);

    self.toGame();
  }

  var keyCode = ' '.charCodeAt(0);
  var key = Util.keyboard(keyCode);
  key.press = keyCallback;
  
  keyCode = 13;
  key = Util.keyboard(keyCode);
  key.press = keyCallback;

  guiManager.on('orientation_change', this.onOrientationChange, this);
}
ScreenMainMenu.prototype = Object.create(Gui.BasePanel.prototype);
ScreenMainMenu.prototype.constructor = ScreenMainMenu;

ScreenMainMenu.prototype.createDificultButton = function(dificult, x)
{
  var button = new Gui.BaseButton({name: 'button_'+dificult, parentPanel: this, layer: this.containerDificults, width: 273, height: 128, x: x, y: 0});
  button.white = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'ScreenMainMenu/button_'+dificult+'_0001.png')), {parent: button, aX: 0.5, aY: 0.5, visible: true});
  button.black = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'ScreenMainMenu/button_'+dificult+'_0002.png')), {parent: button, aX: 0.5, aY: 0.5, visible: false});
  // this.buttonPlay.imgV = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'button_play_v.png')), {parent: this.buttonPlay, aX: 0.5, aY: 0.5, visible: false});
  // this.buttonPlay.imgH = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'button_play_h.png')), {parent: this.buttonPlay, aX: 0.5, aY: 0.5, visible: false});
  button.addClickListener(function(e)
  {
    if(this.state != 'show') return;

    var oldDificult = app.gameData.dificult;
    if(oldDificult == 'hard' || (oldDificult == 'medium' && (dificult == 'easy' || dificult == 'medium')) || dificult == 'easy') app.playAudio('sounds', 'sound_click');

    this.selectDificult(dificult);
  }, this);
  button.isClickSound = false;

  return button;
}
ScreenMainMenu.prototype.selectDificult = function(dificult)
{
  if(app.gameData.dificult == dificult) return;

  app.gameData.dificult = dificult;

  var button = null;
  if(dificult == 'easy') button = this.buttonEasy;
  if(dificult == 'medium') button = this.buttonMedium;
  if(dificult == 'hard') button = this.buttonHard;

  this.buttonEasy.black.visible = this.buttonMedium.black.visible = this.buttonHard.black.visible = false;
  this.buttonEasy.white.visible = this.buttonMedium.white.visible = this.buttonHard.white.visible = true;
  button.white.visible = false;
  button.black.visible = true;

  app.gameScene.action({name: 'main_menu_walk', balloonsCount: app.gameData.balloonsCount[dificult]});

  if(app.panelScore) app.panelScore.updateDisplay();
}

ScreenMainMenu.prototype.onOrientationChange = function(data)
{
  var orientation = data.orientation;

  if(orientation == 'portrait')
  {

  }  
  if(orientation == 'landscape')
  {

  }
}

ScreenMainMenu.prototype.toGame = function()
{
  this.tween({name: 'hide_anim'}, function()
  {
    app.screenGame.initGame({type: 'first_game'});
  });
  // app.screenGame.initGame();
  // app.screenGame.tween({name: 'show_anim'});
}

ScreenMainMenu.prototype.tween = function(data, callback)
{
  var self = this;

  if(data.name == 'show_anim' && this.state == 'hide')
  {
    this.state = 'show_anim';
    this.visible = true;

    var time = 20 / 30;

    TweenMax.to(this, time, {alpha: 1, x: 0, y: 0, ease: Power2.easeOut, onComplete: function()
    {
      self.tween({name: 'show'}, callback);
    }});

    // console.log(app.gameScene.x, app.gameScene.roadWidth);

    app.gameScene.x = 0;
    app.gameScene.y = 230;
    app.gameScene.roadWidth = 100;
    app.gameScene.action({name: 'main_menu_walk', balloonsCount: app.gameData.balloonsCount[app.gameData.dificult]});

    TweenMax.to(app.gameScene.whiteOver, time, {alpha: 0, ease: Power2.easeOut});
    

    TweenMax.to(this.logo, time, {y: -330, ease: Power2.easeOut});
    TweenMax.to(this.containerDificults, time, {y: -157, ease: Power2.easeOut});
    TweenMax.to(this.buttonPlay, time, {y: 363, ease: Power2.easeOut});

    // TweenMax.to(app.gameScene, time, {roadWidth: 250, ease: Power2.easeOut});
  }

  if(data.name == 'hide_anim' && this.state == 'show')
  {
    this.state = 'hide_anim';
    this.interactiveChildren = false;

    var time = 20 / 30;

    TweenMax.to(this, time, {alpha: 0, x: 0, y: 0, ease: Power2.easeOut, onComplete: function()
    {
      self.tween({name: 'hide'}, callback);
    }});

    TweenMax.to(this.logo, time, {y: -330-100, ease: Power2.easeOut});
    TweenMax.to(this.containerDificults, time, {y: -157-100, ease: Power2.easeOut});
    TweenMax.to(this.buttonPlay, time, {y: 363+100, ease: Power2.easeOut});

    TweenMax.to(app.gameScene, time, {roadWidth: 250, ease: Power2.easeOut});

    // TweenMax.to(app, 10/30, {bgSize: 900, ease: Power2.easeOut});
  }

  if(data.name == 'show_from_preloader')
  {
    this.state = 'show_anim';
    this.visible = true;

    app.whiteOver.alpha = 1;
    TweenMax.to(app.whiteOver, 14/30, {alpha: 0, ease: Power2.easeInOut, onComplete: function()
    {
      self.tween({name: 'show'});
    }});

    // this.alpha = 0;
    // app.gameScene.alpha = 0;
    // TweenMax.to(app.gameScene, 12/30, {alpha: 1, ease: Power2.easeOut});
    // TweenMax.to(this, 12/30, {alpha: 1, ease: Power2.easeOut, onComplete: function()
    // {
    //   self.tween({name: 'show'});
    // }});
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