/*
 * ツリーベル四日市事業所
 * 第3回PGコンテスト用ベースすごろくプログラム
 * メイン処理
 */

//更新履歴
//2020 1/16 和田 新規作成

/* 定数 */
//マス数
const  _BOARDSIZE = 30;
//const _ROLLSPEED = 10;
const _ROLLSPEED = 30;

/* グローバル変数 */

//プレイヤー数
var playerCnt = 1;

//ターンプレイヤー
var nowPlayerId = 1;

//プレイヤー情報
var playerInfo = [];

//ダイスロール非同期処理管理ID
var diceTimerId;

//全プレイヤーターンカウント
var allPlayerCount = 0;

// ゲーム終了条件を満たしたプレイヤーが出たか
//var endPlayer = false;

/**
 * 初期処理
 */
$(function() {
	//ログ初期化
	$("#logMsg").val("");

	//プレイヤー情報初期化
	//スタート位置：0
        //Rest:true⇒1回休み
        //Bunki:true⇒分岐した道へ進む
        //BunkiChk:true⇒分岐した道へ進むか判定するダイスを振る
        //AddMus:ダイス目に追加して進むマス
        //Again:再度ダイスを振るかどうか
        //End:true⇒ゲーム終了条件を満たしている
	playerInfo[1] = {Pos:0,Rest:false,Bunki:false,BunkiChk:false,AddMus:0,Again:false,End:false};
});

/**
 * ログメッセージ書き込み処理
 */
function writeMsg(msg){
	$("#logMsg").val($("#logMsg").val() + msg  + "\r\n");
	$("#logMsg").scrollTop($("#logMsg")[0].scrollHeight);
}

/**
 * ゲーム開始時処理
 */
function startGame() {
	//盤面描画
	drawBoard();
        // コンボボックスから選択値を取得
        const playerSelect = document.formPlayer.playerSelect;
	const num = playerSelect.selectedIndex;
	const str = playerSelect.options[num].value;
        // プレイヤーカウントにセット
        playerCnt = Number(str);
        // 現在のプレイヤーを表示
        $("#turnPlayer").text("Player"+String(nowPlayerId))
        // プレイヤーが2人以上いたらプレイヤー情報に追加する
        for(var i = 1; i < playerCnt; i++){
             playerInfo[i+1] = {Pos:0,Rest:false,Bunki:false,BunkiChk:false,AddMus:0,Again:false,End:false};
        }

	//プレイヤー位置描画
	drawBoardPos();

	//設定エリア非表示
	$("#gameSettingArea").hide();

	//ゲームエリア表示
	$("#gameArea").show();
	writeMsg("ゲームを開始します。");
        writeMsg("ランダム数値" + Math.floor(Math.random() * playerCnt +1));

        allStartTurn();
}

/**
 * 盤面描画処理
 */
