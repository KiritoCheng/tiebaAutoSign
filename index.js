const fetch = require('node-fetch');
const md5 = require('js-md5');
const FormData = require('form-data');
const schedule = require('node-schedule');

// API_URL
// var LIKIE_URL = "http://c.tieba.baidu.com/c/f/forum/like";
var LIKIE_URL = "https://tieba.baidu.com/mo/q/newmoindex";
var TBS_URL = "http://tieba.baidu.com/dc/common/tbs";
// var SIGN_URL = "http://c.tieba.baidu.com/c/c/forum/sign";
var SIGN_URL = "https://tieba.baidu.com/sign/add";
var HEADERINFO = {
    'Host': 'tieba.baidu.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36'
};
var SIGN_DATA = {
    '_client_type': '2',
    '_client_version': '9.7.8.0',
    '_phone_imei': '000000000000000',
    'model': 'MI+5',
    "net_type": "1"
};
// VARIABLE NAME
var COOKIE = "Cookie", BDUSS = "BDUSS", TBS = 'tbs', PAGE_NO = 'page_no', ONE = '1', TIMESTAMP = "timestamp", DATA = 'data', FID = 'fid', SIGN_KEY = 'tiebaclient!!!', UTF8 = "utf-8", SIGN = "sign", KW = "kw";
var bduss = '9Yc1pRVlRpVjBMUjVxMk1Qczh5WFl0VDdGVXJ5UVVjRjMxcnJTY3ZlWHRESHRmRVFBQUFBJCQAAAAAAAAAAAEAAAD8n7pCa2lyaXRv0rkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAO1~U1~tf1NfTU';
var headerInfo = Object.assign(HEADERINFO, { COOKIE: `BDUSS=${bduss}` });

var get_tbs = function (bduss) {
    console.info("获取tbs开始");
    return new Promise((res, rej) => {
        fetch(TBS_URL, {
            method: 'GET',
            headers: headerInfo
        })
            .then(function (response) { return response.json(); })
            .catch(e => {
                console.error("获取tbs出错" + e)
                rej(e)
            })
            .then(r => {
                res(r[TBS])
                console.info("获取tbs成功")
            })
    })
};

let get_favorite = function (bduss) {
    console.info("获取关注的贴吧开始")
    return new Promise((res, rej) => {
        fetch(LIKIE_URL, {
            method: 'GET',
            headers: headerInfo
        })
            .then(function (response) { return response.json(); })
            .catch(e => {
                console.error("获取关注的贴吧出错" + e)
                rej([])
            })
            .then(r => {
                res(r.data['like_forum'])
                console.info("获取关注的贴吧结束")
            })

    });
}

let sign = function (bduss, tbs, fid, kw) {
    let formData = new FormData();
    formData.append('ie', 'utf-8');
    formData.append('kw', kw);
    formData.append('ie', tbs);
    return new Promise((res, rej) => {
        console.info("开始签到贴吧：" + kw)
        fetch(SIGN_URL, {
            method: 'POST',
            headers: headerInfo,
            body: formData
        }).then(function (response) { return response.json(); })
            .catch(e => {
                rej(null)
                console.error(`${kw}吧 签到失败。 ${e}`)
            })
            .then(r => {
                console.log(r)
                if (r['no'] == '1101') {
                    res(`${kw}吧 已经签到过了。`);
                    return;
                }
                if((r['no'] == '0')){
                    res(`${kw}吧 签到成功`);
                    return;
                }
                res(`${kw}吧 签到失败。${r['error']}`);
            })
    })
}

function test(i) {
    return new Promise((res) => {
        setTimeout(() => {
            res(i)
        }, 1000)
    })
}

function run() {
    Promise.all([get_tbs(bduss), get_favorite(bduss)])
        .then(async (res) => {
            let tbs = res[0], favorite = res[1];
            for (var i = 0; i < favorite.length; i++) {
                let res = await sign(bduss, tbs, favorite[i]['forum_id'], favorite[i]['forum_name']);
                console.log(res)
            }
        })


}

let rule = new schedule.RecurrenceRule();
rule.hour = 15;
rule.minute = 34;
rule.second = 0;
let job = schedule.scheduleJob(rule, () => {
    // run();
    console.log('test')
});

