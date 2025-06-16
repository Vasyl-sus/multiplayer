var Animation = function()
{
  PIXI.Container.call(this);


  this.sequences = {};
  this.sequence = null;

  this.lastSequence = null;
  this.lastFrame = -1;

  app.addForUpdate(this.update, this);
}
Animation.prototype = Object.create(PIXI.Container.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype.addSequence = function(name, textureAtlas, path, nStart, nEnd, fps, data)
{
  var self = this;

  var frames = [];
  for(var i = nStart; i <= nEnd; i++)
  {
    var n = '';
    if(i < 10) n = '000'+i;
    else if(i < 100) n = '00'+i;
    else if(i < 1000) n = '0'+i;
    frames.push(assetsManager.getTexture(textureAtlas, path+n+'.png'));
  }

  // var animation = new PIXI.extras.MovieClip(frames);
  var animation = new PIXI.extras.AnimatedSprite(frames);
  this.addChild(animation);
  animation.animationSpeed = fps / 60;

  var aX = data.aX != undefined?data.aX:0;
  var aY = data.aY != undefined?data.aY:0;
  if(!(aX == 0 && aY == 0)) animation.anchor.set(aX, aY);
  var pivotX = data.pivotX != undefined?data.pivotX:0;
  var pivotY = data.pivotY != undefined?data.pivotY:0;
  animation.pivot.x = pivotX;
  animation.pivot.y = pivotY;
  animation.x = data.x != undefined?data.x:0;
  animation.y = data.y != undefined?data.y:0;

  // console.log(aX, aY, animation.anchor);

  animation.visible = false;
  // animation.onFrameChange = this.onFrameChange;
  // console.log(animation);

  var loop = data.loop == undefined?true:data.loop;

  var sequence = {name: name, animation: animation, fps: fps, loop: loop};
  this.sequences[name] = sequence;

  animation.onFrameChange = function(frame)
  {
    self.onFrameChange(frame+1, sequence);
  }  
  // animation.onComplete = function(frame)
  // {
  //   console.log('zzz');
  //   self.onComplete(sequence);
  // }
}

Animation.prototype.switchSequence = function(name)
{
  if(this.sequence != null)
  {
    this.sequence.animation.stop();
    this.sequence.animation.visible = false;
  }

  this.sequence = this.sequences[name];
  this.sequence.animation.visible = true;
  // this.sequence.animation.play();
}
Animation.prototype.play = function()
{
  if(this.sequence == null) return;
  
  this.sequence.animation.play();
}
Animation.prototype.gotoAndPlay = function(frame)
{
  // this.sequence.currentFrame = frame-1;
  // this.play();
  this.sequence.animation.gotoAndPlay(frame-1);
}
Animation.prototype.stop = function()
{
  if(this.sequence == null) return;

  this.sequence.animation.stop();
}
Animation.prototype.gotoAndStop = function(frame)
{
  this.sequence.animation.gotoAndStop(frame-1);
}
Animation.prototype.onFrameChange = function(frame, sequence)
{
  // console.log(this.sequence.animation.currentFrame);
  // console.log(frame, sequence.name);
  if(this.sequence != sequence) return;

  this.emit('frame', {name: sequence.name, sequence: sequence, frame: frame});
  this.emit(sequence.name+'_frame_'+frame, {name: sequence.name, sequence: sequence, frame: frame});



  if(frame == sequence.animation.totalFrames) this.emit(sequence.name+'_complete', {name: sequence.name, sequence: sequence, frame: frame});
  if(frame == sequence.animation.totalFrames) this.emit('complete', {name: sequence.name, sequence: sequence});

  if(frame == sequence.animation.totalFrames && !sequence.loop) this.stop();

  // console.log(sequence.animation.totalFrames);
}
// Animation.prototype.onComplete = function(sequence)
// {
//   if(this.sequence != sequence) return;

  

//   console.log('complete');
// }

Animation.prototype.update = function()
{
  if(this.sequence == null) return;

  // var frame;

  // console.log('z');
}

var GameScene = function()
{
  PIXI.Container.call(this);


  // this.y = 200;
  var self = this;

  // this.state = 'hero_walk';
  // this.balloonsCount = 6;

  var fps = 30;

  this.containerContent = new PIXI.Container();
  this.addChild(this.containerContent);

  this.layerBg2 = new PIXI.Container();
  this.containerContent.addChild(this.layerBg2);

  var whiteBrightness = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'white_rect.png'));
  this.containerContent.addChild(whiteBrightness);
  whiteBrightness.anchor.set(0.5, 0.5);
  whiteBrightness.width = 900;
  whiteBrightness.height = 900;
  whiteBrightness.y = -300;
  whiteBrightness.alpha = 0.7;

  this.layerBg1 = new PIXI.Container();
  this.containerContent.addChild(this.layerBg1);  

  this.road = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'Scene/road.png'));
  this.containerContent.addChild(this.road);
  this.road.anchor.set(0.5, 0.5);

  this.containerActors = new PIXI.Container();
  this.containerContent.addChild(this.containerActors);

  this.containerHero = new PIXI.Container();
  this.containerActors.addChild(this.containerHero);

  this.layerOv1 = new PIXI.Container();
  this.containerContent.addChild(this.layerOv1);  
  this.layerOv2 = new PIXI.Container();
  this.containerContent.addChild(this.layerOv2);

  this.layersData = 
  [
      {name: 'bg_2', layer: this.layerBg2, speedFactor: 0.5, fillX: 400, fillData: 
                                                                                  [{elements: ['tree_0001', 'tree_0002', 'tree_0003', 'tree_0004', 'tree_0005'], minShift: 120, maxShift: 250, minY: -40, maxY: -60}]},
      {name: 'bg_1', layer: this.layerBg1, elements: [], speedFactor: 0.75, fillX: 400, fillData: 
                                                                                  [{elements: ['tree_0001', 'tree_0002', 'tree_0003', 'tree_0004', 'tree_0005'], minShift: 150, maxShift: 320, minY: -25, maxY: -35},
                                                                                   {elements: ['bush_0001', 'bush_0002', 'bush_0003', 'bush_0004', 'bush_0005', 'bush_0006', 'bush_0007', 'bush_0008', 'bush_0009'], minShift: 100, maxShift: 150, minY: -15, maxY: -20}]},
      {name: 'ov_1', layer: this.layerOv1, elements: [], speedFactor: 1.2, fillX: 400, fillData: 
                                                                                  []},
      {name: 'ov_2', layer: this.layerOv2, elements: [], speedFactor: 1.4, fillX: 400, fillData: 
                                                                                  [{elements: ['bush_white_0001', 'bush_white_0002', 'bush_white_0003', 'bush_white_0004', 'bush_white_0005', 'bush_white_0006', 'bush_white_0007', 'bush_white_0008', 'bush_white_0009'], minShift: 100, maxShift: 150, minY: 40, maxY: 60}]}
  ];
  // 
  this.L_BG_2 = 0;
  this.L_BG_1 = 1;
  this.L_OV_1 = 2;
  this.L_OV_2 = 3;

  this.elements = [];

  this._scenePosition = 0;
  Object.defineProperty(this, 'scenePosition',
  {
    set: function(value)
    {
      self._scenePosition = value;
      self.updateScenePosition();
    },
    get: function()
    {
      return this._scenePosition;
    }
  });

  this.borderRight = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'Scene/gradient_border.png'));
  this.addChild(this.borderRight);
  this.borderRight.anchor.set(0.0, 1.0);
  this.borderRight.x = 0;
  this.borderRight.y = 200;
  this.borderLeft = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'Scene/gradient_border.png'));
  this.addChild(this.borderLeft);
  this.borderLeft.anchor.set(0.0, 1.0);
  this.borderLeft.scale.x = -1.0;
  this.borderLeft.x = 0;
  this.borderLeft.y = 200;

  this.borderRight.height = this.borderLeft.height = 900;

  this._roadWidth = 0;
  Object.defineProperty(this, 'roadWidth',
  {
    set: function(value)
    {
      self._roadWidth = value;
      self.updateRoadWidth();
    },
    get: function()
    {
      return this._roadWidth;
    }
  });

  // this.isRoadMove = false;
  this.roadSpeed = 0;
  this.roadWidth = 300;

  this.walkRoadSpeed = 2.5;

  this.hero = new Animation();
  this.containerHero.addChild(this.hero);
  this.hero.state = 'none';
  this.hero.x = -85;
  this.hero.y = -280;
  this.hero.addSequence('walk_7', 'animations_9', 'hero_walk_7/frame_', 1, 27, fps, {x: -19, y: -10});
  this.hero.addSequence('walk_6', 'animations_7', 'hero_walk_6/frame_', 1, 27, fps, {x: -19, y: -10});
  this.hero.addSequence('walk_5', 'animations_1', 'hero_walk_5/frame_', 1, 27, fps, {x: -19, y: -10});
  this.hero.addSequence('jump_7', 'animations_8', 'hero_jump_7/frame_', 1, 47, fps, {x: -19, y: -273});
  this.hero.addSequence('jump_6', 'animations_7', 'hero_jump_6/frame_', 1, 47, fps, {x: -19, y: -273});
  this.hero.addSequence('jump_5', 'animations_1', 'hero_jump_5/frame_', 1, 47, fps, {x: -19, y: -273});
  this.hero.addSequence('idle_1', 'animations_2', 'hero_idle_1/frame_', 1, 34, fps, {x: 92, y: -94});
  this.hero.addSequence('idle_2', 'animations_2', 'hero_idle_2/frame_', 1, 12, fps, {x: 92, y: -94});
  this.hero.addSequence('idle_3', 'animations_2', 'hero_idle_3/frame_', 1, 42, fps, {x: 90, y: -94});
  this.hero.addSequence('idle_4', 'animations_2', 'hero_idle_4/frame_', 1, 58, fps, {x: 92, y: -94});
  this.hero.addSequence('right_word', 'animations_2', 'hero_right_word/frame_', 1, 27, fps, {x: 92, y: -94});

  this.hero.addSequence('walk_no_balloons', 'animations_5', 'hero_walk_no_balloons/frame_', 1, 26, fps, {x: 92, y: 126});

  this.hero.addSequence('hero_balloons_burst_7', 'animations_2', 'hero_balloons_burst_6/frame_', 1, 20, fps, {x: 66, y: -100});
  this.hero.addSequence('hero_balloons_burst_6', 'animations_2', 'hero_balloons_burst_6/frame_', 1, 20, fps, {x: 66, y: -100});
  this.hero.addSequence('hero_balloons_burst_5', 'animations_2', 'hero_balloons_burst_5/frame_', 1, 19, fps, {x: 66, y: -100});
  this.hero.addSequence('hero_balloons_burst_4', 'animations_2', 'hero_balloons_burst_4/frame_', 1, 21, fps, {x: 66, y: -100});
  this.hero.addSequence('hero_balloons_burst_3', 'animations_2', 'hero_balloons_burst_3/frame_', 1, 24, fps, {x: 66, y: -100});
  this.hero.addSequence('hero_balloons_burst_2', 'animations_2', 'hero_balloons_burst_2/frame_', 1, 31, fps, {x: 66, y: -100});

  this.hero.addSequence('hero_lose', 'animations_2', 'hero_lose/frame_', 1, 9, fps, {x: 71, y: -284});
  this.hero.addSequence('hero_win', 'animations_5', 'hero_win/frame_', 1, 88, fps, {x: -4, y: -98});
  // this.hero.addSequence('hero_new_balloons', 'animations_5', 'hero_new_balloons/frame_', 1, 36, fps, {x: 7, y: 1});

  this.balloonPop1 = new Animation();
  this.containerHero.addChild(this.balloonPop1);
  this.balloonPop1.addSequence('pop', 'texture_atlas', 'balloon_pop/frame_', 1, 6, fps, {x: this.hero.x -32, y: this.hero.x-173});
  this.balloonPop1.switchSequence('pop');
  this.balloonPop1.visible = false;
  // this.balloonPop1.play();

  this.balloonPop2 = new Animation();
  this.containerHero.addChild(this.balloonPop2);
  this.balloonPop2.addSequence('pop', 'texture_atlas', 'balloon_pop/frame_', 1, 6, fps, {x: this.hero.x+92, y: this.hero.x-200});
  this.balloonPop2.switchSequence('pop');
  this.balloonPop2.visible = false;
  // this.balloonPop2.play();

  this.balloons = new Animation();
  this.containerHero.addChild(this.balloons);
  this.balloons.state = 'none';
  this.balloons.x = this.hero.x + 18;
  this.balloons.y = this.hero.y - 331;
  this.balloons.addSequence('idle', 'animations_3', 'balloons/frame_', 1, 7, fps, {});
  this.balloons.addSequence('burst_7', 'animations_3', 'balloons_burst_7/frame_', 1, 20, fps, {x: -22, y: 38});
  this.balloons.addSequence('burst_6', 'animations_3', 'balloons_burst_6/frame_', 1, 20, fps, {x: -22, y: 38});
  this.balloons.addSequence('burst_5', 'animations_3', 'balloons_burst_5/frame_', 1, 20, fps, {x: -22, y: 38});
  this.balloons.addSequence('burst_4', 'animations_3', 'balloons_burst_4/frame_', 1, 21, fps, {x: -22, y: 38});
  this.balloons.addSequence('burst_3', 'animations_3', 'balloons_burst_3/frame_', 1, 24, fps, {x: -22, y: 38});
  this.balloons.addSequence('burst_2', 'animations_3', 'balloons_burst_2/frame_', 1, 31, fps, {x: -22, y: 38});

  this.balloons.addSequence('fly_7', 'animations_6', 'balloon_fly_7/frame_', 1, 17, fps, {x: -13-18, y: -475+331});
  this.balloons.addSequence('fly_6', 'animations_6', 'balloon_fly_6/frame_', 1, 17, fps, {x: -13-18, y: -475+331});
  this.balloons.addSequence('fly_5', 'animations_6', 'balloon_fly_5/frame_', 1, 17, fps, {x: -13-18, y: -475+331});
  this.balloons.addSequence('fly_4', 'animations_6', 'balloon_fly_4/frame_', 1, 17, fps, {x: -13-18, y: -475+331});
  this.balloons.addSequence('fly_3', 'animations_6', 'balloon_fly_3/frame_', 1, 17, fps, {x: -13-18, y: -475+331});
  this.balloons.addSequence('fly_2', 'animations_6', 'balloon_fly_2/frame_', 1, 17, fps, {x: -13-18, y: -475+331});
  this.balloons.addSequence('fly_1', 'animations_6', 'balloon_fly_1/frame_', 1, 17, fps, {x: -13-18, y: -475+331});

  this.balloons.switchSequence('idle');
  this.balloons.visible = false;

  // this.balloonsFly = [];
  // for(var i = 1; i <= 6; i++)
  // {
  //   var balloonFly = new Animation();
  //   this.containerHero.addChild(balloonFly);
  //   balloonFly.x = this.hero.x + 30;
  //   balloonFly.y = this.hero.y -457;

  //   var framesC = 0;
  //   if(i == 1) framesC = 14;
  //   if(i == 2) framesC = 11;
  //   if(i == 3) framesC = 11;
  //   if(i == 4) framesC = 14;
  //   if(i == 5) framesC = 17;
  //   if(i == 6) framesC = 17;

  //   balloonFly.addSequence('fly', 'animations_6', 'balloon_fly_'+i+'/frame_', 1, framesC, fps, {loop: false});
  //   balloonFly.switchSequence('fly');
  //   balloonFly.visible = false;

  //   this.balloonsFly.push(balloonFly);
  // }

  // this.balloons.play();
 
  this.monster = new Animation();
  this.containerActors.addChild(this.monster);
  this.monster.state = 'none';
  this.monster.x = this.hero.x-98;
  this.monster.y = this.hero.y-12;
  this.monster.addSequence('start', 'animations_4', 'monster_start/frame_', 1, 45, fps, {});
  this.monster.addSequence('idle_1', 'animations_4', 'monster_idle_1/frame_', 1, 36, fps, {x: 23, y: 97});
  this.monster.addSequence('idle_1', 'animations_4', 'monster_idle_1/frame_', 1, 36, fps, {x: 23, y: 97});
  this.monster.addSequence('eat', 'animations_5', 'monster_eat/frame_', 1, 29, fps, {x: 27, y: 34});
  this.monster.addSequence('chew', 'animations_5', 'monster_chew/frame_', 1, 13, fps, {x: 98, y: 116});
  this.monster.addSequence('death', 'animations_5', 'monster_death/frame_', 1, 25, fps, {x: 40, y: 139, loop: false});

  // this.hero.on('complete', function(data)
  // {
  //   if(!(data.name == 'idle_1' || data.name == 'idle_2' || data.name == 'idle_3' || data.name == 'idle_4') || this.hero.state != 'idle') return;

  //   setTimeout(function()
  //   {
  //     if(self.hero.state == 'idle') self.action({name: 'hero_idle'});
  //   }, Util.randomRange(0.5, 2)*1000);
  // }, this);

  this.whiteOver = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'white_rect.png'));
  this.addChild(this.whiteOver);
  this.whiteOver.width = this.whiteOver.height = 1000;
  this.whiteOver.anchor.set(0.5, 0.5);
  this.whiteOver.alpha = 0;
  this.whiteOver.y = -200;

  app.addForUpdate(this.update, this);

  for(var i = 0; i < this.layersData.length; i++) this.updateLayerFill(this.layersData[i]);

  this.idleListenersCount = 0;

  // this.action({name: 'check_idle'});
}
GameScene.prototype = Object.create(PIXI.Container.prototype);
GameScene.prototype.constructor = GameScene;