function drawBoard(){
	var massIdCnt = 0;
	var drawVectorNormal = true;
	var nowYRow =  $('<div class="boardYRow"></div>');

	//プレイヤーの盤面上のコマ
	var massElm =  '<span class="boardMass"><div class="massPlayerArea"></div></span>'
	var massBigElm =  '<span class="boardBigMass"><div class="massPlayerArea"></div></span>'

	var boardXSize = 10;

        // 分岐道用のマスカウント
        var bunkiMassIdCnt = 110;
        // 描画行カウント
        var rowCnt = 1;

	var xCnt = 0;
	for(var i=0;i < _BOARDSIZE;i++) {
		//右方向にマス描画
		if(drawVectorNormal) {
			if( xCnt  !=  boardXSize) {

                            var mass; 
                            if(xCnt ==  boardXSize -1){
                                // 1行目の最後には大きなマスを表示
                                mass = $(massBigElm).attr("massNo",massIdCnt).attr("id","mass"+massIdCnt);
                            }else{
                                mass = $(massElm).attr("massNo",massIdCnt).attr("id","mass"+massIdCnt);
                            }				
			    $(nowYRow).append(mass);
			    massIdCnt++;
		            xCnt++;

                        // 5行目の分岐道を表示(S)
                        if(i == _BOARDSIZE -1){

                            // 5行目の分岐道を表示(S)
                            bunkiMassIdCnt +=9;
                                // 分岐した道を表示
                                for(var j=0;j < 10;j++) {
                                var massBunki = $(massElm).attr("massNo",bunkiMassIdCnt).attr("id","mass"+bunkiMassIdCnt);
				$(nowYRow).append(massBunki);
                                bunkiMassIdCnt--;
                                }
                            
                        }
                        // 5行目の分岐道を表示(E)


			} else {
				$("#board").append(nowYRow);
				nowYRow =  $('<div></div>');
                                rowCnt ++;
				for(var j=0;j<boardXSize-1;j++) {
                                    $(nowYRow).append( '<span class="karaMass"></span>')
				}
				var mass = $(massElm).attr("massNo",massIdCnt).attr("id","mass"+massIdCnt);
				$(nowYRow).append(mass);
				massIdCnt++;

                                // 2行目の分岐道を表示(S)
                                if(rowCnt == 2){
                                    // 1マス開ける
                                    $(nowYRow).append( '<span class="karaMass"></span>')
                                    // 分岐した道を表示
                                    var massBunki = $(massElm).attr("massNo",bunkiMassIdCnt).attr("id","mass"+bunkiMassIdCnt);
				    $(nowYRow).append(massBunki);
                                    bunkiMassIdCnt++;
                                }
                                // 2行目の分岐道を表示(E)

				$("#board").append(nowYRow);
				nowYRow =  $('<div></div>');
                                rowCnt ++;
				drawVectorNormal = false;
				xCnt = 0;
			}
		//左方向にマス描画
		} else {
			if( xCnt  !=  boardXSize) {
				var mass = $(massElm).attr("massNo",massIdCnt).attr("id","mass"+massIdCnt);
				$(nowYRow).prepend(mass);
				massIdCnt++;
				xCnt++;
			} else {

                                // 3行目の分岐道を表示(S)
                                if(rowCnt == 3){
                                    // 1マス開ける
                                    $(nowYRow).append( '<span class="karaMass"></span>')
                                    // 分岐した道を表示
                                    for(var j=0;j < 7;j++) {
                                        var massBunki = $(massElm).attr("massNo",bunkiMassIdCnt).attr("id","mass"+bunkiMassIdCnt);
				        $(nowYRow).append(massBunki);
                                        bunkiMassIdCnt++;
                                    }
                                }
                                // 3行目の分岐道を表示(E)

				$("#board").append(nowYRow);
				nowYRow =  $('<div></div>');
                                rowCnt ++;
				var mass = $(massElm).attr("massNo",massIdCnt).attr("id","mass"+massIdCnt);
				$(nowYRow).append(mass);
				massIdCnt++;

                                // 4行目の分岐道を表示(S)
                                if(rowCnt == 4){
                                    // 空マスを追加
                                    for(var j=0;j < 16;j++) {
                                        $(nowYRow).append( '<span class="karaMass"></span>')
                                    }
                                    //分岐した道を表示
                                    var massBunki = $(massElm).attr("massNo",bunkiMassIdCnt).attr("id","mass"+bunkiMassIdCnt);
				    $(nowYRow).append(massBunki);
                                    bunkiMassIdCnt++;
                                }
                                // 4行目の分岐道を表示(E)

                                $("#board").append(nowYRow);
				nowYRow =  $('<div></div>');
                                rowCnt ++;
				drawVectorNormal = true;
				xCnt = 0;
			}
		}
	}
//	$("#board").append(nowYRow).width(80*boardXSize);
	$("#board").append(nowYRow).width(800*boardXSize);
	//開始地点と終了地点には色を付ける
        //イベント発生マスには赤色を付ける
	$("#mass"+0).css("background-color","yellow");
	$("#mass"+5).css("background-color","red");
	$("#mass"+9).css("background-color","red");
	$("#mass"+15).css("background-color","red");
        $("#mass"+20).css("background-color","red");
        $("#mass"+23).css("background-color","red");
        $("#mass"+28).css("background-color","red");
        $("#mass"+114).css("background-color","red");
        $("#mass"+118).css("background-color","red");
        $("#mass"+121).css("background-color","red");
        $("#mass"+128).css("background-color","red");
	$("#mass"+(_BOARDSIZE-1)).css("background-color","blue");
}

/**
 * プレイヤー情報から盤面に位置を再描画
 */
