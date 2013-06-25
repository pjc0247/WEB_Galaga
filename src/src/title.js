/*
	����� ������ �ν��Ͻ� ���
*/
var audio = cc.AudioEngine.getInstance();

/*
	TitleScene

	������ Ÿ��Ʋ ȭ��

	-> GameScene
*/
var Title = cc.Layer.extend({
	screenSize:null,

	logo:null,
	bgi:null,

	cursor: 0,
	cur : null,

	titleSE:null,

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

		titleSE = audio.playEffect("sound/title.mp3");

        return true;
    },

	/*
		UI�� ����
	*/
	composeUI:function(){
		var size = screenSize;
		var bgiSize = cc.size(640,480);

		/*
			���
		*/
		this.bgi = cc.Sprite.create("res/space.jpg");
		this.bgi.setPosition(cc.p(size.width/2, size.height/2));

		/*
			����� ȭ�鿡 �� ������ �������� �����Ѵ�.
		*/
		this.bgi.setScaleX( size.width / bgiSize.width);
		this.bgi.setScaleY( size.height / bgiSize.height);

		/*
			Ÿ��Ʋ
		*/
		this.logo = cc.Sprite.create("res/title.png");
		this.logo.setPosition(cc.p(size.width/2, size.height/2 + 100));
		this.logo.setScale(0.6);

		/*
			Ŀ��
		*/
		this.cur = cc.Sprite.create("res/ball3.png");
		this.cur.setPosition(cc.p(250, 190));

		/*
			�޴�
		*/
		var startItem = cc.MenuItemImage.create(
            "res/gamestart.png",
            "res/gamestart_hot.png",
            function () {
				audio.stopEffect(titleSE);
				audio.unloadEffect("sound/title.mp3");

				audio.playEffect("sound/credit.mp3");

                cc.Director.getInstance().replaceScene(
				   new GameScene());
            },this);
		var infoItem = cc.MenuItemImage.create(
            "res/info.png",
            "res/info_hot.png",
            function () {
                history.go(-1);
            },this);
		var helpItem = cc.MenuItemImage.create(
            "res/help.png",
            "res/help_hot.png",
            function () {
                history.go(-1);
            },this);

        var menu = cc.Menu.create(startItem, infoItem, helpItem);
        menu.setPosition(cc.PointZero());

        startItem.setPosition(cc.p(size.width/2, 190)); 
		infoItem.setPosition(cc.p(size.width/2, 135)); 
		helpItem.setPosition(cc.p(size.width/2, 80)); 

		this.addChild(this.bgi);
		this.addChild(this.logo);
		this.addChild(menu);
		this.addChild(this.cur);
	},

	
	/*
		�� �����Ӹ��� ȣ��Ǵ� �Լ�
	*/
	update:function(dt){
	
	},

    /*
		�ݱ� ��ư�� ������ ���� �ݹ�
	*/
    menuStartCallback:function (sender) {
		console.log("WER");
        cc.Director.getInstance().end();
    },

	onKeyDown:function (key){
		/*
			����Ű�� ������ Ŀ���� �̵� ó��
		*/
		if(key == cc.KEY.down){
			if(this.cursor == 2) return;

			this.cursor += 1;

			this.cur.setPosition(cc.p(250, 190-this.cursor*55));
		}
		if(key == cc.KEY.up){
			if(this.cursor == 0) return;

			this.cursor -= 1;

			this.cur.setPosition(cc.p(250, 190-this.cursor*55));
		}
		/*
			����Ű�� ������ �ش� Ŀ���� ���� ó��
		*/
		if(key == cc.KEY.enter){
			if( this.cursor == 0 ){
				audio.stopEffect(titleSE);
				audio.unloadEffect("sound/title.mp3");

				audio.playEffect("sound/credit.mp3");

				cc.Director.getInstance().replaceScene(
				   new GameScene());
			}
		}
	},
	onKeyUp:function (key){
	}
});

var TitleScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Title();
        layer.init();
        this.addChild(layer);
    }
});

