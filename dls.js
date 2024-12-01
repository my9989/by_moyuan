/*
-------------------  青龙-配置文件-复制区域  -------------------
# 例子
export example=" 备注 # cookie "

多账号用 换行 或 @ 分割
*/

const CodeName = "杜蕾斯会员中心"      // 这里写你脚本的名字(中文)
const env = "dls"       // 这里写你脚本的名字(英文的)
const fs = require("fs")        // 引入fs模块, 可以读取txt文件内容
const got = require("got");         // 引入依赖, 里面有各种函数, 经常用的都放进去了
const appVersion = "5.1.12";
let sendLog = []             // 准备发送通知
const mode = 1  // 并发-2   顺序-1
const runMax = 3  // 最大并发数量
let envSplit = ["\n", "&", "@"]         // 多个变量分隔符
const ckFile = `${env}.txt`              // 不用管, 默认就是英文 名字.txt

//====================================================================================================
const ck_ = '2U_LusGKeZi29lzTtiL1Gzg9_PMtc2SujTi_uAbj969tjuI7zg6ydcHiGaTotiwA#2'        // 可以快速测试变量


//====================================================================================================

class Http {

    /**
     * 初始化一个http对象
     * @param {string} host hostname地址
     * @param {Object} headers 自定义的header
     */
    constructor(host, headers) {
        this.headers = headers;
        this.host = host;
        const options = {
            prefixUrl: host,
            headers: headers,
        };
        this.client = got.extend(options);

    }

    /**
     *
     * @param {function(): Promise<string>} customProxy
     */
    async setCustomProxy(customProxy) {
        this.customProxy = customProxy;
    }


    /**
     * 如果环境变量设置代理，debug代理
     * @param {Object} options
     */
    async debugProxy(options) {
        // @ts-ignore
        let httpProxy = '';

        if (this.customProxy) {
            httpProxy = this.customProxy;
        } else {
            let dp = process.env.DEBUG_PROXY;
            if (dp) {
                httpProxy = dp;
            }
        }


        if (httpProxy) {
            // @ts-ignore
            // console.log(`Proxy: ${httpProxy}`)
            options.https = {
                rejectUnauthorized: false
            };

            // @ts-ignore
            options.agent = {
                http: new hpagent.HttpProxyAgent({
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                    maxSockets: 256,
                    maxFreeSockets: 256,
                    scheduling: 'lifo',
                    proxy: httpProxy
                },),
                https: new hpagent.HttpsProxyAgent({
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                    maxSockets: 256,
                    maxFreeSockets: 256,
                    scheduling: 'lifo',
                    proxy: httpProxy
                },)
            };
        }
    }

    /**
     * post请求，body为json类型
     * @param {string} path 接口路径
     * @param {Object} headers 自定义的header对象
     * @param {Object} json 对象
     * @param {Object} options 自定义的options对象,详情参考 https://github.com/sindresorhus/got/blob/main/documentation/2-options.md#options
     * @returns
     */
    async postJson(path, headers = {}, json = {}, options = {}) {
        const mergedHeaders = {...this.headers, ...headers};
        const requestOptions = {
            method: 'POST',
            json: json,
            headers: mergedHeaders,
            responseType: 'json'
        };
        await this.debugProxy(requestOptions);
        Object.assign(requestOptions, options);
        const response = await this.client(path, requestOptions);
        const {body: res, headers: res_hd} = response;
        return {res, res_hd}
    }

    /**
     * post请求，body为formData类型
     * @param {string} path 接口路径
     * @param {Object} headers 自定义的header对象
     * @param {Object} form 对象
     * @param {Object} options 自定义的options对象,详情参考 https://github.com/sindresorhus/got/blob/main/documentation/2-options.md#options
     * @returns
     */
    async postForm(path, headers = {}, form = {}, options = {
        // resolveBodyOnly: true,
    }) {
        Object.assign(headers, this.headers);
        headers["content-type"] = "application/x-www-form-urlencoded";
        let o = {
            method: 'POST',
            form: form,
            headers: headers,
            responseType: 'json'
        };
        await this.debugProxy(o);
        Object.assign(o, options);
        let resp = await this.client(path, o);
        let res = resp.body;
        let res_hd = resp.headers;
        return {res, res_hd}
    }