function drawBoardPos() {
	$(".playerMassIcon").remove();
	for(var i=1;i<playerCnt+1;i++) {
		var pos = playerInfo[i].Pos
                // プレイヤー別に描画を変更
                switch (i){
                  case 1:
                    $("#mass" + pos + " .massPlayerArea").append("<span class='playerMassIcon'>①</span>");
                    break;
                  case 2:
                    $("#mass" + pos + " .massPlayerArea").append("<span class='playerMassIcon'>②</span>");
                    break;
                  case 3:
                    $("#mass" + pos + " .massPlayerArea").append("<span class='playerMassIcon'>③</span>");
                    break;
                  case 4:
                    $("#mass" + pos + " .massPlayerArea").append("<span class='playerMassIcon'>④</span>");
                    break;
                  case 5:
                    $("#mass" + pos + " .massPlayerArea").append("<span class='playerMassIcon'>⑤</span>");
                    break;
                  case 6:
                    $("#mass" + pos + " .massPlayerArea").append("<span class='playerMassIcon'>⑥</span>");
                    break;
                }
	}
}

/**
 * ターン開始時処理
 */
function startTurn(){


        // 通常の道の枠線色を元に戻す
        for(var i = 0; i< _BOARDSIZE; i++){
            $("#mass"+i).css("border-color","black");
        }
        // 分岐した道の枠線色を元に戻す
        for(var i = 110; i< 129; i++){
            $("#mass"+i).css("border-color","black");
        }

        // ターンプレイヤーのマスの枠線の色を変える
        $("#mass"+playerInfo[nowPlayerId].Pos).css("border-color","aqua");
        writeMsg("\nPlayer"+String(nowPlayerId)+"の番です");

        //1回休みの場合
        if(playerInfo[nowPlayerId].Rest){
            window.alert("Player"+String(nowPlayerId)+"は1回休みです。");
            writeMsg("Player"+String(nowPlayerId)+"は1回休みです。");
            playerInfo[nowPlayerId].Rest = false;
            endTurn();
        }
        //分岐道をチェックする場合
        if(playerInfo[nowPlayerId].BunkiChk){
            window.alert("Player"+String(nowPlayerId)+"の番です\n初めに1度ダイスを振って進む道を決定してください。\n1～3で左:4～6で右の道へ進みます。");
	    writeMsg("初めに1度ダイスを振って進む道を決定してください。\n1～3で左:4～6で右の道へ進みます。");
        }

        // 現在のプレイヤーをセット
        $("#turnPlayer").text("Player"+String(nowPlayerId))
        $("#diceStart").removeAttr("disabled");
	//setTimeout(diceRoll,1500);
}

/**
 * 全員の同一ターン開始時処理
 */
function allStartTurn(){
        allPlayerCount++;
        writeMsg("\nターン"+allPlayerCount+"開始:");
        startTurn(nowPlayerId);
}

/**
 * 全員の同一ターン終了時処理
 */
function allEndTurn(){

        // 1人でもゲーム終了条件を満たしていたらゲームを終了させる
        for(var i = 1; i <= playerCnt; i++){
             if( playerInfo[i].End == true){
                 gameEnd();
                 return;
             }
        }
        allStartTurn();
}

/**
 * ダイス回転開始
 */
//function diceRoll(){

	//setTimeout(diceRoll,1500);
	//diceTimerId = setInterval(function(){
		//$("#dice").text(Math.floor(Math.random() * 6)+1);
	//},_ROLLSPEED)
	//$("#diceroll").removeAttr("disabled");
//}

/**
 * ダイス回転開始
 */
function diceStart(){

	//setTimeout(diceRoll,1500);        

	diceTimerId = setInterval(function(){
		$("#dice").text(Math.floor(Math.random() * 6)+1);
	},_ROLLSPEED)
        $("#diceStop").removeAttr("disabled");
        $("#diceStart").attr("disabled","disabled");
}

/**
 * ダイス停止処理
 */
