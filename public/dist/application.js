'use strict';

var ApplicationConfiguration = (function() {

	var 
	applicationModuleName = 'lpa',
	applicationModuleVendorDependencies = [
		'ngResource', 
		'ngAnimate', 
		'ngSanitize', 
		'ui.router', 
		'ui.bootstrap', 
		'ui.utils',
		'pascalprecht.translate',
		'ui.select',
		'angulartics',
		'angulartics.google.analytics'
	],

	registerModule = function(moduleName, dependencies) {

		angular.module(moduleName, dependencies || []);

		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
	
})();
'use strict';

angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('core');

'use strict';

ApplicationConfiguration.registerModule('protocols');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

angular.module('core').config(['$analyticsProvider',
	function ($analyticsProvider) {
  		// turn off automatic tracking
  		$analyticsProvider.virtualPageviews(false);
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').config(['$translateProvider', function($translateProvider) {
	$translateProvider.useStaticFilesLoader({
		prefix: 'i18n/locale-',
		suffix: '.json'
	});
	$translateProvider.preferredLanguage('si_SL');

  $translateProvider.useSanitizeValueStrategy('escaped');
}]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', '$translate',
	function($scope, $state, Authentication, Menus, $translate) {
		$scope.$state = $state;
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};
		
		$scope.toggleLanguage = function () {
		    $translate.use(($translate.use() === 'en_EN') ? 'si_SL' : 'en_EN');
  		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {

		$scope.authentication = Authentication;

    $scope.init = function () {
      $scope.slides = [{
        image: 'modules/core/img/brand/lpa-logo.png'
      }, {
        image: 'modules/core/img/pgss/procesi.jpg',
        text: 'Procesi'
      }, {
        image: 'modules/core/img/pgss/fsm.jpg',
        text: 'Final State Machine'
      }, {
        image: 'modules/core/img/pgss/tree-procesi.jpg',
        text: 'Analiza'
      }, {
        image: 'modules/core/img/pgss/tree-send.jpg',
        text: 'Sending messages'
      }, {
        image: 'modules/core/img/pgss/tree-receive.jpg',
        text: 'Receiving messages'
      }, {
        image: 'modules/core/img/pgss/tree-local.jpg',
        text: 'Local messages'
      }, {
        image: 'modules/core/img/pgss/tree-ns.jpg',
        text: 'Nedefiniran sprejem'
      }, {
        image: 'modules/core/img/pgss/tree-pv.jpg',
        text: 'Polna vrsta'
      }, {
        image: 'modules/core/img/pgss/tree-cikel.jpg',
        text: 'Cikle'
      }];
    };
  
	}
]);
'use strict';

angular.module('core').directive('panelDraggable', ["$document", function($document) {
  return {
    restrict: 'C',
    link: function(scope, element, attr) {
      var
      startX = 0, 
      startY = 0, 
      x = 0, 
      y = 0;
    
      function mousemove(e) {
        y = e.screenY - startY;
        x = e.screenX - startX;
        element.css({
          top: y + 'px',
          left: x + 'px'
        });
      }

      function mouseup(e) {
        y = element.css('top').replace('px', '') * 1;
        x = element.css('left').replace('px', '') * 1;
        y = y < 0 ? 0 : y;
        x = x < 0 ? 0 : x;
        element.css({
          top: y + 'px',
          left: x + 'px'
        });
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }

      element.find('.panel-heading').on('mousedown', function(e) {
        e.preventDefault();
        y = element.css('top').replace('px', '') * 1;
        x = element.css('left').replace('px', '') * 1;
        startX = e.screenX - x;
        startY = e.screenY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

    }
  };
}]);
'use strict';

angular.module('core').directive('lpaTitle', [

	function() {
		return {
			restrict: 'E',
			transclude : true,
			scope: {
				code: '@',
			},
			templateUrl: 'modules/core/directives/views/title.client.view.html'
		};
	}

]);
'use strict';

angular.module('core').factory('d3', function() {
  return d3;
});
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemState, isPublic, roles, menuItemType, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				state: menuItemState || menuItemURL,
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemState, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						state: menuItemState || menuItemURL,
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar', true);
	}
]);
'use strict';

angular.module('core').service('Messenger', ['$filter',
	function($filter) {
		
		Messenger.options = {
    	extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    	theme: 'future'
		};

		var _messenger = new Messenger(),
    
    message = function(msg) {
      var args = Array.prototype.slice.call(arguments, 1);

      msg = $filter('translate')(msg || 'NO_MESSAGE');

      return msg.replace(/{(\d+)}/g, function(m, n) {
        return typeof args[n] !== 'undefined' ? args[n] : m;
      });
    };
    
		this.post = function(msg, type) {
			_messenger.post({
  				message: message(msg, Array.prototype.slice.call(arguments, 2)),
  				type: type || 'error',
  				showCloseButton: true
			});	
		};
	}
]);
'use strict';

angular.module('protocols').run(['Menus',
  function(Menus) {
    Menus.addMenuItem('topbar', 'PROTOCOLS_LIST', 'protocols', 'listProtocols');
    Menus.addMenuItem('topbar', 'PROTOCOLS_NEW', 'protocols/create', 'createProtocol', false);
  }
]);
'use strict';

angular.module('protocols').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.
    state('listProtocols', {
      url: '/protocols',
      templateUrl: 'modules/protocols/views/list-protocols.client.view.html'
    }).
    state('createProtocol', {
      url: '/protocols/create',
      templateUrl: 'modules/protocols/views/create-protocol.client.view.html'
    }).
    state('viewProtocol', {
      url: '/protocols/:protocolId',
      templateUrl: 'modules/protocols/views/view-protocol.client.view.html'
    }).
    state('forkProtocol', {
      url: '/protocols/:protocolId/fork',
      templateUrl: 'modules/protocols/views/edit-protocol.client.view.html'
    });
  }
]);
'use strict';

