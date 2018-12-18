//配送单状态
export const DELIVERYSTATUS = {
	'TOBECONFIRMED': '待确认',
	'WAITFOROUTBOUND': '待出库',
	'INDISTRIBUTION': '配送中',
	'ARRIVED': '已送达',
	'RECEIVED': '已签收',
	'CANCELED': '已取消'
}

export const REFUNDORDERSTATUS = {
	//退货中，已退货
	'RETURNING': '退货中',
	'RETURNED': '已退货'
}

export const LOCATIONINTERVAL = 1 * 60 * 1000
