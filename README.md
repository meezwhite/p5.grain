<a id="top"></a>

# 🌾 p5.grain
p5.grain is a [p5.js](https://github.com/processing/p5.js) addon for conveniently applying film grain, seamless texture overlays, and manipulate pixels to achieve nostalgic and artistic effects in p5.js sketches and artworks.

Ideal for deterministic generative art, p5.grain ensures consistent film grain effects with each reload. It's perfect for platforms like [fxhash](https://www.fxhash.xyz) that utilize the `fxrand` / `$fx.rand` random function.


The initial release of the library was accompanied by the article "[All about that grain](https://www.fxhash.xyz/article/all-about-that-grain)" co-authored by by [Gorilla Sun](https://x.com/gorillasu) and [meezwhite](https://x.com/meezwhite). Since then, p5.grain has been regularly updated to further enhance its functionality, performance and ease of use.


<a id="table_of_contents"></a>

## Table of Contents

* [Getting started](#getting_started)
* [Which file should I embed?](#which_file)
* [Usage](#usage)
* [Ignoring errors and warnings](#ignoring_errors_and_warnings)
* [Techniques](#techniques)
    * [Pixel manipulation](#pixel_manipulation)
        * [Read-only mode](#read_only_mode)
    * [Texture overlay inside canvas](#texture_overlay_inside_canvas)
    * [Texture overlay inside canvas with texture animation](#texture_overlay_inside_canvas_with_texture_animation)
* [Global and instance mode](#global_and_instance_mode)
* [API](#api)
* [Limitations](#limitations)
* [Contributing](#contributing)
* [License](#license)


<a id="getting_started"></a>

## Getting started
Download the latest version from [Releases](https://github.com/meezwhite/p5.grain/releases) and embed `p5.grain.js` (~42 KB) or `p5.grain.min.js` (~6 KB) in your project's HTML file *after* loading p5.js but *before* loading your sketch code.

```html
<script src="./lib/p5.min.js"></script>
<!-- insert after p5.js -->
<script src="./lib/p5.grain.min.js"></script>
<script src="./sketch.js"></script>
```

[Go to top ⬆](#top)


<a id="which_file"></a>

## Which file should I embed?

| file              | size    | purpose     | errors & warnings       |
| ----------------- | ------- | ----------- | ----------------------- |
| `p5.grain.js`     | ~ 40 KB | development | Yes (can be turned off) |
| `p5.grain.min.js` | ~ 6 KB  | production  | No                      |

*Note: The unminified version `p5.grain.js` is primarily meant for development. It handles errors and warnings, and therefore has a larger file size. However, it's recommended to use the minified version `p5.grain.min.js` when your sketch is final and you've made sure that p5.grain-related errors and warnings cannot occur.*

[Go to top ⬆](#top)


<a id="usage"></a>

## Usage

The first step is to set up p5.grain according to your project's needs in the `setup` function of your sketch.

### Non-deterministic setup

Suited for projects that *don't* have to be deterministic, *don't* use the [pixel manipulation](#pixel-manipulation) technique, or *don't* use methods for animating texture overlays.

```js
function setup() {
    p5grain.setup();
}
```

### Deterministic setup

Suited for projects that should be deterministic.

```js
function setup() {
    // make Math.random be same as random
    Math.random = random;

    // set seeds (example)
    randomSeed(999999);
    noiseSeed(999999);

    p5grain.setup();
}
```

### Deterministic setup (fxhash)

Suited for fxhash projects.

```js
function setup() {
    // make Math.random be same as fxrand
    Math.random = fxrand;

    // set seeds (example)
    randomSeed(fxrand() * 999999);
    noiseSeed(fxrand() * 999999);

    // use fxrand as the internal random function
    p5grain.setup({ random: fxrand });
}
```

*Note: You can also use `$fx.rand` instead of `fxrand` for consistency across your code.*


<a id="ignoring_errors_and_warnings"></a>

## Ignoring errors and warnings

*Note: Ignoring errors and warnings is not possible when using `p5.grain.min.js`, since errors and warnings are not handled in the minified version of p5.grain.*

Initially, p5.grain will attempt to extend p5.js core functionality by registering new methods. If a method cannot be registered because the method name is already in use, p5.grain will log a warning with a suggestion of an alternative usage. You can prevent warnings to be logged by passing `ignoreWarnings: true` to the `config` object when setting up p5.grain.

When using p5.grain methods, the library validates the parameters passed to the respective methods, and error messages are thrown in case of invalid parameters to attract attention during development. You can prevent errors to be thrown by passing `ignoreErrors: true` to the `config` object when setting up p5.grain. 

*Note: If your sketch is final and you've made sure that p5.grain-related errors or warnings cannot occur, we recommend using `p5.grain.min.js` instead of manually ignoring errors and warnings as shown below, since errors and warnings are not handled in the minified version of p5.grain.*

```js
function setup() {
    // ignore warnings and errors
    p5grain.setup({
        ignoreWarnings: true,
        ignoreErrors: true,
    });
}
```

[Go to top ⬆](#top)


<a id="techniques"></a>

## Techniques

p5.grain currently supports the techniques: pixel manipulation, texture overlay and SVG filter. WebGL shader technique is coming soon.

Depending on how your artwork is created and whether you want to animate texture overlays, you would use p5.grain methods within the `setup` or `draw` functions of your sketch.

The best way to get you started with a technique is to check out the provided standalone [examples](./examples). There is an example for each technique currently supported by the library.

Go to the standalone examples:
* [Pixel manipulation](./examples/pixel-manipulation)
* Texture overlay
  * [Inside canvas](./examples/texture-overlay-inside) (texture animation supported)
  * [Outside canvas](./examples/texture-overlay-outside) (texture animation supported)
* SVG filter
  * [SVG element](./examples/svg-element) (texture animation supported; [limited compatibility in Safari](#limitations))
  * [SVG URL-encoded](./examples/svg-url-encoded) (texture animation supported; [doesn't work in Safari](#limitations))

Here are a few examples of a basic implementation for each respective technique. *Note: the examples below are non-deterministic.*


<a id="pixel_manipulation"></a>

### Pixel manipulation

```js
function setup() {

    p5grain.setup();

    // draw your artwork here
    // ...

    // example: apply monochromatic grain
    applyMonochromaticGrain(42);

    // example: apply chromatic grain
    // applyChromaticGrain(42);
}
```

The next example demonstates granulating the artwork using `tinkerPixels(callback, shouldUpdate)` pixel-manipulation function. In this case the `callback` function is an implementation of the `applyMonochromaticGrain` function. *Note that the example is non-deterministic!*

```js
function setup() {

    p5grain.setup();

    // draw your artwork here
    // ...

    // example: custom applyMonochromaticGrain implementation
    const amount = 42;
    const alpha = false;
    tinkerPixels((index, total) => {
        const grainAmount = floor(random() * (amount * 2 + 1)) - amount;
        pixels[index] = pixels[index] + grainAmount;
        pixels[index+1] = pixels[index+1] + grainAmount;
        pixels[index+2] = pixels[index+2] + grainAmount;
        if (alpha) {
            pixels[index+3] = pixels[index+3] + grainAmount;
        }
    });
}
```

<a id="read_only_mode"></a>

#### Read-only mode

If you only want to loop over pixels without changing them, you can use `loopPixels`:
```js
loopPixels((index, total) => {
    // read-only mode
    // ...
});
```

Alternatively, you can use `tinkerPixels` in read-only mode:
```js
tinkerPixels((index, total) => {
    // read-only mode
    // ...
}, false); // <-- shouldUpdate = false
```

[Go to top ⬆](#top)


<a id="texture_overlay_inside_canvas"></a>

### Texture overlay inside canvas

```js
let textureImage;

function preload() {
    textureImage = loadImage('./assets/texture.jpg');
}

function setup() {

    p5grain.setup();

    // draw your artwork here
    // ...

    textureOverlay(textureImage);
}
```

[Go to top ⬆](#top)


<a id="texture_overlay_inside_canvas_with_texture_animation"></a>

### Texture overlay inside canvas with texture animation

```js
let textureImage;

function preload() {
    textureImage = loadImage('./assets/texture.jpg');
}

function setup() {
    p5grain.setup();
}

function draw() {

    // draw your artwork here
    // ...

    textureOverlay(textureImage, { animate: true });
}
```

For more concrete use cases, please have a look at the provided [examples](./examples).

[Go to top ⬆](#top)


<a id="global_and_instance_mode"></a>

## Global and instance mode

p5.grain supports both global and instance mode. You can read more about p5.js global and instance mode [here](https://github.com/processing/p5.js/wiki/Global-and-instance-mode).

All examples from above showcase p5.grain usage in p5's global mode.

In order to use p5.grain on a specific p5.js instance, you can pass the respective instance to the `p5grain.setup` method. Since p5.grain methods are registered to `p5.prototype`, you can call registered p5.grain methods directly on your p5.js instance. Here's how to use p5.grain in p5's instance mode:

```js
let myp5 = new p5((sketch) => {
    sketch.setup = () => {
        
        // configure p5.grain to be used on a specific p5.js instance
        p5grain.setup({ instance: sketch });

        // draw your artwork here
        // ...

        // example: apply monochromatic grain
        sketch.applyMonochromaticGrain(42);
    }
});
```
To better understand how p5.grain works in instance mode, please have a look at the provided [examples](./examples/instance-mode/).

[Go to top ⬆](#top)


<a id="api"></a>

## API

p5.grain exposes the following API.

*Note: p5.grain is still in the initial development phase and the API can still change. Always review the release notes.*

The library initializes the global `p5grain` variable to a new `P5Grain` instance. You can directly access the fields and methods below from the `p5grain` variable. The library also attempts to register all p5.grain methods except `setup` with p5.js by adding them to `p5.prototype`. This way, instead of calling, for example, `p5grain.applyMonochromaticGrain(42)`, you can conveniently call `applyMonochromaticGrain(42)`, although the former is also possible.

### Fields

| Field | Type | Description |
| --- | --- | --- |
| `version` | `String` | Holds the p5.grain version in [SemVer](https://semver.org) format. |
| `ignoreWarnings` | `Boolean` | Defines whether warnings should be ignored. (default: `false`)<br>*Note: not available in the p5.grain minified version.* |
| `ignoreErrors` | `Boolean` | Defines whether errors should be ignored. (default: `false`)<br>*Note: not available in the p5.grain minified version.* |

### Methods

| Method | Description |
| --- | --- |
| `setup([config])` | Setup and configure certain p5.grain features. |
| `applyMonochromaticGrain(amount, [alpha], [pg])` | Apply monochromatic grain. |
| `applyChromaticGrain(amount, [alpha], [pg])` | Apply chromatic grain. |
| `tinkerPixels(callback, [shouldUpdate], [pg])` | Loop through pixels and call the given callback function for every pixel. Pixels are manipulated depending on the given callback function, unless read-only mode is enabled. |
| `loopPixels(callback, [pg])` | Loop through pixels and call the given callback function for every pixel without updating them (read-only mode). |
| `textureOverlay(textureImage, config)` | Blend the given texture image onto the canvas. |
| `textureAnimate(textureElement, config)` | Animate the given texture element by randomly shifting its background position. |

[Go to top ⬆](#top)


### `p5grain.setup([config])`

Setup and configure certain p5grain features.

| Property | Type | Description |
| --- | --- | --- |
| `config` | `Object` | (optional) Config object to configure p5grain features. |
| `config.random` | `function` | (optional) The random function that should be used internally for pixel manipulation and texture animation. |
| `config.instance` | `Object` | (optional) Reference to a p5.js instance. Read how to use p5.grain with p5.js instance mode [here](#global-and-instance-mode). |
| `config.ignoreWarnings` | `Boolean` | (optional) Defines whether warnings should be ignored.<br>*Note: not available in the p5.grain minified version.* |
| `config.ignoreErrors` | `Boolean` | (optional) Defines whether errors should be ignored.<br>*Note: not available in the p5.grain minified version.* |

[Go to top ⬆](#top)


### `applyMonochromaticGrain(amount, [alpha], [pg])`

Apply monochromatic grain.

This method generates one random value per pixel. The random value ranges from `-amount` to `+amount` and is added to every RGB(A) pixel channel.

| Property | Type | Description |
| --- | --- | --- |
| `amount` | `Number` | The amount of granularity that should be applied. |
| `alpha` | `Boolean` | (optional) Specifies whether the alpha channel should also be modified. When not specified the alpha channel will not be modified. |
| `pg\|img` | `p5.Graphics\|p5.Image` | (optional) The offscreen graphics buffer or image whose pixels should be manipulated.<br><br>*Note: When using an offscreen graphics buffer, use the usual syntax `pg.applyMonochromaticGrain(amount, alpha)`. Only in case `p5.Graphics.applyMonochromaticGrain` could not be registered, use the alternative syntax `p5grain.applyMonochromaticGrain(amount, alpha, pg)`.*<br><br>*Note: When using an image, use the usual syntax `img.applyMonochromaticGrain(amount, alpha)`. Only in case `p5.Image.applyMonochromaticGrain` could not be registered, use the alternative syntax `p5grain.applyMonochromaticGrain(amount, alpha, img)`.* |

[Go to top ⬆](#top)


### `applyChromaticGrain(amount, [alpha], [pg])`

Apply chromatic grain.

This method generates one random value per pixel channel. The random values range from `-amount` to `+amount`. Each random value is added to the respective RGB(A) channel of the pixel.

| Property | Type | Description |
| --- | --- | --- |
| `amount` | `Number` | The amount of granularity that should be applied. |
| `alpha` | `Boolean` | (optional) Specifies whether the alpha channel should also be modified. When not specified the alpha channel will not be modified. |
| `pg\|img` | `p5.Graphics\|p5.Image` | (optional) The offscreen graphics buffer whose pixels should be manipulated.<br><br>*Note: When using an offscreen graphics buffer, use the usual syntax `pg.applyChromaticGrain(amount, alpha)`. Only in case `p5.Graphics.applyChromaticGrain` could not be registered, use the alternative syntax `p5grain.applyChromaticGrain(amount, alpha, pg)`.*<br><br>*Note: When using an image, use the usual syntax `img.applyChromaticGrain(amount, alpha)`. Only in case `p5.Image.applyChromaticGrain` could not be registered, use the alternative syntax `p5grain.applyChromaticGrain(amount, alpha, img)`.* |

[Go to top ⬆](#top)


### `tinkerPixels(callback, [shouldUpdate], [pg])`

Loop through pixels and call the given callback function on every pixel. Pixels are manipulated depending on the given callback function, unless read-only mode is enabled.

The callback function exposes two arguments:
- `index`: the current pixel index
- `total`: the total indexes count

[Read-only mode](#read-only-mode): updating pixels can be by-passed by setting the `shouldUpdate` argument to `false`.

| Property | Type | Description |
| --- | --- | --- |
| `callback` | `Function` | The callback function that should be called on every pixel. |
| `shouldUpdate` | `Boolean` | (optional) Specifies whether the pixels should be updated. |
| `pg\|img` | `p5.Graphics\|p5.Image` | (optional) The offscreen graphics buffer whose pixels should be manipulated.<br><br>*Note: When using an offscreen graphics buffer, use the usual syntax `pg.tinkerPixels(callback, shouldUpdate)`. Only in case `p5.Graphics.tinkerPixels` could not be registered, use the alternative syntax `p5grain.tinkerPixels(callback, shouldUpdate, pg)`.*<br><br>*Note: When using an image, use the usual syntax `img.tinkerPixels(callback, shouldUpdate)`. Only in case `p5.Image.tinkerPixels` could not be registered, use the alternative syntax `p5grain.tinkerPixels(callback, shouldUpdate, img)`.* |

[Go to top ⬆](#top)


### `loopPixels(callback, [pg])`

Loop through pixels and call the given callback function for every pixel without updating them ([read-only mode](#read-only-mode)).

In contrast to the `tinkerPixels` function, no pixel manipulations are performed with `loopPixels`. In other words `loopPixels` has the same effect as using `tinkerPixels` in [read-only mode](#read-only-mode).

The callback function exposes two arguments:
- `index`: the current pixel index
- `total`: the total indexes count

| Property | Type | Description |
| --- | --- | --- |
| `callback` | `Function` | The callback function that should be called on every pixel. |
| `pg\|img` | `p5.Graphics\|p5.Image` | (optional) The offscreen graphics buffer whose pixels should be manipulated.<br><br>*Note: When using an offscreen graphics buffer, use the usual syntax `pg.loopPixels(callback)`. Only in case `p5.Graphics.loopPixels` could not be registered, use the alternative syntax `p5grain.loopPixels(callback, pg)`.*<br><br>*Note: When using an image, use the usual syntax `img.loopPixels(callback)`. Only in case `p5.Image.loopPixels` could not be registered, use the alternative syntax `p5grain.loopPixels(callback, img)`.* |

[Go to top ⬆](#top)


### `textureOverlay(textureImage, [config], [pg])`

Blend the given texture image onto the canvas.

The texture is repeated along the horizontal and vertical axes to cover the entire canvas (or context).

| Property | Type | Description |
| --- | --- | --- |
| `texture` | `p5.Image` | The texture image to blend over. |
| `config` | `Object` | (optional) Config object to configure the texture overlay. |
| `config.width` | `Number` | (optional) The width the texture image should have. When no width is specified, the width of the texture image is assumed. |
| `config.height` | `Number` | (optional) The height the texture image should have. When no height is specified, the height of the texture image is assumed. |
| `config.mode` | `Constant` | (optional) The blend mode that should be used to blend the texture over the canvas. Either `BLEND`, `DARKEST`, `LIGHTEST`, `DIFFERENCE`, `MULTIPLY`, `EXCLUSION`, `SCREEN`, `REPLACE`, `OVERLAY`, `HARD_LIGHT`, `SOFT_LIGHT`, `DODGE`, `BURN`, `ADD` or `NORMAL`. When no mode is specified, the blend mode `MULTIPLY` will be used. |
| `config.reflect` | `Boolean` | (optional) Specifies whether the given texture image should reflect horizontally and vertically, in order to provide seamless continuity. |
| `config.animate` | `Boolean\| Object` | (optional) Specifies whether the given texture image should be animated. |
| `config.animate.atFrame` | `Number` | (optional) When animation is activated, the frame at which the texture should be shifted. When `atFrame` isn't specified, the texture is shifted every 2<sup>nd</sup> frame. |
| `config.animate.amount` | `Number` | (optional) When animation is activated, the maximum amount of pixels by which the texture should be shifted. The actual amount of pixels which the texture is shifted by is generated randomly. When no amount is specified, the minimum of the main canvas `width` or `height` is used. |
| `pg` | `p5.Graphics` | (optional) The offscreen graphics buffer onto which the texture image should be drawn.<br><br>*Note: When using an offscreen graphics buffer, use the usual syntax `pg.textureOverlay(textureImage, config)`. Only in case `p5.Graphics.textureOverlay` could not be registered, use the alternative syntax `p5grain.textureOverlay(textureImage, config, pg)`.* |

[Go to top ⬆](#top)


### `textureAnimate(textureElement, [config])`

Animate the given texture element by randomly shifting its background position.

| Property | Type | Description |
| --- | --- | --- |
| `textureElement` | `HTMLElement\| SVGElement\| p5.Element` | The texture element to be animated. |
| `config` | `Object` | (optional) Config object to configure the texture animation. |
| `config.atFrame` | `Number` | (optional) The frame at which the texture should be shifted. When `atFrame` isn't specified, the texture is shifted every 2<sup>nd</sup> frame. |
| `config.amount` | `Number` | (optional) The maximum amount of pixels by which the texture should be shifted. The actual amount of pixels which the texture is shifted by is generated randomly. When no amount is specified, the minimum of the main canvas `width` or `height` is used. |

[Go to top ⬆](#top)


<a id="limitations"></a>

## Limitations

* Safari: SVG element technique only works for browser window resolutions with less than 2<sup>20</sup> pixels (e.g. 1024 x 1024 pixels).
* Safari: SVG URL-encoded technique is currently unsupported.


<a id="contributing"></a>

## Contributing

Are you considering contributing to p5.grain? Check out our [contributing guidelines](./CONTRIBUTING.md).


<a id="license"></a>

## License

p5.grain is [MIT licensed](./LICENSE).