angular.module('protocols').controller('ProtocolsController', ['$scope', '$stateParams', '$location', '$timeout', '$filter', '$modal', 'Authentication', 'Protocols', 'Graph', 'Actions', 'Messenger', '$analytics',
  function($scope, $stateParams, $location, $timeout, $filter, $modal, Authentication, Protocols, Graph, Actions, Messenger, $analytics) {

    $scope.authentication = Authentication;

    $scope.selected = {
      index: 0
    };

    $scope.actions = Actions;
    
    $scope.$watch(function() {
      return Actions.nodeSettings;
    }, function() {
      $scope.nodeSettings = Actions.nodeSettings;
      if($scope.nodeSettings.node && $scope.nodeSettings.node.rebuild) {
        $scope.nodeSettings.node.rebuild();
      }
    }, true);

    $scope.$watch(function() {
      return Actions.linkSettings;
    }, function() {
      $scope.linkSettings = Actions.linkSettings;
      if($scope.linkSettings.link && $scope.linkSettings.link.rebuild) {
        $scope.linkSettings.link.rebuild();
      }
    }, true);
    
    $scope.openSettings = function() {

      var modalInstance = $modal.open({
        templateUrl: 'modules/protocols/views/modals/create-protocol.client.modal.html',
        controller: 'ProtocolsModalController',
        resolve: {
          protocol: function () {
            return $scope.protocol;
          }
        }
      });
      
      modalInstance.result.then(function (protocol) {
        $scope.protocol = protocol;
      }, function () {
        if(!$scope.protocol || !$scope.protocol.title) {
          Messenger.post('NO_PROTOCOL_TITLE', 'error');
        }
      });

    };

    $scope.saveProtocol = function() {

      if(!$scope.protocol || !$scope.protocol.title) {
        Messenger.post('NO_PROTOCOL_TITLE', 'error');
        return;
      }

      var protocol = new Protocols({
        title: $scope.protocol.title,
        processes: {},
        finalstatemachines: [],
      });

      Graph.instances.forEach(function(instance) {
        var graph = instance.data();
        if (graph.type === Graph.TYPE.PROCESSES) {
          protocol.processes = graph;
        } else {
          protocol.finalstatemachines.push(graph);  
        }
      });

      protocol.$save(function(response) {
        $location.path('protocols/' + response._id);
      }, function(errorResponse) {
        Messenger.post(errorResponse.data.message, 'error');
      });

    };
    
    $scope.import = function(fileInput) {   
      var 
      file = fileInput.files && fileInput.files.length > 0 && fileInput.files[0],
      callback = function(protocol) {
        var errors = 0;
        
        if (protocol.finalstatemachines === undefined) {
          Messenger.post('IMPORT_ERR_FSM', 'error');
          errors += 1;
        }

        if (protocol.processes === undefined) {
          Messenger.post('IMPORT_ERR_PROCESSES', 'error');
          errors += 1;
        }

        if (errors > 0) {
          return false;
        }
        $scope.graphs = [];
        Graph.destroy();
        $scope.$apply();

        $scope.protocol = protocol;
        $scope.graphs = protocol.finalstatemachines || [];
        $scope.graphs.unshift(protocol.processes);

        $scope.$apply();

        $timeout(function() {
          $scope.graphs = Graph.instances;  
        }, 0);

        return true;
      };

      if (file && file.type === 'application/json') {
        Messenger.post('IMPORT_FILE_SUCCESS', 'success', file.name);
        var readFile = new FileReader();
        readFile.onload = function(e) { 
          try {
            if (callback(JSON.parse(e.target.result))) {
              Messenger.post('IMPORT_FILE_PARSE_SUCCESS', 'success', file.name);
            }
          } catch (error) {
            Messenger.post('IMPORT_FILE_PARSE_ERROR', 'error', error.toLocaleString());
          }
        };
        readFile.readAsText(file);
      } else {
        Messenger.post('IMPORT_FILE_ERROR', 'error', file && file.name);
      }

      angular.element(fileInput).val('');
    };

    $scope.export = function($event) {
      var protocol = {
        title: $scope.protocol.title,
        processes: {},
        finalstatemachines: [],
      };

      Graph.instances.forEach(function(instance) {
        var graph = instance.data();
        if (graph.type === Graph.TYPE.PROCESSES) {
          protocol.processes = graph;
        } else {
          protocol.finalstatemachines.push(graph);  
        }
      });

      angular.element($event.target)
        .attr('download', protocol.title + '.json')
        .attr('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(protocol)));
    };

    $scope.exportSvg = function($event) {
      var url, source,
      svg = angular.element.find('svg:visible');

      svg = angular.element(svg).clone();

      // za analizo
      if(angular.element(svg).find('rect.overlay').remove().length > 0) {
        var minX = 0, maxX = 0, maxY = 0;
        angular.element(svg).find('g.node').each(function (i, node) { 
          var tmp = angular.element(node).attr('transform').split(/[^\-0-9.]{1,}/);
          tmp[1] = parseFloat(tmp[1]);
          tmp[2] = parseFloat(tmp[2]);
          if (tmp[1] < minX) {
            minX = tmp[1];
          }
          if (tmp[1] > maxX) {
            maxX = tmp[1];
          }
          if (tmp[2] > maxY) {
            maxY = tmp[2];
          }
        });
        angular.element(svg)
          .attr('width', maxX - minX + 300)
          .attr('height', maxY + 200)
          .children('g')
          .attr('transform', 'translate(' + (minX * -1 + 150) + ', 50)')
          .children('g')
          .attr('transform', '');
      }

      source = new XMLSerializer().serializeToString(svg[0]);

      if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
      
      url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);

      angular.element($event.target)
        .attr('download', $scope.protocol.title + '.svg')
        .attr('href', url);
    };

    $scope.create = function() {
      
      $scope.openSettings();

      Graph.destroy();
      $scope.graphs = Graph.instances;

      angular.forEach(Graph.LINK_TYPE, function(value, key) {
        if(key !== 'UNKNOWN') {
          this.push({
           id: key,
           text: value 
          });
        }
      }, $scope.linkTypes = []);
      
      Graph.empty({
        type: Graph.TYPE.PROCESSES,
        title: $filter('translate')('PROCESS_LIST'),
      });

      $analytics.eventTrack('lpa.protocols.create', { category: 'protocols', label: 'Create' });
    };

    $scope.delete = function(protocolId) {
      $scope.protocol = Protocols.delete({
        protocolId: protocolId || $stateParams.protocolId
      }, function (protocol) {
        var index;
        $scope.protocols.forEach(function (protocol_, index_) {
          if (protocol._id === protocol_._id) {
            index = index_;
          }
        });
        $scope.protocols.splice(index, 1);
      }, function (error) {
        Messenger.post(error.data.message, 'error');
      });
      $analytics.eventTrack('lpa.protocols.view', { category: 'protocols', label: 'Delete' });
    };

    $scope.view = function() {
      Graph.destroy();

      $scope.protocol = Protocols.get({
        protocolId: $stateParams.protocolId
      });
      $analytics.eventTrack('lpa.protocols.view', { category: 'protocols', label: 'View' });
    };

    $scope.edit = function() {
      
      Graph.destroy();

      Protocols.get({
        protocolId: $stateParams.protocolId
      }, function(protocol) {
        $scope.protocol = protocol;
        $scope.graphs = protocol.finalstatemachines || [];
        $scope.graphs.unshift(protocol.processes);
        $timeout(function() {
          $scope.graphs = Graph.instances;  
        }, 0);
      });
      
      angular.forEach(Graph.LINK_TYPE, function(value, key) {
        if(key !== 'UNKNOWN') {
          this.push({
           id: key,
           text: value 
          });
        }
      }, $scope.linkTypes = []);

      $analytics.eventTrack('lpa.protocols.edit', { category: 'protocols', label: 'Edit' });
    };

    $scope.list = function() {
      $scope.protocols = Protocols.query();
      $analytics.eventTrack('lpa.protocols.list', { category: 'protocols', label: 'List' });
    };

    $scope.analyze = function(protocol) {
      $scope.alerts = [];
      
      if (!protocol) {
        $scope.alerts.push({ 
          type: 'danger', 
          msg: 'No protocol defined.' 
        });
      } else if (!protocol.title) {
        $scope.alerts.push({ 
          type: 'danger', 
          msg: 'No protocol title defined.' 
        });
      } else if (!protocol.processes || !protocol.finalstatemachines ){
        protocol.processes = {};
        protocol.finalstatemachines = [];

        Graph.instances.forEach(function(instance) {
          var graph = instance.data();
          if (graph.type === Graph.TYPE.PROCESSES) {
            protocol.processes = graph;
          } else {
            protocol.finalstatemachines.push(graph);  
          }
        });
      }
      $scope.p = protocol;

      $scope.startAnalyze = ($scope.startAnalyze && ++$scope.startAnalyze) || 1;
    };

  }
]);
'use strict';

angular.module('protocols').controller('ProtocolsModalController', ["$scope", "$modalInstance", "protocol", function($scope, $modalInstance, protocol) {

  $scope.protocol = protocol;
  
  $scope.save = function () {
    if($scope.protocol && $scope.protocol.title && $scope.protocol.title.length > 3) {
      $modalInstance.close($scope.protocol);
    } else {
      $scope.error = 'PROTOCOL_TITLE_ERR';
    }
    
  };

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };

}]);
'use strict';

