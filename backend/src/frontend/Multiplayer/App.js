var App = function()
{
  EventEmitter.call(this);


  App.instance = this;

  this.version = '1.3';

  this.dt = 0;
  this.et = 0;
  this.etTime = new Date().getTime();
  this.fps = 60;

  this.audioState = 'on';
  this.isMuteByPlayer = false;
  this.isMuteByWindow = false;

  this.gameFocus = true;

  this.forUpdate = [];

  this.mouse = {x: 0, y: 0};

  this.resizeCounter = 0;
};
App.prototype = Object.create(EventEmitter.prototype);
App.prototype.constructor = App;

App.prototype.init = function()
{
  // console.log('App: Init!');

  //console.log(loader.resources);
  interaction.addListener('mousemove', function(data)
  {
    app.mouse = data.data.global;
  });
  interaction.addListener('touchmove', function(data)
  {
    app.mouse = data.data.global;
  });
  interaction.addListener('pointerdown', function(data)
  {
    // nextAction();
  });

  // var actions = ['init_new_game', 'burst', 'burst', 'burst', 'burst', 'burst', 'lose', 'burst', 'burst', 'burst', 'burst', 'burst', 'lose', 'burst', 'burst', 'burst', 'burst', 'burst', 'lose'];
  // function nextAction()
  // {
  //   if(actions.length == 0) return;

  //   // app.gameScene.action({name: actions[0]});
  //   // actions.splice(0, 1);	
  // }

  guiManager.emit('game_resize', {width: guiManager.rootScene.width, height: guiManager.rootScene.height});

  this.isMobile = false; //initiate as false
  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) this.isMobile = true;
  // console.log('IsMobile:', this.isMobile);

  this.gameData = 
  {
  	dificult: 'none',
  	balloonsCount:
  	{
  		easy: 7,
  		medium: 6,
  		hard: 5
  	},

  	usedWordsId: [],
  	gamePlayed: 0,

  	score:
  	{
  		easy: {best: 0, current: 0},
  		medium: {best: 0, current: 0},
  		hard: {best: 0, current: 0}
  	}
  }

  this.wordsList = assetsManager.loader.resources['words_list'].data.words;
  // console.log(this.wordsList);

  // this.save();
  this.load(); 

  this.gameScene = new GameScene();
  guiManager.rootScene.addChild(this.gameScene);

  this.screenMainMenu = new ScreenMainMenu({name: 'screen_main_menu', parentPanel: guiManager.rootScene});
  this.screenGame = new ScreenGame({name: 'screen_game', parentPanel: guiManager.rootScene});
  // this.screenGame = new ScreenGame({name: 'screen_game', parentPanel: guiManager.rootScene});

  // this.buttonAudio = new Gui.ButtonAudio({name: 'button_audio', parentPanel: guiManager.rootScene, width: 120, height: 120, x: 415, y: -420});

  // this.field = new Field({name: 'field', parentPanel: guiManager.rootScene});

  this.screenMainMenu.onOrientationChange({orientation: guiManager.orientation})
  this.screenGame.onOrientationChange({orientation: guiManager.orientation})
  // this.screenGame.onOrientationChange({orientation: guiManager.orientation})

  this.buttonAudio = new Gui.ButtonAudio({name: 'button_audio', parentPanel: guiManager.rootScene, width: 70, height: 70, positionType: 'left-bot', xRelative: 90, yRelative: -10});

  this.buttonHelp = Gui.createSimpleButton({name: 'button_help', parentPanel: guiManager.rootScene, width: 70, height: 70, positionType: 'left-bot', xRelative: 10, yRelative: -10},
  {
    pathToSkin: 'ScreenGame/button_help.png',
    onClick: function()
    {
      if(!(app.screenMainMenu.state == 'show' || app.screenGame.state == 'show')) return;

      app.panelHelp.tween({name: 'show_anim'});
    }
  });

  this.panelScore = new PanelScore({name: 'panel_score', parentPanel: guiManager.rootScene});
  this.panelScore.updateDisplay();

  this.panelHelp = new PanelHelp({name: 'panel_help', parentPanel: guiManager.rootScene});

  // var self = this;
  // TweenMax.delayedCall(10/30, function()
  // {
  //   self.screenMainMenu.tween({name: 'show_anim'});
  // });


  this.whiteOver = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'white_rect.png'));
  guiManager.rootScene.addChild(this.whiteOver);
  this.whiteOver.width = this.whiteOver.height = 2500;
  this.whiteOver.anchor.set(0.5, 0.5);
  this.whiteOver.alpha = 0;

  this.panelRotate = new PanelRotate({parentPanel: guiManager.rootScene});

  this.screenMainMenu.tween({name: 'show_from_preloader'});

  guiManager.on('orientation_change', this.onOrientationChange, this);
  this.onOrientationChange({orientation: guiManager.orientation});

  // console.log("P: " + app.gameData.gamePlayed);

  // this.whiteOver = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'white_rect.png'));
  // guiManager.rootScene.addChild(this.whiteOver);
  // this.whiteOver.width = this.whiteOver.height = 3000;
  // this.whiteOver.anchor.set(0.5, 0.5);
  // this.whiteOver.visible = false;
  // this.whiteOver.interactive = true;

  // setTimeout(function()
  // {
  // 	console.log('ssss');
  // 	app.gameData.gamePlayed = 1000;
  // 	app.apiCallback('start');
  // }, 1000);
};

