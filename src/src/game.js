/*
	����� ������ �ν��Ͻ� ���
*/
var audio = cc.AudioEngine.getInstance();

OWN_PLAYER = 1;
OWN_MONSTER = 2;

/*
	Missile

	�̻��Ͽ� ���� ������ ��´�.
*/
var Missile = function() {
	this.sx = 0;		// �̻����� x �ӵ�
	this.sy = 0;		// �̻����� y �ӵ�

	this.tag = 0;		// �� ��°�� ������ �̻������� �����ϴ� ��
						// �� ���� cocos2d�� removeChildByTag �Լ��� ���� �����Ѵ�.
	
	this.own = 0;		// �̻����� ������, �÷��̾�����, ������

	this.sprite = null;	// �̻����� ��������Ʈ

//	this.sprite.setBlendFunc(cc._blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA));
};

/*
	Monster

	���Ϳ� ���� ������ ��´�.
*/
var Monster = function() {
	this.sx = 0;		// ������ x �ӵ�
	this.sy = 0;		// ������ y �ӵ�

	this.tag = 0;		// ���°�� ������ �������� �����ϴ� ��

	this.dead = -1;	// ������ ��� ����
						// -1�� ��� ����ִ� ����
						// 0 �̻��� ���� ��� ���Ͱ� �̻��Ͽ� ���� ����� tick ��
						//   tick ���� ���͸� �ٷ� ���� �ʰ�, �ִϸ��̼��� ���� �� �����ϱ� ���� �����Ѵ�.

	this.sprite = cc.Sprite.create("res/bee.png");		// ������ ��������Ʈ
};

