class OtwCarousel {
    constructor(element, options = {}) {
        this.element = element;
        this.cardWidth = options.cardWidth || 100;
        this.transitionDuration = options.transitionDuration || 300;
        this.projectsLength = options.projectsLength || 3;
        this.isAnimating = false;
        this.translateX = -100;
        this.touchstartX = 0;
        this.touchendX = 0;

        this.init();
    }

    init() {
        this.bindEvents();
    }

    setTranslateX(value) {
        this.element.style.setProperty('--translateX', value + '%');
    }

    setTransitionDuration(value) {
        this.element.style.setProperty('--transitionDuration', value + 'ms');
    }

    goToRight() {
        if (!this.isAnimating) {
            this.isAnimating = true;

            const newTranslateX = this.translateX - this.cardWidth;

            if (Math.abs(newTranslateX) > ((this.projectsLength) * this.cardWidth)) {
                this.setTranslateX(newTranslateX);

                setTimeout(() => {
                    this.translateX = -100;

                    this.setTransitionDuration(0);
                    this.setTranslateX(this.translateX);
                    setTimeout(() => {
                        this.isAnimating = false;
                        this.setTransitionDuration(this.transitionDuration);
                    }, this.transitionDuration);
                }, this.transitionDuration);

            } else {
                this.translateX = newTranslateX;
                this.setTranslateX(this.translateX);
                setTimeout(() => {
                    this.isAnimating = false;
                }, this.transitionDuration);
            }
        }
    }

    goToLeft() {
        if (!this.isAnimating) {
            this.isAnimating = true;

            const newTranslateX = this.translateX + this.cardWidth;
            if (newTranslateX === 0) {
                this.translateX = newTranslateX;
                this.setTranslateX(this.translateX);

                setTimeout(() => {
                    this.translateX = -(this.projectsLength * this.cardWidth);
                    this.setTransitionDuration(0);
                    this.setTranslateX(this.translateX);
                    setTimeout(() => {
                        this.setTransitionDuration(this.transitionDuration);
                    }, this.transitionDuration);
                    this.isAnimating = false;

                }, this.transitionDuration);
            } else {
                this.translateX = newTranslateX;
                this.setTranslateX(this.translateX);
                setTimeout(() => {
                    this.isAnimating = false;

                }, this.transitionDuration);
            }

        }
    }

    checkDirection() {
        const width = window.innerWidth;
        if (width >= 992) return;
        const diff = Math.abs(this.touchendX - this.touchstartX);
        if (diff < 50) return;
        if (this.touchendX < this.touchstartX) this.goToRight();
        if (this.touchendX > this.touchstartX) this.goToLeft();
    }

    bindEvents() {
        // Evento para el botón derecho
        const rightButton = this.element.querySelector('[data-otw-carousel_action="right"]');
        if (rightButton) {
            rightButton.addEventListener('click', () => this.goToRight());
        }

        // Evento para el botón izquierdo
        const leftButton = this.element.querySelector('[data-otw-carousel_action="left"]');
        if (leftButton) {
            leftButton.addEventListener('click', () => this.goToLeft());
        }

        // Eventos táctiles
        const container = this.element.querySelector('[data-otw-carousel_container]');
        if (container) {
            container.addEventListener('touchstart', (e) => {
                this.touchstartX = e.changedTouches[0].screenX;
            });

            container.addEventListener('touchend', (e) => {
                this.touchendX = e.changedTouches[0].screenX;
                this.checkDirection();
            });
        }
    }
}

// Inicializar todos los carousels en la página
document.addEventListener('DOMContentLoaded', () => {
    const carouselElements = document.querySelectorAll('[data-otw-carousel]');
    carouselElements.forEach(element => {
        const options = {
            projectsLength: element.dataset.otwItems
        };
        new OtwCarousel(element, options);
    });
});

// Exportar la clase para uso global
window.OtwCarousel = OtwCarousel;