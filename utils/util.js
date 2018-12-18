export const initPosition = () => {
	/**
	 * 使用 absolute 定位，并且设置 bottom 值进行定位。软键盘弹出时，底部会因为窗口变化而被顶上来。
	 * 反向使用 top 进行定位，可以避免此问题。
	 * 依赖uni模块，返回数字，单位px
	 */
	let {
		screenHeight,
		windowWidth,
		windowHeight,
		statusBarHeight
	} = uni.getSystemInfoSync();
	return screenHeight - statusBarHeight - (windowWidth / 750) * 120;
}

export const dateFormat = (date, fmt = 'yyyy-MM-dd HH:mm:ss') => {
	if (!(date instanceof Date)) {
		date = new Date(date)
	}
	var o = {
		"M+": date.getMonth() + 1, //月份         
		"d+": date.getDate(), //日         
		"h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时         
		"H+": date.getHours(), //小时         
		"m+": date.getMinutes(), //分         
		"s+": date.getSeconds(), //秒         
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度         
		"S": date.getMilliseconds() //毫秒         
	};
	var week = {
		"0": "日",
		"1": "一",
		"2": "二",
		"3": "三",
		"4": "四",
		"5": "五",
		"6": "六"
	};

	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if (/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ?
			(RegExp.$1.length > 2 ? "星期" : "周") : "") + week[date.getDay() + ""]);
	}
	for (var k in o) {
		if (o.hasOwnProperty(k) && new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
};
