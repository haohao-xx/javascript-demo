import WSClient from './WSClient'
import { normalMsgType, packageType } from './constants'

export default class KefuIMClientMgr {
  constructor() {
    this._uid = '' // 用户uid
    this._imMsgCallback = null // 消息回调
    this._imMsgAckCallback = null // ack回调
    this._imMsgRetractCallback = null // 消息撤回回调
  }

  setup(uid, username) {
    this._uid = uid
    this._client = new WSClient(this._uid)
    this._client.create(`ws://10.242.17.39:8189?uid=${uid}&name=${encodeURIComponent(username)}`)

    this._client.wsOpened(() => {
      console.info('ws opened.')
    })

    this._client.wsMsg((msg) => {
      this.dispatchMsg(msg)
    })

    this._client.wsClose((evt) => {
      this._imMsgCallback &&
        this._imMsgCallback({
          imMsgType: normalMsgType.SYSTEM,
          text: '长时间无响应，系统关闭会话',
        })
    })
  }

  close() {
    this._client && this._client.close()
  }

  sendNormalMsg(text, msgType, otherParams = {}) {
    const time = Date.now()
    const msgObj = {
      type: packageType.NORMAL_MSG,
      uid: this._uid,
      content: {
        msgType: msgType,
        sendTime: time,
        text,
      },
    }
    this._client && this._client.sendMsg(msgObj)
    return time
  }

  sendRevokeMsg(msgId, otherParams = {}) {
    console.log(`revoke msg: ${msgId}`)
    const msgObj = {
      type: packageType.RETRACT_MSG,
      uid: this._uid,
      content: {
        msgId,
      },
    }
    this._client && this._client.sendMsg(msgObj)
  }

  // 收到服务端消息后处理数据，派发给组件
  dispatchMsg(msgObj) {
    const msg = msgObj
    if (!msg.content) {
      console.warn('返回数据格式缺少 content', msg)
      return
    }
    const msgObjType = Number(msg.type)
    if (msgObjType === packageType.SYSTEM_MSG) {
      this._imMsgCallback &&
        this._imMsgCallback({
          type: msg.type,
          imMsgType: normalMsgType.SYSTEM,
          text: msg.content.text,
        })
    } else if (msgObjType === packageType.NORMAL_MSG) {
      const imMsgType = msg.content.msgType
      this._imMsgCallback &&
        this._imMsgCallback({
          type: msg.type,
          msgId: msg.msgId,
          imMsgType: imMsgType,
          nickName: msg.content.nickName,
          text: msg.content.text,
          fromSelf: false,
        })
    } else if (msgObjType === packageType.NORMAL_ACK) {
      this._imMsgAckCallback &&
        this._imMsgAckCallback({
          msgId: msg.msgId,
          sendTime: Number(msg.content.ack),
        })
    } else if (msgObjType === packageType.RETRACT_MSG) {
      this._imMsgRetractCallback &&
        this._imMsgRetractCallback({
          msgId: msg.content.msgId,
        })
    }
  }

  onIMMsg(callback) {
    this._imMsgCallback = callback
  }

  onMsgAck(callback) {
    this._imMsgAckCallback = callback
  }

  onRevokeMsg(callback) {
    this._imMsgRetractCallback = callback
  }
}
