var LAppDefine = {
    
    // デバッグ。trueのときにログを表示する。                               调试。在true的时候显示日志。
    DEBUG_LOG : true,
    DEBUG_MOUSE_LOG : false, // マウス関連の冗長なログ                 鼠标相关的冗余日志
    DEBUG_DRAW_HIT_AREA : true, // 当たり判定の可視化                 当たり判定の可視化 
    DEBUG_DRAW_ALPHA_MODEL : true, // 半透明のモデル描画を行うかどうか。   半透明のモデル描画を行うかどうか。
    
    //  全体の設定                                                  整体的设定
    
    // 画面                                                        画面
    VIEW_MAX_SCALE : 1.3,                                          //缩放最大值
    VIEW_MIN_SCALE : 0.5,                                       //缩放最小值

    VIEW_LOGICAL_LEFT : -1,
    VIEW_LOGICAL_RIGHT : 1,

    VIEW_LOGICAL_MAX_LEFT : -2,
    VIEW_LOGICAL_MAX_RIGHT : 2,
    VIEW_LOGICAL_MAX_BOTTOM : -2,
    VIEW_LOGICAL_MAX_TOP : 2,
    
    // モーションの優先度定数                                           动作优先常数
    PRIORITY_NONE : 0,                                           //无动作
    PRIORITY_IDLE : 1,                                           //闲置
    PRIORITY_NORMAL : 2,                                         //通常
    PRIORITY_FORCE : 3,                                          //施力
    
    // モデルの後ろにある背景の画像ファイル                                 模特后面背景的画像文件
    BACK_IMAGE_NAME : "/static/assets/image/back_class_normal.png",

    //  モデル定義                                                   模型定义
    MODEL_HARU : "/static/assets/live2d/F/model.model.json",
/*  MODEL_HARU : "/static/assets/live2d/F/model.model.json",
    MODEL_HARU_A : "/static/assets/live2d/haru/haru_01.model.json",
   MODEL_HARU_B : "/static/assets/live2d/haru/haru_02.model.json",
   MODEL_SHIZUKU : "/static/assets/live2d/shizuku/shizuku.model.json",
    MODEL_WANKO : "/static/assets/live2d/F/model.model.json",

   MODEL_EPSILON : "/static/assets/live2d/Epsilon2.1/Epsilon2.1.model.json",*/

     /*MODEL_HARU : "/static/assets/live2d/F/model.model.json",*/
    // 外部定義ファイル(json)と合わせる                                  外部定义文件（json）和配合
    MOTION_GROUP_IDLE : "idle", // アイドリング                        闲置转动	
    MOTION_GROUP_TAP_BODY : "tap_body", // 体をタップしたとき           身体旋转的时候
    MOTION_GROUP_FLICK_HEAD : "flick_head", // 頭を撫でた時           抚摸头部的时候
    MOTION_GROUP_PINCH_IN : "pinch_in", // 拡大した時				   扩大的时候								
    MOTION_GROUP_PINCH_OUT : "pinch_out", // 縮小した時			   缩小的时候
    MOTION_GROUP_SHAKE : "shake", // シェイク                         抖动

    // 外部定義ファイル(json)と合わせる
    HIT_AREA_HEAD : "head",
    HIT_AREA_BODY : "body"
    
};
