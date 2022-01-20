// ■目的
// LINEチャットのメール転送のみを行う。
// ■メンテナンス手順
// 転送を1h停止する連絡
// →ボットをグループから外す
// →→メールアドレスをバックアップして外し、自分だけにする
// スクリプトの応答をボットパークでテストする
//  textで「日程情報」に応答が返らないこと、メールが1つ転送されること
// リッチメニューが表示されないテスト
// ←←メールアドレスのバックアップを元に戻す
// ←ボットをグループに入れる
// みんなに転送再開の連絡する

const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('CHANNEL_ACCESS_TOKEN');
const STATUS_200 = ContentService.createTextOutput(JSON.stringify({'status': 200})).setMimeType(ContentService.MimeType.JSON);

// ブラウザでスクリプトのURLにアクセスすると、GETで通知が来る
function doGet(e) {
  let toppage=HtmlService.createTemplateFromFile("index");
  return toppage.evaluate();
}

// LINE bot はPOSTで通知が来る
// リクエストボディ
// https://developers.line.biz/ja/reference/messaging-api/#request-body
function doPost(e) {
  let IsTransferEMailEnabled = true; //true：EMail転送する、false：EMail転送しない
  let reply_token = '';
  let user_message = '';
  let userDisplayName = ''
  let members = new Members();
  let mailAddressList = members.getLineBotTransferEMailList();
  let attachImg = null
  if (!e){
    // 引数が未定義ならテスト動作とする
    console.log(mailAddressList);
    mailAddressList = getPropertyArray('TEST_MAILADDRESS');
    user_message = '次回予報';
    // user_message = '日程情報';
    // user_message = '次回未記入者';
    // user_message = '次回参加者';
    // user_message = 'メールに転送されるLINEのメッセージ';
    userDisplayName = 'userDisplayName';
  }else{
    console.log(e);
    const postData = e.postData;
    if (!postData) return STATUS_200;
    const contents = postData.contents;
    if (!contents) return STATUS_200;

    // 現状では、GASのdoPostでリクエストヘッダーを取得する手段がないので、署名の検証ができない。
    // 署名の検証
    // https://developers.line.biz/ja/reference/messaging-api/#request-headers
    // GASリファレンス
    // https://developers.google.com/apps-script/guides/web
    // 参照記事
    // https://creators-note.chatwork.com/entry/2017/12/20/163128
    // let signature = getSignature(contents);
    // console.log(e.parameter);
    // if (e.parameter.x-line-signature !== signature) {
    //   console.log("Invalid webhook signature!");
    //   return;
    // }

    const event = JSON.parse(contents).events[0];
    // LINEプラットフォームから疎通確認のために、Webhookイベントが含まれないHTTP POSTリクエストが送信されることがあります。
    // この場合も、ステータスコード200を返してください。
    // https://developers.line.biz/ja/reference/messaging-api/#response
    if (!event) return STATUS_200;
    reply_token = event.replyToken;
    // LINEプラットフォームから送信されるHTTP POSTリクエストは、送受信に失敗しても再送されません。
    if (!reply_token) return STATUS_200;
    //ユーザー1対1のトークの場合転送しない、それ以外(グループトークgroupとトークルームroom)の場合転送する
    if (event.source && event.source.type === 'user') IsTransferEMailEnabled = false;
    let type = ''
    if (event.message) type = event.message.type;
    if (type !== 'image' && type !== 'text') return STATUS_200;
    if (type === 'image') attachImg = getLINEImage(event.message.id); //画像Brob
    user_message = event.message.text;
    const userID = event.source.userId;
    userDisplayName = getLINEUserName(userID);
  }
  if (IsTransferEMailEnabled) receiveMessage(mailAddressList, user_message, attachImg, userDisplayName);
  return replayMessage(reply_token, IsTransferEMailEnabled, mailAddressList, user_message);
}

// 受信メッセージ、botが受け取ったメッセージはメールに転送する(リッチメニュー呼び出しメッセージ含む)
function receiveMessage(mailAddressList, user_message, attachImg, userDisplayName){
  sendEmail(mailAddressList, user_message, userDisplayName + 'の発言', attachImg);
  return STATUS_200;
}

// 応答メッセージ、botの応答をメールやLINEに送る
function replayMessage(reply_token, IsTransferEMailEnabled, mailAddressList, user_message){
  let bot_message = '';
  // let menus = new RichMenus();
  // if (menus) bot_message = menus.getReturnText(user_message);
  if (bot_message){
    if (IsTransferEMailEnabled) sendEmail(mailAddressList, bot_message, 'LINE botの発言', null);
    if (reply_token) sendLINE(reply_token, bot_message);
  }
  return STATUS_200;
}
