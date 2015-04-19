!function () {
	var app = angular.module('cbapp', []);

	app.controller('callback_ctrl', function ($scope, $location, $log) {
		
		var data = $location.search();
		$log.log('location: ', data);

		$scope.transactionId = data['transaction-id'];
		$scope.status = data.status;
		$scope.orderId = data['2pay-order-id'];
		$scope.validationHash = data['validation-hash'];

	});


}();