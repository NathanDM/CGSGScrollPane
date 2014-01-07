/**
 * A CGSGNodeScrollPaneSliderHandle represent a slider handle
 *
 * @class CGSGNodeScrollPaneSliderHandle
 * @module Node
 * @extends CGSGNode
 * @constructor
 * @param {Number} handleWidth width of the handle
 * @type {CGSGNodeScrollPaneSliderHandle}
 */
var CGSGNodeScrollPaneSliderHandle = CGSGNode.extend({

    initialize: function (handleWidth) {
        this._super(0, 0);
        this.resizeTo(handleWidth, handleWidth);
        this.color = "#505050";
        this.rotationCenter = new CGSGPosition(0.5, 0.5);
        this.selectionHandleColor = 'rgba(0,0,0,0)';
        this.selectionLineColor = 'rgba(0,0,0,0)';
        this.handleWidth = handleWidth;
        this.isDraggable = true;
        this.isRoundingFixed = true;
        this.rounding = 0;
        this.onDrag = this.onSlide;

    },

    /**
     * Restrain movement to x or y axis
     *
     * @method onSlide
     * @protected
     */
    onSlide: function () {
        this.handleWidth = Math.min(this._parentNode.getHeight(), this._parentNode.getWidth()) * 2;
        var width = this._parentNode.getWidth();
        var height = this._parentNode.getHeight();
        if (width > height) {
            var x = this.position.x;
            if (x < 0) {
                x = 0;
            } else if (x > width - this._parentNode.getWidth() / 5) {
                x = width - this._parentNode.getWidth() / 5;
            }
            this.translateTo(x, 0);
            var scale = width / (width - this.getWidth()),
                range = this._parentNode.max - this._parentNode.min;
            this._parentNode.value = ((this.position.x) * (range / width)) * scale + this._parentNode.min;
        } else {
            var y = this.position.y;
            if (y < 0) {
                y = 0;
            } else if (y > height - this._parentNode.getHeight() / 5) {
                y = height - this._parentNode.getHeight() / 5;
            }
            this.translateTo(0, y);
            var scale = height / (height - this.getHeight()),
                range = this._parentNode.max - this._parentNode.min;
            this._parentNode.value = ((this.position.y) * (range / height)) * scale + this._parentNode.min;
        }
    },

    /**
     * The handle will look like a pill
     *
     * @method render
     * @protected
     * @param {CanvasRenderingContext2D} context the context into render the node
     */
    render: function (context) {

        var offset = 1;

        var width;
        var height;
        var gradient;

        if (this._parentNode.getWidth() > this._parentNode.getHeight()) {
            width = this._parentNode.getWidth() / 5 - 2;
            height = this._parentNode.getHeight() - 2;
            this.resizeTo(width, height);
        } else {
            width = this._parentNode.getWidth() - 2;
            height = this._parentNode.getHeight() / 5 - 2;
            this.resizeTo(width, height);
        }

        var borderRadius = this.rounding;
        if (!this.isRoundingFixed || this.rounding > Math.min(width, height) / 2) {
            borderRadius = Math.min(width, height) / 2;
        }

        context.lineWidth = 2;
        context.fillStyle = this.color;
        context.strokeStyle = this.color;

        context.save();

        context.translate(offset, offset);

        context.beginPath();
        context.moveTo(0, borderRadius);
        context.quadraticCurveTo(0, 0, borderRadius, 0);
        context.lineTo(width - borderRadius, 0);
        context.quadraticCurveTo(width, 0, width, borderRadius);
        context.lineTo(width, height - borderRadius);
        context.quadraticCurveTo(width, height, width - borderRadius, height);
        context.lineTo(borderRadius, height);
        context.quadraticCurveTo(0, height, 0, height - borderRadius);
        context.lineTo(0, borderRadius);
        context.closePath();

        context.restore();

        context.fill();

    }

});

