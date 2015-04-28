'use strict';

angular.module('protocols').controller('ProtocolsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Messenger', 'Protocols', 'Graph',
  function($scope, $stateParams, $location, Authentication, Messenger, Protocols, Graph) {
    $scope.authentication = Authentication;

    $scope.selected = {
      index: 0
    };

    $scope.init = function() {
      $scope.graphs = Graph.instances;
      Graph.empty({
        type: Graph.TYPE.PROCESSES,
        title: 'Protokol title'
      });
    };

    $scope.findOne = function() {
      $scope.protocol = Protocols.get({
        protocolId: $stateParams.protocolId
      });
    };

  }
]);