/*
	a,b�� �簢 ������ ���� ������ �浹 �˻縦 �����Ѵ�.
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

	������ ����Ǵ� ��

	->
*/
var Game = cc.Layer.extend({
	screenSize:null,

	/*
		������ ���۵� ���ķ� �� ���������� ī�����ϴ� ����
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
		������ �ʱ�ȭ �Լ�
	*/
    init:function () {
        var selfPointer = this;
       
        this._super();

        var size = cc.Director.getInstance().getWinSize();
		screenSize = size;

		this.composeUI();        

		/*
			�Է��� enable
		*/
		this.setKeyboardEnabled(true);

		/*
			�� �����Ӹ��� update �Լ��� ȣ��ǵ��� �Ѵ�.
		*/
		this.scheduleUpdate();

		audio.playEffect("sound/credit.mp3");

        return true;
    },

	/*
		UI�� ����
	*/
	composeUI:function(){
		var size = screenSize;

		/*
			���� ��� ��
		*/
		this.labelTitle = cc.LabelTTF.create(
			"Galaga", "Arial", 30);
		this.labelTitle.setColor(cc.c3(255,255,255));
		this.labelTitle.setAnchorPoint(cc.p(0,1));
		this.labelTitle.setPosition(cc.p(10,size.height-10));

		/*
			���
		*/
		var bgiSize = cc.size(640,480);

        this.bgi1 = cc.Sprite.create("res/space.jpg");
        this.bgi1.setPosition(cc.p(size.width / 2, size.height / 2));
		this.bgi2 = cc.Sprite.create("res/space.jpg");
        this.bgi2.setPosition(cc.p(size.width / 2, size.height / 2));

		/*
			����� ȭ�� ũ�⿡ �µ��� �����ϸ��Ѵ�.
		*/
		this.bgi1.setScaleX( size.width / bgiSize.width);
		this.bgi2.setScaleX( size.width / bgiSize.width);

		this.bgi1.setScaleY( size.height / bgiSize.height);
		this.bgi2.setScaleY( size.height / bgiSize.height);

		this.bgiViewSize = 
			cc.size( bgiSize.width * this.bgi1.getScaleX(), bgiSize.height * this.bgi1.getScaleY());

		/*
			�÷��̾�
		*/
		this.player = cc.Sprite.create("res/player.png");
		this.player.setPosition(cc.p(size.width / 2, 100));
		this.player.setScale(0.7);

		/*
			������ �׼� ����
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
		����� ��ũ�� ó���� �Ѵ�.
	*/
	doScroll:function(){
		this.scroll -= 8;

		this.bgi1.setPositionY(this.scroll % this.bgiViewSize.height + this.bgiViewSize.height + this.bgiViewSize.height/2);
		this.bgi2.setPositionY(this.scroll % this.bgiViewSize.height  + this.bgiViewSize.height/2);
	},

	/*
		Ű�Է¿� ���� ó���� �Ѵ�.
	*/
	processKey:function(){
		var pos = this.player.getPosition();

		/*
			����Ű�� ó��
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
			�̻��� �߻� ��ư ����
		*/
		if(this.keyArray[cc.KEY.space]){
			/*
				������ �ð����� �̻����� �߻��ϵ��� ó��
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
		��� �̻��� ������Ʈ���� �����Ų��.
	*/
	stepMissile:function(){
		for (var i=0; i<this.mlsArray.length;i++)
		{
			var mls = this.mlsArray[i];
			var pos = mls.sprite.getPosition();

			/*
				�̻��� ��ǥ�� ����
			*/
			mls.sprite.setPosition(
				cc.p(
					pos.x + mls.sx, pos.y + mls.sy)
				);

			/*
				���̴°����� ����� �̻����� �����.
			*/
			var screenRect = cc.RectMake(0,0,screenSize.width,screenSize.height);
			var mlsRect = cc.RectMake(pos.x, pos.y, 30,30);

			if(! intersectWith(screenRect, mlsRect)){
				this.removeChildByTag(mls.tag);
				this.mlsArray.splice(i,1);

				continue;
			}

			/*
				���� ó��
			*/

			/*
				�̻����� ���� ���̸�
			*/
			if(mls.own == OWN_MONSTER){
				/*
					�÷��̾�� �浹 ó��
				*/
				var playerRect = cc.RectMake(this.player.getPositionX(), this.player.getPositionY()-10,	100, 60);

				if(intersectWith(playerRect, mlsRect)){
					audio.playEffect("sound/hit2.mp3");

					/*
						�����̴� �ִϸ��̼� ó��
					*/
					this.player.stopAction( this.fadeAction );
					this.player.runAction( this.fadeAction );

					/*
						�浹�� �̻����� ����
					*/
					this.removeChildByTag(mls.tag);
					this.mlsArray.splice(i,1);
				}
			}
			/*
				�̻����� �÷��̾ ����̸�
			*/
			else{
				/*
					���� ��ο� ���� �浹ó��
				*/
				for(j=0;j<this.enemyArray.length;j++){
					var mon = this.enemyArray[j];
					var monRect = 
						cc.RectMake(mon.sprite.getPositionX(), mon.sprite.getPositionY(), 40,28);
					
					/*
						�̹� ���� ���ʹ� �ѱ��.
					*/
					if(mon.dead != -1) continue;

					if(intersectWith(monRect, mlsRect)){
						audio.playEffect("sound/hit.mp3");

						/*
							������ ������ �ִϸ��̼� ó��
						*/
						mon.sprite.stopAction( this.fadeAction );
						mon.sprite.runAction( this.fadeAction );

						mon.dead = this.tick;

						/*
							�浹�� �̻����� ����
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
		�� ���͸� ������ ��ġ�� �����Ѵ�.
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
		������ ���� ó��
	*/
	stepMonster:function(){
		for (var i=0; i<this.enemyArray.length;i++)
		{
			var mon = this.enemyArray[i];
			var pos = mon.sprite.getPosition();

			/*
				�̻��� ��ǥ�� ����
			*/
			mon.sprite.setPosition(
				cc.p(
					pos.x + mon.sx, pos.y + mon.sy)
				);

			/*
				������ �̻��� �߻�
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
				���̴°����� ����� ���͸� �����.
			*/
			var screenRect = cc.RectMake(0,0,screenSize.width,screenSize.height+100);
			var monRect = cc.RectMake(pos.x, pos.y, 40,30);

			if(! intersectWith(screenRect, monRect)){
				this.removeChildByTag(mon.tag);
				this.enemyArray.splice(i,1);

				continue;
			}

			/*
				���� �ð��� �� �� ���͸� �����.
			*/
			if( mon.dead != -1 && this.tick - mon.dead >= 0.7 ){
				this.removeChildByTag(mon.tag);
				this.enemyArray.splice(i,1);

				continue;
			}
		}
	},

	/*
		�� �����Ӹ��� ȣ��Ǵ� �Լ�
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
		�ݱ� ��ư�� ������ ���� �ݹ�
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

