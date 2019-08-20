function LAppLive2DManager()
{
    // console.log("--> LAppLive2DManager()");
    
    // モデルデータ																模型数据
    this.models = [];  // LAppModel
    
    //  サンプル機能														    试样功能				
    this.count = -1;
    this.reloadFlg = false; // モデル再読み込みのフラグ							模型重新读取的标志
    
    Live2D.init();
    Live2DFramework.setPlatformManager(new PlatformManager);
    
}

LAppLive2DManager.prototype.createModel = function()
{
    // console.log("--> LAppLive2DManager.createModel()");
    
    var model = new LAppModel();
    this.models.push(model);
    
    return model;
}


LAppLive2DManager.prototype.changeModel = function(gl)
{
    // console.log("--> LAppLive2DManager.update(gl)");
    
    if (this.reloadFlg)
    {
        // モデル切り替えボタンが押された時、モデルを再読み込みする					模型切换按钮被按下时，重新读取模型
        this.reloadFlg = false;
        var no = parseInt(this.count % 5);

        var thisRef = this;
        switch (no)
        {
            /*
            case 0: // ハル												模型Haru
                this.releaseModel(1, gl);
                this.releaseModel(0, gl);
                // OpenGLのコンテキストをセット									OpenGL的上下文设定
                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_HARU);
                break;
            case 1: // しずく												模型水滴
                this.releaseModel(0, gl);
                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_SHIZUKU);
                break;
            case 2: // わんこ												瓷碗
                this.releaseModel(0, gl);
                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_WANKO);
                break;
            case 3: // Epsilon2.1モデル									Epsilon 2.1模型	
                this.releaseModel(0, gl);
                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_EPSILON);
                break;
            case 4: // 複数モデル											多重模式
                this.releaseModel(0, gl);
                // 一体目のモデル											第一个的模型
                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_HARU_A, function() {
                    // 二体目のモデル										第二个的模型
                    thisRef.createModel();
                    thisRef.models[1].load(gl, LAppDefine.MODEL_HARU_B);
                });
                break;
            default:
                break;*/
            default:
                this.releaseModel(0, gl);
                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_HARU);
                break;
        }
    }
};

LAppLive2DManager.prototype.getModel = function(no)
{
    // console.log("--> LAppLive2DManager.getModel(" + no + ")");
    
    if (no >= this.models.length) return null;
    
    return this.models[no];
};


/*
 * モデルを解放する														模型释放
 * ないときはなにもしない													什么都没有的时候
 */
LAppLive2DManager.prototype.releaseModel = function(no, gl)
{
    // console.log("--> LAppLive2DManager.releaseModel(" + no + ")");
    
    if (this.models.length <= no) return;

    this.models[no].release(gl);
    
    delete this.models[no];
    this.models.splice(no, 1);
};


/*
 * モデルの数														模型的数量
 */
LAppLive2DManager.prototype.numModels = function()
{
    return this.models.length;
};


/*
 * ドラッグしたとき、その方向を向く設定する									拖拽的时候，那个方向的设定
 */
LAppLive2DManager.prototype.setDrag = function(x, y)
{
    for (var i = 0; i < this.models.length; i++)
    {
        this.models[i].setDrag(x, y);
    }
}


/*
 * 画面が最大になったときのイベント										画面成为最大的时候的活动			
 */
LAppLive2DManager.prototype.maxScaleEvent = function()
{
    if (LAppDefine.DEBUG_LOG)
        console.log("Max scale event.");
    for (var i = 0; i < this.models.length; i++)
    {
        this.models[i].startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_IN,
                                         LAppDefine.PRIORITY_NORMAL);
    }
}


/*
 * 画面が最小になったときのイベント										画面最小的时候的活动			
 */
LAppLive2DManager.prototype.minScaleEvent = function()
{
    if (LAppDefine.DEBUG_LOG)
        console.log("Min scale event.");
    for (var i = 0; i < this.models.length; i++)
    {
        this.models[i].startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_OUT,
                                         LAppDefine.PRIORITY_NORMAL);
    }
}


/*
 * タップしたときのイベント												旋转的活动
 */
LAppLive2DManager.prototype.tapEvent = function(x, y)
{    
    if (LAppDefine.DEBUG_LOG)
        console.log("tapEvent view x:" + x + " y:" + y);
    for (var i = 0; i < this.models.length; i++)
    {
        if (this.models[i].hitTest(LAppDefine.HIT_AREA_HEAD, x, y))
        {
            // 顔をタップしたら表情切り替え								如果脸被点切换表情
            if (LAppDefine.DEBUG_LOG)
                console.log("Tap face.");

            this.models[i].setRandomExpression();
        }
        else if (this.models[i].hitTest(LAppDefine.HIT_AREA_BODY, x, y))
        {
            // 体をタップしたらモーション								点击身体动作停止
            if (LAppDefine.DEBUG_LOG)
                console.log("Tap body." + " models[" + i + "]");

            this.models[i].startRandomMotion(LAppDefine.MOTION_GROUP_TAP_BODY,
                                             LAppDefine.PRIORITY_NORMAL);
        }
        else
        {
            if(LAppDefine.DEBUG_LOG)
                console.log("No model match");
        }
    }

    return true;
};

