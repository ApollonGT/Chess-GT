(function(){
    var app = angular.module("chess");
    var move = 1;
    var moves_array = [];
    var game_started = false;

    function column_number(col) {
        if (col == 'a') {
            return 1;
        } else if (col == 'b') {
            return 2;
        } else if (col == 'c') {
            return 3;
        } else if (col == 'd') {
            return 4;
        } else if (col == 'e') {
            return 5;
        } else if (col == 'f') {
            return 6;
        } else if (col == 'g') {
            return 7;
        } else if (col == 'h') {
            return 8;
        }
        return 0;
    }

    function num_to_col(col) {
        if (col == 1) {
            return 'a';
        } else if (col == 2) {
            return 'b';
        } else if (col == 3) {
            return 'c';
        } else if (col == 4) {
            return 'd';
        } else if (col == 5) {
            return 'e';
        } else if (col == 6) {
            return 'f';
        } else if (col == 7) {
            return 'g';
        } else if (col == 8) {
            return 'h';
        }
        return '';
    }

    function are_the_same(s1, s2)
    {
        return (s1.attr("data-row") == s2.attr("data-row") && s1.attr("data-column") == s2.attr("data-column"));
    }

    function are_opponents(s1, s2)
    {
        return s1.attr("id").charAt(0) != s2.attr("id").charAt(0);
    }

    function is_empty(s)
    {
        return (s.html().length == 0);
    }

    function is_valid_move(id, tr, tcs, n)
    {
        var color = id.charAt(0);
        var type = id.charAt(1);
        var sr = $("#"+id).parent().attr("data-row");
        var scs = $("#"+id).parent().attr("data-column");
        var sc = column_number(scs);
        var tc = column_number(tcs);
        var source = $(".step[data-row='"+sr+"'][data-column='"+scs+"']");
        var target = $(".step[data-row='"+tr+"'][data-column='"+tcs+"']");
        var are_op = (!is_empty(target)) ? are_opponents(source.find("div"), target.find("div")) : false;
        //console.log("moving "+type+" from "+sc+", "+sr+" to "+tc+", "+tr);
        switch (type) {
            case 'p':
                var dir = (color == 'w') ? 1 : -1;
                if ( (is_empty(target) && Math.abs(tc - sc) == 0 &&
                      (tr - sr == dir || (sr == 2 && tr == 4) || (sr == 7 && tr == 5))) ||
                   (!is_empty(target) && are_op && tr - sr == dir && Math.abs(tc - sc) == 1) )
                {
                    n.clearAll();
                    return true;
                } else {
                    n.error({message: "<ul><li>A pawn moves straight forward one square, if that square is vacant. If it has not " +
                            "yet moved, a pawn also has the option of moving two squares straight forward, provided both " +
                            "squares are vacant. Pawns cannot move backwards</li>"+
                            "<li>Pawns are the only pieces that capture differently from how they move. A pawn can "+
                            "capture an enemy piece on either of the two squares diagonally in front of the pawn "+
                            "(but cannot move to those squares if they are vacant).</li>"+
                            "</ul>"+
                            "The pawn is also involved in the two special moves en passant and promotion."
                            , title: "Invalid Move"});
                }
                break;
            case 'n':
                if ( (is_empty(target) || (!is_empty(target) && are_op)) &&
                    ((Math.abs(tc - sc) == 1 && Math.abs(tr - sr) == 2) || (Math.abs(tc - sc) == 2 && Math.abs(tr - sr) == 1))) {
                    n.clearAll();
                    return true;
                } else {
                    n.error({title: "Invalid Move", message: "A knight moves to the nearest square not on the same rank, "+
                            "file, or diagonal. (This can be thought of as moving two squares horizontally then one "+
                            "square vertically, or moving one square horizontally then two squares vertically—i.e. in "+
                            ' an "L" pattern.) The knight is not blocked by other pieces: it jumps to the new location.'});
                }
                break;
            case 'b':
                var free_path = true;
                var istep = (Number(tc) - Number(sc) > 0) ? 1 : -1;
                var jstep = (Number(tr) - Number(sr) > 0) ? 1 : -1;
                var istart= Number(sc) + istep;
                var istop = Number(tc);
                var jstart = Number(sr) + jstep;
                var jstop = Number(tr);
                if (Number(tc) - Number(sc) == 0 || Number(tr) - Number(sr) == 0) {
                    n.error({title: "Invalid Move", message: "A bishop moves any number of vacant squares in any "+
                                                             "diagonal direction."});
                    return false;
                }
                for (i = istart, j = jstart; i != istop, j != jstop; i+=istep, j+=jstep) {
                    var chck = $(".step[data-row='"+j+"'][data-column='"+num_to_col(i)+"']");
                    if (!is_empty(chck)) {
                        free_path = false;
                    }
                }
                if ( (is_empty(target) || (!is_empty(target) && are_op)) && free_path &&
                    Math.abs(tc - sc) == Math.abs(tr - sr) ) {
                    n.clearAll();
                    return true;
                } else {
                    n.error({title: "Invalid Move", message: "A bishop moves any number of vacant squares in any "+
                            "diagonal direction."});
                }
                break;
            case 'r':
                var free_path = true;
                if (Number(tc) == Number(sc)) {
                    var istep = (Number(tr) - Number(sr) > 0) ? 1 : -1;
                    var istart= Number(sr) + istep;
                    var istop = Number(tr);
                    for (i = istart; i != istop; i+=istep) {
                        var chck = $(".step[data-row='"+i+"'][data-column='"+num_to_col(tc)+"']");
                        if (!is_empty(chck)) {
                            free_path = false;
                        }
                    }
                    if (free_path && (is_empty(target) || are_op)) {
                        n.clearAll();
                        return true;
                    } else {
                        n.error({title: "Invalid Move", message: "A rook moves any number of vacant squares in a horizontal"+
                                "or vertical direction. It also is moved when castling."});
                    }
                } else if (Number(tr) == Number(sr)) {
                    var istep = (Number(tc) - Number(sc) > 0) ? 1 : -1;
                    var istart= Number(sc) + istep;
                    var istop = Number(tc);
                    for (i = istart; i != istop; i+=istep) {
                        var chck = $(".step[data-row='"+tr+"'][data-column='"+num_to_col(i)+"']");
                        if (!is_empty(chck)) {
                            free_path = false;
                        }
                    }
                    if (free_path && (is_empty(target) || are_op)) {
                        n.clearAll();
                        return true;
                    } else {
                        n.error({title: "Invalid Move", message: "A rook moves any number of vacant squares in a horizontal"+
                                "or vertical direction. It also is moved when castling."});
                    }
                } else {
                    n.error({title: "Invalid Move", message: "A rook moves any number of vacant squares in a horizontal"+
                            "or vertical direction. It also is moved when castling."});
                }
                break;
            case 'k':
                if (Math.abs(Number(tr) - Number(sr)) <= 1 && Math.abs(Number(tc) - Number(sc)) <= 1 &&
                   (is_empty(target) || are_op)) {
                    n.clearAll();
                    return true;
                } else {
                    n.error({title: "Invalid Move", message: "The king moves exactly one square horizontally, "+
                            "vertically, or diagonally. A special move with the king known as castling is allowed only "+
                            "once per player, per game."});
                }
                break;
            case 'q':
                var free_path = true;
                if (Number(tc) == Number(sc)) {
                    var istep = (Number(tr) - Number(sr) > 0) ? 1 : -1;
                    var istart= Number(sr) + istep;
                    var istop = Number(tr);
                    for (i = istart; i != istop; i+=istep) {
                        var chck = $(".step[data-row='"+i+"'][data-column='"+num_to_col(tc)+"']");
                        if (!is_empty(chck)) {
                            free_path = false;
                        }
                    }
                    if (free_path && (is_empty(target) || are_op)) {
                        n.clearAll();
                        return true;
                    } else {
                        n.error({title: "Invalid Move", message: "The queen moves any number of vacant squares in a"+
                                "horizontal, vertical, or diagonal direction."});
                    }
                } else if (Number(tr) == Number(sr)) {
                    var istep = (Number(tc) - Number(sc) > 0) ? 1 : -1;
                    var istart= Number(sc) + istep;
                    var istop = Number(tc);
                    for (i = istart; i != istop; i+=istep) {
                        var chck = $(".step[data-row='"+tr+"'][data-column='"+num_to_col(i)+"']");
                        if (!is_empty(chck)) {
                            free_path = false;
                        }
                    }
                    if (free_path && (is_empty(target) || are_op)) {
                        n.clearAll();
                        return true;
                    } else {
                        n.error({title: "Invalid Move", message: "The queen moves any number of vacant squares in a"+
                                "horizontal, vertical, or diagonal direction."});
                    }
                } else {
                    var istep = (Number(tc) - Number(sc) > 0) ? 1 : -1;
                    var jstep = (Number(tr) - Number(sr) > 0) ? 1 : -1;
                    var istart= Number(sc) + istep;
                    var istop = Number(tc);
                    var jstart = Number(sr) + jstep;
                    var jstop = Number(tr);
                    if (Number(tc) - Number(sc) == 0 || Number(tr) - Number(sr) == 0) {
                        n.error({title: "Invalid Move", message: "The queen moves any number of vacant squares in a"+
                                "horizontal, vertical, or diagonal direction."});
                        return false;
                    }
                    for (i = istart, j = jstart; i != istop, j != jstop; i+=istep, j+=jstep) {
                        var chck = $(".step[data-row='"+j+"'][data-column='"+num_to_col(i)+"']");
                        if (!is_empty(chck)) {
                            free_path = false;
                        }
                    }
                    if ( (is_empty(target) || (!is_empty(target) && are_op)) && free_path &&
                        Math.abs(tc - sc) == Math.abs(tr - sr) ) {
                        n.clearAll();
                        return true;
                    } else {
                        n.error({title: "Invalid Move", message: "The queen moves any number of vacant squares in a"+
                                "horizontal, vertical, or diagonal direction."});
                    }
                }

                break;
        }
        return false;
    }

    function logMove(src, trgt)
    {
        var from = src.attr("data-column")+src.attr("data-row");
        var to = trgt.attr("data-column")+trgt.attr("data-row");

        moves_array.push(from+" - "+to);
        $("#moves").prepend(move+". "+from+" - "+to+"<br/>");
        move++;
    }

    function moveItem(id, tr, tc)
    {
        $("#"+id).appendTo(".step[data-row='"+tr+"'][data-column='"+tc+"']");
    }

    var ctrlMain = function (s, web, t, n) {
        s.emptyBoard = function ()
        {
            move = 1;
            $("#moves").html("");

            $(".chess-set-item").appendTo("#chess-set-box");
        }

        s.saveBoardFun = function (callback) {
            var gm = {
                name: s.game_name,
                moves: moves_array
            };

            web.post("/save", gm).then(function(response){
		game_started = true;
                if (callback) {
                    callback();
                }
            });
        }

        s.saveBoard = function() {
            s.saveBoardFun(function() {
		    n.success({ message: "Game Saved!", delay: 1000});
            });
        }

        s.loadBoardFun = function (callback) {
            if (s.game_name && s.game_name.length == 0) {
                return 0;
            }
            var gm = {
                name: s.game_name
            };
            web.post("/load", gm).then(function(response){
                if (response.data[0]) {
                    s.resetBoard();
                    var saved_moves = response.data[0].moves;
                    angular.forEach(saved_moves, function (move, index) {
                        s.playMove(move);
                    });
                    if (callback) callback(1);
                } else {
                    if (callback) callback(0);
                }
            });
        }

        s.loadBoard = function () {
            s.loadBoardFun(function(res){
            	if (res == 1) {
		    game_started = true;
                    n.success({ message: "Game Loaded!", delay: 1000});
                } else {
                    n.error({title: "Invalid Game Name", message: "Game not found", delay: 1000});
                }
            });
        }

        s.deleteBoard = function() {
            if (s.game_name && s.game_name.length == 0) {
                return 0;
            }
            var gm = {
                name: s.game_name
            };
            web.post("/delete", gm).then(function(response){
                if (response.data.res) {
                    s.resetBoard();
                    n.success({ message: "Game Deleted!", delay: 1000});
                } else {
                    n.error({title: "Invalid Game Name", message: "Game not found", delay: 1000});
                }
            });
        }

        s.resetBoard = function ()
        {
            move = 1;
            moves_array = [];
            game_started = false;
            $("#moves").html("");

            moveItem("bp1", 7, "a");
            moveItem("bp2", 7, "b");
            moveItem("bp3", 7, "c");
            moveItem("bp4", 7, "d");
            moveItem("bp5", 7, "e");
            moveItem("bp6", 7, "f");
            moveItem("bp7", 7, "g");
            moveItem("bp8", 7, "h");

            moveItem("br1", 8, "a");
            moveItem("br2", 8, "h");

            moveItem("bb1", 8, "c");
            moveItem("bb2", 8, "f");

            moveItem("bn1", 8, "b");
            moveItem("bn2", 8, "g");

            moveItem("bk", 8, "e");
            moveItem("bq", 8, "d");

            moveItem("wp1", 2, "a");
            moveItem("wp2", 2, "b");
            moveItem("wp3", 2, "c");
            moveItem("wp4", 2, "d");
            moveItem("wp5", 2, "e");
            moveItem("wp6", 2, "f");
            moveItem("wp7", 2, "g");
            moveItem("wp8", 2, "h");

            moveItem("wr1", 1, "a");
            moveItem("wr2", 1, "h");

            moveItem("wb1", 1, "c");
            moveItem("wb2", 1, "f");

            moveItem("wn1", 1, "b");
            moveItem("wn2", 1, "g");

            moveItem("wk", 1, "e");
            moveItem("wq", 1, "d");
        }

        s.stepMouseOver = function (e) {
            var row = $(e.target).attr("data-row");
            var column = $(e.target).attr("data-column");

            $(".index[data-row='"+row+"']").addClass("highlight-index");
            $(".index div[data-column='"+column+"']").addClass("highlight-index");
        }

        s.stepMouseLeave = function (e) {
            var row = $(e.target).attr("data-row");
            var column = $(e.target).attr("data-column");

            $(".index[data-row='"+row+"']").removeClass("highlight-index");
            $(".index div[data-column='"+column+"']").removeClass("highlight-index");
        }

        s.stepClick = function (e) {
            var t = $(e.target);
            if (!t.hasClass("step")) {
                return;
            }
            if ($(".chess-set-item.active").length > 0 && !are_the_same($(".chess-set-item.active").parent(), t) &&
                !is_empty(t) && are_opponents(t.find(".chess-set-item"), $(".chess-set-item.active"))) {
                if (is_valid_move($(".chess-set-item.active").attr("id"), t.attr("data-row"), t.attr("data-column"), n)) {
                    logMove($(".chess-set-item.active").parent(), t);
                    t.find(".chess-set-item").appendTo("#chess-set-box");
                    moveItem($(".chess-set-item.active").attr("id"), t.attr("data-row"), t.attr("data-column"));
                    if (s.game_name && s.game_name.length > 0) {
                        s.saveBoardFun(false);
                    }
                }
                $(".chess-set-item.active").removeClass("active");
            } else if ($(".chess-set-item.active").length > 0 && !are_the_same($(".chess-set-item.active").parent(), t)) {
                if (is_valid_move($(".chess-set-item.active").attr("id"), t.attr("data-row"), t.attr("data-column"), n)) {
                    logMove($(".chess-set-item.active").parent(), t);
                    moveItem($(".chess-set-item.active").attr("id"), t.attr("data-row"), t.attr("data-column"));
                    if (s.game_name && s.game_name.length > 0) {
                        s.saveBoardFun(false);
                    }
                }
                $(".chess-set-item.active").removeClass("active");
            }
        }

        s.itemClick = function (e) {
            var t = $(e.target);

            if (t.hasClass("active")) {
                t.removeClass("active");
            } else if ($(".chess-set-item.active").length > 0 && are_opponents(t, $(".chess-set-item.active"))) {
                if (is_valid_move($(".chess-set-item.active").attr("id"), t.parent().attr("data-row"), t.parent().attr("data-column"), n)) {
                    logMove($(".chess-set-item.active").parent(), t.parent());
                    moveItem($(".chess-set-item.active").attr("id"), t.parent().attr("data-row"), t.parent().attr("data-column"));
                    t.appendTo("#chess-set-box");
                    if (s.game_name && s.game_name.length > 0) {
                        s.saveBoardFun(false);
                    }
                }
                $(".chess-set-item.active").removeClass("active");
            } else {
                $(".chess-set-item.active").removeClass("active");
                t.addClass("active");
            }
        }

        s.playMove = function(m)
        {
            var mvs = m.split(" - ");
            var id = $(".step[data-row='"+mvs[0].charAt(1)+"'][data-column='"+mvs[0].charAt(0)+"']").find("div").attr("id");
            logMove($(".step[data-row='"+mvs[0].charAt(1)+"'][data-column='"+mvs[0].charAt(0)+"']"), $(".step[data-row='"+mvs[1].charAt(1)+"'][data-column='"+mvs[1].charAt(0)+"']"));
            moveItem(id, mvs[1].charAt(1), mvs[1].charAt(0));
        }

        t(function() { 
             if (game_started) {
                 s.loadBoardFun(function(res) {
		     if (res) {
                         game_started = true;
                     }
                 });
             }
          }, 5000); 

        angular.element(document).ready(function(){
            s.resetBoard();
        })
    }

    app.controller("ctrlMain", ["$scope", "$http", "$interval", "Notification", ctrlMain]);
}());
