(function($) {
    var TableFix = (function () {
        function TableFix($table, options) {
            var opts = $.extend({}, options || {}),
                tableWidth = $table.width(),
                tableHeight = $table.height(),
                wrapDom = $table.parent(),
                wrapWidth, wrapHeight,
                row, col;

            // options initialize
            col = opts.fixCols || 0;
            if (col >= $table.find('tr:first').children().length) {
                col = 0;
            }

            row = $table.find('thead tr').length;

            if (opts.width) {
                if (this.xScroll = opts.width < tableWidth) {
                    this.width = opts.width;
                } else {
                    this.width = tableWidth + 3;
                    delete opts.width;
                }
            } else {
                wrapWidth = wrapDom.width();
                if (this.xScroll = wrapWidth < tableWidth) {
                    this.width = wrapWidth;
                } else {
                    this.width = tableWidth + 3;
                    wrapWidth = null;
                }
            }

            if (opts.height) {
                if (this.yScroll = opts.height < tableHeight) {
                    this.height = opts.height;
                } else {
                    this.height = tableHeight + 3;
                    delete opts.height;
                }
            } else {
                wrapHeight = wrapDom.height();
                $table.siblings().each( function(){ wrapHeight -= $(this).outerHeight(true); });
                if (this.yScroll = wrapHeight < tableHeight) {
                    this.height = wrapHeight;
                } else {
                    this.height = tableHeight + 3;
                    wrapHeight = null;
                }
            }

            if (!opts.height && !wrapHeight && this.xScroll) {this.height += this.getScrollBarWidth();}
            if (!opts.width && !wrapWidth && this.yScroll) {this.width += this.getScrollBarWidth();}

            if (this.xScroll || this.yScroll) {
                $table.width(tableWidth); // table width fixed
                this.tableSplit($table, row, col);
            }
        }

        TableFix.prototype.tableSplit = function ($table, row, col) {
            var wrapDiv = $table.wrap("<div></div>").parent().css({ position: "relative" }),
                midPoint = this.getMidPoint($table, row, col);

            var headLeft = $table.wrap('<div></div>').parent().css({ position: "absolute", overflow: "hidden", 'box-sizing': "content-box" }),
                headRight = $table.clone().wrap('<div></div>').parent().css({ position: "absolute", overflow: "hidden", 'box-sizing': "content-box" }),
                bodyLeft = $table.clone().wrap('<div></div>').parent().css({ position: "absolute", overflow: "hidden", 'box-sizing': "content-box" }),
                bodyRight = $table.clone().wrap('<div></div>').parent().css({ position: "absolute", overflow: "auto", 'box-sizing': "content-box" });
            wrapDiv.append(headRight).append(bodyLeft).append(bodyRight);

            headLeft.
                width(midPoint.x + 1).
                height(midPoint.y).
                find("table").
                    addClass("headLeft").
                    css({
                        marginLeft: 0,
                        marginRight: 0,
                        marginTop: 0,
                        marginBottom: 0 });
            headRight.
                width(this.width - midPoint.x - (this.yScroll ? this.getScrollBarWidth() : 0)).
                height(midPoint.y).
                css({ left: midPoint.x + 1 + 'px' }).
                find('table').
                    addClass("headRight").
                    css({
                        marginLeft: -midPoint.x + 'px',
                        marginRight: 0,
                        marginTop: 0,
                        marginBottom: 0 });
            bodyLeft.
                width(midPoint.x + 1).
                height(this.height - midPoint.y - (this.xScroll ? this.getScrollBarWidth() : 0)).
                css({ top: midPoint.y + 'px' }).
                find("table").
                    addClass("bodyLeft").
                    css({
                        marginLeft: 0,
                        marginRight: 0,
                        marginTop: -midPoint.y + 'px',
                        marginBottom: 0 });
            bodyRight.
                width(this.width - midPoint.x).
                height(this.height - midPoint.y).
                css({ left: midPoint.x + 1 + 'px', top: midPoint.y + 'px' }).
                find("table").
                    addClass("bodyRight").
                    css({
                        marginLeft: -midPoint.x + 'px',
                        marginRight: 0,
                        marginTop: -midPoint.y + 'px',
                        marginBottom: 0 });

            wrapDiv.width(this.width).height(this.height);

            bodyLeft.on({
                'mouseenter': function() {
                    var $this = $(this),
                        r = $this.closest('tr').index(),
                        c = $this.index(),
                        cell = bodyRight.find('tbody tr').eq(r).children().eq(c);
                    if (!cell.data("isHover")) {
                        $this.data("isHover", true);
                        cell.data("isHover", true);
                        cell.mouseover();
                    }
                },
                'mouseleave': function() {
                    var $this = $(this),
                        r = $this.closest('tr').index(),
                        c = $this.index(),
                        cell = bodyRight.find('tbody tr').eq(r).children().eq(c);
                    if (cell.data("isHover")) {
                        $this.removeData("isHover");
                        cell.removeData("isHover");
                        cell.mouseout();
                    }
                }
            }, "tbody tr >");

            bodyRight.scroll(function () {
                headRight.scrollLeft(bodyRight.scrollLeft());
                bodyLeft.scrollTop(bodyRight.scrollTop());
            }).on({
                'mouseenter': function() {
                    var $this = $(this),
                        r = $this.closest('tr').index(),
                        c = $this.index(),
                        cell = bodyLeft.find('tbody tr').eq(r).children().eq(c);
                    if (!cell.data("isHover")) {
                        $this.data("isHover", true);
                        cell.data("isHover", true);
                        cell.mouseover();
                    }
                },
                'mouseleave': function() {
                    var $this = $(this),
                        r = $this.closest('tr').index(),
                        c = $this.index(),
                        cell = bodyLeft.find('tbody tr').eq(r).children().eq(c);
                    if (cell.data("isHover")) {
                        $this.removeData("isHover");
                        cell.removeData("isHover");
                        cell.mouseout();
                    }
                }
            }, "tbody tr >");

            if ($.fn.mousewheel && this.yScroll) {
                bodyRight.mousewheel(function(event, mov) {
                    bodyRight.scrollTop(bodyRight.scrollTop() - mov * 20);
                    return false;
                });
                bodyLeft.mousewheel(function(event, mov) {
                    bodyRight.scrollTop(bodyRight.scrollTop() - mov * 20);
                    return false;
                });
            }

        };

        TableFix.prototype.getMidPoint = function ($table, row, col) {
            var point = { x: 0, y: 0 };
            $table.find('tr').each(function (indexY, tr) {
                $(tr).find('td,th').each(function (indexX, cell) {
                    if (indexY === row && indexX === col) {
                        var $cell = $(cell);
                        point.x = $cell.position().left;
                        point.y = $cell.parent('tr').position().top;
                        return false;
                    }
                });
                if (indexY === row) {
                    return false;
                }
            });

            return point;
        };

        TableFix.prototype.getScrollBarWidth = function () {
            if (!TableFix._ScrollWidth) {
                var inner = $('<p/>').css({
                    width: '100%',
                    height: 200,
                    padding: 0,
                    'box-sizing': "content-box"
                })[0];

                var outer = $('<div/>').css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 200,
                    height: 150,
                    padding: 0,
                    overflow: 'hidden',
                    visibility: 'hidden',
                    'box-sizing': "content-box"
                }).append(inner).appendTo('body');

                var w1 = inner.offsetWidth;
                outer.css('overflow', 'scroll');
                var w2 = inner.offsetWidth;

                if (w1 === w2) {
                    w2 = outer[0].clientWidth;
                }

                outer.remove();

                TableFix._ScrollWidth = w1 - w2;
            }

            return TableFix._ScrollWidth;
        };
        TableFix._ScrollWidth = 0;
        return TableFix;
    })();

    $.fn.tablefix = function(options) {
        return this.each(function() {
            new TableFix($(this), options);
        });
    }
})(jQuery);
