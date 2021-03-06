(function(){
    var app = angular.module("chess", ['ui-notification', 'ngStorage'])
    .config(function(NotificationProvider) {
        NotificationProvider.setOptions({
            delay: 20000,
            startTop: 20,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'left',
            positionY: 'top',
            replaceMessage: true
        });
    });
}());