    /**
     * post请求，body为字符串类型
     * @param {string} path 接口路径
     * @param {Object} headers 自定义的header对象
     * @param {string | Object} body 字符串或对象 , 根据 Content-Type判断放入到哪个位置
     * @param {Object} options 自定义的options对象,详情参考 https://github.com/sindresorhus/got/blob/main/documentation/2-options.md#options
     * @returns
     */
    async post(path, headers = {}, body, options = {
        // resolveBodyOnly: true
    }) {
        Object.assign(headers, this.headers);
        let o = {
            method: 'POST',
            headers: headers,
            responseType: 'json',
            body: body
        };

        await this.debugProxy(o);
        Object.assign(o, options);
        let resp = await this.client(path, o);
        let res = resp.body;
        let res_hd = resp.headers;
        return {res, res_hd}
    }

    /**
     * get请求，返回json对象
     *
     * @param {string} path 接口路径
     * @param {Object} headers 自定义的header对象
     * @param {Object} params get请求的参数对象
     * @param {Object} options 自定义的options对象,详情参考 https://github.com/sindresorhus/got/blob/main/documentation/2-options.md#options
     *
     */
    async get(path, headers = {}, params = {}, options = {
        // resolveBodyOnly: true
    }) {
        Object.assign(headers, this.headers);
        let o = {
            searchParams: params,
            headers: headers,
            responseType: 'json'
        };
        await this.debugProxy(o);
        Object.assign(o, options);
        // console.log(o)
        let resp = await this.client(path, o);
        let res = resp.body;
        let res_hd = resp.headers;
        // console.log(res_hd)
        return {res, res_hd}
    }