angular.module('protocols').directive('analysis', function() {
  return {
    restrict: 'E',
    scope: {
      protocol: '=',
      analyze: '='
    },
    templateUrl: 'modules/protocols/directives/views/analysis.client.directive.view.html',
    controller: ['$scope', 'Analysis', function($scope, Analysis) {
      
      $scope.analysis = Analysis;

      $scope.$watch(function() {
        return $scope.analyze;
      }, function(analyze) {
        if(analyze) {
          $scope.analysis.drawTree($scope.protocol);
        }
      });

      $scope.isFullScreen = false;
      $scope.fullScreen = function ($event) {
        angular.element($event.target)
          .parents('.tab-pane.active')
          .toggleClass('full-screen');
        $scope.isFullScreen = !$scope.isFullScreen;
      };

    }],
    link: function($scope, elm, attrs) {
      $scope.analysis.init(elm[0].querySelector('.tree-content'));
    }
  };
});
'use strict';

angular.module('protocols').directive('graph', [
  
  function() {
    return {
      restrict: 'E',
      scope: {
        graphData: '=',
        edit: '='
      },
      templateUrl: 'modules/protocols/directives/views/graph.client.directive.view.html',
      controller: ['$scope', 'Graph', function($scope, Graph) {
        
        $scope.graph = new Graph.instance();
        
        $scope.gravity = true;
        $scope.toggleGravity = function() {
          $scope.gravity = !$scope.graph.toggleGravity();
        };

        $scope.nodeType = Graph.NODE_TYPE[$scope.graphData.type];

      }],
      link: function($scope, elm, attrs) {
        if($scope.graphData && $scope.graphData.$promise) {
          $scope.graphData.$promise.then(function(graphData) {
            if(graphData) {
              $scope.graph.init(elm[0].querySelector('.graph-content'), graphData.processes);
            }
          });  
        } else {
          $scope.graph.init(elm[0].querySelector('.graph-content'), $scope.graphData);
        }
      }
    };
  }
]);
'use strict';

angular.module('protocols').directive('protocol', [ 
  function() {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'modules/protocols/directives/views/protocol.client.directive.view.html'
    };
  }
]);
'use strict';

angular.module('protocols')

.filter('processFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        if (item.values && item.values.type === 'PROCESSES') {
          item.values.data.nodes.forEach(function (node) {
            if(props && props.parentNodeId && node.nodeId !== props.parentNodeId) {
              out.push(node);
            }
          });
        }
      });
    } else {
      out = items;
    }

    return out;
  };
})

.filter('processName', ['Graph', function(Graph) {
  return function(item) {
    var name;
    if (typeof item === 'string') {
      Graph.instances.forEach(function(graph) {
        if (graph.values && graph.values.type === 'PROCESSES') {
          graph.values.data.nodes.forEach(function(node) {
            if (node.nodeId === item) {
              name = node.title;  
            }
          });
        }
      });
    } else if (!item) {
      name = '_';
    } else {
      name = item.label;
    }
    return name;
  };
}])

.filter('linkTypeName', ['Graph', function(Graph) {
  return function(item) {
    if (typeof item === 'string') {
      return Graph.LINK_TYPE[item];
    } else {
      return item && item.text;
    }
  };
}]);


'use strict';

angular.module('protocols').service('Actions', ['$timeout', 'Messenger',
  function($timeout, Messenger) {
    
    this.nodeSettings = {
      visible: false
    };
    
    this.linkSettings = {
      visible: false
    };

    this.showNodeSettings = function(options) {
      var this_ = this;

      options = options || {};
      options.visible = true;
      
      $timeout(function() {
        this_.nodeSettings = options;
      }, 0);
    };

    this.hideNodeSettings = function() {
      var this_ = this;
      $timeout(function() {
        this_.nodeSettings.visible = false;
      }, 0);
    };

    this.showLinkSettings = function(options) {
      var this_ = this;

      options = options || {};
      options.visible = true;
      
      $timeout(function() {
        this_.linkSettings = options;
      }, 0);
    };

    this.hideLinkSettings = function() {
      var this_ = this;
      $timeout(function() {
        this_.linkSettings.visible = false;
      }, 0);
    };
  }
]);

'use strict';