var CGSGNodeScrollPaneViewPort = CGSGNode.extend({

    initialize: function (x, y, width, height) {
        this._super(x, y);
        this.resizeTo(width, height);
    },

    draw: function (context) {

        context.beginPath();
        context.rect(0, 0, this.getWidth(), this.getHeight());
        context.closePath();

        context.clip();
    },

    render: function (context) {
        this.draw(context);
    },

    /**
     * Override afterRender to add "slipping" effect to scroll pane
     * @protected
     * @method afterRender
     * @param {CanvasRenderingContext2D} context the context into render the nodes
     * */
    afterRender: function (context) {
        if (this.onAfterRenderStart) {
            CGSG.eventManager.dispatch(this, cgsgEventTypes.AFTER_RENDER_START, new CGSGEvent(this, {context: context}));
        }

        //render all children
        if (!this.isALeaf()) {
            //draw children
            for (var i = 0, len = this.children.length; i < len; ++i) {
                var childNode = this.children[i];
                if (childNode.isVisible) {
                    childNode.doRender(context);
                }
            }
        }

        var offset = 25;

        if (this.contained != null) {
            var leftOffset = Math.min(offset, Math.abs(this.container.position.x / 5)) - offset,
                rightOffset = this.getWidth() - Math.min(offset, Math.abs( this.contained.getWidth() + this.container.position.x - this.getWidth()));

            if (this._parentNode.xSlider.isRequired) {
                var gradient = context.createLinearGradient(leftOffset, this.getHeight(), leftOffset + offset, this.getHeight());
                gradient.addColorStop(0, 'rgba(0,0,0,0.7)');
                gradient.addColorStop(0.5, 'rgba(0,0,0,0.45)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                context.fillStyle = gradient;
                context.beginPath();
                context.rect(leftOffset, 0, this.getWidth(), this.getHeight());
                context.closePath();
                context.fill();
                gradient = context.createLinearGradient(rightOffset, this.getHeight(), rightOffset + offset, this.getHeight());
                gradient.addColorStop(0, 'rgba(0,0,0,0.0)');
                gradient.addColorStop(0.5, 'rgba(0,0,0,0.45)');
                gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
                context.fillStyle = gradient;
                context.beginPath();
                context.rect(rightOffset, 0, rightOffset + offset, this.getHeight());
                context.closePath();
                context.fill();
            }
        }

        //restore the context state
        context.restore();

    }

});

var CGSGNodeScrollPane = CGSGNode.extend({

    initialize: function (x, y, width, height) {
        this._viewport = new CGSGNodeScrollPaneViewPort(0, 0, width, height);
        this._super(x, y);
        this.rounding = 0;

        this.sliderWidth = 15;

        this.xSliderInit = false;
        this.ySliderInit = false;

        this.resizeTo(width, height);
        this._build();

    },

    /**
     * <p>
     *     Create view port and its scroll bars
     * </p>
     *
     * @method build
     * @public
     *
     * */
    _build: function () {

        var viewPortWidth = this.getWidth(),
            viewPortHeight = this.getHeight();

//        this._viewport = new CGSGNodeScrollPaneViewPort(0, 0, viewPortWidth, viewPortHeight);
        this._buildYSlider();
        this._buildXSlider();
        this.addChild(this._viewport);

    },

    _buildXSlider: function () {
        //Horizontal slider
        this.xSlider = new CGSGNodeSlider(0, this._viewport.getHeight(), this._viewport.getWidth(), this.sliderWidth);


        var xHandle = new CGSGNodeScrollPaneSliderHandle(20);
        this.xSlider.rounding = this.rounding;
        this.xSlider.setHandle(xHandle, 0, 0);
        this.xSlider.mustRenderValue = false;

        CGSG.eventManager.bindHandler(this.xSlider.getHandle(), cgsgEventTypes.ON_DRAG, this.onSliderTranslate.bind(this));
        CGSG.eventManager.bindHandler(this.xSlider.getHandle(), cgsgEventTypes.ON_DRAG_END, this.onSliderTranslateEnd.bind(this));

        this.addChild(this.xSlider);

        //Not rendered if not needed
        this.xSlider.isVisible = false;
        this.xSlider.isTraversable = false;
    },

    _buildYSlider: function () {
        //vertical Slider
        this.ySlider = new CGSGNodeSlider(this._viewport.getWidth(), 0, this.sliderWidth, this._viewport.getHeight());


        var yHandle = new CGSGNodeScrollPaneSliderHandle(20);
        this.ySlider.rounding = this.rounding;
        this.ySlider.setHandle(yHandle, 0, 0);

        this.ySlider.mustRenderValue = false;
        CGSG.eventManager.bindHandler(this.ySlider.getHandle(), cgsgEventTypes.ON_DRAG, this.onSliderTranslate.bind(this));
        CGSG.eventManager.bindHandler(this.ySlider.getHandle(), cgsgEventTypes.ON_DRAG_END, this.onSliderTranslateEnd.bind(this));

        this.addChild(this.ySlider);

        //Not rendered if not needed
        this.ySlider.isVisible = false;
        this.ySlider.isTraversable = false;
    },

    onSliderTranslate: function (event) {
        this.contained.translateTo(-this.xSlider.value, -this.ySlider.value, false);
    },

    onSliderTranslateEnd: function (event) {
    },

    /**
     * <p>
     *     Dimension scroll bars and view port
     * </p>
     *
     * @method updateViewPort
     * @public
     *
     * */
    updateViewPort: function () {
        if (this._viewport != null && this.contained != null) {

            this.viewPortAreaWidth = this.contained.getWidth();
            this.viewPortAreaHeight = this.contained.getHeight();

            if(this.viewPortAreaHeight > this._viewport.getHeight()) {
                this.showSlider(this.ySlider);
            } else if (cgsgExist(this.ySlider) && this.ySlider.isVisible) {
                this.hideSlider(this.ySlider);
            }

            if (this.viewPortAreaWidth > this._viewport.getWidth()) {
                this.showSlider(this.xSlider);
            } else if (cgsgExist(this.xSlider) && this.xSlider.isVisible) {
                this.hideSlider(this.xSlider);
            }

            this.ySlider.translateTo(this._viewport.getWidth(), 0, false);
            this.xSlider.translateTo(0, this._viewport.getHeight(), false);

            this.ySlider.resizeTo(this.sliderWidth, this._viewport.getHeight());
            this.xSlider.resizeTo(this._viewport.getWidth(), this.sliderWidth);

            this.xSlider.setMin(0);
            this.xSlider.setMax(this.viewPortAreaWidth - this._viewport.getWidth());
            this.xSlider.setValue(0);

            this.ySlider.setMin(0);
            this.ySlider.setMax(this.viewPortAreaHeight - this._viewport.getHeight());
            this.ySlider.setValue(0);

        }
    },

    /**
     * <p>
     *     Add node to scrollable view port
     * </p>
     *
     * @method addToViewPort
     * @public
     *
     * @param {CGSGNode} node
     * */
    addToViewPort: function (node) {
        if (node != null) {
            this.contained = node;
            this._viewport.addChild(node);
            this.updateViewPort();
        }
    },

    clear: function () {
        if (this._viewport.children != null) {
            while (this._viewport.children.length > 0) {
                this._viewport.removeChild(this._viewport.children[0], false);
            }
            this.contained = null;
        }
    },

    /**
     * <p>
     *     Replace current dimension and fit view port to current dimension
     * </p>
     *
     * @method resizeTo
     * @public
     *
     * @param {Number} newWidth
     * @param {Number} newHeight
     * */
    resizeTo: function (newWidth, newHeight) {
        this.dimension.resizeTo(newWidth, newHeight);
        //TODO check if scrollBar are visible
        this._viewport.dimension.resizeTo(newWidth,newHeight);
        this.updateViewPort();
    },

    /**
     * <p>
     *     Multiply current dimension and fit view port to current dimension
     * </p>
     *
     * @method resizeBy
     * @public
     *
     * @param {Number} widthFactor
     * @param {Number} heightFactor
     * */
    resizeBy: function (widthFactor, heightFactor) {
        this.dimension.resizeBy(widthFactor, heightFactor);
        this._viewport.dimension.resizeBy(widthFactor,heightFactor);
        this.updateViewPort();
    },

    /**
     * <p>
     *     Increase/decrease current dimension and fit view port to current dimension
     * </p>
     *
     * @method resizeWith
     * @public
     *
     * @param {Number} width
     * @param {Number} height
     * */
    resizeWith: function (width, height) {
        this.dimension.resizeWith(width, height);
        this._viewport.dimension.resizeWith(width,height);
        this.updateViewPort();
    },

    showSlider: function (slider) {
        if(!slider.isVisible) {
            slider.isVisible = true;
            slider.isTraversable = true;

            if(slider.getWidth() > slider.getHeight()) {
                this._viewport.resizeWith(0, -this.sliderWidth);
            } else {
                this._viewport.resizeWith(-this.sliderWidth, 0);
            }
        }
    },

    hideSlider: function (slider) {
        if(slider.isVisible) {
            slider.isVisible = false;
            slider.isTraversable = false;

            if(slider.getWidth() > slider.getHeight()) {
                this._viewport.resizeWith(0, this.sliderWidth);
            } else {
                this._viewport.resizeWith(this.sliderWidth, 0);
            }
        }
    }

});