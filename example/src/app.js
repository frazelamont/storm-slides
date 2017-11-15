import Slides from './libs/component';

const onDOMContentLoadedTasks = [() => {
    Slides.init('.js-slides-default');
    Slides.init('.js-slides-autoplay', { autoPlay: true, slideDuration: 3 });
}];
    
if('addEventListener' in window) window.addEventListener('DOMContentLoaded', () => { onDOMContentLoadedTasks.forEach((fn) => fn()); });