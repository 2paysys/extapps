define(['angularAMD', 'services', 'notificationAAMD'], function (angularAMD) {
    angularAMD.controller('main_ctrl', ['$scope', 'setting', 'Notification', '$log', function ($scope, setting, Notification, $log) {
        setting.initialize($scope);
        $scope.read = setting.read;
        $scope.save = setting.save;
        $log.log('main_ctrl.data', $scope.data);
    	
        $scope.$watchGroup(['data.transactionId','data.amount'], function () {
			setting.calcHash();
		});
        
        $scope.loadScript = function () {
            if ($scope.data.appId) {
                $scope.data.jsUrl = setting.getJsUrl();
            }
        };
        
        $scope.$on('loadScriptEvent', function (event, status) {
            $log.log('loadScriptEvent value: ', status);
        	if (status==='loading') {
                $scope.data.sessionId = undefined;
                Notification.showMessage('loading');
            } else if (status==='failed') {
                Notification.showMessage('Loading of 2pay-session-id failed.', 'error');
            } else {
                $log.log('Clear message');
                Notification.clearMessage();
            }
        });
        
        $scope.$on('watchChangeEvent', function (event, value) {
            $log.log('watchChangeEvent value: ', value);
            setting.setSessionId(value);
        });
        
        // Load the sessionId
        $scope.loadScript();
        
        
    }]);
});
