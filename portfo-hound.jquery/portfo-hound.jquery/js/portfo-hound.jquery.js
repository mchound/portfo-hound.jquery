(function ($) {

    var portfohound = function ($el, options) {
        // Init
        var ph = this;
        ph.$container = $el;
        ph.list = ph.$container.children('ul');

        ph.settings = options;

        // Definitions
        ph.defs = {
            containerWidth: ph.$container.width(),
            itemsPerRow: 4,
            itemWidth: 25,
            activeCategory: ph.settings.initialCategory,
            allItems: $(ph.list).children('li'),
            visibleItems: $(ph.list).children('li'),
            hiddenItems: [],
            itemPositions: [],
            actualItemPositions: []
        };

        console.log('Container width: ' + ph.$container.width());

        // Start
        ph.calculateLayout(ph);
        ph.placeItems(ph);
        ph.getItemPositions(ph);
        ph.filter(ph);

        // Bind to window resize event
        $(window).resize(function (e) {
            ph.defs.containerWidth = ph.$container.width();
            ph.calculateLayout(ph);
            ph.placeItems(ph);
            ph.getItemPositions(ph);
        });

        // Bind portfo-houd-buttons
        $('.portfo-hound-button').click(function () {
            var cat = $(this).data('category');
            ph.filter(ph, cat);
            ph.positionItems(ph, 'absolute');
            ph.getItemPositions(ph);
            ph.hideItems(ph);
            ph.placeItems(ph);
            ph.relocateItems(ph, function () {                
                ph.positionItems(ph, 'relative');
            });
            
            
        });
    };

    portfohound.prototype = {

        hideItems: function (ph) {
            $.each(ph.defs.hiddenItems, function (index, item) {
                var $item = $(item);
                $item.fadeOut();
            });
        },

        relocateItems: function (ph, callback) {
            $.each(ph.defs.visibleItems, function (index, item) {
                var $item = $(item);
                $item.animate({
                    top: ph.defs.itemPositions[index].top,
                    left: ph.defs.itemPositions[index].left
                }, 600, function () {
                    index == ph.defs.visibleItems.length - 1 ? callback() : false;
                });
            });
        },

        positionItems: function (ph, pos) {
            var position = pos ? pos : 'absolute';
            ph.defs.allItems.each(function (index, item) {
                var $item = $(item);
                $item.css({
                    position: position,
                    top: position == 'absolute' ? ph.defs.itemPositions[index].top : 0,
                    left: position == 'absolute' ? ph.defs.itemPositions[index].left : 0
                });
            });
        },        

        getItemPositions: function (ph) {
            ph.defs.itemPositions = [];

            var numberOfRows = Math.round(ph.defs.visibleItems.length / ph.defs.itemsPerRow),
                itemIndex = 0,
                topOffset = 0;

            // Loop though each row
            for (var i = 0; i < numberOfRows; i++) {
                var leftOffset = 0;
                for (var q = 0; q < ph.defs.itemsPerRow; q++) {

                    ph.defs.itemPositions.push({ top: topOffset, left: leftOffset });

                    var $item = $(ph.defs.visibleItems[itemIndex]),
                        itemHeight = $item.height(),
                        itemWidth = (ph.defs.itemWidth / 100) * ph.defs.containerWidth,
                        itemMargin = (ph.settings.itemMargin / 100) * ph.defs.containerWidth;
                    
                    q == 0 ? leftOffset += itemWidth : leftOffset += itemWidth + itemMargin;
                    
                    itemIndex++;
                }
                topOffset += itemHeight + itemMargin;
            }
        },

        filter: function (ph, category) {
            ph.defs.visibleItems = [];
            ph.defs.hiddenItems = [];

            var cat = category ? category : ph.defs.activeCategory;
            ph.defs.activeCategory = cat;
            ph.defs.allItems.each(function (index, item) {
                var $item = $(item);
                if ($item.data('category').split(' ').indexOf(cat) != -1)
                    ph.defs.visibleItems.push($item);
                else
                    ph.defs.hiddenItems.push($item);
            });
        },

        calculateLayout: function (ph) {
            var itemsPerRow = ph.settings.itemsPerRow,
                itemActualWidth = 0;

            // Loop until items fit row on desired width
            while (itemActualWidth < ph.settings.itemMinWidth && itemsPerRow >= 1 || ph.defs.visibleItems.length-1 < itemsPerRow) {
                var marginSum = (ph.settings.itemMargin / 100) * (itemsPerRow - 1),
                    itemStyleWidth = 1 - marginSum;
                itemActualWidth = ph.defs.containerWidth * itemStyleWidth / itemsPerRow;
                itemsPerRow--;
            }
            
            ph.defs.itemsPerRow = ++itemsPerRow;
            ph.defs.itemWidth = itemStyleWidth / itemsPerRow * 100;

            console.log('Layout calculation finished and resulted in: ' + ph.defs.itemsPerRow + ' on each row. Item width: ' + ph.defs.itemWidth + '%');
        },

        placeItems: function (ph) {
            var numberOfRows = Math.round(ph.defs.visibleItems.length / ph.defs.itemsPerRow),
                itemIndex = 0;

            // Loop though each row
            for (var i = 0; i < numberOfRows; i++) {
                for (var q = 0; q < ph.defs.itemsPerRow; q++) {

                    var $item = $(ph.defs.visibleItems[itemIndex])
                    if (q == 0) {
                        $item.css({
                            width: ph.defs.itemWidth + '%',
                            marginLeft: 0,
                            marginBottom: i < numberOfRows - 1 ? ph.settings.itemMargin + '%' : 0,
                            display: 'block'
                        });      
                    }
                    else {
                        $item.css({
                            width: ph.defs.itemWidth + '%',
                            marginLeft: ph.settings.itemMargin + '%',
                            marginBottom: i < numberOfRows - 1 ? ph.settings.itemMargin + '%' : 0,
                            display: 'block'
                        });
                    }
                    itemIndex++;
                }
            }
        }
    };

    $.fn.portfohound = function ( options ) {

        // Create some defaults
        var settings = $.extend({
            initialCategory: 'all',        
            itemsPerRow: 4,
            itemMargin: 2,
            itemMinWidth: 200
        }, options);

        return this.each(function () {
            var portfo = new portfohound($(this), settings);            
        });		
    };

    $.fn.reverse = [].reverse;   

})(jQuery);



if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
             ? Math.ceil(from)
             : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}