# LINE_BOT_TENSOU

[LINEボットでチャット内容をメールに転送する](https://qiita.com/igapon1/items/559a89e669d6633eaa80)

↑この記事からの変更点を以降に記載する。

## 重要な定義をプロジェクトのプロパティで保持するように変更した

LINEボットのチャンネルアクセストークンは、プロジェクトのプロパティCHANNEL_ACCESS_TOKENで定義する。

LINEボット転送ちゃんネル.gs の以下のコードで読み込んで使用される。
```
const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('CHANNEL_ACCESS_TOKEN');
```

名簿のスプレッドシートIDは、プロジェクトのプロパティMEMBER_SPREADSHEET_IDで定義する。
名簿のシート名は、プロジェクトのプロパティMEMBER_SHEET_NAMEで定義する。

名簿スプレッドシート.gs の以下のコードで読み込んで使用される。
```
// スプレッドシートのURLは
// https://docs.google.com/spreadsheets/d/XXXXXXX/edit
// のような形になっています。XXXXXXXの部分がIDになります。
// 「グループ名簿」のスプレッドシート
const MEMBER_SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('MEMBER_SPREADSHEET_ID');
const MEMBER_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('MEMBER_SHEET_NAME');
```

ログスプレッドシートIDは、プロジェクトのプロパティRICHMENUS_SPREADSHEET_IDで定義する。
ログのシート名は、コード上で「ログ」に固定している。

log.gsの以下のコードで読み込んで使用される。
```
const LOG_SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('RICHMENUS_SPREADSHEET_ID');
```

## 名簿スプレッドシート用のクラスを用意した

名簿スプレッドシート.gs の以下のコードは、名簿の各列を表しており、LINEボット転送メールアドレスが17列目(this.lineBotTransferEMail)になっている。
```
  let TobaMember = function(record) {
    [this.name,
    this.birthday,
    this.age,
    this.licenseDeadline,
    this.smartPhoneEMail,
    this.homeEMail,
    this.smartPhoneNumber,
    this.officeEMail,
    this.homePhoneNumber,
    this.officePhoneNumber,
    this.officeName,
    this.officePostalCode,
    this.officeAddress,
    this.homePostalCode,
    this.homeAddress,
    this.bloodType,
    this.lineBotTransferEMail] = record;
  };
```

[記事](https://qiita.com/igapon1/items/559a89e669d6633eaa80)の様な、1列しかないスプレッドシートで使う場合は、以下のコードに修正するとよい(と思う)。

```
  let TobaMember = function(record) {
    [this.lineBotTransferEMail] = record;
  };
```

## 転送する際に、宛先一人ずつメールを送っていたが、どうせお互いにアドレス知っているので、まとめて一通のメールで送るように変更した。

1. まとめて一通のメールで送る場合は、utilities.gs　sendEmail()　を使用する。
1. 個別にメールを送る場合は、utilities.gs　sendEmailIndividually()　を使用する。

## メッセージTextと、静止画imageを転送するようにした。

1. JSON.parse(e.postData.contents).events[0].message.type　が　image　と　text　のみ処理する。
1. メール添付ファイルの制限など未調査なので、サイズの大きい画像が送れるか不明。
1. events[0]しか処理していないので、複数来るケースがあれば後続のデータは無視する。
(複数の静止画をまとめ送るなどしたらこのケースになるかもしれない。その場合は最初の一枚しか転送しないと思われる。)
