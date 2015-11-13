define(['angularAMD', 'setting'], function (angularAMD) {
    angularAMD.controller('callback_ctrl', ['$scope', 'Setting', '$http', '$location', '$log', function ($scope, Setting, $http, $location, $log) {

        var data = $location.search(),
            stored = {};
        Setting.initialize(stored);

        $log.log('location: ', data);
        $log.log('stored: ', stored);

        $scope.transactionId = data['transaction-id'];
        $scope.status = data.status;
        $scope.orderId = data['2pay-order-id'];
        $scope.validationHash = data['validation-hash'];
        $scope.confirmHash = data['confirm-hash'];

        if (stored.data) {
            if ($scope.orderId) {
                $scope.showValidation = true;
            }

            // Validate hashes
            var appId = stored.data.appId,
                secretKey = stored.data.secretKey,
                innerHash = Setting.calcHash($scope.orderId, secretKey),
                validationHash = Setting.calcHash($scope.transactionId, innerHash, secretKey),
                innerConfirm = Setting.calcHash($scope.orderId, secretKey, $scope.status),
                confirmHash = Setting.calcHash($scope.transactionId, innerConfirm, secretKey)
            ;

            $log.log('innerHash: ' + innerHash);
            $log.log('validationHash: ' + validationHash);
            $log.log('innerConfirm: ' + innerConfirm);
            $log.log('confirmHash: ' + confirmHash);

            if ($scope.confirmHash) {
                $scope.confirmHashValid = (confirmHash.substring(0, $scope.confirmHash.length) === $scope.confirmHash);
            }
            if ($scope.validationHashValid) {
                $scope.validationHashValid = (validationHash.substring(0, $scope.validationHash.length) === $scope.validationHash);
            }

            // Get the order_id status
            var inst = stored.data.inst,
                hostAddress = stored.insts[inst].hostAddress,
                orderCheckHash = Setting.calcHash(appId, $scope.orderId, secretKey),
                url = hostAddress + '/ext/1/payapi/orderdoc/' + $scope.orderId
            ;

            $http.jsonp(url).then(function (result) {
                $log.log("Data: " + result.data);
            });
        }

    }]);
});