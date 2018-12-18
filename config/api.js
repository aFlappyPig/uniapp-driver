export const HOST = 'http://192.168.4.50:8999/api.do';

export const METHODS = {
	login: 'AccountLogin', //登录
	updatePassword: 'PwdMember', //修改密码
	uploadLocation: 'uploadVehicleLocation', //更新位置信息
	workingOrderList: 'DeliveryOrderList', //获取进行中的配送单列表
	canceledOrderList: 'CanceledDeliveryOrderList', //获取已取消的配送单列表
	refundOrderList: 'RefundOrderList', //获取已退货的配送单列表
	applyVacation: 'ApplyVacation', //申请休假
	endOfVacation: 'EndOfVacation', //开始工作
	getDriverStatus: 'DriverData', //获取当前工作状态
	updateRefundStatus: 'UpdateRefundDriver', //更新退货单的状态
	updateDeliveryStatus: 'ChangeDeliveryStatus', //更新配送单的状态
}
