const SearchService = require("../services/search.service");
const db = require("../models/index");
const Key = require("../constants/user");
// const logger = require("../config/log4js.config.js");

exports.search = (req, res) => {
  const keyword = req.body.keyword;
  const pfArray = req.body.platform;
  const resultNum = Number(req.body.resultNum);
  const sortIndex = req.body.sortIndex;
  const sortOrder = req.body.sortOrder;

  console.log("keyword: " + keyword);
  console.log("pfArray: " + pfArray);
  console.log("resultNum: " + resultNum);
  console.log("sortIndex: " + sortIndex);
  console.log("sortOrder: " + sortOrder);

  const scraping = (keyword, pfArray) => {
    var promiseArray = [];

    if (pfArray.includes("mercari")) {
      promiseArray.push(SearchService.mercari(keyword));
    }

    if (pfArray.includes("rakuten")) {
      promiseArray.push(SearchService.rakuten(keyword));
    }

    return promiseArray;
  };

  Promise.all(scraping(keyword, pfArray)).then((data) => {
    console.log("Promiseオブジェクト：" + data);

    const service = SearchService.init(res);
    service
      .findAll(resultNum, sortIndex, sortOrder)
      .then((items) => {
        console.log("promiseオブジェクト（空でない場合）：" + items);
        console.log("アイテムリストを取得しました。");
        res.status(Key.FETCH.SUCCESS.httpResCode).send(items);
        service.deleteAll();
        // 取得した情報をここからフロントエンドに返す場合、
        // initメソッドを使わずstaticメソッドにしても良いかも？
        // res.status(200).send(items);
      })
      .then((items) => {
        console.log("promiseオブジェクト（空の場合）：" + items);
        console.log("アイテムリストを全て削除しました。");
        // Sequelize.close
        // プールをクローズする場合に使用するメソッド。
        // プールを使用している場合、アプリケーション側で明示的に接続をクローズ
        // しなくても、プール側で処理してくれる。
        // db.sequelize.close();
      })
      .catch((err) => {
        console.log("promiseオブジェクト（エラーの場合）：" + err);
        // res.status(Key.FETCH.FAIL.httpResCode).send({
        //   message: err.message
        // });
        // db.sequelize.close();
        // const consoleLogger = log4js.getLogger();
        // consoleLogger.error("これはerrorです");
      });
  });
};
