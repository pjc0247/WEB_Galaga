/*
	GameCubeScene

	ȭ�鿡 ���� ť�� �ΰ� ����ϴ� ��.

	-> TitleScene
*/
var GameCube = cc.LayerColor.extend({
	screenSize:null,

	tick : 0,

	logo:null,

	/*
		������ �ʱ�ȭ �Լ�
	*/
    init:function () {
        var selfPointer = this;
       
        this._super( cc.c4(0,0,1,255) );

        var size = cc.Director.getInstance().getWinSize();
		screenSize = size;

		this.composeUI();        

		/*
			�� �����Ӹ��� update �Լ��� ȣ��ǵ��� �Ѵ�.
		*/
		this.scheduleUpdate();

        return true;
    },

	/*
		UI�� ����
	*/
	composeUI:function(){
		var size = screenSize;

		this.logo = cc.Sprite.create("res/gamecube.png");
		this.logo.setPosition(cc.p(size.width / 2, size.height / 2));

		this.addChild(this.logo);
	},

	/*
		�� �����Ӹ��� ȣ��Ǵ� �Լ�
	*/
	update:function(dt){
		this.tick += dt;

		/*
			�� ���� ǥ�õ��� 1�ʰ� ������
		*/
		if(this.tick >= 1){
			/*
				TitleScene���� �̵��Ѵ�.
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

