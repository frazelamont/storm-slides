(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _component = require('./libs/component');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var onDOMContentLoadedTasks = [function () {
    _component2.default.init('.js-slides');
}];

if ('addEventListener' in window) window.addEventListener('DOMContentLoaded', function () {
    onDOMContentLoadedTasks.forEach(function (fn) {
        return fn();
    });
});

},{"./libs/component":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _defaults = require('./lib/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _componentPrototype = require('./lib/component-prototype');

var _componentPrototype2 = _interopRequireDefault(_componentPrototype);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var init = function init(sel, opts) {
	var els = [].slice.call(document.querySelectorAll(sel));
	//let els = Array.from(document.querySelectorAll(sel));

	if (!els.length) throw new Error('Slides not initialised, no augmentable elements found');

	return els.map(function (el) {
		return Object.assign(Object.create(_componentPrototype2.default), {
			node: el,
			settings: Object.assign({}, _defaults2.default, opts)
		}).init();
	});
};

exports.default = { init: init };

},{"./lib/component-prototype":3,"./lib/defaults":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var KEY_CODES = {
	ENTER: 13
},
    TRIGGER_EVENTS = ['click', 'keydown'];

exports.default = {
	init: function init() {
		var _this = this;

		this.slides = [].slice.call(document.querySelectorAll(this.settings.itemSelector)).map(function (slide) {
			return {
				unloadedImgs: [].slice.call(slide.querySelectorAll('[data-srcset], [data-src]')),
				container: slide
			};
		});

		this.nextButton = document.querySelector(this.settings.buttonNextSelector);
		this.previousButton = document.querySelector(this.settings.buttonPreviousSelector);
		this.navItems = [].slice.call(document.querySelectorAll(this.settings.navItemSelector));

		if (this.navItems.length > 0 && this.navItems.length !== this.slides.length) throw new Error('Slide navigation does not match the number of slides.');

		this.notification = this.node.querySelector(this.settings.liveRegionSelector);
		this.setCurrent(this.settings.startIndex);
		this.slides[this.currentIndex].container.classList.add(this.settings.activeClass);
		this.initHandlers();
		this.settings.preload ? this.slides.forEach(function (slide, i) {
			_this.loadImage(i);
		}) : this.loadImages(this.settings.startIndex);

		return this;
	},
	initHandlers: function initHandlers() {
		var _this2 = this;

		TRIGGER_EVENTS.forEach(function (ev) {
			['previous', 'next'].forEach(function (type) {
				if (_this2[type + 'Button']) _this2[type + 'Button'].addEventListener(ev, function (e) {
					if (e.keyCode && e.keyCode !== KEY_CODES.ENTER) return;
					_this2[type]();
				});
			});
			_this2.navItems.length > 0 && _this2.navItems.forEach(function (item, i) {
				item.addEventListener(ev, function (e) {
					if (e.keyCode && e.keyCode !== KEY_CODES.ENTER) return;
					_this2.change(i);
				});
			});
		});
	},
	loadImage: function loadImage(i) {
		var _this3 = this;

		if (!this.slides[i].unloadedImgs.length) return;

		this.slides[i].container.classList.add(this.settings.loadingClass);
		this.slides[i].unloadedImgs = this.slides[i].unloadedImgs.reduce(function (acc, el) {
			['src', 'srcset'].forEach(function (type) {
				if (el.hasAttribute('data-' + type)) {
					el.setAttribute(type, el.getAttribute('data-' + type));
					el.removeAttribute('data-' + type);
				}
				_this3.slides[i].container.classList.remove(_this3.settings.loadingClass);
			});
			return acc;
		}, []);
	},
	loadImages: function loadImages(i) {
		var _this4 = this;

		if (!this.node.querySelector('[data-src], [data-srcset]')) return;
		var indexes = [i];

		if (this.slides.length > 1) indexes.push(i === 0 ? this.slides.length - 1 : i - 1);
		if (this.slides.length > 2) indexes.push(i === this.slides.length - 1 ? 0 : i + 1);

		indexes.forEach(function (idx) {
			_this4.loadImage(idx);
		});
	},
	reset: function reset() {
		this.slides[this.currentIndex].container.classList.remove(this.settings.activeClass);
		this.slides[this.currentIndex].container.removeAttribute('tabindex');
		this.navItems.length && this.navItems[this.currentIndex].removeAttribute('aria-current');

		var previouslyHidden = this.node.querySelector('.' + this.settings.hidePreviousClass),
		    previouslyShown = this.node.querySelector('.' + this.settings.showPreviousClass),
		    nextShown = this.node.querySelector('.' + this.settings.showNextClass),
		    nextHidden = this.node.querySelector('.' + this.settings.hideNextClass);

		previouslyHidden && previouslyHidden.classList.remove(this.settings.hidePreviousClass);
		previouslyShown && previouslyShown.classList.remove(this.settings.showPreviousClass);
		nextShown && nextShown.classList.remove(this.settings.showNextClass);
		nextHidden && nextHidden.classList.remove(this.settings.hideNextClass);
	},
	next: function next() {
		this.change(this.currentIndex === this.slides.length - 1 ? 0 : this.currentIndex + 1);
	},
	previous: function previous() {
		this.change(this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1);
	},
	change: function change(index) {
		if (index === this.currentIndex) return;

		this.reset();

		index = index === -1 ? this.slides.length - 1 : index === this.slides.length ? 0 : index;

		this.loadImages(index);

		var isForwards = (index > this.currentIndex || index === 0 && this.currentIndex === this.slides.length - 1) && !(index === this.slides.length - 1 && this.currentIndex === 0);

		this.slides[this.currentIndex].container.classList.add(isForwards ? this.settings.hidePreviousClass : this.settings.hideNextClass);
		this.slides[index].container.classList.add('' + (isForwards ? this.settings.showNextClass : this.settings.showPreviousClass));
		this.setCurrent(index);

		this.settings.callback && typeof this.settings.callback === 'function' && this.settings.callback();
	},
	setCurrent: function setCurrent(i) {
		this.slides[i].container.classList.add(this.settings.activeClass);
		this.slides[i].container.setAttribute('tabindex', '-1');
		this.slides[i].container.focus();
		this.navItems.length && this.navItems[i].setAttribute('aria-current', true);
		this.notification.innerHTML = 'Slide ' + (i + 1) + ' of ' + this.slides.length;
		this.currentIndex = i;
	}
};

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {
	buttonPreviousSelector: '.js-slides__previous',
	buttonNextSelector: '.js-slides__next',
	navItemSelector: '.js-slides__nav-item',
	itemSelector: '.js-slides__item',
	liveRegionSelector: '.js-slides__liveregion',
	loadingClass: 'is--loading',
	activeClass: 'is--current',
	showPreviousClass: 'show--previous',
	showNextClass: 'show--next',
	hidePreviousClass: 'hide--previous',
	hideNextClass: 'hide--next',
	isCarousel: true,
	startIndex: 0,
	preload: false
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2RlZmF1bHRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7Ozs7QUFFQSxJQUFNLDJCQUEyQixZQUFNLEFBQ25DO3dCQUFBLEFBQU8sS0FBUCxBQUFZLEFBQ2Y7QUFGRCxBQUFnQyxDQUFBOztBQUloQyxJQUFHLHNCQUFILEFBQXlCLGVBQVEsQUFBTyxpQkFBUCxBQUF3QixvQkFBb0IsWUFBTSxBQUFFOzRCQUFBLEFBQXdCLFFBQVEsVUFBQSxBQUFDLElBQUQ7ZUFBQSxBQUFRO0FBQXhDLEFBQWdEO0FBQXBHLENBQUE7Ozs7Ozs7OztBQ05qQzs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU0sT0FBTyxTQUFQLEFBQU8sS0FBQSxBQUFDLEtBQUQsQUFBTSxNQUFTLEFBQzNCO0tBQUksTUFBTSxHQUFBLEFBQUcsTUFBSCxBQUFTLEtBQUssU0FBQSxBQUFTLGlCQUFqQyxBQUFVLEFBQWMsQUFBMEIsQUFDL0M7QUFFSDs7S0FBRyxDQUFDLElBQUosQUFBUSxRQUFRLE1BQU0sSUFBQSxBQUFJLE1BQVYsQUFBTSxBQUFVLEFBRWhDOztZQUFPLEFBQUksSUFBSSxVQUFBLEFBQUMsSUFBTyxBQUN0QjtnQkFBTyxBQUFPLE9BQU8sT0FBQSxBQUFPLDRCQUFyQjtTQUFpRCxBQUNqRCxBQUNOO2FBQVUsT0FBQSxBQUFPLE9BQVAsQUFBYyx3QkFGbEIsQUFBaUQsQUFFN0MsQUFBNEI7QUFGaUIsQUFDdkQsR0FETSxFQUFQLEFBQU8sQUFHSixBQUNIO0FBTEQsQUFBTyxBQU1QLEVBTk87QUFOUjs7a0JBY2UsRUFB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TCxBQUFnQixBQUVmOztPQUFBLEFBQUssU0FBTCxBQUFjLFlBQVksT0FBTyxLQUFBLEFBQUssU0FBWixBQUFxQixhQUFoRCxBQUE2RCxjQUFlLEtBQUEsQUFBSyxTQUFqRixBQUE0RSxBQUFjLEFBQzFGO0FBbkdhLEFBb0dkO0FBcEdjLGlDQUFBLEFBb0dILEdBQUUsQUFDWjtPQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxVQUFmLEFBQXlCLFVBQXpCLEFBQW1DLElBQUksS0FBQSxBQUFLLFNBQTVDLEFBQXFELEFBQ3JEO09BQUEsQUFBSyxPQUFMLEFBQVksR0FBWixBQUFlLFVBQWYsQUFBeUIsYUFBekIsQUFBc0MsWUFBdEMsQUFBa0QsQUFDbEQ7T0FBQSxBQUFLLE9BQUwsQUFBWSxHQUFaLEFBQWUsVUFBZixBQUF5QixBQUN6QjtPQUFBLEFBQUssU0FBTCxBQUFjLFVBQVUsS0FBQSxBQUFLLFNBQUwsQUFBYyxHQUFkLEFBQWlCLGFBQWpCLEFBQThCLGdCQUF0RCxBQUF3QixBQUE4QyxBQUN0RTtPQUFBLEFBQUssYUFBTCxBQUFrQix3QkFBcUIsSUFBdkMsQUFBMkMsY0FBUSxLQUFBLEFBQUssT0FBeEQsQUFBK0QsQUFDL0Q7T0FBQSxBQUFLLGVBQUwsQUFBb0IsQUFDcEI7QSxBQTNHYTtBQUFBLEFBQ2Q7Ozs7Ozs7Ozt5QkNOYyxBQUNVLEFBQ3hCO3FCQUZjLEFBRU0sQUFDcEI7a0JBSGMsQUFHRyxBQUNqQjtlQUpjLEFBSUEsQUFDZDtxQkFMYyxBQUtNLEFBQ3BCO2VBTmMsQUFNQSxBQUNkO2NBUGMsQUFPRCxBQUNiO29CQVJjLEFBUUssQUFDbkI7Z0JBVGMsQUFTQyxBQUNmO29CQVZjLEFBVUssQUFDbkI7Z0JBWGMsQUFXQyxBQUNmO2FBWmMsQUFZRixBQUNaO2FBYmMsQUFhRixBQUNaO1UsQUFkYyxBQWNMO0FBZEssQUFDZCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgU2xpZGVzIGZyb20gJy4vbGlicy9jb21wb25lbnQnO1xuXG5jb25zdCBvbkRPTUNvbnRlbnRMb2FkZWRUYXNrcyA9IFsoKSA9PiB7XG4gICAgU2xpZGVzLmluaXQoJy5qcy1zbGlkZXMnKTtcbn1dO1xuICAgIFxuaWYoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7IG9uRE9NQ29udGVudExvYWRlZFRhc2tzLmZvckVhY2goKGZuKSA9PiBmbigpKTsgfSk7IiwiaW1wb3J0IGRlZmF1bHRzIGZyb20gJy4vbGliL2RlZmF1bHRzJztcbmltcG9ydCBjb21wb25lbnRQcm90b3R5cGUgZnJvbSAnLi9saWIvY29tcG9uZW50LXByb3RvdHlwZSc7XG5cbmNvbnN0IGluaXQgPSAoc2VsLCBvcHRzKSA9PiB7XG5cdGxldCBlbHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSk7XG4gICAgLy9sZXQgZWxzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbCkpO1xuXG5cdGlmKCFlbHMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ1NsaWRlcyBub3QgaW5pdGlhbGlzZWQsIG5vIGF1Z21lbnRhYmxlIGVsZW1lbnRzIGZvdW5kJyk7XG4gICAgXG5cdHJldHVybiBlbHMubWFwKChlbCkgPT4ge1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoY29tcG9uZW50UHJvdG90eXBlKSwge1xuXHRcdFx0bm9kZTogZWwsXG5cdFx0XHRzZXR0aW5nczogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdHMpXG5cdFx0fSkuaW5pdCgpO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHsgaW5pdCB9OyIsImNvbnN0IEtFWV9DT0RFUyA9IHtcblx0XHRFTlRFUjogMTNcblx0fSxcblx0VFJJR0dFUl9FVkVOVFMgPSBbJ2NsaWNrJywgJ2tleWRvd24nIF07XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0aW5pdCgpe1xuXHRcdHRoaXMuc2xpZGVzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2V0dGluZ3MuaXRlbVNlbGVjdG9yKSlcblx0XHRcdFx0XHRcdC5tYXAoc2xpZGUgPT4gKHtcblx0XHRcdFx0XHRcdFx0dW5sb2FkZWRJbWdzOiBbXS5zbGljZS5jYWxsKHNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNyY3NldF0sIFtkYXRhLXNyY10nKSksXG5cdFx0XHRcdFx0XHRcdGNvbnRhaW5lcjogc2xpZGVcblx0XHRcdFx0XHRcdH0pKTtcblxuXHRcdHRoaXMubmV4dEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5idXR0b25OZXh0U2VsZWN0b3IpO1xuXHRcdHRoaXMucHJldmlvdXNCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuYnV0dG9uUHJldmlvdXNTZWxlY3Rvcik7XG5cdFx0dGhpcy5uYXZJdGVtcyA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNldHRpbmdzLm5hdkl0ZW1TZWxlY3RvcikpO1xuXG5cdFx0aWYodGhpcy5uYXZJdGVtcy5sZW5ndGggPiAwICYmIHRoaXMubmF2SXRlbXMubGVuZ3RoICE9PSB0aGlzLnNsaWRlcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignU2xpZGUgbmF2aWdhdGlvbiBkb2VzIG5vdCBtYXRjaCB0aGUgbnVtYmVyIG9mIHNsaWRlcy4nKTtcblxuXHRcdHRoaXMubm90aWZpY2F0aW9uID0gdGhpcy5ub2RlLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5saXZlUmVnaW9uU2VsZWN0b3IpO1xuXHRcdHRoaXMuc2V0Q3VycmVudCh0aGlzLnNldHRpbmdzLnN0YXJ0SW5kZXgpO1xuXHRcdHRoaXMuc2xpZGVzW3RoaXMuY3VycmVudEluZGV4XS5jb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0XHR0aGlzLmluaXRIYW5kbGVycygpO1xuXHRcdHRoaXMuc2V0dGluZ3MucHJlbG9hZCA/IHRoaXMuc2xpZGVzLmZvckVhY2goKHNsaWRlLCBpKSA9PiB7IHRoaXMubG9hZEltYWdlKGkpOyB9KSA6IHRoaXMubG9hZEltYWdlcyh0aGlzLnNldHRpbmdzLnN0YXJ0SW5kZXgpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGluaXRIYW5kbGVycygpe1xuXHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0WydwcmV2aW91cycsICduZXh0J10uZm9yRWFjaCh0eXBlID0+IHtcblx0XHRcdFx0aWYodGhpc1tgJHt0eXBlfUJ1dHRvbmBdKSB0aGlzW2Ake3R5cGV9QnV0dG9uYF0uYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdFx0aWYoZS5rZXlDb2RlICYmIGUua2V5Q29kZSAhPT0gS0VZX0NPREVTLkVOVEVSKSByZXR1cm47XG5cdFx0XHRcdFx0dGhpc1t0eXBlXSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5uYXZJdGVtcy5sZW5ndGggPiAwICYmIHRoaXMubmF2SXRlbXMuZm9yRWFjaCgoaXRlbSwgaSlcdCA9PiB7XG5cdFx0XHRcdGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdFx0aWYoZS5rZXlDb2RlICYmIGUua2V5Q29kZSAhPT0gS0VZX0NPREVTLkVOVEVSKSByZXR1cm47XG5cdFx0XHRcdFx0dGhpcy5jaGFuZ2UoaSk7XG5cdFx0XHRcdH0pXG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSxcblx0bG9hZEltYWdlKGkpe1xuXHRcdGlmKCF0aGlzLnNsaWRlc1tpXS51bmxvYWRlZEltZ3MubGVuZ3RoKSByZXR1cm47XG5cdFx0XG5cdFx0dGhpcy5zbGlkZXNbaV0uY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5sb2FkaW5nQ2xhc3MpO1xuXHRcdHRoaXMuc2xpZGVzW2ldLnVubG9hZGVkSW1ncyA9IHRoaXMuc2xpZGVzW2ldLnVubG9hZGVkSW1ncy5yZWR1Y2UoKGFjYywgZWwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRbJ3NyYycsICdzcmNzZXQnXS5mb3JFYWNoKHR5cGUgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYoZWwuaGFzQXR0cmlidXRlKGBkYXRhLSR7dHlwZX1gKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbC5zZXRBdHRyaWJ1dGUodHlwZSwgZWwuZ2V0QXR0cmlidXRlKGBkYXRhLSR7dHlwZX1gKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVsLnJlbW92ZUF0dHJpYnV0ZShgZGF0YS0ke3R5cGV9YCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLnNsaWRlc1tpXS5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnNldHRpbmdzLmxvYWRpbmdDbGFzcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSwgW10pO1xuXHR9LFxuXHRsb2FkSW1hZ2VzKGkpe1xuXHRcdGlmKCF0aGlzLm5vZGUucXVlcnlTZWxlY3RvcignW2RhdGEtc3JjXSwgW2RhdGEtc3Jjc2V0XScpKSByZXR1cm47XG5cdFx0bGV0IGluZGV4ZXMgPSBbaV07XG5cblx0XHRpZih0aGlzLnNsaWRlcy5sZW5ndGggPiAxKSBpbmRleGVzLnB1c2goaSA9PT0gMCA/IHRoaXMuc2xpZGVzLmxlbmd0aCAtIDEgOiBpIC0gMSk7XG5cdFx0aWYodGhpcy5zbGlkZXMubGVuZ3RoID4gMikgaW5kZXhlcy5wdXNoKGkgPT09IHRoaXMuc2xpZGVzLmxlbmd0aCAtIDEgPyAwIDogaSArIDEpO1xuXG5cdFx0aW5kZXhlcy5mb3JFYWNoKGlkeCA9PiB7IHRoaXMubG9hZEltYWdlKGlkeCkgfSk7XG5cdH0sXG5cdHJlc2V0KCl7XG5cdFx0dGhpcy5zbGlkZXNbdGhpcy5jdXJyZW50SW5kZXhdLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHRcdHRoaXMuc2xpZGVzW3RoaXMuY3VycmVudEluZGV4XS5jb250YWluZXIucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuXHRcdHRoaXMubmF2SXRlbXMubGVuZ3RoICYmIHRoaXMubmF2SXRlbXNbdGhpcy5jdXJyZW50SW5kZXhdLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1jdXJyZW50Jyk7XG5cblx0XHRsZXQgcHJldmlvdXNseUhpZGRlbiA9IHRoaXMubm9kZS5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLnNldHRpbmdzLmhpZGVQcmV2aW91c0NsYXNzfWApLFxuXHRcdFx0cHJldmlvdXNseVNob3duID0gdGhpcy5ub2RlLnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuc2V0dGluZ3Muc2hvd1ByZXZpb3VzQ2xhc3N9YCksXG5cdFx0XHRuZXh0U2hvd24gPSB0aGlzLm5vZGUucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5zZXR0aW5ncy5zaG93TmV4dENsYXNzfWApLFxuXHRcdFx0bmV4dEhpZGRlbiA9IHRoaXMubm9kZS5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLnNldHRpbmdzLmhpZGVOZXh0Q2xhc3N9YCk7XG5cblx0XHRwcmV2aW91c2x5SGlkZGVuICYmIHByZXZpb3VzbHlIaWRkZW4uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnNldHRpbmdzLmhpZGVQcmV2aW91c0NsYXNzKTtcblx0XHRwcmV2aW91c2x5U2hvd24gJiYgcHJldmlvdXNseVNob3duLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5zZXR0aW5ncy5zaG93UHJldmlvdXNDbGFzcyk7XG5cdFx0bmV4dFNob3duICYmIG5leHRTaG93bi5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuc2V0dGluZ3Muc2hvd05leHRDbGFzcyk7XG5cdFx0bmV4dEhpZGRlbiAmJiBuZXh0SGlkZGVuLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5zZXR0aW5ncy5oaWRlTmV4dENsYXNzKTtcblx0fSxcblx0bmV4dCgpe1xuXHRcdHRoaXMuY2hhbmdlKCh0aGlzLmN1cnJlbnRJbmRleCA9PT0gdGhpcy5zbGlkZXMubGVuZ3RoIC0gMSA/IDAgOiB0aGlzLmN1cnJlbnRJbmRleCArIDEpKTtcblx0fSxcblx0cHJldmlvdXMoKXtcblx0XHR0aGlzLmNoYW5nZSgodGhpcy5jdXJyZW50SW5kZXggPT09IDAgPyB0aGlzLnNsaWRlcy5sZW5ndGggLSAxIDogdGhpcy5jdXJyZW50SW5kZXggLSAxKSk7XG5cdH0sXG5cdGNoYW5nZShpbmRleCl7XG5cdFx0aWYgKGluZGV4ID09PSB0aGlzLmN1cnJlbnRJbmRleCkgcmV0dXJuO1xuXHRcdFxuXHRcdHRoaXMucmVzZXQoKTtcblxuXHRcdGluZGV4ID0gaW5kZXggPT09IC0xID8gdGhpcy5zbGlkZXMubGVuZ3RoIC0gMSA6IGluZGV4ID09PSB0aGlzLnNsaWRlcy5sZW5ndGggPyAwIDogaW5kZXg7XG5cblx0XHR0aGlzLmxvYWRJbWFnZXMoaW5kZXgpO1xuXHRcdFxuXHRcdGxldCBpc0ZvcndhcmRzID0gKGluZGV4ID4gdGhpcy5jdXJyZW50SW5kZXggfHwgaW5kZXggPT09IDAgJiYgdGhpcy5jdXJyZW50SW5kZXggPT09IHRoaXMuc2xpZGVzLmxlbmd0aCAtIDEpICYmICEoaW5kZXggPT09ICh0aGlzLnNsaWRlcy5sZW5ndGggLSAxKSAmJiB0aGlzLmN1cnJlbnRJbmRleCA9PT0gMCk7XG5cdFx0XG5cdFx0dGhpcy5zbGlkZXNbdGhpcy5jdXJyZW50SW5kZXhdLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKGlzRm9yd2FyZHMgPyB0aGlzLnNldHRpbmdzLmhpZGVQcmV2aW91c0NsYXNzIDogdGhpcy5zZXR0aW5ncy5oaWRlTmV4dENsYXNzKTtcblx0XHR0aGlzLnNsaWRlc1tpbmRleF0uY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoYCR7aXNGb3J3YXJkcyA/IHRoaXMuc2V0dGluZ3Muc2hvd05leHRDbGFzcyA6IHRoaXMuc2V0dGluZ3Muc2hvd1ByZXZpb3VzQ2xhc3N9YCk7XG5cdFx0dGhpcy5zZXRDdXJyZW50KGluZGV4KTtcblx0XHRcblx0XHQodGhpcy5zZXR0aW5ncy5jYWxsYmFjayAmJiB0eXBlb2YgdGhpcy5zZXR0aW5ncy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgJiYgdGhpcy5zZXR0aW5ncy5jYWxsYmFjaygpO1xuXHR9LFxuXHRzZXRDdXJyZW50KGkpe1xuXHRcdHRoaXMuc2xpZGVzW2ldLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHRcdHRoaXMuc2xpZGVzW2ldLmNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG5cdFx0dGhpcy5zbGlkZXNbaV0uY29udGFpbmVyLmZvY3VzKCk7XG5cdFx0dGhpcy5uYXZJdGVtcy5sZW5ndGggJiYgdGhpcy5uYXZJdGVtc1tpXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtY3VycmVudCcsIHRydWUpO1xuXHRcdHRoaXMubm90aWZpY2F0aW9uLmlubmVySFRNTCA9IGBTbGlkZSAke2kgKyAxfSBvZiAke3RoaXMuc2xpZGVzLmxlbmd0aH1gO1xuXHRcdHRoaXMuY3VycmVudEluZGV4ID0gaTtcblx0fVxufTsiLCJleHBvcnQgZGVmYXVsdCB7XG5cdGJ1dHRvblByZXZpb3VzU2VsZWN0b3I6ICcuanMtc2xpZGVzX19wcmV2aW91cycsXG5cdGJ1dHRvbk5leHRTZWxlY3RvcjogJy5qcy1zbGlkZXNfX25leHQnLFxuXHRuYXZJdGVtU2VsZWN0b3I6ICcuanMtc2xpZGVzX19uYXYtaXRlbScsXG5cdGl0ZW1TZWxlY3RvcjogJy5qcy1zbGlkZXNfX2l0ZW0nLFxuXHRsaXZlUmVnaW9uU2VsZWN0b3I6ICcuanMtc2xpZGVzX19saXZlcmVnaW9uJyxcblx0bG9hZGluZ0NsYXNzOiAnaXMtLWxvYWRpbmcnLFxuXHRhY3RpdmVDbGFzczogJ2lzLS1jdXJyZW50Jyxcblx0c2hvd1ByZXZpb3VzQ2xhc3M6ICdzaG93LS1wcmV2aW91cycsXG5cdHNob3dOZXh0Q2xhc3M6ICdzaG93LS1uZXh0Jyxcblx0aGlkZVByZXZpb3VzQ2xhc3M6ICdoaWRlLS1wcmV2aW91cycsXG5cdGhpZGVOZXh0Q2xhc3M6ICdoaWRlLS1uZXh0Jyxcblx0aXNDYXJvdXNlbDogdHJ1ZSxcblx0c3RhcnRJbmRleDogMCxcblx0cHJlbG9hZDogZmFsc2Vcbn07Il19