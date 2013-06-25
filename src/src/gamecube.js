/*
	GameCubeScene

	화면에 게임 큐브 로고를 출력하는 씬.

	-> TitleScene
*/
var GameCube = cc.LayerColor.extend({
	screenSize:null,

	tick : 0,

	logo:null,

	/*
		게임의 초기화 함수
	*/
    init:function () {
        var selfPointer = this;
       
        this._super( cc.c4(0,0,1,255) );

        var size = cc.Director.getInstance().getWinSize();
		screenSize = size;

		this.composeUI();        

		/*
			매 프레임마다 update 함수가 호출되도록 한다.
		*/
		this.scheduleUpdate();

        return true;
    },

	/*
		UI의 구성
	*/
	composeUI:function(){
		var size = screenSize;

		this.logo = cc.Sprite.create("res/gamecube.png");
		this.logo.setPosition(cc.p(size.width / 2, size.height / 2));

		this.addChild(this.logo);
	},

	/*
		매 프레임마다 호출되는 함수
	*/
	update:function(dt){
		this.tick += dt;

		/*
			이 씬이 표시된지 1초가 지나면
		*/
		if(this.tick >= 1){
			/*
				TitleScene으로 이동한다.
			*/
			 var t = cc.TransitionPageTurn.create(1.3, new TitleScene(), false);

			 cc.Director.getInstance().setDepthTest(true);
			 cc.Director.getInstance().replaceScene(t);

			this.unscheduleUpdate();
		}
	}
});

var GameCubeScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameCube();
        layer.init();
        this.addChild(layer);
    }
});

