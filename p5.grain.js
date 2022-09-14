/**!
 * p5.grain
 * 
 * @version 0.1.0
 * @license MIT
 * @copyright meezwhite, Gorilla Sun
 */
class P5Grain {
    version = '0.1.0';
    ignoreErrors = false;
    ignoreWarnings = false;
    _textureAnimate = {
        frameCount: 0,
    };
    _textureOverlay = {
        frameCount: 0,
        tX_anchor: 0,
        tX: 0,
        tY: 0,
    };

    constructor() {
        // this._random = p5.prototype.random;
        this._random = Math.random;
    }

    /**
     * Setup and configure certain p5grain features.
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
     * @param {Object} [config] Config object to configure p5grain features.
     * @param {function} [config.random] The random function that should be
     *     used when for e.g. pixel manipulation, texture animation, etc. 
     *     Here you could use a deterministic random function.
     * @param {Boolean} [config.ignoreErrors] Specifies whether errors should 
     *     be ignored. This is dangerous, but it might be more performant.
     * @param {Boolean} [config.ignoreWarnings] Specifies whether warnings 
     *     should be ignored.
     */
    setup(config) {
        this._validateParameters('setup', arguments);
        if (typeof config === 'undefined') {
            this._random = random;
        } else if (typeof config === 'object') {
            if (typeof config.random === 'function') {
                this._random = config.random;
            }
            if (typeof config.ignoreErrors === 'boolean') {
                this.ignoreErrors = config.ignoreErrors;
            }
            if (typeof config.ignoreWarnings === 'boolean') {
                this.ignoreWarnings = config.ignoreWarnings;
            }
        }
    }

    /**
     * Granulate the main canvas pixels by the given amount.
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
     */
    granulateSimple(amount, alpha) {
        this._validateParameters('granulateSimple', arguments);
        const _amount = round(amount);
        const _alpha = alpha || false;
        loadPixels();
        const d = pixelDensity();
        const pixelsCount = 4 * (width * d) * (height * d);
        for (let i = 0; i < pixelsCount; i += 4) {
            const grainAmount = this._random(-_amount, _amount);
            pixels[i] = pixels[i] + grainAmount;
            pixels[i+1] = pixels[i+1] + grainAmount;
            pixels[i+2] = pixels[i+2] + grainAmount;
            if (_alpha) {
                pixels[i+3] = pixels[i+3] + grainAmount;
            }
        }
        updatePixels();
    }

    /**
     * Granulate the main canvas pixels channels by the given amount.
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
     */
    granulateChannels(amount, alpha) {
        this._validateParameters('granulateChannels', arguments);
        const _amount = round(amount);
        const _alpha = alpha || false;
        loadPixels();
        const d = pixelDensity();
        const pixelsCount = 4 * (width * d) * (height * d);
        for (let i = 0; i < pixelsCount; i += 4) {
            pixels[i] = pixels[i] + this._random(-_amount, _amount);
            pixels[i+1] = pixels[i+1] + this._random(-_amount, _amount);
            pixels[i+2] = pixels[i+2] + this._random(-_amount, _amount);
            if (_alpha) {
                pixels[i+3] = pixels[i+3] + this._random(-_amount, _amount);
            }
        }
        updatePixels();
    }

