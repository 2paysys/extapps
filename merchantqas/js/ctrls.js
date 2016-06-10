define(['angularAMD', 'setting', 'notificationAAMD'], function (angularAMD) {
    angularAMD.controller('main_ctrl', ['$scope', 'Setting', 'Notification', '$sce','$log', function ($scope, Setting, Notification, $sce, $log) {
        // Handle sessionId change event from watchChange directive
        $scope.$on('watchChangeEvent', function (event, value) {
            $log.log('watchChangeEvent value: ', value);
            Setting.setSessionId(value);
        });
        
        // Handle load sessionId event from loadScript directive
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

        // Initialize the setting that will load the data and bind the save/read method to $scope
        Setting.initialize($scope);
        
        // Load the sessionId
        $scope.loadScript = function () {
            if ($scope.data.appId) {
                $scope.data.jsUrl = Setting.getJsUrl();
            }
        };
        $scope.loadScript();
        
        // Watch for changes in variable needed by validation hash
        $scope.$watchGroup(['data.transactionId','data.amount'], function () {
			Setting.calcValidationHash();
		});
        
        // Cart Management
        $scope.addCartItem = function () {
        	$scope.data.cartContent.push({});
        };
        $scope.delCartItem = function (index) {
        	$scope.data.cartContent.splice(index, 1);
        };
        
        // On Submit
        $scope.onSubmit = function () {
        	$scope.formAction = $sce.trustAsResourceUrl(Setting.getPostUrl());
            $scope.cartContentJSON = JSON.stringify($scope.data.cartContent);
        };
        
    }]);
});
