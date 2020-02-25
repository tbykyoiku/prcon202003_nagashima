/*
 * ツリーベル四日市事業所
 * 第3回PGコンテスト用ベースすごろくプログラム
 * マスイベント
 */

//更新履歴
//2020 1/16 和田 新規作成
const _events = [
                        event_ChangeLoad
		       ,event_Pitfall
                       ,event_GoTwo
                       ,event_OneRest
                       ,event_Change
                       ,event_BackStart
                       ,event_AgainDice
		];

function event_Pitfall() {
        window.alert("落とし穴にハマった・・・。3マス戻る。");
	writeMsg("落とし穴にハマった・・・。3マス戻る。");
	return playerMove(nowPlayerId,-3);
}

// 2マス進むイベント
function event_GoTwo() {
        window.alert("バスに乗った。2マス進む。");
	writeMsg("バスに乗った。2マス進む。");
	return playerMove(nowPlayerId,2);
}

// 1回休むイベント
function event_OneRest() {
        window.alert("お腹が減ったのでレストランに入った。次の番1回休む。");
	writeMsg("お腹が減ったのでレストランに入った。次の番1回休む。");
        playerInfo[nowPlayerId].Rest = true;
	return playerMove(nowPlayerId,0);
}

// 特定のプレイヤーと入れ替わるイベント
function event_Change() {
        window.alert("特定のプレイヤーと入れ替わります。");
	writeMsg("特定のプレイヤーと入れ替わります。");
        if(playerCnt == 1){
            window.alert("他のプレイヤーがいないため何も起こりませんでした。");
            writeMsg("他のプレイヤーがいないため何も起こりませんでした。");
            return playerMove(nowPlayerId,0);
        }else{
            var random = 0;
            do{
               random = Math.floor(Math.random() * playerCnt +1);
            }while(random == nowPlayerId)

            window.alert("プレイヤー"+nowPlayerId + "とプレイヤー"+random+"の位置が入れ替わりました。");
	    writeMsg("プレイヤー"+nowPlayerId + "とプレイヤー"+random+"の位置が入れ替わりました。");
	    return playerChangeMove(nowPlayerId,random);
        }
}

// 道が分岐するイベント
function event_ChangeLoad() {
            window.alert("道が分岐します。次のターンにどちらの道に進むかをダイスで決定してください。");
	    writeMsg("道が分岐します。次のターンにどちらの道に進むかをダイスで決定してください。");
            playerInfo[nowPlayerId].BunkiChk = true;
	    return false;
}

//スタートに戻るイベント
function event_BackStart() {
            window.alert("忘れ物をしました。スタートに戻ります。");
	    writeMsg("忘れ物をしました。スタートに戻ります。");
            playerInfo[nowPlayerId].Pos = 0;
            playerInfo[nowPlayerId].Bunki = false;
            drawBoardPos();
	    return false;
}

//再度ダイスを振るイベント
function event_AgainDice() {
            window.alert("電車に乗った。もう一度ダイスを振ってください。");
	    writeMsg("電車に乗った。もう一度ダイスを振ってください。");
            playerInfo[nowPlayerId].Again = true;
	    return false;
}