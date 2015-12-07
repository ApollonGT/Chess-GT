(function(){
    var app = angular.module("chess");
    var move = 1;

    function are_the_same(s1, s2)
    {
        return (s1.attr("data-row") == s2.attr("data-row") && s1.attr("data-column") == s2.attr("data-column"));
    }

    function are_opponents(s1, s2)
    {
        return s1.attr("id").charAt(0) != s2.attr("id").charAt(0);
    }

    function logMove(src, trgt)
    {
        var from = src.attr("data-column")+src.attr("data-row");
        var to = trgt.attr("data-column")+trgt.attr("data-row");

        $("#moves").prepend(move+". "+from+" - "+to+"<br/>");
        move++;
    }

    function moveItem(id, tr, tc)
    {
        $("#"+id).appendTo(".step[data-row='"+tr+"'][data-column='"+tc+"']");
    }

    var ctrlMain = function (s, web) {
        s.emptyBoard = function ()
        {
            move = 1;
            $("#moves").html("");

            $(".chess-set-item").appendTo("#chess-set-box");
        }

        s.saveBoard = function () {

        }

        s.resetBoard = function ()
        {
            move = 1;
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
            if ($(".chess-set-item.active").length > 0 && !are_the_same($(".chess-set-item.active").parent(), t) && t.html().length > 0) {
                logMove($(".chess-set-item.active").parent(), t);
                t.find(".chess-set-item").appendTo("#chess-set-box");
                moveItem($(".chess-set-item.active").attr("id"), t.attr("data-row"), t.attr("data-column"));
                $(".chess-set-item.active").removeClass("active");
            } else if ($(".chess-set-item.active").length > 0 && !are_the_same($(".chess-set-item.active").parent(), t)) {
                logMove($(".chess-set-item.active").parent(), t);
                moveItem($(".chess-set-item.active").attr("id"), t.attr("data-row"), t.attr("data-column"));
                $(".chess-set-item.active").removeClass("active");
            }
        }

        s.itemClick = function (e) {
            var t = $(e.target);

            if (t.hasClass("active")) {
                t.removeClass("active");
            } else if ($(".chess-set-item.active").length > 0 && are_opponents(t, $(".chess-set-item.active"))) {
                logMove($(".chess-set-item.active").parent(), t.parent());
                moveItem($(".chess-set-item.active").attr("id"), t.parent().attr("data-row"), t.parent().attr("data-column"));
                $(".chess-set-item.active").removeClass("active");
                t.appendTo("#chess-set-box");
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

        angular.element(document).ready(function(){
            s.resetBoard();
        })
    }

    app.controller("ctrlMain", ["$scope", "$http", ctrlMain]);
}());