function diceStop() {

        if(playerInfo[nowPlayerId].BunkiChk == true){
        // 分岐チェックをするダイスを振る
            clearInterval(diceTimerId);
	    var diceCnt = Number($("#dice").text().trim());
            if(diceCnt <=3){
                playerInfo[nowPlayerId].Bunki = false;
                window.alert("左の道へ進みます。");
	        writeMsg("左の道へ進みます。");
            }else if(diceCnt >=4){
                playerInfo[nowPlayerId].Bunki = true;
                playerInfo[nowPlayerId].AddMus = 100;
                window.alert("右の道へ進みます。");
	        writeMsg("右の道へ進みます。");
            }
            playerInfo[nowPlayerId].BunkiChk = false
	    $("#diceStop").attr("disabled","disabled");
            $("#diceStart").removeAttr("disabled");

        }else if(playerInfo[nowPlayerId].BunkiChk == false){
            // 通常のダイス処理
	    clearInterval(diceTimerId);
	    var diceCnt = Number($("#dice").text().trim());

            // 分岐した道へ移動
            if(playerInfo[nowPlayerId].AddMus > 0){
                diceCnt += playerInfo[nowPlayerId].AddMus;
                playerInfo[nowPlayerId].AddMus = 0;
            }
            // 分岐点の道は強制的に止まる
            if(playerInfo[nowPlayerId].Pos <=8){
                if(playerInfo[nowPlayerId].Pos + diceCnt >= 9){
                    diceCnt = 9 -playerInfo[nowPlayerId].Pos;
                }
            }

	    $("#diceStop").attr("disabled","disabled");
            writeMsg(diceCnt  +"が出ました");
	    //ダイスの移動結果か、イベントの実行結果でゲーム終了条件を満たしたらゲーム終了
	    if(playerMove(nowPlayerId,diceCnt) || eventCheck(nowPlayerId)) {
                // ゴールについた場合

                if(playerInfo[nowPlayerId].Again == false){
                    
                    //gameEnd();
                    //endPlayer = true;
	            window.alert("プレイヤー"+nowPlayerId+"がゴールに着きました。");
                    writeMsg("プレイヤー"+nowPlayerId+"がゴールに着きました。");
                    playerInfo[nowPlayerId].End = true;
                    endTurn();
                } else if(playerInfo[nowPlayerId].Again == true) {
                    // 再度ダイスを振るイベントが起こっている場合はターンプレイヤーの処理を続ける
                    playerInfo[nowPlayerId].Again = false;
                    $("#diceStart").removeAttr("disabled");

                    // 通常の道の枠線色を元に戻す
                    for(var i = 0; i< _BOARDSIZE; i++){
                        $("#mass"+i).css("border-color","black");
                    }
                    // 分岐した道の枠線色を元に戻す
                    for(var i = 110; i< 129; i++){
                        $("#mass"+i).css("border-color","black");
                    }
                    // ターンプレイヤーのマスの枠線の色を変える
                    $("#mass"+playerInfo[nowPlayerId].Pos).css("border-color","aqua");
                }
	
	    } else {
                // ゴールについていない場合

                if(playerInfo[nowPlayerId].Again == false){
                    endTurn();
                } else if(playerInfo[nowPlayerId].Again == true) {
                    // 再度ダイスを振るイベントが起こっている場合はターンプレイヤーの処理を続ける
                    playerInfo[nowPlayerId].Again = false;
                    $("#diceStart").removeAttr("disabled");
                    // 通常の道の枠線色を元に戻す
                    for(var i = 0; i< _BOARDSIZE; i++){
                        $("#mass"+i).css("border-color","black");
                    }
                    // 分岐した道の枠線色を元に戻す
                    for(var i = 110; i< 129; i++){
                        $("#mass"+i).css("border-color","black");
                    }
                    // ターンプレイヤーのマスの枠線の色を変える
                    $("#mass"+playerInfo[nowPlayerId].Pos).css("border-color","aqua");
                }
	    }
        }
}

/**
 * 指定したプレイヤーの位置を指定したマス分移動させる
 * @param pId 移動させる対象のプレイヤーID
 * @param move 移動数
 * @return true:ゲーム終了 false：ゲーム継続
 */