angular.module('protocols').factory('Analysis', ['d3', '$window', 'Graph', 'Messenger',
  function(d3, $window, Graph, Messenger) {

    var 

    graph = {
      svg: null,
      overlay: null,
      tree: null,
      treeSvg: null,
      protocol: null,
      root: null,
      diagonal: null,
      nodesCount: 0,
      normalNodesCount: 0,
      error: false
    },

    element = null,

    node = {
      procNum: 0,
      size: 30
    },
    
    duration = 500,

    NODE_TYPE = {
      QUEUE_FULL: 'QUEUE_FULL',
      UNDEFINED_RECEIVE: 'UNDEFINED_RECEIVE',
      REPEATING: 'REPEATING',
      NORMAL: 'NORMAL'
    };

    function resize() {
      var 
      w = angular.element('.container > section').prop('offsetWidth'),
      h = 2000;

      graph.tree.size([w, h]);

      graph.treeSvg
        .attr('width', w)
        .attr('height', h);

      graph.overlay
        .attr('width', w)
        .attr('height', h);
    }

    function click(node_) {
      if (node_.children) {
        node_._children = node_.children;
        node_.children = null;
      } else if(node_._children) {
        node_.children = node_._children;
        node_._children = null;   
      }
      update(node_);
    }

    function creatTextNode(d3node, value) {
      d3node.selectAll('g')
        .data([value])
        .enter()
        .append('svg:g')
        .attr('class', 'text-tree-node')
        .attr('text-anchor', 'middle')
        .each(function (d) {

          d3.select(this)
            .append('svg:circle')
            .attr('stroke', '#333')
            .attr('fill', '#fff')
            .attr('stroke-width', '2px')
            .attr('r', 22)
            .attr('cx', '2px')
            .attr('cy', '22px');

          d3.select(this)
            .append('svg:text')
            .attr('font-family', 'sans-serif')
            .attr('font-size', '14px')
            .attr('dx', '2px')
            .attr('dy', '28px')
            .text(d);    
        });
    }
    
    function createNode(d3node, node_) {

      node_.grid = {
        data: [],
        item: {
          size: node.size,
          startX: node.procNum * node.size / -2,
          startY: 0,
          step: node.size
        }
      };
      node_.grid.item.posX = node_.grid.item.startX;
      node_.grid.item.posY = node_.grid.item.startY;

      for (var i = 0; i < node.procNum * node.procNum; i++) {

        if (Math.floor(i / node.procNum) === i % node.procNum) {
          node_.value = node_.processes[i % node.procNum].currrentFsmNode.label;
          node_.process = node_.processes[i % node.procNum].label;
        } else {
          node_.value = node_.processes[i % node.procNum].queue[node_.processes[Math.floor(i / node.procNum)]._id].values.join(', ');
          node_.process = null;
        }

        node_.grid.data.push({ 
          time: i, 
          value: node_.value,
          process: node_.process,
          width: node_.grid.item.size,
          height: node_.grid.item.size,
          x: node_.grid.item.posX,
          y: node_.grid.item.posY,
          count: i + 1
        });

        node_.grid.item.posY += node_.grid.item.step;
        if((i + 1) % node.procNum === 0) {
          node_.grid.item.posY = node_.grid.item.startY;
          node_.grid.item.posX += node_.grid.item.step;
        }
      }

      d3node.selectAll('g')
        .data(node_.grid.data)
        .enter()
        .append('svg:g')
        .attr('text-anchor', 'middle')
        .each(function (d) {
          
          d3.select(this)
            .append('svg:rect')
            .attr('class', 'cell')
            .attr('fill', '#fff')
            .attr('stroke', '#333')
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; })
            .attr('width', function(d) { return d.width; })
            .attr('height', function(d) { return d.height; });

          d3.select(this)
            .append('svg:text')           
            .attr('x', function(d) { return d.x + d.width / 2; })
            .attr('y', function(d) { return d.y; })
            .attr('dy', '20px')
            .text(function(d) { return d.value || ''; });

          d3.select(this)
            .append('svg:text')
            .attr('class', 'process')
            .attr('text-anchor', 'start')
            .attr('fill', '#A7A7A7')
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; })
            .attr('dy', '28px')
            .attr('dx', '2px')
            .text(function(d) { return d.process || ''; });
        });
    }

    function update(source) {

      graph.tree.nodeSize([
        node.size * source.processes.length + 30,
        node.size * source.processes.length + 130
      ]);
      
      var 
      nodes = graph.tree.nodes(graph.root).reverse(),
      links = graph.tree.links(nodes);

      nodes.forEach(function(d) { d.y = d.depth * 150; });

      var 
      node_ = graph.svg.selectAll('g.node')
        .data(nodes, function(d) { return d.id; });

      node_.enter().append('g')
        .attr('class', 'node')
        .attr('width', function () { return node.procNum * node.size; })
        .attr('height', function () { return node.procNum * node.size; })
        .attr('transform', function (d) { return 'translate(' + source.x0 + ',' + source.y0 + ')'; })
        .each(function (d) {

          switch(d.typeId) {
            case NODE_TYPE.QUEUE_FULL:
              creatTextNode(d3.select(this), 'PV');
              break;
            case NODE_TYPE.UNDEFINED_RECEIVE:
              creatTextNode(d3.select(this), 'NS');
              break;
            case NODE_TYPE.REPEATING:
              creatTextNode(d3.select(this), getTreeNode(d.repeatingNodeId).normalNodeId);
              break;
            default:
              createNode(d3.select(this), d);

              d3.select(this)
                .append('svg:text')
                .attr('x', function () { return (node.procNum * node.size) / -2; })
                .attr('dy', '-5px')
                .text(function(d) { return getTreeNode(d.id).normalNodeId; });

              d3.select(this)
                .on('click', click);
          }

          d3.select(this)
            .append('svg:text')
            .attr('dx', '10px')
            .attr('dy', '-5px')
            .text(function(d) { return d.action; });

        });
  
      node_
        .transition()
        .duration(duration)
        .attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')'; 
        });

      node_
        .exit()
        .transition()
        .duration(duration)
        .attr('transform', function(d) {
          return 'translate(' + source.x + ',' + source.y+ ')'; 
        })
        .remove();

      var 
      link = graph.svg.selectAll('path.tree-link')
        .data(links, function(d) { return d.target.id; });

      link.enter().insert('path', 'g')
        .attr('class', 'tree-link')
        .attr('fill', 'none')
        .attr('stroke', '#333')
        .attr('stroke-width', '2px')
        .attr('d', function(d) {
          var o = {
            x: source.x0, 
            y: source.y0
          };
          return graph.diagonal({
            source: o, 
            target: o
          });
        });

      link
        .transition()
        .duration(duration)
        .attr('d', graph.diagonal);

      link
        .exit()
        .transition()
        .duration(duration)
        .attr('d', function(d) {
          var o = {
            x: source.x,
            y: source.y
          };
          return graph.diagonal({
            source: o, 
            target: o
          });
        })
        .remove();

      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function getProcessFsmNodes(process) {
      var fsmNodes = [];
      graph.protocol.processes.nodes.forEach(function(process) {
        graph.protocol.finalstatemachines.forEach(function(fsm) {
          if (process.nodeId === fsm.parentNodeId) {
            fsmNodes = fsm.nodes;
          }
        });
      });
      return fsmNodes;
    }
    
    function getProcessFsmLinks(process) {
      var fsmLinks = [];
      graph.protocol.finalstatemachines.forEach(function(fsm) {
        if (process.nodeId === fsm.parentNodeId) {
          fsmLinks = fsm.links;
        }
      });
      return fsmLinks;
    }
    
    function getParentTreeProcess(parentTreeNode, processId) {
      var parent;
      parentTreeNode.processes.forEach(function (process) {
        if (process.nodeId === processId) {
          parent = process;
        }
      });
      return parent;
    }

    function getProcess(processId) {
      var process_;
      graph.protocol.processes.nodes.forEach(function(process) {
        if (process.nodeId === processId) {
            process_ = process;
        }
      });
      return process_;
    }

    function addToQueue(parentTreeNode, targetProcessId, sourceProcess, msg) {
      var isAdded = false;
      graph.protocol.processes.nodes.forEach(function(processNode) {
        if (processNode.nodeId === targetProcessId && processNode.queue[sourceProcess._id].values.length < processNode.queue[sourceProcess._id].length) {
          processNode.queue[sourceProcess._id].values.push(msg);
          isAdded = true;
        }
      });

      return isAdded;
    }

    function removeFromQueue(parentTreeNode, sourceProcess, targetProcess, msg) {
      var isRemoved = false;

      graph.protocol.processes.nodes.forEach(function(processNode) {
        if (processNode.nodeId === sourceProcess.nodeId) {
          var index = processNode.queue[targetProcess._id].values.indexOf(msg);
          if (index >= 0) {
            processNode.queue[targetProcess._id].values.splice(index, 1);
            isRemoved = true;
          }
        }
      });
      
      return isRemoved;
    }

    function transformFsmNode(node_) {
      return {
        nodeId: node_.nodeId,
        label: node_.label
      };
    }
    
    function transformProcessNode(process) {
      var tmp_  = {
        nodeId: process.nodeId,
        label: process.label,
        _id: process._id,
        currrentFsmNode: transformFsmNode(process.currrentFsmNode),
        queue: {}
      };
      graph.protocol.processes.nodes.forEach(function (process_) {
        if (process !== process_) {
          tmp_.queue[process_._id] = {
            values: process.queue[process_._id].values.slice(),
            length: process.queue[process_._id].length
          };
        }
      });
      return tmp_;
    }

    function compareTreeNodes(node1, node2) {
      var count = 0;
      if (node1.typeId === NODE_TYPE.NORMAL && node2.typeId === NODE_TYPE.NORMAL) {
        node1.processes.forEach(function(p1) {
          node2.processes.forEach(function(p2) {
            if (p1.nodeId === p2.nodeId && angular.equals(p1.queue, p2.queue) &&
              p1.currrentFsmNode.nodeId === p2.currrentFsmNode.nodeId) {
              count++;
            }
          });
        });
      }
      return node1.processes.length === node2.processes.length && node1.processes.length === count;
    }

    function isTreeNodeExists(currentTreeNode, treeNode) {
      var index = -1;
      if (compareTreeNodes(currentTreeNode, treeNode)) {
        index = currentTreeNode.id;
      } else if (currentTreeNode.children && currentTreeNode.children.length > 0) {
        for (var i = 0; i < currentTreeNode.children.length; i++) {
          if((index = isTreeNodeExists(currentTreeNode.children[i], treeNode)) > 0) {
            break; 
          }
        }
      }
      return index;
    }

    function createTreeNode(options) {
      options = options || {};
      
      var treeNode =  {
        id: ++graph.nodesCount - 1,
        processes: [],
        typeId: options.typeId || NODE_TYPE.NORMAL,
        action: options.action || '',
        level: options.level
      };

      graph.protocol.processes.nodes.forEach(function(process) {
        treeNode.processes.push(transformProcessNode(process));
      });

      if (graph.root && (treeNode.repeatingNodeId = isTreeNodeExists(graph.root, treeNode)) >= 0) {
        treeNode.typeId = NODE_TYPE.REPEATING;
      }

      if (treeNode.typeId === NODE_TYPE.NORMAL) {
        treeNode.normalNodeId =  ++graph.normalNodesCount - 1;
      }

      return treeNode;
    }

    function addChildNode(parentTreeNode, options) {
      parentTreeNode.children = parentTreeNode.children || [];

      parentTreeNode.children.push(createTreeNode(options));
    }

    
    function treeNodes(parent, node, childs) {
      if (!parent) return;
      node(parent);
      childs(parent).forEach(function (child) {
        treeNodes(child, node, childs);
      });
    }

    function getTreeNodes(level, typeId) {
      var nodes = [];
      treeNodes(graph.root, function(node) {
        if (node.level === level && node.typeId === typeId) {
          nodes.push(node);
        }
      }, function(d) {
        return d.children && d.children.length > 0 ? d.children : [];
      });
      return nodes;
    }
    
    function getTreeNode(id) {
      var node;
      treeNodes(graph.root, function(node_) {
        if (node_.id === id) {
          node = node_;
        }
      }, function(d) {
        return d.children && d.children.length > 0 ? d.children : (d._children && d._children.length > 0 ? d._children : []);
      });
      return node;
    }

    function researchLevel(parentTreeNode, level, isLast) {

      graph.protocol.processes.nodes.forEach(function (sourceProcess) {

        getProcessFsmLinks(sourceProcess).forEach(function(link) {
  
          sourceProcess.currrentFsmNode = getParentTreeProcess(parentTreeNode, sourceProcess.nodeId).currrentFsmNode;
          
          if (sourceProcess.currrentFsmNode.nodeId === link.source.nodeId) {

            var 
            targetProcess = link.processId && getProcess(link.processId) || {},
            action = sourceProcess.label + ': ' + Graph.LINK_TYPE[link.typeId] + link.name + (link.processId && ('(' + targetProcess.label + ')') || '');

            graph.protocol.processes.nodes.forEach(function (process_) {
              var parent  = getParentTreeProcess(parentTreeNode, process_.nodeId);
              process_.currrentFsmNode = parent.currrentFsmNode;
              process_.queue = {};
              graph.protocol.processes.nodes.forEach(function (process2_) {
                if (process_ !== process2_) {
                  process_.queue[process2_._id] = {
                    values: parent.queue[process2_._id].values.slice(),
                    length: parent.queue[process2_._id].length
                  };
                }
              });
            });

            switch(link.typeId) {
              case 'SEND':
                // damo v queue od procesa na linku (npr. B-ju)
                if (addToQueue(parentTreeNode, link.processId, sourceProcess, link.name)) {
                  sourceProcess.currrentFsmNode = link.target;
                  addChildNode(parentTreeNode, {
                    action: action,
                    level: level
                  });
                } else {
                  addChildNode(parentTreeNode, {
                    typeId: NODE_TYPE.QUEUE_FULL,
                    action: action,
                    level: level
                  });
                }
                break;
              case 'RECEIVE':
                // ko smo na B-ju ne sprejmemo od A-ja ampak od B-ja (ker smo prej sem poslali)
                if (removeFromQueue(parentTreeNode, sourceProcess, targetProcess, link.name)) {
                  sourceProcess.currrentFsmNode = link.target;
                  addChildNode(parentTreeNode, {
                    action: action,
                    level: level
                  });
                } else if (getParentTreeProcess(parentTreeNode, sourceProcess.nodeId).queue[targetProcess._id].values.length > 0) {
                  addChildNode(parentTreeNode, {
                    typeId: NODE_TYPE.UNDEFINED_RECEIVE,
                    action: action,
                    level: level
                  });
                }
                break;
              case 'LOCAL':
                sourceProcess.currrentFsmNode = link.target;
                addChildNode(parentTreeNode, {
                  action: action,
                  level: level
                });
                break;
            }
          }
        });
      });
      
      if (isLast) {
        var children = getTreeNodes(level, NODE_TYPE.NORMAL);
        children.forEach(function (treeChildNode, index) {
          if (treeChildNode.typeId === NODE_TYPE.NORMAL) {
            researchLevel(treeChildNode, level + 1, index === children.length - 1);
          }
        });
      }
    }

    function collapseAllNodes() {
      graph.svg.selectAll('g.node').each(function(d, i) {
        var 
        data = d3.select(this).data(),
        onClickFunc = d3.select(this).on('click');
        if (onClickFunc && d3.select(this).data()[0].children) {
          onClickFunc.apply(this, [d, i]);  
        }
      });  
    }

    function drawGraph(protocol) {
      
      graph.protocol = protocol;
      graph.error = false;
      graph.nodesCount = 0;
      graph.normalNodesCount = 0;
      graph.root = null;

      if(!graph.protocol) {
        Messenger.post('NO_PROTOCOL_TO_ANALYZE', 'error');
        return;
      }
      if(graph.protocol.processes && graph.protocol.processes.nodes && graph.protocol.processes.nodes.length) {
        node.procNum = graph.protocol.processes.nodes.length;
      } else {
        Messenger.post('PROTOCOL_HAS_NO_PROCESSES', 'error');
        return;
      }

      // init current process state and queues
      graph.protocol.processes.nodes.forEach(function(process, index) {
        graph.protocol.finalstatemachines.forEach(function(fsm) {
          if (process.nodeId === fsm.parentNodeId) {
            fsm.nodes.forEach(function(node_) {
              if (node_.type === 'START_STATE') {
                process.currrentFsmNode = transformFsmNode(node_);
              }
            });
          }
        });
        if(!process.currrentFsmNode) {
          Messenger.post('MISSING_START_STATE', 'error', process.label);
          graph.error = true;
        }

        // processes.length - 1 == number of queues
        process.queue = {};
        graph.protocol.processes.nodes.forEach(function(process_) {
          if(process !== process_) {
            process.queue[process_._id] = {
              length: process.queueLength,
              values: []
            };  
          }
        });          
        
      });

      if(graph.error) {
        return;
      }

      resize();

      graph.root = createTreeNode();      
      graph.root.x0 = graph.treeSvg.attr('width') / 2;
      graph.root.y0 = 0;
      
      researchLevel(graph.root, 0, true);

      update(graph.root);
    }

    function init(element_) {
      var
      width =  5000,
      height = 1000;

      element = element_;

      graph.tree = d3.layout.tree()
        .size([width, height]);

      graph.diagonal = d3.svg.diagonal()
        .source(function(d) { return { x: d.source.x, y: ( d.source.y + node.procNum * node.size )}; })            
        .target(function(d) { return { x: d.target.x, y: d.target.y }; })
        .projection(function(d) { return [d.x, d.y]; });

      graph.treeSvg = d3.select(element_).append('svg')
        .attr('width', width)
        .attr('height', height);

      graph.svg = graph.treeSvg
        .append('g')
        .attr('transform', 'translate(0, 50)')
        .call(d3.behavior.zoom().scaleExtent([-1, 8]).on('zoom', function () {
          graph.svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
        }));

      graph.overlay = graph.svg.append('rect')
        .attr('class', 'overlay')
        .attr('fill', 'none')
        .attr('width', width)
        .attr('height', height);

      graph.svg = graph.svg.append('g');

      angular.element($window).bind('resize', resize);
    }

    return {
      init: init,
      drawTree: drawGraph,
      collapseAllNodes: collapseAllNodes
    };
  }
]);