GameScene.prototype.updateRoadWidth = function()
{
  this.borderLeft.x = -this.roadWidth/2;
  this.borderRight.x = this.roadWidth/2;
}

GameScene.prototype.updateLayerFill = function(layerData)
{
  var self = this;

  var p = this.toGlobal(new PIXI.Point(0, 0));
  p = layerData.layer.toLocal(p);
  // console.log(p, layerData);

  if(p.x - 500 <= layerData.fillX) 
  {
    var startX = layerData.fillX - 500;
    var endX = layerData.fillX;

    // console.log('zzz');

    for(var i = 0; i < layerData.fillData.length; i++) fill(startX, endX, layerData.fillData[i]);

    layerData.fillX = startX;
  }

  function fill(startX, endX, data)
  {
    var elementX = startX;
    var elementY = 0;
    while(true)
    {
      var shift = Util.randomRangeInt(data.minShift, data.maxShift);
      elementX += shift;

      if(elementX > endX) break;

      elementY = Util.randomRangeInt(data.minY, data.maxY);
      var type = Util.randomElement(data.elements);

      var element = self.createElement(type, layerData.layer, elementX, elementY);
      self.addElement(element);
      element.visible = false;
    }
  }
}

GameScene.prototype.createElement = function(type, layer, x, y)
{
  var atlas = 'texture_atlas';
  var path = 'Scene/elements/'+type+'.png';
  var sprite = new PIXI.Sprite(assetsManager.getTexture(atlas, path));
  layer.addChild(sprite);
  sprite.anchor.set(0.5, 1);
  sprite.x = x;
  sprite.y = y;
  sprite.scale.x = sprite.scale.y = Util.randomRange(0.9, 1.3);

  if(Util.randomRange(0, 3) <= 1) sprite.scale.x *= -1;

  return sprite;
}

