/*
	오디오 엔진의 인스턴스 얻기
*/
var audio = cc.AudioEngine.getInstance();

OWN_PLAYER = 1;
OWN_MONSTER = 2;

/*
	Missile

	미사일에 대한 정보를 담는다.
*/
var Missile = function() {
	this.sx = 0;		// 미사일의 x 속도
	this.sy = 0;		// 미사일의 y 속도

	this.tag = 0;		// 몇 번째로 생성된 미사일인지 저장하는 값
						// 이 값은 cocos2d의 removeChildByTag 함수르 위해 저장한다.
	
	this.own = 0;		// 미사일의 소유자, 플레이어인지, 적인지

	this.sprite = null;	// 미사일의 스프라이트

//	this.sprite.setBlendFunc(cc._blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA));
};

/*
	Monster

	몬스터에 대한 정보를 담는다.
*/
var Monster = function() {
	this.sx = 0;		// 몬스터의 x 속도
	this.sy = 0;		// 몬스터의 y 속도

	this.tag = 0;		// 몇번째로 생성된 몬스터인지 저장하는 값

	this.dead = -1;	// 몬스터의 사망 상태
						// -1일 경우 살아있는 몬스터
						// 0 이상의 값일 경우 몬스터가 미사일에 맞은 당시의 tick 값
						//   tick 값은 몬스터르 바로 삭제 않고, 애니메이션이 끝난 후 삭제하기 위해 저장한다.

	this.sprite = cc.Sprite.create("res/bee.png");		// 몬스터의 스프라이트
};

/*
	a,b의 사각 영역에 대해 서로의 충돌 검사를 수행한다.
*/
var intersectWith = function(a, b){
	var Amin;
	var Amax;
	var Bmin;
	var Bmax;

	Amin = a.x;
	Amax = Amin + a.width;
	Bmin = b.x;
	Bmax = Bmin + b.width;
	if (Bmin > Amin)
		Amin = Bmin;
	if (Bmax < Amax)
		Amax = Bmax;
	if (Amax <= Amin)
		return false;

	Amin = a.y;
	Amax = Amin + a.height;
	Bmin = b.y;
	Bmax = Bmin + b.height;
	if (Bmin > Amin)
		Amin = Bmin;
	if (Bmax < Amax)
		Amax = Bmax;
	if (Amax <= Amin)
		return false;

	return true;
};