// App.prototype.initGame = function()
// {
//   this.screenMainMenu.tween({name: 'show_anim'});
// }

App.prototype.onOrientationChange = function(data)
{
  var orientation = data.orientation;

  if(orientation == 'portrait' && this.isMobile)
  {
    this.panelRotate.tween({name: 'show'});
  }  
  if(orientation == 'landscape' && this.isMobile)
  {
    this.panelRotate.tween({name: 'hide'});
  }

  // console.log(this.panelRotate);
}

App.prototype.getWord = function(dificult)
{
	// console.log(dificult);
	if(app.gameData.usedWordsId == undefined || this.wordsList.length <= app.gameData.usedWordsId.length) app.gameData.usedWordsId = [];

	var words = [];
	for(var i = 0; i < this.wordsList.length; i++)
	{
		var isBlock = false;
		for(var j = 0; j < app.gameData.usedWordsId.length; j++)
		{
			if(app.gameData.usedWordsId[j] == i) 
			{
				isBlock = true;
				break;
			}
		}

		if(isBlock) continue;

		words.push(this.wordsList[i]);
	}

	// console.log(words);
	var wordData = null;
	if(words.length > 0) wordData = Util.randomElement(words);
	else 
	{
		app.gameData.usedWordsId = [];
		wordData = app.getWord(dificult);
	}

	// console.log(wordData);

	return wordData;
}

App.prototype.apiCallback = function(name, data)
{
  // console.log('Api:', name, data);

  if(name == 'statistics')
  {
  	data.dificult = app.gameData.dificult;
  	// data.score = app.getScore();
  	data.gamePlayed = app.gameData.gamePlayed;

  	var statistics = '';

  	if(data.dificult == 'easy') statistics += '0';
  	else if(data.dificult == 'medium') statistics += '1';
  	else if(data.dificult == 'hard') statistics += '2';

  	if(data.result == 'success') statistics += '0';
  	else if(data.result == 'failture') statistics += '1';
  	else if(data.result == 'quit') statistics += '2';

  	// if(data.score < 10) statistics += '00'+data.score;
  	// else if(data.score < 100) statistics += '0'+data.score;
  	// else if(data.score > 999) statistics += '999';
  	// else statistics += data.score;

  	// if(data.gamePlayed < 10) statistics += '000'+data.gamePlayed;
  	// else if(data.gamePlayed < 100) statistics += '00'+data.gamePlayed;
  	// else if(data.gamePlayed < 1000) statistics += '0'+data.gamePlayed;
  	// else if(data.gamePlayed > 9999) statistics += '9999';
  	// else statistics += data.gamePlayed;

  	statistics += ':';
  	statistics += data.word;

  	// console.log('Statistics:', statistics);
  	
    if(window.parent && window.parent.postMessage)
    {
      window.parent.postMessage(JSON.stringify({eventType: "dataEvent", key: "data", value: statistics}), "*");
    }

  	return;
  }

  if(name == 'start' || name == 'replay')
  {
  	data = '';

  	var gamePlayed = app.gameData.gamePlayed;
  	if(gamePlayed == undefined || gamePlayed < 0) gamePlayed = 0;

  	if(gamePlayed < 10) data += '000'+gamePlayed;
  	else if(gamePlayed < 100) data += '00'+gamePlayed;
  	else if(gamePlayed < 1000) data += '0'+gamePlayed;
  	else if(gamePlayed < 9999) data += gamePlayed;
  	else if(gamePlayed > 9999) data += '9999';

  	// console.log('cmgGameEvent: ' + name, data);
  }

  if(window.parent && window.parent.postMessage)
  {
    if(data !== null && data !== undefined) {
      window.parent.postMessage(JSON.stringify({eventType: "gameEvent", key: "name", value: data}), "*");
    }
    else {
      window.parent.postMessage(JSON.stringify({eventType: "gameEvent", key: "name", value: ""}), "*");
    }
  }
}

