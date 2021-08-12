//■目的
//LINEチャットのメール転送のみを行う。
//■メンテナンス手順
//転送を1h停止する連絡
//→ボットをグループから外す
//→→メールアドレスをバックアップして外し、自分だけにする
//スクリプトの応答をボットパークでテストする
//　textで「日程情報」に応答が返らないこと、メールが1つ転送されること
//リッチメニューが表示されないテスト
//←←メールアドレスのバックアップを元に戻す
//←ボットをグループに入れる
//みんなに転送再開の連絡する

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
  let user_message = '';
  let userDisplayName = ''
  if (!e){
    //引数が未定義ならテスト動作とする
    let members = new Members();
    let mailAddressList = members.getLineBotTransferEMailList();
    console.log(mailAddressList);
    mailAddressList = getPropertyArray('TEST_MAILADDRESS');
    user_message = '次回予報';
    // user_message = '日程情報';
    // user_message = '次回未記入者';
    // user_message = '次回参加者';
    // user_message = 'メールに転送されるLINEのメッセージ';
    userDisplayName = 'userDisplayName';
    return procMessage(mailAddressList, user_message, userDisplayName);
  }else{
    const contents = e.postData.contents;

    //現状では、GASのdoPostでリクエストヘッダーを取得する手段がないので、署名の検証ができない。
    //署名の検証
    //https://developers.line.biz/ja/reference/messaging-api/#request-headers
    //GASリファレンス
    //https://developers.google.com/apps-script/guides/web
    //参照記事
    //https://creators-note.chatwork.com/entry/2017/12/20/163128
    // let signature = getSignature(contents);
    // console.log(e.parameter);
    // if (e.parameter.x-line-signature !== signature) {
    //   console.log("Invalid webhook signature!");
    //   return;
    // }

    const event = JSON.parse(contents).events[0];
    if (!event) {
      // LINEプラットフォームから疎通確認のために、Webhookイベントが含まれないHTTP POSTリクエストが送信されることがあります。 この場合も、ステータスコード200を返してください。
      // https://developers.line.biz/ja/reference/messaging-api/#response
      return STATUS_200;
    }
    const type = event.message.type;
    //LINEからTEXT以外が送られた場合
    if (type !== 'text') {
      return STATUS_200;
    }
    let members = new Members();
    let mailAddressList = members.getLineBotTransferEMailList();
    user_message = event.message.text;
    const userID = event.source.userId;
    userDisplayName = getLINEUserName(userID);
    return procMessage(mailAddressList, user_message, userDisplayName);
  }
}

//メッセージプロシージャ
function procMessage(mailAddressList, user_message, userDisplayName){
  //ボットが受け取ったメッセージはメールに転送する
  sendEmail(mailAddressList, user_message, userDisplayName + 'の発言');
  console.log('ボットはチャットでしゃべらない');
  return STATUS_200;
}
