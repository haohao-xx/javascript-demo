/**
 * 消息数据包类型
 */
export const packageType = {
  /**
   * 系统消息
   */
  SYSTEM_MSG: 0,
  /**
   * 心跳包
   */
  HEARTBEAT: 1,
  /**
   * 用户发送普通消息
   */
  NORMAL_MSG: 2,
  /**
   * 消息 ack
   */
  NORMAL_ACK: 22,
  /**
   * 用户撤回消息
   */
  RETRACT_MSG: 33,
  /**
   * 服务端关闭ws
   */
  SERVER_CLOSE: 44,
}

/**
 * 普通消息类型
 */
export const normalMsgType = {
  SYSTEM: 0,
  TEXT: 1,
  PIC: 2,
}