'use strict';

angular.module('protocols').factory('Graph', ['$filter', 'd3', 'Messenger', 'Actions',
  function($filter, d3, Messenger, Actions) {

    var 
    graphs = [],
    graphsCount = 0,

    isGravityZero = false,

    radius = d3.scale.sqrt().range([0, 6]),
    
    LINKDISTANCE = 250,
    
    SETTINGS_MARGIN = 10,

    PROC_LABEL_TRANSLATOR = 'PABC'.split(''),
    FSM_LABEL_TRANSLATOR = 'xyz'.split(''),
    LABEL_TRANSLATOR = 'abcdefghijklmn'.split(''),

    GRAPH = {
      TYPE: {
        PROCESSES: 'PROCESSES',
        FINAL_STATE_MACHINE: 'FINAL_STATE_MACHINE'
      },
      NODES: {
        PROCESSES: 'PROCESS',
        FINAL_STATE_MACHINE: 'ACCEPT_STATE'
      }
    },

    LINKS = {
      TYPE: {
        UNKNOWN: '_',
        RECEIVE: '+',
        SEND: '-',
        LOCAL: '#'
      }
    },

    NODES = {
      TYPE: {
        PROCESS: 'PROCESS',
        START_STATE: 'START_STATE',
        ACCEPT_STATE: 'ACCEPT_STATE'
      },
      SIZE: {
        PROCESS: 14,
        START_STATE: 12,
        ACCEPT_STATE: 12
      },
      COLOR: {
        PROCESS: '#DDD',
        START_STATE: '#DDD',
        ACCEPT_STATE: '#DDD'
      },
      STROKE_WIDTH: {
        PROCESS: 1,
        START_STATE: 2,
        ACCEPT_STATE: 1,
        SELECTED: 3
      },
      STROKE: {
        PROCESS: '#000',
        START_STATE: '#F00',
        ACCEPT_STATE: '#000',
        SELECTED: '#337ab7',
      }
    };

    function nodeData(node) {
      return node[0][0].parentNode.__data__;
    }

    function random(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    function label(i, type) {
      var label_ = '';
      if(angular.isNumber(i)) {
        angular.forEach(i.toString().replace('-', '').split(''), function(value) {
          value = parseInt(value);
          if(type === GRAPH.TYPE.PROCESSES) {
            label_ += PROC_LABEL_TRANSLATOR[value % PROC_LABEL_TRANSLATOR.length];
          } else if(type === GRAPH.TYPE.FINAL_STATE_MACHINE) {
            label_ += FSM_LABEL_TRANSLATOR[value % FSM_LABEL_TRANSLATOR.length];
          } else {
            label_ += LABEL_TRANSLATOR[value % LABEL_TRANSLATOR.length];
          }
        });
      } else {
        label_ = i;
      }
      return label_;
    }
  
    function uid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    }   

    function Graph() {
      this.values = {

        type: null,
        title: null,
        parentNodeId: null,

        force: null,
        
        svg: {
          nodes: [],
          links: [],
          selected: {
            node: null,
            link: null
          },
          start: {
            node: null
          }
        },
        data: {
          nodes: [],
          links: [],
          start: {
            node: null
          }
        }
      };
      if(graphsCount > graphs.length) {
        graphs[graphs.length - 1] = this;
      } else {
        graphs.push(this);  
        graphsCount++;
      }
      
    }

    Graph.prototype.data = function() {
      return {
        title: this.values.title,
        type: this.values.type,
        parentNodeId: this.values.parentNodeId,
        nodes: this.values.data.nodes,
        links: this.values.data.links
      };
    };

    Graph.prototype.build = function() {

      var this_ = this,

      nodeClicked = function(node) {
        if (this_.values.svg.selected.node) {
          this_.values.svg.selected.node
            //.style('filter', '');
            .style('stroke-width', function(d) { return NODES.STROKE_WIDTH[d.type]; })
            .style('stroke', function(d) { return NODES.STROKE[d.type]; });
        }

        if (!this_.values.svg.selected.node || 
          this_.values.svg.selected.node.data()[0].nodeId !== d3.select(this).data()[0].nodeId) {
          
          this_.values.svg.selected.node = d3.select(this)
            .select('circle')
            .style('stroke-width', function(d) { return NODES.STROKE_WIDTH.SELECTED; })
            .style('stroke', function(d) { return NODES.STROKE.SELECTED; });
            //.style('filter', 'url(#selected-element)');

        } else {
          this_.values.svg.selected.node = null;
        }
      },

      nodeDblClicked = function(node) {
        Actions.showNodeSettings({
          style: {
            top: 80,
            left:100
          },
          node: node,
          graph: this_.data()
        });

        this_.temp = this_.temp || {};
        this_.temp.currentNode = d3.select(this);
      },

      linkClicked = function(link) {
        if (this_.values.svg.selected.link) {
          this_.values.svg.selected.link.style('filter', '');
        }

        this_.values.svg.selected.link = d3.select(this)
          .select('line')
          .style('filter', 'url(#selected-element)');
      },

      labelClick = function (link) {
        Actions.showLinkSettings({
          style: {
            top: 80,
            left:10
          },
          link: link,
          graph: this_.data()
        });
        this_.temp = this_.temp || {};
        this_.temp.currentLink = d3.select(this);
      };

      //NODES
      this_.values.svg.nodes = this_.values.svg.nodes
        .data(this_.values.force.nodes(), function(d) { 
          return d.nodeId; 
        });

      this_.values.svg.nodes.enter().append('svg:g').attr('class', 'node').each(function(d) {

        d3.select(this)
          .append('svg:circle')
          .attr('class', function(d) { return 'node ' + d.nodeId; })
          .attr('r', function(d) { return radius(NODES.SIZE[d.type]); })
          .style('stroke-width', function(d) { return NODES.STROKE_WIDTH[d.type]; })
          .style('stroke', function(d) { return NODES.STROKE[d.type]; })
          .style('fill', function(d) { return NODES.COLOR[d.type]; });

        d3.select(this)
          .append('svg:text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('font-family', 'sans-serif')
          .attr('font-size', '10px')
          .text(function(d, i) { return d.label || i; }); 
      
        d3.select(this)
          .on('click', nodeClicked)
          .on('dblclick', nodeDblClicked);

        d3.select(this)
          .call(this_.values.force.drag);
      });

      this_.values.svg.nodes.exit()
        .remove();

       // LINKS
      this_.values.svg.links = this_.values.svg.links
        .data(this_.values.force.links(), function(d) { 
          return d.source.nodeId + '-' + d.target.nodeId + '-' + (d.linkNum || 1); 
        });

      this_.values.svg.links.enter().insert('svg:g',':first-child').attr('class', 'link').each(function(d) {
        
        d3.select(this)
          .append('svg:path')
          .attr('class', 'link')
          .attr('fill', 'none')
          .attr('stroke', '#666')
          .attr('stroke-width', '3px')
          .attr('id', function(d) { return 'link-' + d.source.nodeId + '-' + d.target.nodeId + '-' + (d.linkNum || 1); })
          .attr('marker-end', this_.values.type === GRAPH.TYPE.PROCESSES ? '' : 'url(#link-arrow)');

        d3.select(this)
          .append('svg:text')
          .attr('class', 'linklabel')
          .attr('dx', LINKDISTANCE / 2)
          .attr('dy', '-10')
          .attr('text-anchor', 'middle')
          .attr('font-size', '15px')
          .attr('fill', '#333')
          .append('svg:textPath')
            .on('dblclick', labelClick)
            .attr('xlink:href', function(d) { return '#link-' + d.source.nodeId + '-' + d.target.nodeId + '-' + (d.linkNum || 1); })
            .text(function(d) { return d.label(); });       
      });

      this_.values.svg.links.exit()
        .remove();

      // START  
      this_.values.force.start();
    };

    Graph.prototype.nodeLinks = function(nodeId_) {
      var links = [];
      this.values.data.links.forEach(function(link) {
        if (link.source.nodeId === nodeId_ || link.target.nodeId === nodeId_) {
          links.push(link);
        }
      });
      return links;
    };
    
    Graph.prototype.addLink = function (options) {
      options = options || {};

      var
      this_ = this,

      addLink = function(source, target, options) {
        options = options || {};
        var linkNum = 1;

        this_.values.data.links.forEach(function(link) {
          if(link.source === source && link.target === target) {
            linkNum += 1;
          }
        });
        if(source === target) {
          linkNum = linkNum * -1;
        }
        this_.values.data.links.push({
          source: source, 
          target: target,
          typeId: options.typeId || 'UNKNOWN',
          linkNum: linkNum,
          name: options.name || label(linkNum),
          processId: options.processId,
          label: function() {
            var label_ = '';
            if (this.source.type === NODES.TYPE.PROCESS && this.target.type === NODES.TYPE.PROCESS) {
              label_ = processById(this.source.nodeId).queueLength + '/' + processById(this.source.nodeId).queueLength;
            } else if (this.typeId === 'LOCAL') {
              label_ = LINKS.TYPE[this.typeId] + this.name;
            } else {
              label_ = LINKS.TYPE[this.typeId] + this.name + '(' + (processById(this.processId).label || '_') + ')';
            }
            return label_;
          },
          rebuild: function() {
            this_.temp = this_.temp || {};
            this_.temp.currentLink
              .text(function(d) { return d.label(); });
          }
        });
        this_.build();
      };
      
      this_.temp = this_.temp || {};

      if(!this_.values.svg.selected.node && !options.targetNode && !this_.temp.sourceNode) {
        Messenger.post('Select source node and click add link.', 'info');
        return;
      } else if(this_.temp.sourceNode && this_.values.svg.selected.node || options.sourceNode) {
        if(options.targetNode) {
          addLink(options.sourceNode, options.targetNode, options);
        } else {
          addLink(nodeData(this_.temp.sourceNode), nodeData(this_.values.svg.selected.node));  
          Messenger.post('Link added.', 'success');
        }
        this_.temp.sourceNode = null;
      } else {
        if (this_.values.svg.selected.node) {
          this_.temp.sourceNode = this_.values.svg.selected.node;
        }
        Messenger.post('Select target node and click add link.', 'info');
      }
    };

    Graph.prototype.addNode = function (type, options) {
      if (!type) {
        Messenger.post('No type selected!', 'error');
        return;
      }
      
      options = options || {};

      var
      this_ = this,

      nodeLabel = label(this_.values.data.nodes.length + 1, this_.values.type),

      node = {
        nodeId: options.nodeId || uid(),
        label: options.label || nodeLabel,
        size: options.size || NODES.SIZE[type],
        type: options.type || NODES.TYPE[type],
        isStart: (options.type || NODES.TYPE[type]) === NODES.TYPE.START_STATE,
        queueLength: options.queueLength || 1,
        rebuild: function() {
          this_.temp = this_.temp || {};

          this_.temp.currentNode
            .select('text')
            .text(function(d, i) { return d.label || i; });

          if(node && node.type === NODES.TYPE.PROCESS) {
            updateGraphTitle(node.nodeId, node.label);
          }
        }
      };

      if(this_.values.type === GRAPH.TYPE.PROCESSES && !options.type) {
        createNewGraph({
          type: GRAPH.TYPE.FINAL_STATE_MACHINE,
          title: nodeLabel,
          parentNodeId: node.nodeId
        });  
      } else if(this_.values.type === GRAPH.TYPE.FINAL_STATE_MACHINE) {
        node.setStartState = function() {
          if(this_.values.svg.start.node && this_.values.data.start.node) {
            this_.values.svg.start.node
              .style('stroke-width', function(d) { return NODES.STROKE_WIDTH.ACCEPT_STATE; })
              .style('stroke', function(d) { return NODES.STROKE.ACCEPT_STATE; });
            this_.values.data.start.node.type = NODES.TYPE.ACCEPT_STATE;
            this_.values.data.start.node.isStart = false;
          }

          this_.values.svg.start.node = this_.temp.currentNode.select('circle');
          this_.values.data.start.node = node;
          
          if(!node.isStart) {
            this_.values.svg.start.node
              .style('stroke-width', function(d) { return NODES.STROKE_WIDTH.START_STATE; })
              .style('stroke', function(d) { return NODES.STROKE.START_STATE; });
            this_.values.data.start.node.type = NODES.TYPE.START_STATE;
          }
        };
      }
      
      this_.values.data.nodes.push(node);

      if(this_.values.svg.selected.node) {  
        node.x = nodeData(this_.values.svg.selected.node).x + random(-15, 15);
        node.y = nodeData(this_.values.svg.selected.node).y + random(-15, 15);
        this_.addLink({
          sourceNode: nodeData(this_.values.svg.selected.node),
          targetNode: node
        });
      } else {
        this_.build();
      }
    };

    Graph.prototype.removeNode = function () {
      var this_ = this;
      if (!this_.values.svg.selected.node) {
        Messenger.post('NO_SELECTED_NODE', 'error');
        return;
      }
      var 
      nodeId_ = nodeData(this_.values.svg.selected.node).nodeId,
      nodeIndex,
      nodeLinksIndexes = [];
      this_.values.data.nodes.forEach(function(node, index) {
        if(node.nodeId === nodeId_) {
          nodeIndex = index;
        }
      });

      this_.values.data.nodes.splice(nodeIndex, 1);
      
      this_.values.data.links.forEach(function(link, index) { 
        this_.nodeLinks(nodeId_).forEach(function(nodeLink) {  
          if(nodeLink === link) {
            nodeLinksIndexes.push(index);
          }
        });
      });
      nodeLinksIndexes
        .sort(function(a, b) { return b - a; })
        .forEach(function(linkIndex) {
          this_.values.data.links.splice(linkIndex, 1);
        });

      removeGraph(nodeIndex + 1);
      this_.values.svg.selected.node = null;
      this_.build();
    };
    
    Graph.prototype.toggleGravity = function(element, options) {
      if(isGravityZero) {
        this.values.force.gravity(0.1);
      } else {
        this.values.force.gravity(0);
      }
      return (isGravityZero = !isGravityZero);
    };

    Graph.prototype.init = function(element, options) {
      options = options || {};
      
      var 
      this_ = this,
      
      svg = d3.select(element).append('svg')
        .attr('width', '100%')
        .attr('height', '100%'),
      
      defs = svg.append('svg:defs'),

      filter, 
      feMerge,
      
      tick = function () {
        this_.values.svg.nodes.attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')'; 
        });

        this_.values.svg.links.selectAll('path').attr('d', function(d) {
          var
          sx = d.source.x,
          sy = d.source.y,
          tx = d.target.x,
          ty = d.target.y,
          dx = tx - sx,
          dy = ty - sy,
          dr = Math.sqrt(dx * dx + dy * dy),
          drx = dr,
          dry = dr,
          xRotation = 0,
          largeArc = 0,
          sweep = 1;

          if(d.linkNum < 0) {
            xRotation = 0;
            largeArc = 1;
            drx = 30 + (d.linkNum * -10);
            dry = 30 + (d.linkNum * -10);
            tx = tx + 1;
            ty = ty + 1;
          }

          drx = drx / (d.linkNum || 1);
          dry = dry / (d.linkNum || 1);

          var 
          scx = sx,
          scy = sy + 100,
          tcx = tx,
          tcy = ty + 100;
          return 'M' + 
            sx + ',' + sy + 
            'A' + drx + ',' + dry + ' ' + xRotation + ',' + largeArc + ',' + sweep + ' ' +
            //'C' + scx + ',' + scy + ' ' + tcx + ',' + tcy + ' ' +
            tx + ',' + ty;
        });
      },
      

      resize = function () {
        this_.values.force
          .size([element.offsetWidth, element.offsetHeight])
          .resume();
      };

      defs.append('svg:marker')
        .attr('id', 'link-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 22)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

      filter = defs.append('svg:filter')
        .attr('id', 'selected-element');
      filter.append('svg:feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 3)
        .attr('result', 'blur');
      filter.append('svg:feOffset')
        .attr('in', 'blur')
        .attr('result', 'offsetBlur');
      feMerge = filter.append('svg:feMerge');
      feMerge.append('svg:feMergeNode')
        .attr('in', 'offsetBlur');
      feMerge.append('svg:feMergeNode')
        .attr('in', 'SourceGraphic');

      this_.values.data.nodes = [];
      this_.values.data.links = [];

      this_.values.force = d3.layout.force()
        .nodes(this_.values.data.nodes)
        .links(this_.values.data.links)
        .charge(-400)
        .linkDistance(LINKDISTANCE)
        .on('tick', tick);
        
      resize();
      d3.select(window).on('resize.' + options._id || uid(), resize);

      this_.values.svg.nodes = svg.selectAll('g.node');
      this_.values.svg.links = svg.selectAll('g.link');

      this_.values.type = options.type;
      this_.values.title = options.title;
      this_.values.parentNodeId = options.parentNodeId;

      options.nodes = options.nodes || [];
      options.nodes.forEach(function(node) {
        this_.addNode(node.type, {
          id: node._id,
          nodeId: node.nodeId,
          label: node.label,
          size: node.size,
          type: node.type,
          queueLength: node.queueLength
        });
      });
      
      options.links = options.links || [];
      options.links.forEach(function(link, sourceNode, targetNode) {
        sourceNode = null;
        targetNode = null;
        this_.values.data.nodes.forEach(function(node) {
          if(node.nodeId === link.source.nodeId) {
            sourceNode = node;
          }
          if(node.nodeId === link.target.nodeId) {
            targetNode = node;  
          }
        });
        this_.addLink({
          sourceNode: sourceNode,
          targetNode: targetNode,
          typeId: link.typeId,
          name: link.name,
          processId: link.processId
        });
      });
    };

    function updateGraphTitle(parentNodeId, title) {
      for (var i = 0; i < graphs.length; i++) {
        if(graphs[i].values && graphs[i].values.parentNodeId === parentNodeId) {
          graphs[i].values.title = title;
        }
      }
    }
    
    function createNewGraph(options) {
      graphsCount += 2;
      graphs.push(options);
    }

    function removeGraph(graphIndex) {
      graphs.splice(graphIndex, 1);
      graphsCount--;
    }

    function destroy() {
      graphs.splice(0, graphs.length);
      graphsCount = 0;
    }

    function processById(id) {
      var process = {};
      for (var i = 0; i < graphs.length; i++) {
        if(graphs[i].values && graphs[i].values.type === GRAPH.TYPE.PROCESSES) {
          for (var j = graphs[i].values.data.nodes.length - 1; j >= 0; j--) {
            if(graphs[i].values.data.nodes[j].nodeId === id) {
              process = graphs[i].values.data.nodes[j];
              break;
            }
          }
        }
      }
      return process;
    }

    return {
      instance: Graph,
      instances: graphs,
      destroy: destroy,
      empty: createNewGraph,
      NODES: NODES,
      TYPE: GRAPH.TYPE,
      NODE_TYPE: GRAPH.NODES,
      LINK_TYPE: LINKS.TYPE
    };
  }
]);

'use strict';

angular.module('protocols').factory('Protocols', ['$resource',
  function($resource) {
    return $resource('protocols/:protocolId', {
      protocolId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		}).
		state('users', {
			url: '/users',
			templateUrl: 'modules/users/views/users/list-users.client.view.html'
		}).
		state('createUser', {
			url: '/users/create',
			templateUrl: 'modules/users/views/users/create-user.client.view.html'
		}).
		state('editUser', {
			url: '/users/:userId',
			templateUrl: 'modules/users/views/users/edit-user.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		if ($scope.authentication.user) {
			$location.path('/');
		} 

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				$scope.authentication.user = response;
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('UsersController', ['$scope', '$http', '$stateParams', '$location', 'LpaUsers', 'Authentication', 'Messenger',
  function($scope, $http, $stateParams, $location, LpaUsers, Authentication, Messenger) {
    $scope.authentication = Authentication;
    
    $scope.userRoles = [
      {
        name: 'User',
        key: 'user',
        value: false
      },
      {
        name: 'Administrator',
        key: 'admin',
        value: false
      }
    ];

    $scope.create = function() {
      var lpaUser = new LpaUsers({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        username: this.username
      });

      lpaUser.$save(function(response) {
        $location.path('users/' + response._id);

        $scope.firstName = '';
        $scope.lastName = '';
        $scope.username = '';
        $scope.email = '';
      
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.update = function() {
      var lpaUser = $scope.lpaUser;

      lpaUser.roles = [];
      $scope.userRoles.forEach(function(role) {
        if(role.value) {
          lpaUser.roles.push(role.key);
        }
      }); 

      lpaUser.$update(function(lpaUser) {
        $scope.success = true;
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.remove = function(lpaUser) {
      var errorHandler = function (error) {
        Messenger.post(error.data.message, 'error');
      };
      if (lpaUser) {
        lpaUser.$remove(function() {
          for (var i in $scope.lpaUsers) {
            if ($scope.lpaUsers[i] === lpaUser) {
              $scope.lpaUsers.splice(i, 1);
            }
          } 
        }, errorHandler);
      } else {
        $scope.lpaUser.$remove(function() {
          $location.path('users');
        }, errorHandler);
      }
    };

    $scope.findOne = function() {
      $scope.lpaUser = LpaUsers.get({
        userId: $stateParams.userId
      }, function(lpaUser) {
        lpaUser.roles = lpaUser.roles || [];
        lpaUser.roles.forEach(function(role) {
          $scope.userRoles.forEach(function(role2) {
            if(role === role2.key) {
              role2.value = true;
            }
          }); 
        });
      });
    };

    $scope.list = function() {
      $scope.lpaUsers = LpaUsers.query();
    };

    $scope.edit = function(lpaUser) {
      $location.path('users/' + lpaUser._id);
    };

  }
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window', function($window) {
	var auth = {
		user: $window.user,
    hasAuthorization: function(roles) {
      var 
      this_ = this,
      userRoles,
      hasAuthorization = false;
      
      roles = roles || [];
      userRoles = this_.user && this_.user.roles || [];
      if (!angular.isArray(roles)) {
        roles = [roles];    
      }

      roles.forEach(function(role) {
        var hasRole = false;
        userRoles.forEach(function(role2) {
          if(role === role2) {
             hasRole = true;
          }    
        });  
        if(!hasRole) {
          return (hasAuthorization = false);
        } else {
          hasAuthorization = true;
        }
      });
      
      return hasAuthorization;
    },
    checkUser: function(user) {
      return user && this.user && user._id === this.user._id;
    }
	};
	
	return auth;
}]);

'use strict';

angular.module('users').
  
  factory('Users', ['$resource',
    function($resource) {
		  return $resource('users', {}, {
        update: {
          method: 'PUT'
        }
      });
    }
  ]).

  factory('LpaUsers', ['$resource',
    function($resource) {
      return $resource('users/:userId', {
        userId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }
  ]);