    /**
     * Fuzzify and granulate the main canvas pixels by the given amount.
     *
     * Note: This method modifies pixels in two steps:
     * 1. Selects a pixel (Pn) that lies "width indices" + "2 pixel indices"
     *    further in the pixels array. The value of the current pixel is
     *    then calculated as follows: Pcurrent = (Pcurrent + Pn) / 2
     * 2. A random value per pixel channel is generated. The random values 
     *    range from -amount to +amount. Each random value is added to the
     *    respective RGB channel of the pixel.
     *
     * @method granulateFuzzify
     * 
     * @param {Number} amount The amount of granularity that should be applied.
     * @param {Number} [fuzziness] The amount of fuzziness that should be 
     *     applied or the amount of pixels the cavans should be fuzzified by. 
     *     When not specified the amount of fuzziness will be 2.
     * @param {Boolean} [alpha] Specifies whether the alpha channel should 
     *     also be modified. When not specified the alpha channel will
     *     not be modified.
     */
    granulateFuzzify(amount, fuzziness, alpha) {
        this._validateParameters('granulateFuzzy', arguments);
        loadPixels();
        const _amount = round(amount);
        const _fuzziness = fuzziness ? round(fuzziness) : 2;
        const _alpha = alpha || false;
        const d = pixelDensity();
        const c = 4 * _fuzziness; // channels * pixels
        const w = 4 * width * d;
        const f = c + w;
        const pixelsCount = w * (height * d);
        for (let i = 0; i < pixelsCount; i += 4) {
            // fuzzify
            if (pixels[i+f]) {
                pixels[i] = round((pixels[i] + pixels[i+f])/2);
                pixels[i+1] = round((pixels[i+1] + pixels[i+f+1])/2);
                pixels[i+2] = round((pixels[i+2] + pixels[i+f+2])/2);
                if (_alpha) {
                    pixels[i+3] = round((pixels[i+3] + pixels[i+f+3])/2);
                }
            }
            // granulate
            pixels[i] = pixels[i] + this._random(-_amount, _amount);
            pixels[i+1] = pixels[i+1] + this._random(-_amount, _amount);
            pixels[i+2] = pixels[i+2] + this._random(-_amount, _amount);
            if (_alpha) {
                pixels[i+3] = pixels[i+3] + this._random(-_amount, _amount);
            }
        }
        updatePixels();
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
        this._validateParameters('textureAnimate', arguments);
        const _atFrame = config && config.atFrame ? round(config.atFrame) : 2;
        this._textureAnimate.frameCount += 1;
        if (this._textureAnimate.frameCount >= _atFrame) {
            const _amount = config && config.amount 
                ? round(config.amount) : min(width, height);
            const bgPosX = floor(this._random()*_amount);
            const bgPosY = floor(this._random()*_amount);
            const bgPos = `${bgPosX}px ${bgPosY}px`;
            if (textureElement instanceof HTMLElement) {
                textureElement.style.backgroundPosition = bgPos;
            } else if (textureElement instanceof SVGElement) {
                // TODO
                throw new Error('[p5.grain] Animating SVGElement currently unsupported.');
            } else if (textureElement instanceof p5.Element) {
                textureElement.style('background-position', bgPos);
            }
            this._textureAnimate.frameCount = 0;
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
     *     MULTIPLY is be used.
     * @param {p5.Graphics} [config.context] The context on which the texture 
     *     image should be drawn onto. When no context is specified, the 
     *     default canvas is be used.
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
     */
    textureOverlay(textureImage, config) {
        this._validateParameters('textureOverlay', arguments);
        // flag whether given context is an instance of p5.Graphics
        const isCtxGfx = config.context instanceof p5.Graphics;
        // width of the canvas or context
        const _width = config.context ? config.context.width : width;
        // height of the canvas or context
        const _height = config.context ? config.context.height : height;
        // blend mode used to blend the texture over the canvas or context
        const _mode = config.mode || MULTIPLY;
        // should reflect flag
        const _reflect = config.reflect || false;
        // should animate flag
        const _animate = config.animate || false;
        // animate atFrame
        const _animateAtFrame = config.animate && config.animate.atFrame
            ? round(config.animate.atFrame) : 2;
        // animate amount
        const _animateAmount = config.animate && config.animate.amount 
            ? round(config.animate.amount) : min(_width, _height);
        // texture width
        const tW = typeof config.width === 'number' 
            ? config.width : textureImage.width;
        // texture height
        const tH = typeof config.height === 'number' 
            ? config.height : textureImage.height;
        // animate the texture coordinates
        if (_animate) {
            this._textureOverlay.frameCount += 1;
            if (this._textureOverlay.frameCount >= _animateAtFrame) {
                this._textureOverlay.tX_anchor = (
                    -floor(this._random()*_animateAmount)
                );
                this._textureOverlay.tY = (
                    -floor(this._random()*_animateAmount)
                );
                this._textureOverlay.frameCount = 0;
            }
        }
        // texture current start x-coordinate
        let tX = this._textureOverlay.tX_anchor;
        // texture current start y-coordinate
        let tY = this._textureOverlay.tY;
        // flag that the first texture row is currently drawn
        let tRowFirst = true;
        // flag that the first texture column is currently drawn
        let tColFirst = true;
        blendMode(_mode);
        while (tY < _height) {
            while (tX < _width) {
                if (_reflect) {
                    if (!isCtxGfx) {
                        push();
                    } else {
                        config.context.push();
                    }
                    if (tRowFirst) {
                        if (tColFirst) {
                            if (!isCtxGfx) {
                                image(textureImage, tX, tY, tW,  tH);
                            } else {
                                config.context.image(textureImage, tX, tY, tW,  tH);
                            }
                        } else { // tColSecond
                            if (!isCtxGfx) {
                                scale(-1, 1);
                                image(textureImage, -tX, tY, -tW, tH);
                            } else {
                                config.context.scale(-1, 1);
                                config.context.image(textureImage, -tX, tY, -tW, tH);
                            }
                        }
                    } else { // tRowSecond
                        if (tColFirst) {
                            if (!isCtxGfx) {
                                scale(1, -1);
                                image(textureImage, tX, -tY, tW, -tH);
                            } else {
                                config.context.scale(1, -1);
                                config.context.image(textureImage, tX, -tY, tW, -tH);
                            }
                        } else { // tColSecond
                            if (!isCtxGfx) {
                                scale(-1, -1);
                                image(textureImage, -tX, -tY, -tW, -tH);
                            } else {
                                config.context.scale(-1, -1);
                                config.context.image(textureImage, -tX, -tY, -tW, -tH);
                            }
                        }
                    }
                    if (!isCtxGfx) {
                        pop();
                    } else {
                        config.context.pop();
                    }
                } else {
                    if (!isCtxGfx) {
                        image(textureImage, tX, tY, tW, tH);
                    } else {
                        config.context.image(textureImage, tX, tY, tW, tH);
                    }
                }
                tX += tW;
                if (tX >= _width) {
                    tColFirst = true;
                    tX = this._textureOverlay.tX_anchor;
                    tY += tH;
                    break;
                } else {
                    tColFirst = !tColFirst;
                }
            }
            tRowFirst = !tRowFirst;
        }
        // reset blend mode
        blendMode(BLEND);
        // reset context
        if (isCtxGfx) {
            config.context.reset();
        }
    }


    /********************
     * Internal methods *
     ********************/

    /**
     * Checks the validity of the given arguments to the respective method. 
     * Unless ignoreErrors is false, errors will be thrown when necessary.
     * 
     * @private
     * @method _validateParameters
     * 
     * @param {String} method Name of the method
     * @param {Array} args User given arguments to the respective method
     */
    _validateParameters(method, args) {
        // console.debug('args:', args);
        if (!this.ignoreErrors) {
            switch (method) {
                case 'setup':
                    if (
                        typeof args[0] !== 'undefined'
                        && typeof args[0] !== 'object'
                    ) {
                        throw new Error(`[p5.grain] The optional config parameter passed to p5grain.${method}() must be of type object.`);
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
                    }
                    break;

                case 'granulateSimple':
                case 'granulateChannels':
                    if (typeof args[0] !== 'number') {
                        throw new Error(`[p5.grain] The amount parameter passed to ${method}() must be of type number.`);
                    }
                    if (
                        typeof args[1] !== 'undefined'
                        && typeof args[1] !== 'boolean'
                    ) {
                        throw new Error(`[p5.grain] The alpha parameter passed to ${method}() must be of type boolean.`);
                    }
                    break;

                case 'granulateFuzzify':
                    if (typeof args[0] !== 'number') {
                        throw new Error(`[p5.grain] The amount parameter passed to ${method}() must be of type number.`);
                    }
                    if (
                        typeof args[1] !== 'undefined'
                        && typeof args[1] !== 'number'
                    ) {
                        throw new Error(`[p5.grain] The fuzziness parameter passed to ${method}() must be of type number.`);
                    }
                    if (
                        typeof args[2] !== 'undefined'
                        && typeof args[2] !== 'boolean'
                    ) {
                        throw new Error(`[p5.grain] The alpha parameter passed to ${method}() must be of type boolean.`);
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
                        throw new Error(`[p5.grain] The textureElement parameter passed to ${method}() must be an instance of HTMLElement, SVGElement or p5.Element.`);
                    }
                    if (
                        typeof args[1] !== 'undefined'
                        && typeof args[1] !== 'object'
                    ) {
                        throw new Error(`[p5.grain] The optional config parameter passed to ${method}() must be of type object.`);
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
                            throw new Error(`[p5.grain] The optional config.amount parameter passed to ${method}() must be of type number.`);
                        }
                    }
                    break;

                case 'textureOverlay':
                    if (!(args[0] instanceof p5.Image)) {
                        throw new Error(`[p5.grain] The texture parameter passed to ${method}() must be an instance of p5.Image.`);
                    }
                    if (
                        typeof args[1] !== 'undefined'
                        && typeof args[1] !== 'object'
                    ) {
                        throw new Error(`[p5.grain] The optional config parameter passed to ${method}() must be of type object.`);
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
                            typeof args[1].context !== 'undefined'
                            && ! ( args[1].context instanceof p5.Graphics )
                        ) {
                            throw new Error(`[p5.grain] The optional config.context parameter passed to ${method}() must be an instance of p5.Graphics.`);
                        }
                        if (
                            typeof args[1].reflect !== 'undefined'
                            && typeof args[1].reflect !== 'boolean'
                        ) {
                            throw new Error(`[p5.grain] The optional config.reflect property passed to ${method}() must be of type boolean.`);
                        }
                    }
                    break;

                default: break;
            }
        }
    }
}

