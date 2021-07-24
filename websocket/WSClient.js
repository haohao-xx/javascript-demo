import { packageType } from './constants'
let HEARTBEAT_DELAY = 10 * 1000


/**
 * 对 Websocket 的封装，内部实现重连功能
 */
export default class WSClient {
  constructor(uid) {
    this._uid = uid
    this._ws = null
    this._closed = false
    this._heartbeatTimer = null
    this._reconnectingLock = false
    this._reconnectCount = 0

    this._openedCallback = null
    this._msgCallback = null
    this._errorCallback = null
    this._closedCallback = null
  }

  /**
   * 创建 Websocket
   * @param {String} wsurl 客服 websocket 服务器地址
   */
  create(wsurl) {
    if (!window.WebSocket) {
      console.error('WebSocket unsupported!')
    }
    this._ws = new WebSocket(wsurl)
    if (!this._ws) {
      console.error(`create WebSocket failed, url: ${wsurl}`)
      return
    }
    this._ws.addEventListener('open', (evt) => {
      this._reconnectCount = 0
      this._openedCallback && this._openedCallback()
      // 连接打开后马上发一次心跳包
      this.sendMsg({
        type: packageType.HEARTBEAT,
        uid: this._uid,
        content: {
          sendTime: Date.now(),
        },
      })
      // 开启心跳函数
      this.sendHeartbeat()
      // 重连后重制心跳时间为5s一次
      HEARTBEAT_DELAY = 10000
    })
    this._ws.addEventListener('message', (evt) => {
      let msgObj = null
      try {
        msgObj = JSON.parse(evt.data)
      } catch (e) {
        console.warn('Invalid Message Received: ', JSON.stringify(evt.data))
      }
      this._msgCallback && this._msgCallback(msgObj)
    })
    this._ws.addEventListener('error', (err) => {
      console.error('wsclient error:', err)
      //  异常关闭
      clearInterval(this._heartbeatTimer)

      this._errorCallback && this._errorCallback(err)
      this.reconnect(wsurl)
    })
    this._ws.addEventListener('close', (evt) => {
      console.info(`wsclient closed. code: ${evt.code}`, evt)
      //  只要关闭，就要清除 timer
      clearInterval(this._heartbeatTimer)

      if (evt.code !== 1005 && !this._closed) {
        this.reconnect(wsurl)
      } else {
        this._closedCallback && this._closedCallback(evt)
      }
    })
  }

  close() {
    this._closed = true
    this._ws.close()
  }

  _isOpened() {
    return this._ws.readyState === WebSocket.OPEN
  }

  sendHeartbeat() {
    clearInterval(this._heartbeatTimer)

    if (!this._isOpened()) return false

    this._heartbeatTimer = setTimeout(() => {
      this.sendMsg({
        type: packageType.HEARTBEAT,
        uid: this._uid,
        content: {
          sendTime: Date.now(),
        },
      })
      HEARTBEAT_DELAY += 5000
      this.sendHeartbeat()
    }, HEARTBEAT_DELAY)
  }

  /**
   * 发送消息对象
   * @param {Object} msgObj 消息对象，内容遵循客服 IM 消息格式
   */
  sendMsg(msgObj) {
    if (msgObj.type === packageType.HEARTBEAT) {
      console.info(`heartbeat.  uid: ${msgObj.uid}`)
    } else {
      console.info(
        `send msg - type: ${msgObj.type}, uid: ${msgObj.uid}, msgType: ${
          msgObj.content && msgObj.content.msgType
        }\n`,
        JSON.stringify(msgObj.content && msgObj.content.data)
      )
    }

    if (!this._ws || !this._isOpened()) {
      console.error('ws client is null or not yet opened!')
      return
    }

    this._ws.send(JSON.stringify(msgObj))
  }

  /**
   * 重连
   * @param {String} wsurl 客服 websocket 服务器地址
   */
  reconnect(wsurl) {
    if (this._reconnectingLock) return
    this._reconnectingLock = true
    this._ws.close()

    let delayTime = Math.pow(2, this._reconnectCount++) - 1
    delayTime = delayTime > 30 ? 30 : delayTime
    console.info(`delay ${delayTime}s...`)

    setTimeout(() => {
      console.info(`尝试第 ${this._reconnectCount} 次重连...`)
      this.create(wsurl)
      this._reconnectingLock = false
    }, delayTime * 1000 + 100)
  }

  wsOpened(callback) {
    this._openedCallback = callback
  }

  wsMsg(callback) {
    this._msgCallback = callback
  }

  wsError(callback) {
    this._errorCallback = callback
  }

  wsClose(callback) {
    this._closedCallback = callback
  }
}