App.prototype.gameEnd = function(type)
{
  // console.log(app.gameData.categories);
  // app.save();
}

App.prototype.setScore = function(score, dificult)
{
	if(dificult == undefined) dificult = app.gameData.dificult;

	var scoreData = app.gameData.score[dificult];
	scoreData.current = score;

	if(scoreData.current > scoreData.best) scoreData.best = scoreData.current;

	app.panelScore.updateDisplay();

	app.save();
}
App.prototype.getScore = function(dificult)
{
	if(dificult == undefined) dificult = app.gameData.dificult;
	var scoreData = app.gameData.score[dificult];
	return scoreData.current;
}
function getItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return undefined;
  }
}
function setItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}
App.prototype.save = function()
{
  // var data = app.gameData.scores;
  var data =
  {
  	version: app.version,
  	usedWordsId: app.gameData.usedWordsId,
  	gamePlayed: app.gameData.gamePlayed,

  	score: app.gameData.score
  }

  var jsonString = JSON.stringify(data);

  setItem('Multiplayer_save', jsonString);
  // localStorage.setItem('Multiplayer_save', jsonString);

  // console.log('Save!', data);
}
App.prototype.load = function()
{
  var data = getItem('Multiplayer_save');
  // var data = localStorage.getItem('Multiplayer_save');
  if(data == undefined || data == null) data = null;
  if(data != null)
  {
    data = JSON.parse(data);
    if(data.version != app.version) data = null;
  }

  if(data == null) 
  {
    app.save();
    data = getItem('Multiplayer_save');
    // data = localStorage.getItem('Multiplayer_save');
    data = {
      version: app.version,
      usedWordsId: app.gameData.usedWordsId,
      gamePlayed: app.gameData.gamePlayed,

      score: app.gameData.score
    };
    // data = JSON.parse(data);
  }

  app.gameData.score = data.score;
  app.gameData.gamePlayed = data.gamePlayed;
  if(app.gameData.gamePlayed > 9999) app.gameData.gamePlayed = 9999;
  app.gameData.usedWordsId = data.usedWordsId;

  // console.log('Load!', data);
}

App.prototype.focusChange = function(focus)
{
  if(this.gameFocus == focus) return;

  this.gameFocus = focus;

  if(this.gameFocus)
  {
    this.isMuteByWindow = false;
  }
  else 
  {
    this.isMuteByWindow = true;
  }

  this.checkAudioMute();
}

App.prototype.createMusic = function(name)
{
  var audio = constsManager.getData('audio_info/audio/'+name); 
  var id = audio.play();

  audio.loop(true, id);
  // audio.volume(0.2, id);

  var music = {audio: audio, id: id, name: name, _volume: 1};

  Object.defineProperty(music, 'volume',
  {
    set: function(value)
    {
      music._volume = value;
      music.audio.volume(music._volume, music.id);
    },
    get: function()
    {
      return music._volume;
    }
  });

  // music.pause = function()
  // {
  //   music.audio.pause(music.id);
  // }
  // music.stop = function()
  // {
  //   music.audio.stop(music.id);
  // }
  // music.play = function()
  // {
  //   var audio = constsManager.getData('audio_info/audio/'+music.name); 
  //   music.audio = audio;
  //   music.id = music.audio.play();
  // }

  return music;
}

App.prototype.setMusic = function(name)
{
  var self = this;

  // console.log('set music:', name);

  var nextMusic = name == 'music_battle'?this.musicBattle:this.musicMenu;

  if(this.currentMusic == null)
  {
    this.currentMusic = nextMusic;
    this.currentMusic.volume = 0;
    TweenMax.to(this.currentMusic, 5, {volume: 1});
  }
  else 
  {
    TweenMax.to(this.currentMusic, 1, {volume: 0, onComplete:function()
    {
      self.currentMusic = nextMusic;
      self.currentMusic.volume = 0;
      TweenMax.to(self.currentMusic, 1, {volume: 1});
    }});
  }
}