const p5grain = new P5Grain();

// Register granulateSimple()
if (!p5.prototype.hasOwnProperty('granulateSimple')) {
    p5.prototype.granulateSimple = function(amount, alpha) {
        return p5grain.granulateSimple(amount, alpha);
    };
} else if (!p5grain.ignoreWarnings) {
    console.warn('[p5.grain] granulateSimple() could not be registered, since it\'s already defined.\nUse p5grain.granulateSimple() instead.');
}

// Register granulateChannels()
if (!p5.prototype.hasOwnProperty('granulateChannels')) {
    p5.prototype.granulateChannels = function(amount, alpha) {
        return p5grain.granulateChannels(amount, alpha);
    };
} else if (!p5grain.ignoreWarnings) {
    console.warn('[p5.grain] granulateChannels() could not be registered, since it\'s already defined.\nUse p5grain.granulateChannels() instead.');
}

// Register granulateFuzzify()
if (!p5.prototype.hasOwnProperty('granulateFuzzify')) {
    p5.prototype.granulateFuzzify = function(amount, fuzziness, alpha) {
        return p5grain.granulateFuzzify(amount, fuzziness, alpha);
    };
} else if (!p5grain.ignoreWarnings) {
    console.warn('[p5.grain] granulateFuzzify() could not be registered, since it\'s already defined.\nUse p5grain.granulateFuzzify() instead.');
}

// Register textureAnimate()
if (!p5.prototype.hasOwnProperty('textureAnimate')) {
    p5.prototype.textureAnimate = function(textureElement, config) {
        return p5grain.textureAnimate(textureElement, config);
    };
} else if (!p5grain.ignoreWarnings) {
    console.warn('[p5.grain] textureAnimate() could not be registered, since it\'s already defined.\nUse p5grain.textureAnimate() instead.');
}

// Register textureOverlay()
if (!p5.prototype.hasOwnProperty('textureOverlay')) {
    p5.prototype.textureOverlay = function(textureImage, config) {
        return p5grain.textureOverlay(textureImage, config);
    };
} else if (!p5grain.ignoreWarnings) {
    console.warn('[p5.grain] textureOverlay() could not be registered, since it\'s already defined.\nUse p5grain.textureOverlay() instead.');
}