/*
	GameScene

	게임이 진행되는 씬

	->
*/
var Game = cc.Layer.extend({
	screenSize:null,

	/*
		게임이 시작된 이후로 몇 초지났는지 카운팅하는 변수
	*/
    tick : 0,
  
	labelTitle:null,

	bgi1:null, bgi2:null,
	bgiViewSize:null,

	payer:null,
	fadeAction:null,
	
	scroll:0,

	keyArray : [],

	mlsArray : [],
	mlsCounter : 0,

	enemyArray : [],
	enemyCounter : 100000,

	shootTick : -9999,

	/*
		게임의 초기화 함수
	*/
    init:function () {
        var selfPointer = this;
       
        this._super();

        var size = cc.Director.getInstance().getWinSize();
		screenSize = size;

		this.composeUI();        

		/*
			입력을 enable
		*/
		this.setKeyboardEnabled(true);

		/*
			매 프레임마다 update 함수가 호출되도록 한다.
		*/
		this.scheduleUpdate();

		audio.playEffect("sound/credit.mp3");

        return true;
    },

	/*
		UI의 구성
	*/
	composeUI:function(){
		var size = screenSize;

		/*
			왼쪽 상단 라벨
		*/
		this.labelTitle = cc.LabelTTF.create(
			"Galaga", "Arial", 30);
		this.labelTitle.setColor(cc.c3(255,255,255));
		this.labelTitle.setAnchorPoint(cc.p(0,1));
		this.labelTitle.setPosition(cc.p(10,size.height-10));

		/*
			배경
		*/
		var bgiSize = cc.size(640,480);

        this.bgi1 = cc.Sprite.create("res/space.jpg");
        this.bgi1.setPosition(cc.p(size.width / 2, size.height / 2));
		this.bgi2 = cc.Sprite.create("res/space.jpg");
        this.bgi2.setPosition(cc.p(size.width / 2, size.height / 2));

		/*
			배경을 화면 크기에 맞도록 스케일링한다.
		*/
		this.bgi1.setScaleX( size.width / bgiSize.width);
		this.bgi2.setScaleX( size.width / bgiSize.width);

		this.bgi1.setScaleY( size.height / bgiSize.height);
		this.bgi2.setScaleY( size.height / bgiSize.height);

		this.bgiViewSize = 
			cc.size( bgiSize.width * this.bgi1.getScaleX(), bgiSize.height * this.bgi1.getScaleY());

		/*
			플레이어
		*/
		this.player = cc.Sprite.create("res/player.png");
		this.player.setPosition(cc.p(size.width / 2, 100));
		this.player.setScale(0.7);

		/*
			깜빡임 액션 생성
		*/
		var actionFade = cc.FadeIn.create(0.2);
        var fadeBack = actionFade.reverse();

        this.fadeAction = cc.Sequence.create(actionFade, fadeBack, actionFade);

        this.addChild(this.bgi1);
		this.addChild(this.bgi2);
		this.addChild(this.labelTitle);
		this.addChild(this.player);

	},

	/*
		배경의 스크롤 처리를 한다.
	*/
	doScroll:function(){
		this.scroll -= 8;

		this.bgi1.setPositionY(this.scroll % this.bgiViewSize.height + this.bgiViewSize.height + this.bgiViewSize.height/2);
		this.bgi2.setPositionY(this.scroll % this.bgiViewSize.height  + this.bgiViewSize.height/2);
	},

	/*
		키입력에 대한 처리를 한다.
	*/
	processKey:function(){
		var pos = this.player.getPosition();

		/*
			방향키의 처리
		*/
		if(this.keyArray[cc.KEY.left]){
			this.player.setPositionX(pos.x - MOVEMENT_SPEED);
		}
		if(this.keyArray[cc.KEY.right]){
			this.player.setPositionX(pos.x + MOVEMENT_SPEED);
		}
		if(this.keyArray[cc.KEY.up]){
			this.player.setPositionY(pos.y + MOVEMENT_SPEED);
		}
		if(this.keyArray[cc.KEY.down]){
			this.player.setPositionY(pos.y - MOVEMENT_SPEED);
		}

		/*
			미사일 발사 버튼 누름
		*/
		if(this.keyArray[cc.KEY.space]){
			/*
				지정된 시간마다 미사일을 발사하도록 처리
			*/
			if(this.tick - this.shootTick >= SHOOTING_INTERVAL){
				audio.playEffect("sound/shoot.mp3");

				this.shootTick = this.tick;

				var m = new Missile();
				m.own = OWN_PLAYER;
				m.sy = 10;
				m.sprite = cc.Sprite.create("res/ball2.png");
				m.sprite.setPosition( pos );
				m.tag = this.mlsCounter++;

				this.addChild(m.sprite, 5, m.tag);
				this.mlsArray.push(m);
			}
		}
	},

	/*
		모든 미사일 오브젝트들을 진행시킨다.
	*/
	stepMissile:function(){
		for (var i=0; i<this.mlsArray.length;i++)
		{
			var mls = this.mlsArray[i];
			var pos = mls.sprite.getPosition();

			/*
				미사일 좌표의 스텝
			*/
			mls.sprite.setPosition(
				cc.p(
					pos.x + mls.sx, pos.y + mls.sy)
				);

			/*
				보이는곳에서 벗어나는 미사일을 지운다.
			*/
			var screenRect = cc.RectMake(0,0,screenSize.width,screenSize.height);
			var mlsRect = cc.RectMake(pos.x, pos.y, 30,30);

			if(! intersectWith(screenRect, mlsRect)){
				this.removeChildByTag(mls.tag);
				this.mlsArray.splice(i,1);

				continue;
			}

			/*
				판정 처리
			*/

			/*
				미사일이 몬스터 것이면
			*/
			if(mls.own == OWN_MONSTER){
				/*
					플레이어와 충돌 처리
				*/
				var playerRect = cc.RectMake(this.player.getPositionX(), this.player.getPositionY()-10,	100, 60);

				if(intersectWith(playerRect, mlsRect)){
					audio.playEffect("sound/hit2.mp3");

					/*
						깜빡이는 애니메이션 처리
					*/
					this.player.stopAction( this.fadeAction );
					this.player.runAction( this.fadeAction );

					/*
						충돌한 미사일의 삭제
					*/
					this.removeChildByTag(mls.tag);
					this.mlsArray.splice(i,1);
				}
			}
			/*
				미사일이 플레이어가 쏜것이면
			*/
			else{
				/*
					적군 모두와 비교해 충돌처리
				*/
				for(j=0;j<this.enemyArray.length;j++){
					var mon = this.enemyArray[j];
					var monRect = 
						cc.RectMake(mon.sprite.getPositionX(), mon.sprite.getPositionY(), 40,28);
					
					/*
						이미 죽은 몬스터는 넘긴다.
					*/
					if(mon.dead != -1) continue;

					if(intersectWith(monRect, mlsRect)){
						audio.playEffect("sound/hit.mp3");

						/*
							몬스터의 깜빡임 애니메이션 처리
						*/
						mon.sprite.stopAction( this.fadeAction );
						mon.sprite.runAction( this.fadeAction );

						mon.dead = this.tick;

						/*
							충돌한 미사일의 삭제
						*/
						this.removeChildByTag(mls.tag);
						this.mlsArray.splice(i,1);

						break;
					}
				}
			}
		}
	},
	
	/*
		새 몬스터를 랜덤한 위치에 생성한다.
	*/
	spawnMonster:function(){
		var m = new Monster();
		var pos = cc.p(
			Math.random() * (screenSize.width-100) + 100, screenSize.height);

		m.sy = -1;
		m.sprite.setPosition( pos );
		m.tag = this.enemyCounter++;

		this.addChild(m.sprite, 4, m.tag);
		this.enemyArray.push(m);
	},
	
	/*
		몬스터의 스텝 처리
	*/
	stepMonster:function(){
		for (var i=0; i<this.enemyArray.length;i++)
		{
			var mon = this.enemyArray[i];
			var pos = mon.sprite.getPosition();

			/*
				미사일 좌표의 스텝
			*/
			mon.sprite.setPosition(
				cc.p(
					pos.x + mon.sx, pos.y + mon.sy)
				);

			/*
				몬스터의 미사일 발사
			*/
			if(Math.random() * 100 < MONSTER_ATTACK_RATE){
				var m = new Missile();

				m.own = OWN_MONSTER;
				m.sy = -8;
				m.sprite = cc.Sprite.create("res/ball3.png");
				m.sprite.setPosition( pos );
				m.tag = this.mlsCounter++;

				this.addChild(m.sprite, 5, m.tag);
				this.mlsArray.push(m);
			}

			/*
				보이는곳에서 벗어나는 몬스터를 지운다.
			*/
			var screenRect = cc.RectMake(0,0,screenSize.width,screenSize.height+100);
			var monRect = cc.RectMake(pos.x, pos.y, 40,30);

			if(! intersectWith(screenRect, monRect)){
				this.removeChildByTag(mon.tag);
				this.enemyArray.splice(i,1);

				continue;
			}

			/*
				죽을 시간이 다 된 몬스터를 지운다.
			*/
			if( mon.dead != -1 && this.tick - mon.dead >= 0.7 ){
				this.removeChildByTag(mon.tag);
				this.enemyArray.splice(i,1);

				continue;
			}
		}
	},

	/*
		매 프레임마다 호출되는 함수
	*/
	update:function(dt){
		this.tick += dt;

		this.doScroll();
		this.processKey();

		this.stepMissile();

		this.stepMonster();

		if(Math.random() * 100 <= MONSTER_SPAWN_RATE)
			this.spawnMonster();

		this.labelTitle.setColor(
			cc.c3(
				Math.random()*255,Math.random()*255,Math.random()*255
				)
			);
	},

    /*
		닫기 버튼을 눌렀을 때의 콜백
	*/
    menuCloseCallback:function (sender) {
        cc.Director.getInstance().end();
    },

	onKeyDown:function (key){
		var pos = this.player.getPosition();
		
		this.keyArray[key] = 1;
	},
	onKeyUp:function (key){
		this.keyArray[key] = 0;
	}
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Game();
        layer.init();
        this.addChild(layer);
    }
});

