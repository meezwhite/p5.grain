/**!
 * p5.grain
 * 
 * @version 0.6.1
 * @license MIT
 * @copyright meezwhite, Gorilla Sun
 */
class P5Grain {
    version = '0.6.1';

    /** @internal */
    ignoreWarnings = false;
    ignoreErrors = false;
    /** @end */

    #random;
    #textureAnimate;
    #textureOverlay;
    instanceMode = false;
    instanceRef;

    constructor() {
        // this.#random = p5.prototype.random;
        this.#random = Math.random;
        this.#textureAnimate = {
            frameCount: 0,
        };
        this.#textureOverlay = {
            frameCount: 0,
            tX_anchor: 0,
            tX: 0,
            tY: 0,
        };
    }

    /**
     * Setup and configure certain p5.grain features.
     * 
     * @example
     * <p>Pass a custom random function to be used internally.</p>
     * <code>
     *     p5grain.setup({ random: fxrand });
     * </code>
     * 
     * @example
     * <p>Ignore errors and warnings</p>
     * <code>
     *     // Dangerous, but might be more performant
     *     p5grain.setup({
     *         ignoreErrors: true,
     *         ignoreWarnings: true,
     *     });
     * </code>
     * 
     * @method setup
     * 
     * @param {Object} [config] Config object to configure p5.grain features.
     * @param {function} [config.random] The random function that should be
     *     used when for e.g. pixel manipulation, texture animation, etc. 
     *     Here you could use a deterministic random function.
     * @param {Boolean} [config.ignoreErrors] Specifies whether errors should 
     *     be ignored. This is dangerous, but it might be more performant.
     * @param {Boolean} [config.ignoreWarnings] Specifies whether warnings 
     *     should be ignored.
     * @param {Boolean} [config.instanceMode] Specifies if instance mode should be used instead of global mode.
     * @param {Object} [config.instanceRef] Specifies reference to instance. Can only be used if instanceMode is true.
     */
    setup(config) {
        /** @internal */
        this.#validateArguments('setup', arguments);
        /** @end */
        if (typeof config === 'undefined') {
            this.#random = random;
        } else if (typeof config === 'object') {
            if (typeof config.random === 'function') {
                this.#random = config.random;
            }
            if (typeof config.instanceMode === 'boolean') {
                this.instanceMode = config.instanceMode;
            }
            if (typeof config.instanceRef === 'object') {
                this.instanceRef = config.instanceRef;
                this.instanceRef.p5grain = this;
            }
            /** @internal */
            if (typeof config.ignoreErrors === 'boolean') {
                this.ignoreErrors = config.ignoreErrors;
            }
            if (typeof config.ignoreWarnings === 'boolean') {
                this.ignoreWarnings = config.ignoreWarnings;
            } /** @end */
        }
    }

    /**
     * Granulate pixels by the given amount.
     *
     * This method generates one random value per pixel. The random value 
     * ranges from -amount to +amount and is added to every RGB(A) pixel 
     * channel.
     *
     * @method granulateSimple
     * 
     * @param {Number} amount The amount of granularity that should be applied.
     * @param {Boolean} [alpha] Specifies whether the alpha channel should 
     *     also be modified. When not specified the alpha channel will
     *     not be modified.
     * @param {p5.Graphics} [pg] The offscreen graphics buffer whose pixels 
     *     should be manipulated.
     */
    granulateSimple(amount, alpha, pg) {
        /** @internal */
        this.#validateArguments('granulateSimple', arguments);
        /** @end */
        const _amount = this.instanceMode ? this.instanceRef.round(amount) : round(amount);
        const _alpha = alpha || false;
        pg ? pg.loadPixels() : this.instanceMode ? this.instanceRef.loadPixels() : loadPixels();
        const density = pg ? pg.pixelDensity() : this.instanceMode ? this.instanceRef.pixelDensity() : pixelDensity();
        const total = 4 * ((this.instanceMode ? this.instanceRef.width : width) * density) * ((this.instanceMode ? this.instanceRef.height : height) * density);
        const _pixels = pg ? pg.pixels : this.instanceMode ? this.instanceRef.pixels : pixels;
        for (let i = 0; i < total; i += 4) {
            const grainAmount = this.#randomIntInclusive(-_amount, _amount);
            _pixels[i] = _pixels[i] + grainAmount;
            _pixels[i+1] = _pixels[i+1] + grainAmount;
            _pixels[i+2] = _pixels[i+2] + grainAmount;
            if (_alpha) {
                _pixels[i+3] = _pixels[i+3] + grainAmount;
            }
        }
        pg ? pg.updatePixels() : this.instanceMode ? this.instanceRef.updatePixels() : updatePixels();
    }

    /**
     * Granulate pixels channels by the given amount.
     *
     * This method generates one random value per pixel channel. The random 
     * values range from -amount to +amount. Each random value is added to 
     * the respective RGB(A) channel of the pixel.
     *
     * @method granulateChannels
     * 
     * @param {Number} amount The amount of granularity that should be applied.
     * @param {Boolean} [alpha] Specifies whether the alpha channel should 
     *     also be modified. When not specified the alpha channel will
     *     not be modified.
     * @param {p5.Graphics} [pg] The offscreen graphics buffer whose pixels 
     *     should be manipulated.
     */
    granulateChannels(amount, alpha, pg) {
        /** @internal */
        this.#validateArguments('granulateChannels', arguments);
        /** @end */
        const _amount = this.instanceMode ? this.instanceRef.round(amount) : round(amount);
        const _alpha = alpha || false;
        pg ? pg.loadPixels() : this.instanceMode ? this.instanceRef.loadPixels() : loadPixels();
        const density = pg ? pg.pixelDensity() : this.instanceMode ? this.instanceRef.pixelDensity() : pixelDensity();
        const total = 4 * ((this.instanceMode ? this.instanceRef.width : width) * density) * ((this.instanceMode ? this.instanceRef.height : height) * density);
        const _pixels = pg ? pg.pixels : this.instanceMode ? this.instanceRef.pixels : pixels;
        for (let i = 0; i < total; i += 4) {
            _pixels[i] = _pixels[i] + this.#randomIntInclusive(-_amount, _amount);
            _pixels[i+1] = _pixels[i+1] + this.#randomIntInclusive(-_amount, _amount);
            _pixels[i+2] = _pixels[i+2] + this.#randomIntInclusive(-_amount, _amount);
            if (_alpha) {
                _pixels[i+3] = _pixels[i+3] + this.#randomIntInclusive(-_amount, _amount);
            }
        }
        pg ? pg.updatePixels() : this.instanceMode ? this.instanceRef.updatePixels() : updatePixels();
    }

    /**
     * Loop through pixels and call the given callback function on every pixel. 
     * Pixels are manipulated depending on the given callback function.
     * 
     * Updating pixels can be by-passed with the `shouldUpdate` argument.
     * 
     * The callback function receives two arguments:
     * - index: the current pixel index
     * - total: the total indexes count
     * 
     * @example
     * <p>Custom granulateSimple implementation:</p>
     * <code>
     *     const amount = 42;
     *     const alpha = false;
     *     tinkerPixels((index, total) => {
     *         const grainAmount = Math.floor(random() * (amount * 2 + 1)) - amount;
     *         pixels[index] = pixels[index] + grainAmount;
     *         pixels[index+1] = pixels[index+1] + grainAmount;
     *         pixels[index+2] = pixels[index+2] + grainAmount;
     *         if (alpha) {
     *             pixels[index+3] = pixels[index+3] + grainAmount;
     *         }
     *     });
     * </code>
     * 
     * @example
     * <p>Read-only mode:</p>
     * <code>
     *     let minAvg = 255;
     *     let maxAvg = 0;
     *     tinkerPixels((index, total) => {
     *         // determine min, max average pixel values
     *         const avg = round((pixels[index] + pixels[index+1] + pixels[index+2])/3);
     *         minAvg = min(minAvg, avg);
     *         maxAvg = max(maxAvg, avg);
     *     }, false); // <-- shouldUpdate = false
     * </code>
     *
     * @method tinkerPixels
     * 
     * @param {Function} callback The callback function that should be called 
     *     on every pixel.
     * @param {Boolean} [shouldUpdate] Specifies whether the pixels should be
     *     updated.
     * @param {p5.Graphics} [pg] The offscreen graphics buffer whose pixels 
     *     should be manipulated.
     */
    tinkerPixels(callback, shouldUpdate, pg) {
        /** @internal */
        this.#validateArguments('tinkerPixels', arguments);
        /** @end */
        shouldUpdate = shouldUpdate !== false;
        pg ? pg.loadPixels() : this.instanceMode ? this.instanceRef.loadPixels() : loadPixels();
        const density = pg ? pg.pixelDensity() : this.instanceMode ? this.instanceRef.pixelDensity() : pixelDensity();
        const total = 4 * ((this.instanceMode ? this.instanceRef.width : width) * density) * ((this.instanceMode ? this.instanceRef.height : height) * density);
        for (let i = 0; i < total; i += 4) {
            callback(i, total);
        }
        if (shouldUpdate) {
            pg ? pg.updatePixels() : this.instanceMode ? this.instanceRef.updatePixels() : updatePixels();
        }
    }

    /**
     * Animate the given texture element by randomly shifting its background 
     * position.
     * 
     * @method textureAnimate
     * 
     * @param {HTMLElement|SVGElement|p5.Element} textureElement The texture element to be 
     *     animated.
     * @param {Object} [config] Config object to configure the texture 
     *     animation.
     * @param {Number} [config.atFrame] The frame at which the texture should 
     *     be shifted. When atFrame isn't specified, the texture is shifted 
     *     every 2nd frame.
     * @param {Number} [config.amount] The maximum amount of pixels by which 
     *     the texture should be shifted. The actual amount of pixels which 
     *     the texture is shifted by is generated randomly. When no 
     *     amount is specified, the minimum of the main canvas 
     *     width or height is used.
     */
    textureAnimate(textureElement, config) {
        /** @internal */
        this.#validateArguments('textureAnimate', arguments);
        /** @end */
        const _atFrame = config && config.atFrame ? this.instanceMode ? this.instanceRef.round(config.atFrame) : round(config.atFrame) : 2;
        this.#textureAnimate.frameCount += 1;
        if (this.#textureAnimate.frameCount >= _atFrame) {
            const _amount = config && config.amount 
                ? this.instanceMode ? this.instanceRef.round(config.amount) : round(config.amount) : this.instanceMode ? this.instanceRef.min((this.instanceMode ? this.instanceRef.width : width), (this.instanceMode ? this.instanceRef.height : height)) : min(width, height);
            const bgPosX = this.instanceMode ? this.instanceRef.floor(this.#random()*_amount) : floor(this.#random()*_amount);
            const bgPosY = this.instanceMode ? this.instanceRef.floor(this.#random()*_amount) : floor(this.#random()*_amount);
            const bgPos = `${bgPosX}px ${bgPosY}px`;
            if (textureElement instanceof HTMLElement) {
                textureElement.style.backgroundPosition = bgPos;
            } else if (textureElement instanceof SVGElement) {
                textureElement.style.top = `${-bgPosY}px`;
                textureElement.style.left = `${-bgPosX}px`;
            } else if (textureElement instanceof p5.Element) {
                textureElement.style('background-position', bgPos);
            }
            this.#textureAnimate.frameCount = 0;
        }
    }

    /**
     * Blend the given texture image onto the canvas.
     * 
     * The texture is repeated along the horizontal and vertical axes to cover 
     * the entire canvas or context.
     * 
     * @method textureOverlay
     * 
     * @param {p5.Image} texture The texture image to blend over.
     * @param {Object} [config] Config object to configure the texture overlay.
     * @param {Number} [config.width] The width the texture image should have. 
     *     When no width is specified, the width of the texture image is 
     *     assumed.
     * @param {Number} [config.height] The height the texture image should 
     *     have. When no height is specified, the height of the texture 
     *     image is assumed.
     * @param {Constant} [config.mode] The blend mode that should be used to 
     *     blend the texture over the canvas. 
     *     Either BLEND, DARKEST, LIGHTEST, DIFFERENCE, MULTIPLY, EXCLUSION, 
     *     SCREEN, REPLACE, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, BURN, 
     *     ADD or NORMAL. When no mode is specified, the blend mode 
     *     MULTIPLY will be used.
     * @param {Boolean} [config.reflect] Specifies whether the given texture
     *     image should reflect horizontally and vertically, in order to 
     *     provide seamless continuity.
     * @param {Boolean|Object} [config.animate] Specifies whether the given 
     *     texture image should be animated.
     * @param {Number} [config.animate.atFrame] When animation is activated, 
     *     the frame at which the texture should be shifted. When atFrame 
     *     isn't specified, the texture is shifted every 2nd frame.
     * @param {Number} [config.animate.amount] When animation is activated,
     *     the maximum amount of pixels by which the texture should be 
     *     shifted. The actual amount of pixels which the texture is 
     *     shifted by is generated randomly. When no amount is specified, 
     *     the minimum of the main canvas width or height is used.
     * @param {p5.Graphics} [pg] The offscreen graphics buffer onto which the 
     *     texture image should be drawn.
     */
    textureOverlay(textureImage, config, pg) {
        /** @internal */
        this.#validateArguments('textureOverlay', arguments);
        /** @end */
        // flag whether drawing onto an offset graphics buffer
        const isGraphicsBuffer = pg instanceof p5.Graphics;
        // width of the canvas or context
        const _width = isGraphicsBuffer ? pg.width : this.instanceMode ? this.instanceRef.width : width;
        // height of the canvas or context
        const _height = isGraphicsBuffer ? pg.height : this.instanceMode ? this.instanceRef.height : height;
        // blend mode used to blend the texture over the canvas or context
        const _mode = config && config.mode ? config.mode : this.instanceMode ? this.instanceRef.MULTIPLY : MULTIPLY;
        // should reflect flag
        const _reflect = config && config.reflect ? config.reflect : false;
        // should animate flag
        const _animate = config && config.animate ? config.animate : false;
        // animate atFrame
        const _animateAtFrame = (
            config && config.animate && config.animate.atFrame
            ? round(config.animate.atFrame) 
            : 2
        );
        // animate amount
        const _animateAmount = (
            config && config.animate && config.animate.amount
            ? this.instanceMode ? this.instanceRef.round(config.animate.amount) : round(config.animate.amount)
            : this.instanceMode ? this.instanceRef.min(_width, _height) : min(_width, _height)
        );
        // texture width
        const tW = config && typeof config.width === 'number' 
            ? config.width : textureImage.width;
        // texture height
        const tH = config && typeof config.height === 'number' 
            ? config.height : textureImage.height;
        // animate the texture coordinates
        if (_animate) {
            this.#textureOverlay.frameCount += 1;
            if (this.#textureOverlay.frameCount >= _animateAtFrame) {
                this.#textureOverlay.tX_anchor = (
                    this.instanceMode ? -this.instanceRef.floor(this.#random()*_animateAmount) : -floor(this.#random()*_animateAmount)
                );
                this.#textureOverlay.tY = (
                    this.instanceMode ? -this.instanceRef.floor(this.#random()*_animateAmount) : -floor(this.#random()*_animateAmount)
                );
                this.#textureOverlay.frameCount = 0;
            }
        }
        // texture current start x-coordinate
        let tX = this.#textureOverlay.tX_anchor;
        // texture current start y-coordinate
        let tY = this.#textureOverlay.tY;
        // flag that the first texture row is currently drawn
        let tRowFirst = true;
        // flag that the first texture column is currently drawn
        let tColFirst = true;
        pg ? pg.blendMode(_mode) : this.instanceMode ? this.instanceRef.blendMode(_mode) : blendMode(_mode);
        while (tY < _height) {
            while (tX < _width) {
                if (_reflect) {
                    if (!isGraphicsBuffer) {
                        this.instanceMode ? this.instanceRef.push() : push();
                    } else {
                        pg.push();
                    }
                    if (tRowFirst) {
                        if (tColFirst) {
                            if (!isGraphicsBuffer) {
                                this.instanceMode ? this.instanceRef.image(textureImage, tX, tY, tW,  tH) : image(textureImage, tX, tY, tW,  tH);
                            } else {
                                pg.image(textureImage, tX, tY, tW,  tH);
                            }
                        } else { // tColSecond
                            if (!isGraphicsBuffer) {
                                this.instanceMode ? this.instanceRef.scale(-1, 1) : scale(-1, 1);
                                this.instanceMode ? this.instanceRef.image(textureImage, -tX, tY, -tW, tH) : image(textureImage, -tX, tY, -tW, tH);
                            } else {
                                pg.scale(-1, 1);
                                pg.image(textureImage, -tX, tY, -tW, tH);
                            }
                        }
                    } else { // tRowSecond
                        if (tColFirst) {
                            if (!isGraphicsBuffer) {
                                this.instanceMode ? this.instanceRef.scale(1, -1) : scale(1, -1);
                                this.instanceMode ? this.instanceRef.image(textureImage, tX, -tY, tW, -tH) : image(textureImage, tX, -tY, tW, -tH);
                            } else {
                                pg.scale(1, -1);
                                pg.image(textureImage, tX, -tY, tW, -tH);
                            }
                        } else { // tColSecond
                            if (!isGraphicsBuffer) {
                                this.instanceMode ? this.instanceRef.scale(-1, -1) : scale(-1, -1);
                                this.instanceMode ? this.instanceRef.image(textureImage, -tX, -tY, -tW, -tH) : image(textureImage, -tX, -tY, -tW, -tH);
                            } else {
                                pg.scale(-1, -1);
                                pg.image(textureImage, -tX, -tY, -tW, -tH);
                            }
                        }
                    }
                    if (!isGraphicsBuffer) {
                        this.instanceMode ? this.instanceRef.pop() : pop();
                    } else {
                        pg.pop();
                    }
                } else {
                    if (!isGraphicsBuffer) {
                        this.instanceMode ? this.instanceRef.image(textureImage, tX, tY, tW, tH) : image(textureImage, tX, tY, tW, tH);
                    } else {
                        pg.image(textureImage, tX, tY, tW, tH);
                    }
                }
                tX += tW;
                if (tX >= _width) {
                    tColFirst = true;
                    tX = this.#textureOverlay.tX_anchor;
                    tY += tH;
                    break;
                } else {
                    tColFirst = !tColFirst;
                }
            }
            tRowFirst = !tRowFirst;
        }
        // reset blend mode
        pg ? pg.blendMode(this.instanceMode ? this.instanceRef.BLEND : BLEND) : this.instanceMode ? this.instanceRef.blendMode(this.instanceRef.BLEND) : blendMode(BLEND);
        // reset context
        if (isGraphicsBuffer) {
            pg.reset();
        }
    }


    /********************
     * Internal methods *
     ********************/

    /**
     * Generate a random integer between given bounds inclusively.
     * 
     * @private
     * @method randomIntInclusive
     * 
     * @param {Number} min Min value that may be generated.
     * @param {Number} max Max value that may be generated.
     * @returns {Number}
     */
    #randomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(this.#random() * (max - min + 1) + min);
    }

    /** @internal */
    /**
     * Checks the validity of the given arguments to the respective method. 
     * Unless ignoreErrors is false, errors will be thrown when necessary.
     * 
     * @private
     * @method validateArguments
     * 
     * @param {String} method Name of the method
     * @param {Array} args User given arguments to the respective method
     */
    #validateArguments(method, args) {
        if (!this.ignoreErrors) {
            switch (method) {
                case 'setup':
                    if (
                        typeof args[0] !== 'undefined'
                        && typeof args[0] !== 'object'
                    ) {
                        throw new Error(`[p5.grain] The optional config argument passed to p5grain.${method}() must be of type object.`);
                    }
                    if (typeof args[0] === 'object') {
                        if (
                            typeof args[0].random !== 'undefined'
                            && typeof args[0].random !== 'function'
                        ) {
                            throw new Error(`[p5.grain] The optional config.random property passed to p5grain.${method}() must be of type function.`);
                        }
                        if (
                            typeof args[0].ignoreErrors !== 'undefined'
                            && typeof args[0].ignoreErrors !== 'boolean'
                        ) {
                            throw new Error(`[p5.grain] The optional config.ignoreErrors property passed to p5grain.${method}() must be of type boolean.`);
                        }
                        if (
                            typeof args[0].ignoreWarnings !== 'undefined'
                            && typeof args[0].ignoreWarnings !== 'boolean'
                        ) {
                            throw new Error(`[p5.grain] The optional config.ignoreWarnings property passed to p5grain.${method}() must be of type boolean.`);
                        }
                        if (
                            typeof args[0].instanceMode !== 'undefined'
                            && typeof args[0].instanceMode !== 'boolean'
                        ) {
                            throw new Error(`[p5.grain] The optional config.instanceMode property passed to p5grain.${method}() must be of type boolean.`);
                        }
                        if (
                            typeof args[0].instanceRef !== 'undefined'
                            && typeof args[0].instanceRef !== 'object'
                        ) {
                            throw new Error(`[p5.grain] The optional config.instanceRef property passed to p5grain.${method}() must be of type object.`);
                        }
                        if (
                            (typeof args[0].instanceMode !== 'undefined'
                            && typeof args[0].instanceRef === 'undefined') ||
                            (typeof args[0].instanceRef !== 'undefined'
                            && typeof args[0].instanceMode === 'undefined')
                        ) {
                            throw new Error(`[p5.grain] The optional config.instanceRef property passed to p5grain.${method}() must be given with config.instanceMode.`);
                        }
                    }
                    break;
                case 'granulateSimple':
                case 'granulateChannels':
                    if (typeof args[0] !== 'number') {
                        throw new Error(`[p5.grain] The amount argument passed to ${method}() must be of type number.`);
                    }
                    if (
                        typeof args[1] !== 'undefined'
                        && typeof args[1] !== 'boolean'
                    ) {
                        throw new Error(`[p5.grain] The optional alpha argument passed to ${method}() must be of type boolean.`);
                    }
                    if (
                        typeof args[2] !== 'undefined'
                        && ! (args[2] instanceof p5.Graphics)
                    ) {
                        throw new Error(`[p5.grain] The offscreen graphics buffer for ${method}() must be an instance of p5.Graphics.`);
                    }
                    break;
                case 'tinkerPixels':
                    if (typeof args[0] !== 'function') {
                        throw new Error(`[p5.grain] The callback argument passed to ${method}() must be of type function.`);
                    }
                    if (
                        typeof args[1] !== 'undefined'
                        && typeof args[1] !== 'boolean'
                    ) {
                        throw new Error(`[p5.grain] The optional shouldUpdate argument for ${method}() must be an instance of boolean.`);
                    }
                    if (
                        typeof args[2] !== 'undefined'
                        && ! (args[2] instanceof p5.Graphics)
                    ) {
                        throw new Error(`[p5.grain] The offscreen graphics buffer for ${method}() must be an instance of p5.Graphics.`);
                    }
                    break;
                case 'textureAnimate':
                    if (
                        ! ( 
                            args[0] instanceof HTMLElement
                            || args[0] instanceof SVGElement
                            || args[0] instanceof p5.Element
                        )
                    ) {
                        throw new Error(`[p5.grain] The textureElement argument passed to ${method}() must be an instance of HTMLElement, SVGElement or p5.Element.`);
                    }
                    if (
                        typeof args[1] !== 'undefined'
                        && typeof args[1] !== 'object'
                    ) {
                        throw new Error(`[p5.grain] The optional config argument passed to ${method}() must be of type object.`);
                    }
                    if (typeof args[1] === 'object') {
                        if (
                            typeof args[1].atFrame !== 'undefined'
                            && typeof args[1].atFrame !== 'number'
                        ) {
                            throw new Error(`[p5.grain] The optional config.atFrame property passed to ${method}() must be of type number.`);
                        }
                        if (
                            typeof args[1].amount !== 'undefined'
                            && typeof args[1].amount !== 'number'
                        ) {
                            throw new Error(`[p5.grain] The optional config.amount argument passed to ${method}() must be of type number.`);
                        }
                    }
                    break;
                case 'textureOverlay':
                    if (!(args[0] instanceof p5.Image)) {
                        throw new Error(`[p5.grain] The texture argument passed to ${method}() must be an instance of p5.Image.`);
                    }
                    if (
                        typeof args[1] !== 'undefined'
                        && typeof args[1] !== 'object'
                    ) {
                        throw new Error(`[p5.grain] The optional config argument passed to ${method}() must be of type object.`);
                    }
                    if (typeof args[1] === 'object') {
                        if (
                            typeof args[1].width !== 'undefined'
                            && typeof args[1].width !== 'number'
                        ) {
                            throw new Error(`[p5.grain] The optional config.width property passed to ${method}() must be of type number.`);
                        }
                        if (
                            typeof args[1].height !== 'undefined'
                            && typeof args[1].height !== 'number'
                        ) {
                            throw new Error(`[p5.grain] The optional config.height property passed to ${method}() must be of type number.`);
                        }
                        if (
                            typeof args[1].mode !== 'undefined'
                            && typeof args[1].mode !== 'string'
                        ) {
                            throw new Error(`[p5.grain] The optional config.mode property passed to ${method}() must be of type string.`);
                        }
                        if (
                            typeof args[1].reflect !== 'undefined'
                            && typeof args[1].reflect !== 'boolean'
                        ) {
                            throw new Error(`[p5.grain] The optional config.reflect property passed to ${method}() must be of type boolean.`);
                        }
                    }
                    if (
                        typeof args[2] !== 'undefined'
                        && ! (args[2] instanceof p5.Graphics)
                    ) {
                        throw new Error(`[p5.grain] The offscreen graphics buffer for ${method}() must be an instance of p5.Graphics.`);
                    }
                    break;
                default: break;
            }
        }
    }
    /** @end */
}
