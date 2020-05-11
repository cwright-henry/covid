
/**
 * Defaults to a zoom animation - override to set
 * a different animation.
 * 
 * Visit for possible overrides - https://daneden.github.io/animate.css/
 */
export const animation = {
    methods: {
        enter(el, done) {
            let ANIMATION_IN = this.ANIMATION_IN || "animate__zoomIn";
            let ANIMATION_TIME = this.ANIMATION_TIME || "0.75s";

            el.classList.add("animated", ANIMATION_IN);
            el.style.animationDuration = ANIMATION_TIME;

            const handleAnimationEnd = () => {
                el.classList.remove("animated", ANIMATION_IN);
                el.removeEventListener("animationend", handleAnimationEnd);
                done();
            };
            el.addEventListener("animationend", handleAnimationEnd);
        },

        leave(el, done) {
            let ANIMATION_OUT = this.ANIMATION_OUT || "animate__zoomOut";
            let ANIMATION_TIME = this.ANIMATION_TIME || "0.75s";

            el.classList.add("animated", ANIMATION_OUT);
            el.style.animationDuration = ANIMATION_TIME;

            const handleAnimationEnd = () => {
                el.classList.remove("animated", ANIMATION_OUT);
                el.removeEventListener("animationend", handleAnimationEnd);
                done();
            };
            el.addEventListener("animationend", handleAnimationEnd);
        },

        beforeLeave(el) {
            el.style.height = 0;
        },

        afterLeave(el) {
            el.style.height = 0;
        }
    }
}