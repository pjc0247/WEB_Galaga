/*
	오디오 엔진의 인스턴스 얻기
*/
var audio = cc.AudioEngine.getInstance();

/*
	TitleScene

	게임의 타이틀 화면

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

		titleSE = audio.playEffect("sound/title.mp3");

        return true;
    },

	/*
		UI의 구성
	*/
	composeUI:function(){
		var size = screenSize;
		var bgiSize = cc.size(640,480);

		/*
			배경
		*/
		this.bgi = cc.Sprite.create("res/space.jpg");
		this.bgi.setPosition(cc.p(size.width/2, size.height/2));

		/*
			배경이 화면에 꽉 차도록 스케일을 지정한다.
		*/
		this.bgi.setScaleX( size.width / bgiSize.width);
		this.bgi.setScaleY( size.height / bgiSize.height);

		/*
			타이틀
		*/
		this.logo = cc.Sprite.create("res/title.png");
		this.logo.setPosition(cc.p(size.width/2, size.height/2 + 100));
		this.logo.setScale(0.6);

		/*
			커서
		*/
		this.cur = cc.Sprite.create("res/ball3.png");
		this.cur.setPosition(cc.p(250, 190));

		/*
			메뉴
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
		매 프레임마다 호출되는 함수
	*/
	update:function(dt){
	
	},

    /*
		닫기 버튼을 눌렀을 때의 콜백
	*/
    menuStartCallback:function (sender) {
		console.log("WER");
        cc.Director.getInstance().end();
    },

	onKeyDown:function (key){
		/*
			방향키를 누르면 커서의 이동 처리
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
			엔터키를 누르면 해당 커서에 대한 처리
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