GameScene.prototype.addElement = function(element)
{
  var n = this.elements.indexOf(element);
  if(n == -1)
  {
    this.elements.push(element);
  }
}
GameScene.prototype.destroyElement = function(element)
{
  element.destroy();

  var n = this.elements.indexOf(element);
  if(n != -1)
  {
    this.elements.splice(n, 1);
  }

  // console.log(element);
}

GameScene.prototype.updateScenePosition = function()
{
  for(var i = 0; i < this.layersData.length; i++)
  {
    var layerData = this.layersData[i];
    layerData.layer.x = this._scenePosition * layerData.speedFactor;
  }
  // console.log(this.scenePosition);
}
GameScene.prototype.updateScene = function()
{
  // var roadWidth = 140;
  // var roadHS = 30;
  var forDestroy = [];

  for(var i = 0; i < this.elements.length; i++)
  {
    var element = this.elements[i];
    // var shift = Math.abs(element.x - this._scenePosition);
    var p = element.parent.toGlobal(element);
    p = this.toLocal(p);
    // shift = Math.abs(p.x);

    if(p.x < -500) element.visible = false;
    else element.visible = true;

    if(p.x > 500) forDestroy.push(element);
  }
  for(var i = 0; i < forDestroy.length; i++) this.destroyElement(forDestroy[i]);

  for(var i = 0; i < this.layersData.length; i++) this.updateLayerFill(this.layersData[i]);

  // console.log(this.elements.length);
}
GameScene.prototype.update = function()
{
  this.scenePosition += this.roadSpeed;

  this.updateScene();

  // console.log(TweenMax.getTweensOf(this.containerHero).length);
}

