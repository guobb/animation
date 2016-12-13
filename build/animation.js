(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["animation"] = factory();
	else
		root["animation"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by apple on 16/12/12.
	 */
	'use strict';

	var loadImage = __webpack_require__(1);
	var Timeline = __webpack_require__(2);

	//初始化状态
	var STATE_INITIAL = 0;
	//开始状态
	var STATE_START = 0;
	//停止状态
	var STATE_STOP = 0;
	//同步任务
	var TASK_SYNC = 0;
	//异步任务
	var TASK_ASYNC = 1;

	/**
	 * 简单的函数封装 执行callback
	 * @param callback
	 */
	function next(callback) {
	    callback && callback();
	}
	/*
	* 帧动画库类
	* */

	function Animation(){
	    this.taskQueue = [];
	    this.index = 0;
	    this.state = STATE_INITIAL;
	    this.timeline = new Timeline();
	}

	/*
	* 添加一个同步任务 预加载图片
	* imglist 图片数组
	* */
	Animation.prototype.loadImage = function(imglist){
	    var taskFn = function (next) {
	        loadImage(imglist.slice(), next);
	    };
	    var type = TASK_SYNC;

	    return this._add(taskFn, type);
	};

	/**
	 * 添加一个异步定时任务，通过定时改变图片背景位置，实现帧动画
	 * @param ele dom对象
	 * @param positions 背景位置数组
	 * @param imgUrl 图片地址
	 */

	Animation.prototype.changPosition = function (ele, positions, imgUrl) {
	    var len = positions.length;
	    var taskFn;
	    var type;
	    if(len){
	        var me = this;
	        taskFn = function (next, time) {
	            if (imgUrl){
	                ele.style.backgroundImage = 'url('+ imageUrl +')';
	            }
	            //获取当前图片位置索引
	            var index = Math.min(time/me.interval|0, len-1);
	            var position = positions[index].split(' ');
	            //改变dom对象的背景图片位置
	            ele.style.backgroundPosition = position[0] + 'px' + position[1] + 'px';
	            if(index === len-1){
	                next();
	            }

	        };
	        type = TASK_ASYNC;
	    }else {
	        taskFn = next;
	        type = TASK_SYNC;
	    }
	    return this._add(taskFn, type);
	};

	/**
	 * 添加一个异步定时任务，通过定时改变image标签的src属性，实现帧动画
	 * @param ele image标签
	 * @param imgList 图片数组
	 */
	Animation.prototype.changeSrc = function (ele, imgList) {
	    var len = imgList.length;
	    var taskFn;
	    var type;
	    if(len){
	         var me = this;
	         taskFn = function (next, time) {
	             //获取当前图片的索引
	             var index = Math.min(time /me.interval | 0, len - 1);
	             //改变image对象的图片地址
	             ele.src = imgList[index];
	             if(index === len-1){
	                 next();
	             }
	         };
	         type = TASK_ASYNC;
	    }else{
	        taskFn = next;
	        type = TASK_SYNC;
	    }
	    return this._add(taskFn, type);
	};

	/**
	 * 添加一个异步定时执行任务
	 * 该任务自定义动画每帧执行任务函数
	 * @param taskFn 自定义每帧执行的任务函数
	 */
	Animation.prototype.enterFrame = function (taskFn) {
	    return this._add(taskFn, TASK_ASYNC);
	};

	/**
	 * 添加一个同步任务，可以在上一个任务完成后执行回调函数
	 * @param callback 回调函数
	 */
	Animation.prototype.then = function (callback) {
	    var taskFn = function (next) {
	        callback();
	        next();
	    };
	    var type = TASK_SYNC;
	    return this._add(taskFn,type);
	};

	/**
	 * 开始执行任务， 异步执行任务的间隔
	 * @param interval
	 */
	Animation.prototype.start = function (interval) {
	    if (this.state === STATE_START){
	        return this;
	    }

	    //如果任务链中没有任务，则返回
	    if (!this.taskQueue.length){
	        return this;
	    }
	    this.state = STATE_START;
	    this.interval = interval;
	    this._runTask();
	    return this;
	};

	/**
	 * 添加一个同步任务， 该任务就是回退到上一个任务中，
	 * 实现重复欧上一个任务的效果，可以定义重复的次数
	 * @param times 重复的次数
	 */
	Animation.prototype.repeat = function (times) {
	    var me = this;
	    var taskFn = function () {
	       if(typeof times == 'underfined'){
	           //无限回退到上一个任务
	           me.index--;
	           me._runTask();
	           return;
	       }
	       if(times){
	           times--;
	           //回退
	           me.index--;
	           me._runTask();
	       }else {
	           //达到重复的次数。跳转到下一个任务
	           var task = me.taskQueue[me.index];
	           me._next(task);
	       }
	    };
	    var type = TASK_SYNC;
	    return this._add(taskFn(), type);
	};
	/**
	 * 添加一个同步任务，相当于repeat()更友好的接口，无限循环上一次任务
	 */
	Animation.prototype.repeatForever = function () {
	    return this.repeat();
	};

	/**
	 * 设置当前任务执行结束后下一个任务前的等待时间
	 * @param time
	 */
	Animation.prototype.wait = function (time) {
	    if(this.taskQueue && this.taskQueue.length>0){
	        this.taskQueue[this.taskQueue.length -1].wait = time;
	    }
	    return this;
	};

	/**
	 * 暂停当前异步定时任务
	 */
	Animation.prototype.pause = function () {
	    if(this.state === STATE_START){
	        this.state = STATE_STOP;
	        this.timeline.stop();
	        return this;
	    }
	    return this;
	};

	/**
	 * 重新执行上一次暂停的异步任务
	 */
	Animation.prototype.restart = function () {
	    if(this.state === STATE_STOP){
	        this.state = STATE_START;
	        this.timeline.restart();
	        return this;
	    }
	    return this;
	};

	/**
	 * 释放资源
	 */

	Animation.prototype.dispose = function () {
	    if(this.state !== STATE_INITIAL){
	        this.state = STATE_INITIAL;
	        this.taskQueue = null;
	        this.timeline.stop();
	        this.timeline = null;
	        return this;
	    }
	    return this;
	};
	/**
	 * 添加一个任务队列中
	 * @param taskFn 任务方法
	 * @param type 任务类型
	 * @private
	 */
	Animation.prototype._add = function (taskFn,type) {
	    this.taskQueue.push({
	        taskFn:taskFn,
	        type: type
	    });
	    return this;
	};

	/**
	 * 执行任务
	 * @private
	 */
	Animation.prototype._runTask = function () {
	    if (! this.taskQueue || this.state !== STATE_START){
	        return;
	    }
	    //任务执行完毕
	    if (this.index === this.taskQueue.length){
	        this.dispose();
	        return;
	    }
	    //获取任务链上的当前任务
	    var task = this.taskQueue[this.index];

	    if(task.type === TASK_SYNC){
	        this._syncTask(task);
	    }else {
	        this._asyncTask(task);
	    }
	};

	/**
	 * 同步任务
	 * @param task 执行任务对象
	 * @private
	 */
	Animation.prototype._syncTask = function (task) {
	    var me = this;
	    var next = function () {
	        //切换下一个任务
	        me._next(task);
	    };
	    var taskFn = task.taskFn;
	    taskFn(next);
	};
	/**
	 * 切换到下一个任务
	 * @private
	 */
	Animation.prototype._next = function (task) {
	    this.index++;
	    var me = this;
	    task.wait ? setTimeout(function () {
	        me._runTask();
	    },task.wait) : this._runTask();
	    this._runTask();
	};

	/**
	 * 异步任务
	 * @private
	 */
	Animation.prototype._asyncTask = function (task) {

	    var me = this;
	    //定义每一帧的回调函数
	    var enterFrame = function (time) {
	        var taskFn = task.taskFn;
	        var next = function () {
	            //停止当前任务
	            me.timeline.stop();
	            //执行下一个任务
	            me._next(task);
	        };
	        taskFn(next, time);
	    };
	    this.timeline.onenterframe = enterFrame;
	    this.timeline.start(this.interval);
	};

	module.exports = function () {
	    return new Animation();
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Created by apple on 16/12/12.
	 */
	'use strict';

	/**
	 * 预加载图片函数
	 * @param images 加载图片的数组或者对象
	 * @param callback 全部图片加载完成后调用的回调函数
	 * @param timeout 加载超时的时长
	 */
	function loadImage(images, callback, timeout) {
	    //加载完成图片的计数器
	    var count = 0;
	    //全部图片加载成功的一个标志位
	    var success = true;
	    //超时timer的id
	    var timeoutId = 0;
	    //是否加载超时的标志位
	    var isTimeout = false;
	    //对图片数组（或对象）进行遍历
	    for(var key in images){
	        //过滤protype上的属性
	        if(!images.hasOwnProperty(key)){
	            continue;
	        }
	        //获取每一个图片元素
	        var item = images[key];

	        if (typeof item === 'string'){
	            item = item[key] = {
	                src: item
	            };
	        }
	        //如果格式不满足，丢弃此条数据进行下一次遍历
	        if (!item || !item.src){
	            continue;
	        }
	        //计数+1
	        count++;
	        //设置图片元素的id
	        item.id = '__img__'+key+getId();
	        //设置图片的img,它是一个Image对象
	        item.img = window[item.id] = new Image();

	        doLoad(item);
	    }

	    //遍历完成如果计数为0，直接调用callback
	    if(!count){
	        callback(success);
	    }else {
	        timeoutId = setTimeout(onTimeout, timeout);
	    }



	    /**
	     * 真正进行图片加载的函数
	     * @param item 图片元素对象
	     */
	    function doLoad(item) {
	        item.status = 'loading';
	        
	        var img = item.img;

	        //定义图片加载成功的回调函数
	        img.onload = function () {
	            success = success & true;
	            item.status = 'loaded';
	            done();
	        };
	        //定义图片加载失败的回调函数
	        img.onerror = function () {
	            success = false;
	            item.status = 'error';
	            done();
	        };
	        //发起的请求；
	        img.src = item.src;
	        //每张图片加载完成的回调函数
	        function done() {
	            img.onload = img.onerror = null;

	            try{
	                delete window[item.id];
	            }catch (e){

	            }
	            //每张图片加载完成，计数－1 当所有图片加载完成没有超时
	            //清除超时计时器，且执行回调函数
	            if(!--count && !isTimeout){
	                clearTimeout(timeoutId);
	                callback(success);
	            }
	        }
	    }

	    //超时函数
	    function onTimeout() {
	        isTimeout = true;
	        callback(false);
	    }
	}

	var __id = 0;
	function getId() {
	    return ++__id;
	}
	module.exports = loadImage;

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Created by apple on 16/12/12.
	 */
	'use strict';

	var DEFAULT_INTERVAL = 1000 / 60;

	// 初始化状态
	var STATE_INITIAL = 0;
	// 开始状态
	var STATE_START = 1;
	// 停止状态
	var STATE_STOP = 2;

	/**
	 * raf
	 */
	var requestAnimationFrame = (function () {
	    return window.requestAnimationFrame ||
	           window.webkitRequestAnimationFrame ||
	           window.mozRequestAnimationFrame ||
	           window.oRequestAnimationFrame ||
	           function (callback) {
	               return window.setTimeout(callback,callback.interval || DEFAULT_INTERVAL)

	           };
	})();

	var cancelAnimationFrame = (function () {
	    return window.cancelAnimationFrame ||
	           window.webkitCancelAnimationFrame ||
	           window.mozCancelAnimationFrame ||
	           window.oCancelAnimationFrame ||
	           function (id) {
	               return window.clearTimeout(id);
	           }; 
	})();


	/**
	 * Timline 时间轴类
	 * @constructor
	 */
	function Timeline() {
	    this.animationHander = 0;
	    this.state = STATE_INITIAL;
	}

	/**
	 * 时间轴上每一个回调执行函数
	 * @param time 从动画开始到当前执行的时间
	 */
	Timeline.prototype.onenterframe = function (time) {

	};

	/**
	 * 动画开始
	 * @param interval 每一次回调的间隔时间
	 */
	Timeline.prototype.start = function (interval) {
	    if (this.state === STATE_START){
	        return;
	    }
	    this.state = STATE_START;
	    this.interval = interval || DEFAULT_INTERVAL;
	    startTimeline(this, +new Date());
	};

	/**
	 * 动画停止
	 */
	Timeline.prototype.stop = function () {
	    if(this.state !== STATE_START ){
	        return;
	    }
	    this.state = STATE_START;

	    //如果动画开始过，则记录动画到现在所经历的时间
	    if(this.startTime ){
	        this.dur = +new Date() - this.startTime;
	    }

	    cancelAnimationFrame(this.animationHander);

	};

	/**
	 * 重新开始动画
	 */

	Timeline.prototype.restart = function () {
	    if (this.state === STATE_START){
	        return;
	    }
	    if (!this.dur || !this.interval){
	        return;
	    }

	    startTimeline(this, +new Date() - this.dur);
	};

	/**
	 * 时间轴动画启动函数
	 * @param timeline 时间轴实例
	 * @param startTime 动画开始时间间隔
	 */
	function startTimeline(timeline, startTime) {

	    timeline.startTime = startTime;
	    nextTick.interval = timeline.interval;

	    //记录上一次回调的时间间隔
	    var lastTick = +new Date();
	    nextTick();

	    /**
	     * 每一帧执行的函数
	     */
	    function nextTick() {
	        var now = +new Date();

	        timeline.animationHander = requestAnimationFrame(nextTick);
	    }

	    //如果当前时间与上一次回调的时间大于设置的时间间隔
	    //表示这一次可以执行回调函数
	    if (now - lastTick>=time.interval){
	        timeline.onenterframe(now - startTime);
	        lastTick = now;
	    }

	}

	module.exports = Timeline;

/***/ }
/******/ ])
});
;