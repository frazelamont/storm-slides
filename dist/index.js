/**
 * @name storm-slides: Slides/carousel/fader/slider component
 * @version 0.2.0: Mon, 13 Nov 2017 12:45:13 GMT
 * @author stormid
 * @license MIT
 */
import defaults from './lib/defaults';
import componentPrototype from './lib/component-prototype';

const init = (sel, opts) => {
	let els = [].slice.call(document.querySelectorAll(sel));
    //let els = Array.from(document.querySelectorAll(sel));

	if(!els.length) throw new Error('Slides not initialised, no augmentable elements found');
    
	return els.map((el) => {
		return Object.assign(Object.create(componentPrototype), {
			node: el,
			settings: Object.assign({}, defaults, opts)
		}).init();
	});
};

export default { init };