function playerMove(pId,move) {

        if(playerInfo[pId].Bunki == true){
        // 分岐した道へ進む場合
            if(playerInfo[pId].Pos+ move <= 0) {
		    playerInfo[pId].Pos = 0;
		    drawBoardPos();
	    } else if(playerInfo[pId].Pos+ move >= _BOARDSIZE-1+100) {
		    playerInfo[pId].Pos = _BOARDSIZE-1;
		    drawBoardPos();
		    return true
	    } else {
		    playerInfo[pId].Pos = playerInfo[pId].Pos + move;
		    drawBoardPos();
	    }
	    return false

        
        }else{
        // 通常の道へ進む場合
	    if(playerInfo[pId].Pos+ move <= 0) {
		    playerInfo[pId].Pos = 0;
		    drawBoardPos();
	    } else if(playerInfo[pId].Pos+ move >= _BOARDSIZE-1) {
		    playerInfo[pId].Pos = _BOARDSIZE-1;
		    drawBoardPos();
		    return true
	    } else {
		    playerInfo[pId].Pos = playerInfo[pId].Pos + move;
		    drawBoardPos();
	    }
	    return false
        }
}

/**
 * 指定したプレイヤー同士の位置を入れ替える
 * @param pId 移動させる現ターンのプレイヤーID
 * @param changePId 移動させる現ターンではないプレイヤーID
 * @return true:ゲーム終了 false：ゲーム継続
 */
function playerChangeMove(pId,changePId) {

        // 各プレイヤーの現位置を保管
        var pIdPos = playerInfo[pId].Pos;
        var pIdBunki = playerInfo[pId].Bunki;
        var changePIdPos = playerInfo[changePId].Pos;
        var changePIdBunki = playerInfo[changePId].Bunki;
       
        // 位置を入れ替え
        playerInfo[changePId].Pos = pIdPos;
        playerInfo[changePId].Bunki = pIdBunki;
        playerInfo[pId].Pos = changePIdPos;
        playerInfo[pId].Bunki = changePIdBunki;

        // 分岐点の道のプレイヤーと変わった場合の処理
        if(playerInfo[pId].Pos == 9) {
            playerInfo[pId].BunkiChk = true;
            playerInfo[changePId].BunkiChk = false;
        }


        // ゴールマスのプレイヤーを変わった場合の処理
	if(playerInfo[pId].Pos == _BOARDSIZE-1) {
                playerInfo[pId].End = true;
                playerInfo[changePId].End = false;
		drawBoardPos();
                return true;
	} else {
		drawBoardPos();
	}
	return false
}

/**
 * 指定プレイヤーのマス位置イベントを実行
 * @param pId
 * @return true:ゲーム終了 false：ゲーム継続
 */
function eventCheck(pId){
	//到着マスのイベント発生
	  //var massEvt = _events[playerInfo[pId].Pos];
          var massEvt;
          var pos = playerInfo[pId].Pos;

          // イベントマスの場合
          if(pos == 5 ||
             pos == 15 ||
             pos == 20 ||
             pos == 23 ||
             pos == 28 ||
             pos == 114 ||
             pos == 118 ||
             pos == 121 ||
             pos == 128
          ){
               writeMsg("ランダムイベント：");
               // ランダムイベント
               var random = Math.floor(Math.random() * 6 +1);
	       var massEvt = _events[random];
           } else if(pos == 9){
             // 分岐道のイベント
             var massEvt = _events[0];
           }

	if(massEvt) {
		return massEvt();
	} else {
		writeMsg("何も起こらなかった");
	}
	return false;

}


/*
 * ターン終了時処理
 */
function endTurn(){

	if(nowPlayerId < playerCnt) {
            // 個別のターン終了 
            nowPlayerId++;
            startTurn();    
	} else {
            // 全員のターン終了
	    nowPlayerId = 1;
            allEndTurn();
	}
}

/**
 * ゲーム終了条件が満たされたときにゲームを終了させる
 */
function gameEnd(){
        // 通常の道の枠線色を元に戻す
        for(var i = 0; i< _BOARDSIZE; i++){
            $("#mass"+i).css("border-color","black");
        }
        // 分岐した道の枠線色を元に戻す
        for(var i = 110; i< 129; i++){
            $("#mass"+i).css("border-color","black");
        }
	writeMsg("ゲーム終了");
        writeMsg("次のプレイヤーの勝利です。");
        for(var i = 0; i < playerCnt; i++){
             if(playerInfo[i+1].End == true){
                 writeMsg("プレイヤー"+(i+1));
             }
        }
}