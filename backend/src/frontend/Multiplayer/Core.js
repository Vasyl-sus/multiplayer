// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var ConstsManager = function()
{
  this.gameWidth = 540;
  this.gameHeight = 540;
  this.gameMinWidth = 540;
  this.gameMinHeight = 540;

  this.storage = {};

  this.storage['text_configs'] =
  {
    game_word: {font: '96px PH_92', align: 'center', tint:0x000000},

    score_panel_text: {font: '40px PH_46', align: 'left', tint:0x000000},
    lose_score_text: {font: '80px PH_92', align: 'center', tint:0x000000},

    hint_text: {font: '53px PH_46', align: 'center', tint:0x000000}

    // field_char_text: {font: '76px CG_70', align: 'center', tint:0x5B5855},
    // field_words_text: {font: '60px CG_70', align: 'left', tint:0xFFFFFF},
    // field_maniac_words_text: {font: '65px CO_65', align: 'left', tint:0x5B5855},
    // field_title_text: {font: '85px CG_70', align: 'center', tint:0x9A9587},
    // timer_text: {font: '60px CG_70', align: 'center', tint:0xFFFFFF},
    // streak_text: {font: '56px CG_70', align: 'left', tint:0x8C836A},
    // category_name: {font: '70px CG_70', align: 'center', tint:0x7B7158}
  };

  var dVK = 0.9;

  this.storage.audio_info =
  {
    sounds:
    {
      path: 'assets/audio/',

      files:
      {
        sound_click: {volume: 1.0*dVK},
        sound_button_play: {volume: 0.6*dVK},
        sound_balloon_pop: {volume: 1.0*dVK},
        sound_correct_letter: {volume: 1.0*dVK},
        sound_solved: {volume: 1.0*dVK},
        sound_lose: {volume: 1.0*dVK},
        sound_monster_chomp: {volume: 1.0},
        sound_monster_appears: {volume: 1.0*dVK},
        sound_monster_dead: {volume: 1.0*dVK},
        sound_add_balloon: {volume: 1.0*dVK}
      },

      formats: ['ogg', 'm4a']
      // formats: ['wav']
    },

    audio: {}
  };
}

ConstsManager.prototype.init = function()
{

}

