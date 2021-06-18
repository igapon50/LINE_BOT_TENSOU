# LINE_BOT_TENSOU

[LINEボットでチャット内容をメールに転送する](https://qiita.com/igapon1/items/559a89e669d6633eaa80)

↑この記事からの変更点を以降に記載する。

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