    /**
     * options 请求, 适合一键生成脚本使用
     * @param {Object} options 自定义的header对象
     * @param ck_flag ck 状态, false 就不执行任何请求
     */
    async request(options, ck_flag = true) {
        try {
            if (ck_flag) {
                await this.debugProxy(options);
                let response, body, res_hd, res, timeout;
                try {
                    // 手动处理 params 参数
                    if (options.params) {
                        let paramsArray = [];
                        for (const key in options.params) {
                            if (options.params.hasOwnProperty(key)) {
                                paramsArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(options.params[key])}`);
                            }
                        }
                        const queryString = paramsArray.join('&');
                        options.url = options.url + "?" + queryString;
                    }
                    if (options.method.toUpperCase() === "GET") delete options.json, options.body, options.from;
                    timeout = options.timeout || 13000;
                    response = await got(options, {
                        followRedirect: false,
                        https: {rejectUnauthorized: false},
                        timeout: timeout
                    });
                } catch (error) {
                    response = error.response;
                }
                if (response) {
                    body = response.body;
                    res_hd = response.headers;
                    if (body) {
                        try {
                            res = JSON.parse(body);
                        } catch (e) {
                            res = body;
                        }
                    }
                }
                return {res, res_hd}
            } else {
                return null
            }
        } catch (e) {
            console.log(e);
        }
    }


    /**
     * options 请求, 适合一键生成脚本使用
     * @param {Object} options 自定义的header对象
     * @param ck_flag ck 状态, false 就不执行任何请求
     */
    async requestNoProxy(options, ck_flag = true) {
        try {
            if (ck_flag) {
                let response, body, res_hd, res;
                try {
                    if (options.method.toUpperCase() === "GET") delete options.json, options.body, options.from;
                    response = await got(options, {
                        followRedirect: false,
                        https: {rejectUnauthorized: false},
                        timeout: 13000,
                    });
                } catch (error) {
                    response = error.response;
                }
                if (response) {
                    body = response.body;
                    res_hd = response.headers;
                    if (body) {
                        try {
                            res = JSON.parse(body);
                        } catch (e) {
                            res = body;
                        }
                    }
                }
                return {res, res_hd}
            } else {
                return null
            }
        } catch (e) {
            console.log(e);
        }
    }


}

const http = new Http();

// 创建一个用户类   一个账户就会创建一个类
class User {
    // 类的构造函数, 处理每个ck的多分段
    constructor(str, id) {
        this.index = id
        this.ck_ = str.split("#")
        this.remark = this.ck_[1]
        this.cookie = this.ck_[1]
        this.ts = this.getTimestamp(13);
        this.reqNonc = this.randomInt(100000, 999999);
        this.dls_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b19)XWEB/11529',
            'content-type': 'application/json;charset=utf-8',
            'sid': '10006',
            'xweb_xhr': '1',
            'platform': 'MP-WEIXIN',
            'enterprise-hash': '10006',
            'access-token': this.ck_,
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://servicewechat.com/wxe11089c85860ec02/34/page-frame.html',
            'accept-language': 'zh-CN,zh;q=0.9'
        };
        this.set_this();
    }
    set_this() {
        this.ck_flag = true;
    }



    // 获取时间戳
    getTimestamp(type = 13, _data = "") {
        let myDate = new Date();
        let a = "";
        switch (type) {
            case 10:
                a = Math.round(new Date().getTime() / 1000).toString();
                break;
            case 13:
                a = Math.round(new Date().getTime()).toString();
                break;
            case "h":
                a = myDate.getHours();
                break;
            case "m":
                a = myDate.getMinutes();
                break;
            case "y":
                a = myDate.getFullYear();
                break;
            case "mo":
                a = myDate.getMonth() + 1; // 修正：月份需要加1
                break;
            case "d":
                a = myDate.getDate();
                break;
            case "ts2Data":
                if (_data !== "") {
                    let time = _data;
                    if (time.toString().length === 13) {
                        let date = new Date(parseInt(time) + 28800 * 1000);
                        a = date.toJSON().substr(0, 19).replace("T", " ");
                    } else if (time.toString().length === 10) {
                        time = parseInt(time) * 1000;
                        let date = new Date(time + 28800 * 1000);
                        a = date.toJSON().substr(0, 19).replace("T", " ");
                    }
                }
                break;
            default:
                a = "未知错误,请检查";
                break;
        }
        return a;
    }

    // 生成随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 生成签名
    getSign(ts, reqNonc) {
        const salt = "17aaf8118ffb270b766c6d6774317a13" + appVersion;
        const sign = crypto.MD5(`signature${reqNonc}${ts}${salt}`).toString();
        return sign;
    }

    // 每个类的任务列表, 可以将需要做的任务都放这里
    async userTask() {
        await this.Doapply()
        await this.checklottery()
        await this.lottery()
        await this.SQlottery()
        await this.SQlotteryCX()
        await this.getinfo()  // 获取缓存的变量
    }

    // 具体功能实现函数   可以多个 自己复制就行
    async Doapply() {
        try {
            // 使用 options 组装请求参数
            const options = {
                method: 'GET',
                url: 'https://vip.ixiliu.cn/mp/sign/applyV2',
                headers: this.dls_headers
            }

            // console.log(options)
            // 使用 封装的 got 请求库进行网络请求
            let {res} = await http.request(options, this.ck_flag);
            //console.log(res)
            const message = await this.handleResponse(options.url, res);
            this.log(message, 1);

        } catch (error) {
            console.log(error)
        }
    }

    async getinfo() {
        try {
            const options = {
                method: 'GET',
                url: 'https://vip.ixiliu.cn/mp/user/info',
                headers: this.dls_headers
            }
            // console.log(options)
            // 使用 封装的 got 请求库进行网络请求
            let {res} = await http.request(options, this.ck_flag);
            //console.log(res)
            // 根据请求的返回 进行日志输出
            const message = await this.handleResponse(options.url, res);
            this.log(message, 1);

        } catch (error) {
            console.log(error)
        }
    }

    async lottery() {
        try {
            const options = {
                method: 'GET',
                url: 'https://vip.ixiliu.cn/mp/activity.lottery/draw?snId=381955713996608&channelSn=0',
                headers: this.dls_headers
            }
            // console.log(options)
            // 使用 封装的 got 请求库进行网络请求
            let {res} = await http.request(options, this.ck_flag);
            //console.log(res)
            const message = await this.handleResponse(options.url, res);
            this.log(message, 1);
        } catch (error) {
            console.log(error)
        }
    }

    async SQlottery(){
        try {
            const options = {
                method: 'GET',
                url: 'https://vip.ixiliu.cn/mp/activity.lottery/draw?snId=376653438743296&channelSn=0',
                headers:this.dls_headers
            }
            let {res} = await http.request(options,this.ck_flag);
            const message = await this.handleResponse(options.url, res);
            this.log(message, 1);
        } catch (error) {
            console.log(error)
        }
    }

    async SQlotteryCX(){
        try {
            const options = {
                method: 'GET',
                url: 'https://vip.ixiliu.cn/mp/activity.record/list?snId=376653438743296',
                headers:this.dls_headers
            }
            let {res} = await http.request(options,this.ck_flag);

            const message = await this.handleResponse(options.url, res);
            this.log(message, 1);

        } catch (error) {
            console.log(error)
        }
    }

    async checklottery() {
        try {
            const options = {
                method: 'GET',
                url: 'https://vip.ixiliu.cn/mp/activity.lottery/getUserInfoV2?snId=381955713996608',
                headers: this.dls_headers
            }
            // console.log(options)
            // 使用 封装的 got 请求库进行网络请求
            let {res} = await http.request(options, this.ck_flag);
            //console.log(res)
            const message = await this.handleResponse(options.url, res);
            this.log(message, 1);
            // 根据请求的返回 进行日志输出
            // if (res.status === 200) {
            //     this.log(`杜蕾斯会员中心抽奖: 剩余抽奖次数 ${res.data.user.draw_day_times}! `, 1)
            // } else if ({res}.data.user.draw_day_times === 0) {
            //     this.log(`今日抽奖次数已用完，请明日再来！`,1)
            // } else {
            //     this.log(res)
            // }
        } catch (error) {
            console.log(error)
        }
    }

    // 自己封装的打印函数
    log(message, pushCode = 0) {
        message = typeof message === "object" ? JSON.stringify(message) : message
        console.log(`${this.index}-${this.remark},  ${ message}`)
        if (pushCode) {
            sendLog.push(`${this.index}-${this.remark} ${message}`)
        }
    }
    async handleResponse(url, res) {
        switch (url) {
            case 'https://vip.ixiliu.cn/mp/user/info': // 处理用户信息（getinfo）
                if (res.status === 200) {
                    return `杜蕾斯会员中心: 用户 ${res.data.userInfo.nick_name}, 等级 ${res.data.userInfo.upgrade_code}, 累计积分 ${res.data.userInfo.points}!`;
                } else if (res.status === 0) {
                    return `今日已签到，请明日再来！`;
                } else {
                    return `未知响应: ${res.message || '未知错误'}`;
                }

            case 'https://vip.ixiliu.cn/mp/activity.lottery/draw?snId=381955713996608&channelSn=0': // 处理每日会员中心抽奖（lottery）
                if (res.status === 200) {
                    return `杜蕾斯会员中心抽奖: 用户抽奖获得 ${res.data.prize.prize_name}!`;
                } else if (res.status === 500) {
                    return `今日抽奖次数已用完，请明日再来！`;
                } else {
                    return `抽奖错误: ${res.message || '未知错误'}`;
                }

            case 'https://vip.ixiliu.cn/mp/activity.lottery/getUserInfoV2?snId=381955713996608':  //获取每日抽奖次数(checklottery)
                if (res.status === 200) {
                    return `杜蕾斯会员中心抽奖: 用户剩余抽奖 ${res.data.user.draw_day_times}次!`;
                } else if (res.status === 500) {
                    return `今日抽奖次数已用完，请明日再来！`;
                } else {
                    return `抽奖错误: ${res.message || '未知错误'}`;
                }

            case 'https://vip.ixiliu.cn/mp/activity.lottery/draw?snId=381955713996608&channelSn=0':  //获取社群当前抽奖结果（SQlottery）
                if (res.status === 200) {
                    return `${res.data.lottery.active_name} ${res.message}成功!`;
                } else if (res.status === 500) {
                    return `今日抽奖次数已用完，请明日再来！`;
                } else {
                    return `抽奖错误: ${res.message || '未知错误'}`;
                }

            case 'https://vip.ixiliu.cn/mp/sign/applyV2':  //获取当前签到结果（Doapply）
                if (res.status === 200) {
                    return `签到成功!`;
                } else if (res.status === 500) {
                    return `${res.msg}！`;
                } else {
                    return `抽奖错误: ${res.message || '未知错误'}`;
                }


            case 'https://vip.ixiliu.cn/mp/activity.record/list?snId=381955713996608':  //获取社群抽奖记录（SQlotteryCX）
                if (res.status === 200) {
                    let prizeDetailsStr = '';  // 用来累积结果的字符串
                    const prizeDetails = res.data?.list.map(item => ({
                        create_time: item.create_time || '未知',
                        prizeName: item.prize?.prize_name || '未知'
                    }));

                    prizeDetails.forEach((detail, index) => {
                        prizeDetailsStr += `第 ${index + 1} 次:\n`;
                        prizeDetailsStr += `抽奖时间: ${detail.create_time}\n`;
                        prizeDetailsStr += `奖品名称: ${detail.prizeName}\n`;
                    });

                    return prizeDetailsStr || '没有抽奖记录';  // 如果没有记录，返回提示信息
                } else if (res.status === 500) {
                    return '今日抽奖次数已用完，请明日再来！';
                } else {
                    return `抽奖错误: ${res.message || '未知错误'}`;
                }




            default: // 处理其他请求
                return `未知请求 URL: ${url}, 状态码: ${res.status}`;
        }
    }

}



// 创建一个用户列表类, 可以用来处理多账号
class UserList {
    constructor(env) {
        this.env = env
        this.userList = []
        this.logPrefix = `\n[环境检测 ${this.env}]`
        this.mode = mode
    }
    // 进行ck处理, 将配置文件内的ck进行处理,生成用户列表
    checkEnv() {
        try {
            let UserData = ""
            if (ckFile !== "" && fs.existsSync(ckFile)) {
                UserData = UserData.concat(fs.readFileSync(`./${ckFile}`, "utf-8").split("\n") || [])
                console.log(`ck文件[ ${ckFile} ]加载成功`)
            } else {
                console.log(`ck文件[ ${ckFile} ]不存在, 调用青龙环境变量`)
                UserData = process.env[env] || ck_
            }
            if (!UserData || UserData.trim() === "") {
                console.log(`${this.logPrefix} 没有找到账号信息`)
                return false
            }
            envSplit = envSplit || ["\n", "&", "@"]
            this.userList = UserData
                .split(new RegExp(envSplit.join("|")))
                .filter((cookie) => cookie.trim() !== "")
                .map((cookie, index) => new User(cookie.trim(), `账号[${index + 1}]`))
            const userCount = this.userList.length
            console.log(`${this.logPrefix} ${userCount > 0 ? `找到 ${userCount} 个账号\n` : "没有找到账号\n"}`)
            return true
        } catch (e) {
            console.log(e)
        }
    }

    // 使用 Promise 进行异步封装
    async runTask() {
        if (!this.checkEnv()) {
            return
        }
        console.log(`[任务 ${CodeName}] 开始运行`)
        if (this.mode === 2) {  // 并发
            const taskQueue = []
            const concurrency = runMax
            for (const user of this.userList) {
                while (taskQueue.length >= concurrency) {
                    await Promise.race(taskQueue)
                }
                const promise = user.userTask()
                taskQueue.push(promise)
                promise.finally(() => {
                    taskQueue.splice(taskQueue.indexOf(promise), 1)
                })
                if (taskQueue.length < concurrency) {
                    continue
                }
                await Promise.race(taskQueue)
            }
            await Promise.allSettled(taskQueue)
        } else {
            for (const user of this.userList) {
                await user.userTask()
            }
        }
    }
}

// 自执行函数, 脚本从这里开始
(async () => {
    require("dotenv").config()      // 用于读取 .env 文件(win,liunx,mac需要)
    const s = Date.now()    // 取开始时间
    const userList = new UserList(env)  // 获取用户信息
    await userList.runTask()        // 从 runTask 中执行需要的函数
    const e = Date.now()    // 取结束时间
    await done(s, e)                // 脚本结束, 可以根据需要发送通知
})().catch(console.error)

// 脚本结束
async function done(s, e) {
    const el = (e - s) / 1000
    console.log(`\n[任务执行完毕 ${CodeName}] 耗时：${el.toFixed(2)}秒`)
    await showmsg()      // 发送消息调用
    async function showmsg() {
        if (!sendLog) return
        if (!sendLog.length) return
        let notify = require('./sendNotify')
        console.log('\n============== 本次推送--by_墨渊 ==============')
        await notify.sendNotify(CodeName, sendLog.join('\n'))
    }
    process.exit(0)
}
