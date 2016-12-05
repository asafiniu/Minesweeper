(function(){
    Cell = function(x, y, value){
        var _x = x;
        var _y = y;
        var _value = value;
        var _uiElem = null;
        var _revealed = false;
        var _flagged = false;
        var _setValue = function(val){
            if ( !isNaN(val) ) {
                _value = val
            }

            return _value
        };

        return {
            x:_x,
            y:_y,
            isMine:function(){ return _value === -1 },
            setMine:function(){ return _setValue(-1) },
            isHint:function(){ return _value > 0 },
            setHint:function(value){ return _setValue(value) },
            isEmpty:function(){ return _value === 0 },
            setEmpty:function(){ return _setValue(0) },
            value:function(){ return _value },
            ui:function(elem){
                if ( elem ) {
                    _uiElem = elem
                }
                return _uiElem
            },
            reveal:function(){
                _revealed = true;
            },
            flag:function(){
                if ( !_revealed ) {
                    _flagged = true;
                }
            }
        }
    };

    Board = function(size, elem){
        var _size = size;
        var _boardElem = elem;
        var _boardCells = [];

        var init = function(func){
            // init board cells with zeros
            for (var x = 0; x < _size; x++) {
                _boardCells[x] = new Array(_size);
                for (var y = 0; y < _size; y++) {
                    _boardCells[x][y] = new Cell(x, y, 0)
                }
            }

            // plant mines
            var mines = Math.floor(Math.pow(_size, 2) / (_size - 1));
            while (mines > 0) {
                var x = Math.floor((Math.random() * 1000) + 1) % _size;
                var y = Math.floor((Math.random() * 1000) + 1) % _size;
                if ( x > 0 && y > 0 && !_boardCells[x][y].isMine()) {
                    _boardCells[x][y].setMine()
                    mines--
                }
            }

            // calculate hints
            for (var x = 0; x < _size; x++) {
                for (var y = 0; y < _size; y++) {
                    if (!_boardCells[x][y].isMine()) {
                        _boardCells[x][y].setHint(neighbors(x, y).filter(function(cell){ return cell.isMine() }).length);
                    }
                }
            }
        };

        var neighbors = function(x, y){
            var cells = [];
            if ( x - 1 > 0 ) {
                if ( y - 1 > 0 ) {
                    cells.push(_boardCells[x-1][y-1]) // upper-left
                }

                cells.push(_boardCells[x-1][y]); // left

                if ( y + 1 < _boardCells[x].length ) {
                    cells.push(_boardCells[x-1][y+1]) // lower-left
                }
            }

            if ( y - 1 > 0 ) {
                cells.push(_boardCells[x][y-1]) // down
            }

            if ( y + 1 < _boardCells[x].length ) {
                cells.push(_boardCells[x][y+1]) // up
            }

            if ( x + 1 < _boardCells.length ) {
                if ( y - 1 > 0 ) {
                    cells.push(_boardCells[x+1][y-1]) // upper-right
                }

                cells.push(_boardCells[x+1][y]); // right

                if ( y + 1 < _boardCells[x+1].length ) {
                    cells.push(_boardCells[x+1][y+1]) // lower-right
                }
            }

            return cells
        };

        var reveal = function(cell) {
            cell.reveal();
            if ( cell.isEmpty() ) {
                var more = neighbors(cell.x, cell.y).filter(function(cell){ return !cell.isMine() });
                for (var i = 0; i < more.length; i++) {
                    reveal(more[i]);
                }
            } else if ( cell.isMine() ) {
                stop("BOOM! You lose... a leg.")
            }
        };

        var draw = function(){
            for (var x = 0; x < _size; x++) {
                var row = document.createElement("div");
                row.id = x;
                row.className = "row";
                for (var y = 0; y < _size; y++) {
                    var dataCell = _boardCells[x][y];
                    var cell = document.createElement("div");
                    cell.className = "cell";
                    if (dataCell.isMine()) {
                        cell.className += " mine"
                    } else {
                        cell.className += " hint";
                        cell.val = dataCell.value();
                    }

                    cell.onclick = function(x, y){
                        reveal(_boardCells[x][y])
                    }.bind(cell, x, y);

                    dataCell.ui(cell);
                    row.appendChild(cell);
                }

                _boardElem.appendChild(row);
            }
        };

        var stop = function(result){
            alert(result)
        }

        return {
            start:init,
            stop:stop
        }
    };

    window.onload = function(e){
        var board = new Board(9, document.getElementById("board"));
        board.start()
    }
})();
