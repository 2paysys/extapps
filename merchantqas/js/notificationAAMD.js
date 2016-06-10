define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.service('Notification', ['$log', function ($log) {
        var privCb;

        this.register = function (cb) {
            privCb = cb
        };

        this.showMessage = function (message, type) {
            if (privCb) {
                privCb(message, type);
            }
        };

        this.clearMessage = function () {
            if (privCb) {
                privCb();
            }
        };

    }]);

    angularAMD.directive('notificationArea', function () {
        return {
            restrict: 'E',
            scope: {},
            controller: ['$scope', 'Notification', '$timeout', function ($scope, Notification, $timeout) {

                /**
                 * Show the popup message.  `type` can be:
                 * - info
                 * - warning
                 * - error
                 *
                 * If `info` or `warning` used, the message will auto-clear in 2 secs.
                 * `error` will have to be cleared manually.
                 *
                 * @param message
                 * @param type
                 */
                var dissmissTimer,
                    delayTimer;
                function showMessage(message, type) {

                    var className,
                        iconName,
                        showDismiss,
                        autoDismiss,
                        delayStart,
                        showSpinner;

                    if (message==='loading' && typeof type==='undefined') {
                        message = "";
                        type = "loading";
                    }

                    if (type==='error') {
                        className = 'alert-danger';
                        iconName = 'glyphicon-exclamation-sign';
                        showDismiss = true;
                    } else if (type==='warn') {
                        className = 'alert-warning';
                        iconName = 'glyphicon-exclamation-sign';
                        showDismiss = true;
                        autoDismiss = 3000;
                    } else if (type==='loading') {
                        className = 'alert-info';
                        iconName = 'glyphicon-time';
                        showSpinner = true;
                        delayStart = 500;
                        message = message || "Loading";
                    } else {
                        className = 'alert-success';
                        iconName = 'glyphicon-info-sign';
                        showDismiss = true;
                        autoDismiss = 2000;
                    }

                    // Only show if message is set
                    function setMessage(fs) {
                    	$scope.fs = fs;
                        delayTimer = undefined;
                        if (autoDismiss) {
                            dissmissTimer = $timeout(function () {
                                $scope.close();
                            }, autoDismiss);
                        }
                    }
                    
                    if (message) {
                        var fs = {
                            message: message,
                            className: className,
                            iconName: iconName,
                            showDismiss: showDismiss,
                            showSpinner: showSpinner
                        };
                        
                        // Make sure there are no other delayTimer already set
                        if (delayTimer) {
                            $timeout.cancel(delayTimer);
                        }
                        
                        if (delayStart) {
                            delayTimer = $timeout(function () {
                            	setMessage(fs);
                            }, delayStart);
                        } else {
                        	setMessage(fs);
                        }
                    } else {
                        if (delayTimer) {
                        	$timeout.cancel(delayTimer);
                            delayTimer = undefined;
                        } else {
                            $scope.fs = undefined;
                        }
                    }
                }

                Notification.register(showMessage);

                $scope.close = function () {
                    $scope.fs = undefined;
                    if (dissmissTimer) {
                        $timeout.cancel(dissmissTimer);
                        dissmissTimer = undefined;
                    }
                }

            }],
            templateUrl: 'views/directive/notification.html'
        };
    });
});
