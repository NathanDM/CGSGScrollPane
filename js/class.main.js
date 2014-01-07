var CGMain = CGSGView.extend(
    {
        initialize : function(canvas) {

            this._super(canvas);

            ////// INITIALIZATION /////////
            this.initializeCanvas();
            this.createScene();

            this.startPlaying();
        },

        initializeCanvas : function() {
            //redimensionnement du canvas pour être full viewport en largeur
            this.viewDimension = cgsgGetRealViewportDimension();
            this.setCanvasDimension(this.viewDimension);
        },

        /**
         * create a random scene with some nodes
         *
         */
        createScene : function() {

            var i,
                itemSize = 40,
                padding = 5,
                column = 6,
                core = new CGSGNodeSquare(0, 0, 400, 200),
                item;

            //create and add a root node to the scene, with arbitrary dimension
            this.rootNode = new CGSGNode(0, 0);
            CGSG.sceneGraph.addNode(this.rootNode, null);

            core.color = "yellow";
            core.isClickable = true;
            core.isTraversable = true;
            core.isDraggable = true;
            core.isResizable = true;
            this.viewport = new CGSGNodeScrollPane(15, 15, 200, 200);

            for (i = 0; i < 30; i++) {
                item = new CGSGNodeSquare(Math.floor(i % column) * (itemSize + padding), Math.floor(i / column) * (itemSize + padding), itemSize, itemSize);
                item.isClickable = true;
                item.isTraversable = false;
                item.isDraggable = true;
                item.isResizable = true;
                core.addChild(item);
            }

            this.viewport.addToViewPort(core);

            this.rootNode.addChild(this.viewport);
        }
    }
);