GameScene.prototype.getHeroPositionY = function(balloonsCount)
{
  var posY = 40 - (balloonsCount-1)*12;
  return posY;
}

GameScene.prototype.action = function(data, callback)
{
  var self = this;

  if(data.name == 'main_menu_walk')
  {
    var oldBalloonsCount = this.balloonsCount;
    this.balloonsCount = data.balloonsCount;

    // TweenMax.killTweensOf(this.containerHero);
    // this.containerHero.y = 0;

    if(this.hero.state == 'walk')
    {
      // TweenMax.killTweensOf(this.containerHero);
      // this.containerHero.y = 0;

      var frame = this.hero.sequence.animation.currentFrame;
      this.hero.switchSequence('walk_'+this.balloonsCount);
      this.hero.gotoAndPlay(frame);

      var isPop = false;
      if(oldBalloonsCount == 7 && this.balloonsCount < 7)
      {
        this.balloonPop1.visible = true;
        this.balloonPop1.gotoAndPlay(1);
        this.balloonPop1.once('complete', function()
        {
          this.balloonPop1.stop();
          this.balloonPop1.visible = false;
        }, this);

        isPop = true;
      }   
      if(oldBalloonsCount >= 6 && this.balloonsCount < 6)
      {
        this.balloonPop2.visible = true;
        this.balloonPop2.gotoAndPlay(1);
        this.balloonPop2.once('complete', function()
        {
          this.balloonPop2.stop();
          this.balloonPop2.visible = false;
        }, this);

        isPop = true;
      }

      if(isPop) app.playAudio('sounds', 'sound_balloon_pop');

      return;
    }

    this.containerActors.x = 0;
    this.roadSpeed = this.walkRoadSpeed;

    this.hero.removeAllListeners();

    this.hero.visible = true;
    this.hero.switchSequence('walk_'+this.balloonsCount);
    this.hero.gotoAndPlay(1);
    this.hero.state = 'walk';

    this.monster.visible = false;
    this.monster.removeAllListeners();
    this.monster.state = 'none';

    this.balloons.visible = false;
    this.balloons.removeAllListeners();
    this.balloons.state = 'none';

    TweenMax.killTweensOf(this.containerHero);
    this.containerHero.y = 0;
    TweenMax.to(this.containerHero, 1/30, {y: 0});

    // console.log('CCC');
  }

  if(data.name == 'init_new_game')
  {
    this.idleListenersCount = 0;

    this.balloonsCount = data.balloonsCount;

    this.balloons.removeAllListeners();
    this.hero.removeAllListeners();
    this.monster.removeAllListeners();

    this.hero.visible = true;

    var heroSpeed = 85;
    var heroEase = Power1.easeIn;

    if(this.hero.state == 'dead')
    {
      this.containerActors.x = -350;
      heroSpeed = 140;
      heroEase = Power1.easeIn;
    }

    if(this.hero.state != 'walk') 
    {
      this.hero.switchSequence('walk_'+this.balloonsCount);
      this.hero.gotoAndPlay(1);
    }

    // var shift = this.roadWidth / 2 + 250;
    // this.containerActors.x = shift;
    var shift = Math.abs(-100 - this.containerActors.x);
    var time = shift / heroSpeed;
    // console.log(time);
    TweenMax.to(this.containerActors, time, {x: -100, ease: Power1.easeIn, onComplete: function()
    {
      self.hero.state = 'walk';

      self.action({name: 'start'}, callback);
    }});
    TweenMax.to(this, time, {roadSpeed: this.walkRoadSpeed, ease: Power2.easeOut});

     this.hero.state = 'init_new_game';
  }
  if(data.name == 'init_new_game_fast')
  {
    this.idleListenersCount = 0;

    this.balloonsCount = data.balloonsCount;

    this.balloons.removeAllListeners();
    this.hero.removeAllListeners();
    this.monster.removeAllListeners();

    this.hero.visible = true;
    this.action({name: 'hero_idle'});
    this.action({name: 'tween_hero_fly'});

    this.balloons.visible = true;
    this.balloons.switchSequence('idle');
    this.balloons.gotoAndStop(this.balloonsCount);

    this.monster.visible = true;
    this.monster.switchSequence('idle_1');
    this.monster.gotoAndPlay(1);

    this.monster.state = 'idle';

    this.containerActors.x = 0;
    this.roadSpeed = 0;
    this.containerHero.y = this.getHeroPositionY(this.balloonsCount);
  }

  if(data.name == 'hero_jump')
  {
    this.hero.state = 'hero_jump';

    // console.log('Jump:', this.balloonsCount);
    // this.hero.once('walk_frame_1', function(data)
    // {
      this.hero.switchSequence('jump_'+this.balloonsCount);
      this.hero.gotoAndPlay(1);

      TweenMax.delayedCall(46/30, function()
      {
        // this.hero.once('complete', function(d)
        // {
          self.action({name: 'hero_idle'});

          self.balloons.visible = true;
          self.balloons.switchSequence('idle');
          self.balloons.gotoAndStop(self.balloonsCount);
          // console.log('BBB:', data.balloonsCount);

          // if(callback) callback();
        // }, this);
      });

      TweenMax.delayedCall(40/30, function()
      {
        if(callback) callback();
      });

      TweenMax.delayedCall(35/30, function()
      {
      // this.hero.once('jump_'+this.balloonsCount+'_frame_35', function(d)
      // {
        var normalY = self.getHeroPositionY(self.balloonsCount);
        TweenMax.to(self.containerHero, 40/30, {y: normalY, ease: Power2.easeOut, onComplete: function()
        {
          self.action({name: 'tween_hero_fly'});

          // if(callback) callback();
        }});
      // }, this);
      });
    // }, this);
  }  
  if(data.name == 'tween_hero_fly' && (this.hero.state == 'idle' || this.hero.state == 'burst' || this.hero.state == 'right_word'))
  {
    var normalY = this.getHeroPositionY(this.balloonsCount);

    var dir = (data.dir == undefined)?'up':data.dir;
    var shift = Util.randomRangeInt(7, 10);
    var targetY = normalY + (dir == 'down'?shift:-shift);
    TweenMax.to(this.containerHero, 60/30, {y: targetY, ease: Power2.easeInOut, onComplete: function()
    {
      self.action({name: 'tween_hero_fly', dir: dir == 'down'?'up':'down'});
    }});

    // console.log('fly: '+this.hero.state);
  }

  if(data.name == 'hero_idle')
  {
    this.hero.state = 'idle';

    this.idleListenersCount ++;

    var idleN = Util.randomRangeInt(1, 4);
    this.hero.switchSequence('idle_'+idleN);
    this.hero.gotoAndPlay(1);
    this.hero.once('complete', function(data)
    {
      this.idleListenersCount --;

      if(data.sequence.name != 'idle_'+idleN) return;

      this.hero.stop();

      setTimeout(function()
      {
        // console.log(self.idleListenersCount);
        if(self.hero.state == 'idle' && self.idleListenersCount == 0) self.action({name: 'hero_idle'});
      }, Util.randomRange(0.5, 2)*1000);
    }, this);
  } 

  // if(data.name == 'check_idle')
  // {
    // if(this.hero.state == 'idle')
    // {
    //   var idleN = Util.randomRangeInt(1, 4);
    //   this.hero.switchSequence('idle_'+idleN);
    //   this.hero.gotoAndPlay(1);
    //   this.hero.once('complete', function(data)
    //   {
    //     if(data.sequence.name != 'idle_'+idleN) return;

    //     this.hero.stop();
    //   }, this);
    // }

    // TweenMax.delayedCall(Util.randomRange(0.5, 2), function()
    // {
    //   self.action({name: 'check_idle'});
    // });
  // } 

  if(data.name == 'hero_right_word')
  {
    if(this.hero.state == 'right_word') return;

    if(this.hero.state == 'burst')
    {
      this.hero.once('complete', function()
      {
        this.action({name: 'hero_right_word'});
      }, this);

      return;
    }

    this.hero.state = 'right_word';

    this.hero.switchSequence('right_word');
    this.hero.gotoAndPlay(1);
    this.hero.once('complete', function(data)
    {
      if(this.hero.state != 'right_word') return;

      this.action({name: 'hero_idle'});
    }, this);
  }  

  if(data.name == 'burst')
  {
    this.hero.state = 'burst';

    app.playAudio('sounds', 'sound_balloon_pop');
    // console.log('Burst:', (data.balloonsCount+1));
    this.balloonsCount --;
    TweenMax.killTweensOf(this.containerHero);
    TweenMax.to(this.containerHero, 5/30, {y: this.getHeroPositionY(this.balloonsCount)});

    this.balloons.switchSequence('burst_'+(data.balloonsCount+1));
    this.balloons.gotoAndPlay(1);
    this.balloons.once('complete', function(d)
    {
      if(this.balloons.sequence.name != 'burst_'+(data.balloonsCount+1)) return;
      this.balloons.switchSequence('idle');
      this.balloons.gotoAndStop(data.balloonsCount);

      // console.log('zz');
    }, this);

    this.hero.switchSequence('hero_balloons_burst_'+(data.balloonsCount+1));
    this.hero.gotoAndPlay(1);
    this.hero.once('complete', function(d)
    {
      // if(this.balloons.sequence.name != 'burst_'+(data.balloonsCount+1)) return;

      this.action({name: 'hero_idle'});
      this.action({name: 'tween_hero_fly'});
    }, this);

    // this.balloonsCount --;
  }

  if(data.name == 'start' && this.hero.state == 'walk')
  {
    this.action({name: 'monster_start'});
    this.action({name: 'hero_jump'}, callback);

    // TweenMax.to()

    var time = 40/30;
    TweenMax.to(this.containerActors, time, {x: 0, ease: Power2.easeOut});
    TweenMax.to(this, time, {roadSpeed: 0.0, ease: Power2.easeOut});
  }

  if(data.name == 'lose')
  {
    this.hero.state = 'lose';
    this.monster.state = 'eat';

    this.balloons.removeAllListeners();
    this.hero.removeAllListeners();
    this.monster.removeAllListeners();

    TweenMax.killTweensOf(this.containerHero);
    TweenMax.to(this.containerHero, 5/30, {y: 0, onComplete: function()
    {
      
    }});

     self.balloons.visible = false;

      self.monster.switchSequence('eat');
      self.monster.gotoAndPlay(1);
      self.monster.once('complete', function(data)
      {
        self.monster.switchSequence('chew');
        self.monster.gotoAndPlay(1);
        self.monster.once('complete', function(data)
        {
        self.monster.switchSequence('chew');
        self.monster.gotoAndPlay(1);
        self.monster.once('complete', function(data)
        {
        self.monster.switchSequence('chew');
        self.monster.gotoAndPlay(1);
        self.monster.once('complete', function(data)
        {
          self.monster.stop();

          self.hero.state = 'dead';
          self.monster.state = 'after_eat';

          // TweenMax.to(this, 2, {roadSpeed: this.walkRoadSpeed, ease: Power1.easeOut});
          // TweenMax.to(this.containerActors, 3.0, {x: 400, ease: Power1.easeInOut, onComplete: function()
          // {
            // self.monster.visible = false;

            if(callback) callback();

            // self.action({name: 'init_new_game', balloonsCount: 6});
          // }});
        }, self);
        }, self);
        }, self);
      }, self);

      TweenMax.delayedCall(4/30, function()
      {
        app.playAudio('sounds', 'sound_balloon_pop');

        self.hero.switchSequence('hero_lose');
        self.hero.gotoAndPlay(1);
        self.hero.once('complete', function(data)
        {
          self.hero.stop();
          self.hero.visible = false;
          // this.action({name: 'hero_idle'});
        }, self);
      });

      TweenMax.delayedCall(15/30, function()
      {
        burst();
      });

      TweenMax.delayedCall(11/30, function()
      {
        app.playAudio('sounds', 'sound_monster_chomp');
      });
  }

  if(data.name == 'win')
  {
    this.hero.state = 'win';

    this.balloons.removeAllListeners();
    this.hero.removeAllListeners();
    this.monster.removeAllListeners();

    var fallDistance = Math.abs(this.containerHero.y);

    TweenMax.killTweensOf(this.containerHero);
    TweenMax.to(this.containerHero, fallDistance/200, {y: 0, ease: Power1.easeInOut, onComplete: function()
    {

    }});
    startJump();

    function startJump()
    {
      self.hero.switchSequence('hero_win');
      self.hero.gotoAndPlay(1);

      TweenMax.delayedCall(10/30, function()
      {
        // this.balloons.visible = false;
        // for(var i = 0; i < data.balloonsCount; i++)
        // {
        //   this.balloonsFly[i].visible = true;
        //   this.balloonsFly[i].gotoAndPlay(1);
        // }

        self.balloons.switchSequence('fly_'+data.balloonsCount);
        self.balloons.gotoAndPlay(1);
        self.balloons.once('complete', function(d)
        {
          self.balloons.stop();
          self.balloons.visible = false;
        }, self);
      });

      TweenMax.delayedCall(14/30, function()
      {
        app.playAudio('sounds', 'sound_monster_dead');

        self.monster.switchSequence('death');
        self.monster.gotoAndPlay(1);
      });
      // self.hero.once('hero_win_frame_15', function(d)
      // {
      //   self.monster.switchSequence('death');
      //   self.monster.gotoAndPlay(1);
      // }, self);

      TweenMax.delayedCall(59/30, function()
      {
        if(callback) callback();
      }); 

      TweenMax.delayedCall(69/30, function()
      {
        TweenMax.to(self, 10/30, {roadSpeed: 2.0, ease: Power2.easeInOut});
      }); 

      self.hero.once('complete', function(d)
      {
        self.hero.switchSequence('walk_no_balloons');
        self.hero.gotoAndPlay(1);

        // if(callback) callback();
      }, self);

      // var isComplete = false;
      // this.hero.on('hero_win_frame_61', function(d)
      // {
      //   this.hero.gotoAndPlay(52);
      //   if(isComplete) return;

      //   isComplete = true;
      //   if(callback) callback();
      // }, this);
    }
  }

  if(data.name == 'monster_start')
  {
    this.monster.visible = true;
    this.monster.state = 'start';

    this.monster.switchSequence('start');
    this.monster.gotoAndPlay(1);
    TweenMax.delayedCall(44/30, function()
    {
    // this.monster.once('complete', function(data)
    // {
      self.monster.switchSequence('idle_1');
      self.monster.gotoAndPlay(1);

      self.monster.state = 'idle';
    // }, this);
    });

    TweenMax.delayedCall(9/30, function()
    {
      burst();
    });
    TweenMax.delayedCall(7/30, function()
    {
      app.playAudio('sounds', 'sound_monster_appears');
    });
  }

    function burst(dir)
    {
      // var targetY = dir == 'down'?10:0;
      // TweenMax.to(app.gameScene.containerContent, 6/30, {y: targetY, ease: Back.easeOut, onComplete: function()
      // {
      //  burst(dir == 'down'?'up':'down');
      // }});

      TweenMax.to(app.gameScene.containerContent, 3/30, {y: 50, ease: Back.easeOut, onComplete: function()
      {
      TweenMax.to(app.gameScene.containerContent, 4/30, {y: -10, ease: Back.easeOut, onComplete: function()
      {
      TweenMax.to(app.gameScene.containerContent, 6/30, {y: 15, ease: Back.easeOut, onComplete: function()
      {
      TweenMax.to(app.gameScene.containerContent, 8/30, {y: 0, ease: Back.easeOut, onComplete: function()
      {
        // burst(dir == 'down'?'up':'down');
      }});
      }});
      }});
      }});
    }
}

// HeroActor.prototype.update = function()
// {
//   console.log('z')
// }