App.prototype.playAudio = function(dir, name)
{
  var audio = constsManager.getData('audio_info/audio/'+name);  
  // audio.loop(true);
  audio.play();


  // audio.loop(true, a);
  //console.log(audio.loop);

  // if(this.audioState == 'off') audio.muted = true;

  // console.log('play sound:', name);
}
App.prototype.setAudioState = function(state)
{
  if(this.audioState == state) return;

  this.audioState = state;
  // if(state == 'on') PIXI.audioManager.unmute();
  // else if(state == 'off') PIXI.audioManager.mute();

  if(state == 'on')
  {
    this.isMuteByPlayer = false;
  } 
  else if(state == 'off')
  {
    this.isMuteByPlayer = true;
  }

  this.checkAudioMute();
  // console.log(audios);

  // console.log('set audio state:', state, PIXI.audioManager);
}
App.prototype.checkAudioMute = function()
{
  var isMute = this.isMuteByPlayer || this.isMuteByWindow;

  // console.log(isMute);

  var audios = constsManager.getData('audio_info/audio');
  for(var key in audios)
  {
    var audio = audios[key];
    audio.mute(isMute);
  }
}

App.prototype.addForUpdate = function(f, context)
{
  if(context == undefined) context = null;
  this.forUpdate.push({f: f, context: context});
}

App.prototype.update = function()
{
  for(var i = 0; i < this.forUpdate.length; i++)
  {
    if(this.forUpdate[i].context != null) this.forUpdate[i].f.call(this.forUpdate[i].context);
    else this.forUpdate[i].f();
  }

  // console.log(interaction.mouse.global);
};

App.prototype.loop = function(time)
{
  requestAnimationFrame(app.loop);

  var now = new Date().getTime();
  this.et = (now - this.etTime)*0.001;
  this.etTime = now;

  app.update();

  renderer.render(stage);

  if(app.resizeCounter == 0) 
  {
    resize();
    app.resizeCounter = 30;
  }
  else if(app.resizeCounter > 0) app.resizeCounter --;
};

App.instance = null;
App.getInstance = function()
{
  return App.instance;
};
//=========================================================================================================================================================================//

/*
// Моя обертка для АПИ, что бы просто вызывать везде где нужно и не париться, а тут уже проверяется есть ли к АПИ доступ, и если есть, то оно вызывается
var apiCallback = function(name, data)
{
  console.log('Api:', name, data);
  if(parent && parent.cmgGameEvent)
  {
    if(data) parent.cmgGameEvent(name, data);
    else parent.cmgGameEvent(name);
  }
}

// Дальше в нужных местах игры вызываем разные, необходимые события которые указаны в доке, например событие "start" при нажатии кнопки Play:
apiCallback('start', null);
// Если стартуем например 5 лвл то:
apiCallback('start', '5');
// Всего их помоему интересует только 3 события - нажатие кнопки Play(стар игры, событие 'start'), запуск лвл(то же событие 'start', только с данными в виде номера лвла)
// и рестарт уровня игроком(событие 'replay', так же с указанием номера уровня).

// Так же, если в игре есть уровни которые надо открывать, они просят внедрить фичу по разблакировке всех уровней, при вызове со стороны их АПИ функции unlockAllLevels, 
// соответсвенно необходимо реализовать(создать) эту функцию, и написать внутри свой код который будет разблокировать все лвлы. Важно, функция должна находиться в "корне" игры, 
// то есть быть  доступной из любого места, собсвенно банальный пример:
function unlockAllLevels()
{
  // Твой код по разблакировке всех лвлов
}

// Незнаю что там на счет сайт-локов, но я запилил самым банальным способом, в целом это филькина грамота, но они не жаловались, выглядит у меня это так, 
// перед самым стартом игры, вызывается функция checkSitelock(), которая возвращяет true\false, если false, то игра просто дальше не запускается.
function checkSitelock()
{
  var avaiabledomains =
  [
      'localhost',
      'coolmath-games.com',
      'edit.coolmath-games.com',
      'stage.coolmath-games.com',
      'edit-stage.coolmath-games.com',
      'dev.coolmath-games.com',
      'm.coolmath-games.com'
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

  return isPlayAvaiable;
}
*/