(function($) {
    var fixCellIndexes = function(table) {
        var rows = table.rows,
            len = rows.length,
            matrix = [];
        for ( var i = 0; i < len; i++ ) {
            var cells = rows[i].cells,
                clen = cells.length;
            for ( var j = 0; j < clen; j++ ) {
                var c = cells[j],
                    rowSpan = c.rowSpan || 1,
                    colSpan = c.colSpan || 1,
                    firstAvailCol = -1;
                if ( !matrix[i] ) {
                    matrix[i] = [];
                }
                var m = matrix[i];
                // Find first available column in the first row
                while ( m[++firstAvailCol] ) {}
                c.realIndex = firstAvailCol;
                for ( var k = i; k < i + rowSpan; k++ ) {
                    if ( !matrix[k] ) {
                        matrix[k] = [];
                    }
                    var matrixrow = matrix[k];
                    for ( var l = firstAvailCol; l < firstAvailCol + colSpan; l++ ) {
                        matrixrow[l] = 1;
                    }
                }
            }
        }
    };

    var fixRowIndexes = function(tbl) {
        var v = 0, i, k, r = ( tbl.tHead ) ? tbl.tHead.rows : 0;
        if ( r ) {
            for ( i = 0; i < r.length; i++ ) {
                r[i].realRIndex = v++;
            }
        }
        for ( k = 0; k < tbl.tBodies.length; k++ ) {
            r = tbl.tBodies[k].rows;
            if ( r ) {
                for ( i = 0; i < r.length; i++ ) {
                    r[i].realRIndex = v++;
                }
            }
        }
        r = ( tbl.tFoot ) ? tbl.tFoot.rows : 0;
        if ( r ) {
            for ( i = 0; i < r.length; i++ ) {
                r[i].realRIndex = v++;
            }
        }
    };

    var selectClass = 'selected';
    var noTrSelectClass = 'no-rowselector';

    $.fn.rowSelector = function() {
        return this.each(function() {
            var rowIndex = [], tbl = this, rCnt = 0;

            if ( !tbl.tBodies || !tbl.tBodies.length ) {
                return;
            }

            var addToIndex = function(rows, nodeName) {
                var c, row, rowI, cI, s;
                //loop through the rows
                for ( rowI = 0; rowI < rows.length; rowI++, rCnt++ ) {
                    row = rows[rowI];
                    //each cell
                    for ( cI = 0; cI < row.cells.length; cI++ ) {
                        c = row.cells[cI];
                        //add to rowindex
                        if ( nodeName == 'TBODY' ) {
                            s = c.rowSpan;
                            while ( --s >= 0 ) {
                                rowIndex[rCnt + s].push(c);
                            }
                        }

                        if ( nodeName == 'TBODY' ) {
                            c.tselect = true;
                        }
                    }
                }
            };

            var clickFunction = function(e) {
                var p = e.target;
                while ( p != this && p.tselect !== true ) {
                    p = p.parentNode;
                }
                if ($(p).hasClass(selectClass) || $(p).closest('tr').hasClass(noTrSelectClass)) {
                    return;
                }
                if ( p.tselect === true ) {
                    $(p).closest('TBODY').find('th.'+selectClass+',td.'+selectClass).removeClass(selectClass);
                    highlight(p);
                }
            };

            var highlight = function(cell) {
                //highlight columns
                var rH = [], rI;
                rI = cell.parentNode.realRIndex;
                if ( rowIndex[rI] ) {
                    rH = rH.concat(rowIndex[rI]);
                }
                $(rH).addClass(selectClass);
            };

            fixCellIndexes(tbl);
            fixRowIndexes(tbl);

            //init rowIndex
            for (var r = 0; r < tbl.rows.length; r++ ) {
                rowIndex[r] = [];
            }
            //add header cells to index
            if ( tbl.tHead ) {
                addToIndex(tbl.tHead.rows, 'THEAD');
            }
            //create index - loop through the bodies
            for (var r = 0; r < tbl.tBodies.length; r++ ) {
                addToIndex(tbl.tBodies[r].rows, 'TBODY');
            }
            //add footer cells to index
            if ( tbl.tFoot ) {
                addToIndex(tbl.tFoot.rows, 'TFOOT');
            }
            $(this).on('click', clickFunction);
        });
    };

    $.fn.unrowSelector = function() {
        return this.each(function() {
            $(this).off('click');
        });
    };
})(jQuery); 
