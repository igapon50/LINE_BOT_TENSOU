# LINE_BOT_TENSOU

[LINEボットでチャット内容をメールに転送する](https://qiita.com/igapon1/items/559a89e669d6633eaa80)

名簿のスプレッドシートIDやシート名は、プロジェクトのプロパティに変更した。
以下の箇所でプロジェクトのプロパティを読み込む。

```
// スプレッドシートのURLは
// https://docs.google.com/spreadsheets/d/XXXXXXX/edit
// のような形になっています。XXXXXXXの部分がIDになります。
// 「グループ名簿」のスプレッドシート
const MEMBER_SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('MEMBER_SPREADSHEET_ID');
const MEMBER_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('MEMBER_SHEET_NAME');
```

以下の箇所は名簿の各列を表しており、LINEボット転送メールアドレスが17列目(this.lineBotTransferEMail)になっている。
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

1列しかないスプレッドシートなら、以下のコードに修正するとよい(と思う)。
```
  let TobaMember = function(record) {
    [this.lineBotTransferEMail] = record;
  };
```
