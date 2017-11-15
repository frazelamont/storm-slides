import should from 'should';
import 'jsdom-global/register';
import Slides from '../dist/storm-slides.standalone';

const html = `<div class="js-slides">
                <div class="js-slides__list">
                    <div class="js-slides__item">
                        <img data-src="http://lorempixel.com/400/200">
                    </div>
                    <div class="js-slides__item">
                        <img data-src="http://lorempixel.com/400/200">
                    </div>
                    <div class="js-slides__item">
                        <img data-src="http://lorempixel.com/400/200">
                    </div>
                    <div class="js-slides__item">
                        <img data-src="http://lorempixel.com/400/200">
                    </div>
                </div>
                <button class="js-slides__previous">Previous</button>
                <button class="js-slides__next">Next</button>
                <ul>
                    <li><button class="js-slides__nav-item">1</button></li>
                    <li><button class="js-slides__nav-item">2</button></li>
                    <li><button class="js-slides__nav-item">3</button></li>
                    <li><button class="js-slides__nav-item">4</button><li>
                </ul>
                <div aria-live="polite" aria-atomic="true" class="visuallyhidden js-slides__liveregion"></div>
            </div>
            <div class="js-slides-autoplay">
            <div class="js-slides__list">
                <div class="js-slides__item">
                    <img data-src="http://lorempixel.com/400/200">
                </div>
                <div class="js-slides__item">
                    <img data-src="http://lorempixel.com/400/200">
                </div>
                <div class="js-slides__item">
                    <img data-src="http://lorempixel.com/400/200">
                </div>
                <div class="js-slides__item">
                    <img data-src="http://lorempixel.com/400/200">
                </div>
            </div>
            <div aria-live="polite" aria-atomic="true" class="visuallyhidden js-slides__liveregion"></div>
        </div>`;

document.body.innerHTML = html;

let SlidesBasic = Slides.init('.js-slides', {
    callback: () => {}
});

let SlidesAutoplay = Slides.init('.js-slides-autoplay', {
    autoPlay: true
});

describe('Initialisation', () => {
  
	it('should return array of slides', () => {
		should(SlidesBasic)
		.Array()
		.and.have.lengthOf(1);
	});

	it('should throw an error if no elements are found', () => {
		Slides.init.bind(Slides, '.js-err').should.throw();
    });    

	it('should throw an error if slide navigation does not match the number of slides', () => {
		//Slides.init.bind(Slides, '.js-slides-2').should.throw();
	});	
	
	it('each array item should be an object with the correct properties', () => {
		SlidesBasic[0].should.be.an.instanceOf(Object).and.not.empty();
		SlidesBasic[0].should.have.property('node');
		SlidesBasic[0].should.have.property('settings').Object();
        SlidesBasic[0].should.have.property('slides').Array();
		SlidesBasic[0].should.have.property('init').Function();
		SlidesBasic[0].should.have.property('initHandlers').Function();
		SlidesBasic[0].should.have.property('loadImages').Function();
		SlidesBasic[0].should.have.property('next').Function();
		SlidesBasic[0].should.have.property('previous').Function();
		SlidesBasic[0].should.have.property('change').Function();
	});

    it('should set zero index slide as default', () => {
		SlidesBasic[0].currentIndex.should.equal(0);
	});
    
    it('should set innerHTML of notification live region', () => {
        SlidesBasic[0].notification.innerHTML.should.equal('Slide 1 of 4');
    });

    it('should add active classNme to navItem', () => {
        window.setTimeout(() => {
            Array.from(SlidesBasic[0].navItems[0].classList).should.containEql('is--current');
        }, 0);
    });

    it('should create an interval when enabling autoplay', () => {
        SlidesAutoplay.should.have.property('interval').which.is.a.Number();
    });
});


describe('Interaction', () => {

    it('should set navigate to the next slide when you click next', () => {
		SlidesBasic[0].nextButton.click();
        Array.from(SlidesBasic[0].slides[1].container.classList).should.containEql('is--current');
		Array.from(SlidesBasic[0].slides[0].container.classList).should.not.containEql('is--current');
        SlidesBasic[0].notification.innerHTML.should.equal('Slide 2 of 4');
    });

    it('should set navigate to the previous slide when you click previous', () => {
		SlidesBasic[0].previousButton.click();
        Array.from(SlidesBasic[0].slides[0].container.classList).should.containEql('is--current');
		Array.from(SlidesBasic[0].slides[1].container.classList).should.not.containEql('is--current');
        SlidesBasic[0].notification.innerHTML.should.equal('Slide 1 of 4');
    });

    it('should not change if the user tries to change to the current item', () => {
        SlidesBasic[0].change(SlidesBasic[0].currentIndex);
        Array.from(SlidesBasic[0].slides[0].container.classList).should.containEql('is--current');
        SlidesBasic[0].notification.innerHTML.should.equal('Slide 1 of 4');
    });
    
    it('should loop', () => {
        SlidesBasic[0].navItems[3].click();
        Array.from(SlidesBasic[0].slides[3].container.classList).should.containEql('is--current');
        SlidesBasic[0].notification.innerHTML.should.equal('Slide 4 of 4');
    });

    it('should attach keydown eventListener to button', () => {		
		//trigger
		SlidesBasic[0].previousButton.dispatchEvent(
			new window.KeyboardEvent('keydown', { 
				code : 33,
				keyCode: 33
			})
        );

        SlidesBasic[0].navItems[0].dispatchEvent(
			new window.KeyboardEvent('keydown', { 
				code : 33,
				keyCode: 33
			})
        );
    });
    
    it('should be navigable by navItems', () => {
		SlidesBasic[0].nextButton.click();
        Array.from(SlidesBasic[0].slides[0].container.classList).should.containEql('is--current');
        SlidesBasic[0].notification.innerHTML.should.equal('Slide 1 of 4');
    });
    
    it('should be navigable by navItems backwards', () => {
		SlidesBasic[0].previousButton.click();
        Array.from(SlidesBasic[0].slides[3].container.classList).should.containEql('is--current');
        SlidesBasic[0].notification.innerHTML.should.equal('Slide 4 of 4');
    });
    
    it('should handle out of bounds index change', () => {
        SlidesBasic[0].change(-1);
        Array.from(SlidesBasic[0].slides[3].container.classList).should.containEql('is--current');
        SlidesBasic[0].notification.innerHTML.should.equal('Slide 4 of 4');
    });

});
