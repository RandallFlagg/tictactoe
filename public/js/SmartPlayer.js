var SmartPlayer = (function() {
    'use strict';

    var DELIMITER = '|';

    function SmartPlayer(opts) {
        new Player(opts);
        this.id = _.uniqueId('smart');
        this.algo = this.useMinimax ? new Minimax(opts) : new Q(opts);
    }

    SmartPlayer.prototype = new Player({
        'isComputer': true,
        'isSmart': true
    });

    _.extend(SmartPlayer.prototype, Backbone.Events, {

        start: function(opts) {
            Player.prototype.start.apply(this, arguments);
            this.algo.start(this.game);
        },

        onYouLose: function() {
            this.algo.trigger('reward_activity', 'lose');
            Player.prototype.onYouLose.apply(this, arguments);
        },

        onCat: function() {
            this.algo.trigger('reward_activity', 'cat');
            Player.prototype.onCat.apply(this, arguments);
        },

        bindEvents: function() {
            Player.prototype.bindEvents.apply(this, arguments);
            this.listenTo(this, 'clear_q', this.clearQ);
            this.listenTo(this, 'set_discover', this.setDiscover);
        },

        setDiscover: function(discover) {
            this.algo.trigger('set_discover', discover);
        },

        onToggleComputer: function() {},

        clearQ: function() {
            this.algo.trigger('clear');
        },

        pause: function() {
            this.algo.trigger('pause');
        },

        restart: function() {
            this.algo.trigger('restart');
        },

        setSymbol: function(symbol) {
            Player.prototype.setSymbol.apply(this, arguments);
            this.algo.setSymbol(symbol);
        },

        onYouWon: function() {
            this.algo.trigger('reward_activity', 'win');
            Player.prototype.onYouWon.apply(this, arguments);
        },

        play: function(board) {
            var options = _getOptions(board);
            var choice = this.algo.choose(board, options);
            this.trigger('select_square', choice.x, choice.y);
        }
    });


    /////////// helpers
    function _getOptions(board) {
        var options = [];
        var x = board[0].length;
        while (x--) {
            var y = board.length;
            while (y--) {
                if (!board[y][x]) {
                    options.push({
                        'x': x,
                        'y': y
                    });
                    break;
                }
            }
        }
        return options;
    }

    function _hashBoard(board, mySymbol) {
        // creating hashes of the board, to store as keys for the state info for Q
        // 0 = null, a = me, b = opponent
        return 'h_' + _.map(_.flatten(board), function(symbol) {
            if (!symbol) return 0;
            if (symbol === mySymbol) return 'a';
            return 'b';
        }).join('');
    }

    return SmartPlayer;
})();