ConstsManager.prototype.getData = function(path)
{
  var keys = path.split('/');
  if(keys.length == 0) return null;

  var data = this.storage[keys[0]];
  for(var i = 1; i < keys.length; i++)
  {
    var key = keys[i];
    if(key == null || data == null) return null;
    data = data[key];
  }

  return data;
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
document.addEventListener("DOMContentLoaded", function()
{
  String.prototype.splice = function(idx, rem, str) {
      return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
  };

  init();
});

window.onfocus = function()
{
  if(app) app.focusChange(true);
};
window.onblur = function()
{
  if(app) app.focusChange(false);
};
window.addEventListener("beforeunload", function (e) {
  var confirmationMessage = "\o/";

  if(app && app.screenGame.gameState == 'start')
  {
    app.apiCallback('statistics', {result: 'quit', score: app.getScore(), word: app.screenGame.wordData.word});
  }

  // (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  // return confirmationMessage;                            //Webkit, Safari, Chrome
});

var renderer;
var stage;
var app;

var assetsManager;
var soundsManager;
var guiManager;
var constsManager;

var interaction;

function init()
{
    // todo insert domain for real server
    var avaiabledomains =
    [
      'localhost',
      'coolmathgames.com',
      'edit.coolmathgames.com',
      'stage2.coolmathgames.com',
      'stage2-edit.coolmathgames.com',
      'dev.coolmathgames.com',
      'dev-edit.coolmathgames.com',
      'dev2.coolmathgames.com',
      'dev3.coolmathgames.com',
      'stage.coolmathgames.com',
      'stage-edit.coolmathgames.com',
      'Multiplayer-backend.coolmathgames.com',
      'Multiplayerqa.coolmathgames.com'
    ];

      var isPlayAvaiable = false;
      var domain = document.domain;
      for(var i = 0; i < avaiabledomains.length; i ++)
      {
        if(domain.indexOf(avaiabledomains[i]) != -1)
        {
          isPlayAvaiable = true;
          break;
        }
      }
      // console.log(domain);

    if(!isPlayAvaiable) return;

  renderer = PIXI.autoDetectRenderer(960, 720, {antialias: true, transparent: false, resolution: 1, autoResize: false, roundPixels: false});
  document.getElementById('game').appendChild(renderer.view);

  renderer.backgroundColor = 0xFFFFFF;
  // renderer.backgroundColor = 0xCCCCCC;
  renderer.view.style.position = "absolute";
  renderer.view.style.top = "0px";
  renderer.view.style.left = "0px";

  interaction = new PIXI.interaction.InteractionManager(renderer);

  constsManager = new ConstsManager();
  constsManager.init();

  assetsManager = new AssetsManager(PIXI.loader);

  assetsManager.addAssetToLoad('boot', {name:'preloader_bar_border', url:'assets/preloader/preloader_bar_border.png'});
  assetsManager.addAssetToLoad('boot', {name:'preloader_bar', url:'assets/preloader/preloader_bar.png'});

  assetsManager.addAssetToLoad('load', {name:'texture_atlas', url:'assets/texture_atlas.json'});
  assetsManager.addAssetToLoad('load', {name:'animations_1', url:'assets/animations_1.json'});
  assetsManager.addAssetToLoad('load', {name:'animations_2', url:'assets/animations_2.json'});
  assetsManager.addAssetToLoad('load', {name:'animations_3', url:'assets/animations_3.json'});
  assetsManager.addAssetToLoad('load', {name:'animations_4', url:'assets/animations_4.json'});
  assetsManager.addAssetToLoad('load', {name:'animations_5', url:'assets/animations_5.json'});
  assetsManager.addAssetToLoad('load', {name:'animations_6', url:'assets/animations_6.json'});
  assetsManager.addAssetToLoad('load', {name:'animations_7', url:'assets/animations_7.json'});
  assetsManager.addAssetToLoad('load', {name:'animations_8', url:'assets/animations_8.json'});
  assetsManager.addAssetToLoad('load', {name:'animations_9', url:'assets/animations_9.json'});
  assetsManager.addAssetToLoad('load', {name:'words_list', url:'assets/words_list.json'});
  // assetsManager.addAssetToLoad('load', {name:'letters_list', url:'assets/letters_list.txt'});
  assetsManager.addAssetToLoad('load', {name: 'PH_92', url:'assets/fonts/PH_92.fnt'});
  assetsManager.addAssetToLoad('load', {name: 'PH_46', url:'assets/fonts/PH_46.fnt'});
  // assetsManager.addAssetToLoad('load', {name: 'CO_65', url:'assets/fonts/CO_65.fnt'});

  soundsManager = new SoundsManager();

  stage = new PIXI.Container();

  guiManager = new Gui.GuiManager(stage);

  renderer.render(stage);

  app = new App();

  new StateBoot();

  window.addEventListener('resize', resize);
  resize();
  for(var i = 1; i <= 10; i++)
  {
    setTimeout(function()
    {
      resize();
    }, 200*i);
  }

  requestAnimationFrame(app.loop);
};

function resize()
{
  // console.log('z');
  var viewWidth = screen.width;
  var viewHeight = screen.height;

  var gameWidth = 0;
  var gameHeight = 0;

  var size = calculateGameSize(window.innerWidth, window.innerHeight);
  // var size = {width: window.innerWidth, height: window.innerHeight};
  gameWidth = size.width;
  gameHeight = size.height;

  ratio = Math.min(window.innerWidth/gameWidth, window.innerHeight/gameHeight);

  var shiftX = (window.innerWidth - Math.ceil(gameWidth * ratio)) / 2;
  var shiftY = (window.innerHeight - Math.ceil(gameHeight * ratio)) / 2;
  renderer.view.style.left = shiftX+"px";
  renderer.view.style.top = shiftY+"px";

  var width = Math.ceil(gameWidth * ratio);
  var height = Math.ceil(gameHeight * ratio);

  renderer.view.style.width = width + "px";
  renderer.view.style.height = height + "px";
  renderer.resize(gameWidth, gameHeight);

  // console.log(renderer);
  //
  // stage.scale.y = 720 / gameHeight;

  //stage.y = - (720 - gameHeight) / 2;
  //guiManager.rootScene.height = gameHeight;
  // var size = calculateGameSize(window.innerWidth, window.innerHeight);
  guiManager.resize(gameWidth, gameHeight);
  // guiManager.resize(size.width, size.height);
};

function calculateGameSize(screenWidth, screenHeight)
{
  var width;
  var height;

  width = screenWidth;
  height = screenHeight;

  var minWidth = 900;
  var minHeight = 1200;

  if(screenWidth > screenHeight)
  {
    minWidth = 1200;
    minHeight = 900;
  }

  var wK = screenWidth / minWidth;
  var hK = screenHeight / minHeight;

  var k = 1 / Math.min(wK, hK);

  width = screenWidth * k;
  height = screenHeight * k;

  // console.log(width, height);

  return {width: width, height: height};
}

/*
function resize()
{
  var viewWidth = screen.width;
  var viewHeight = screen.height;

  var gameWidth = 0;
  var gameHeight = 0;

  var size = calculateGameSize(window.innerWidth, window.innerHeight);
  gameWidth = size.width;
  gameHeight = size.height;

  ratio = Math.min(window.innerWidth/gameWidth, window.innerHeight/gameHeight);

  var shiftX = (window.innerWidth - Math.ceil(gameWidth * ratio)) / 2;
  var shiftY = (window.innerHeight - Math.ceil(gameHeight * ratio)) / 2;
  renderer.view.style.left = shiftX+"px";
  renderer.view.style.top = shiftY+"px";

  var width = Math.ceil(gameWidth * ratio);
  var height = Math.ceil(gameHeight * ratio);

  renderer.view.style.width = width + "px";
  renderer.view.style.height = height + "px";

  renderer.resize(gameWidth, gameHeight);

  guiManager.resize(gameWidth, gameHeight);
};

function calculateGameSize(screenWidth, screenHeight)
{
  var width = 1200;
  var height = 900;

  return {width: width, height: height};
}
*/
