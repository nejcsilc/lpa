"use strict";var ApplicationConfiguration=function(){var applicationModuleName="lpa",applicationModuleVendorDependencies=["ngResource","ngAnimate","ui.router","ui.bootstrap","ui.utils","pascalprecht.translate","ui.select","angulartics","angulartics.google.analytics"],registerModule=function(moduleName,dependencies){angular.module(moduleName,dependencies||[]),angular.module(applicationModuleName).requires.push(moduleName)};return{applicationModuleName:applicationModuleName,applicationModuleVendorDependencies:applicationModuleVendorDependencies,registerModule:registerModule}}();angular.module(ApplicationConfiguration.applicationModuleName,ApplicationConfiguration.applicationModuleVendorDependencies),angular.module(ApplicationConfiguration.applicationModuleName).config(["$locationProvider",function($locationProvider){$locationProvider.hashPrefix("!")}]),angular.element(document).ready(function(){"#_=_"===window.location.hash&&(window.location.hash="#!"),angular.bootstrap(document,[ApplicationConfiguration.applicationModuleName])}),ApplicationConfiguration.registerModule("core"),ApplicationConfiguration.registerModule("protocols"),ApplicationConfiguration.registerModule("users"),angular.module("core").config(["$analyticsProvider",function($analyticsProvider){$analyticsProvider.virtualPageviews(!1)}]),angular.module("core").config(["$stateProvider","$urlRouterProvider",function($stateProvider,$urlRouterProvider){$urlRouterProvider.otherwise("/"),$stateProvider.state("home",{url:"/",templateUrl:"modules/core/views/home.client.view.html"})}]),angular.module("core").config(["$translateProvider",function($translateProvider){$translateProvider.useStaticFilesLoader({prefix:"i18n/locale-",suffix:".json"}),$translateProvider.preferredLanguage("si_SL")}]),angular.module("core").controller("HeaderController",["$scope","Authentication","Menus","$translate",function($scope,Authentication,Menus,$translate){$scope.authentication=Authentication,$scope.isCollapsed=!1,$scope.menu=Menus.getMenu("topbar"),$scope.toggleCollapsibleMenu=function(){$scope.isCollapsed=!$scope.isCollapsed},$scope.toggleLanguage=function(){$translate.use("en_EN"===$translate.use()?"si_SL":"en_EN")},$scope.$on("$stateChangeSuccess",function(){$scope.isCollapsed=!1})}]),angular.module("core").controller("HomeController",["$scope","Authentication",function($scope,Authentication){$scope.authentication=Authentication}]),angular.module("core").directive("lpaTitle",[function(){return{restrict:"E",transclude:!0,scope:{code:"@"},templateUrl:"modules/core/directives/views/title.client.view.html"}}]),angular.module("core").service("Menus",[function(){this.defaultRoles=["*"],this.menus={};var shouldRender=function(user){if(!user)return this.isPublic;if(~this.roles.indexOf("*"))return!0;for(var userRoleIndex in user.roles)for(var roleIndex in this.roles)if(this.roles[roleIndex]===user.roles[userRoleIndex])return!0;return!1};this.validateMenuExistance=function(menuId){if(menuId&&menuId.length){if(this.menus[menuId])return!0;throw new Error("Menu does not exists")}throw new Error("MenuId was not provided")},this.getMenu=function(menuId){return this.validateMenuExistance(menuId),this.menus[menuId]},this.addMenu=function(menuId,isPublic,roles){return this.menus[menuId]={isPublic:isPublic||!1,roles:roles||this.defaultRoles,items:[],shouldRender:shouldRender},this.menus[menuId]},this.removeMenu=function(menuId){this.validateMenuExistance(menuId),delete this.menus[menuId]},this.addMenuItem=function(menuId,menuItemTitle,menuItemURL,menuItemType,menuItemUIRoute,isPublic,roles,position){return this.validateMenuExistance(menuId),this.menus[menuId].items.push({title:menuItemTitle,link:menuItemURL,menuItemType:menuItemType||"item",menuItemClass:menuItemType,uiRoute:menuItemUIRoute||"/"+menuItemURL,isPublic:null===isPublic||"undefined"==typeof isPublic?this.menus[menuId].isPublic:isPublic,roles:null===roles||"undefined"==typeof roles?this.menus[menuId].roles:roles,position:position||0,items:[],shouldRender:shouldRender}),this.menus[menuId]},this.addSubMenuItem=function(menuId,rootMenuItemURL,menuItemTitle,menuItemURL,menuItemUIRoute,isPublic,roles,position){this.validateMenuExistance(menuId);for(var itemIndex in this.menus[menuId].items)this.menus[menuId].items[itemIndex].link===rootMenuItemURL&&this.menus[menuId].items[itemIndex].items.push({title:menuItemTitle,link:menuItemURL,uiRoute:menuItemUIRoute||"/"+menuItemURL,isPublic:null===isPublic||"undefined"==typeof isPublic?this.menus[menuId].items[itemIndex].isPublic:isPublic,roles:null===roles||"undefined"==typeof roles?this.menus[menuId].items[itemIndex].roles:roles,position:position||0,shouldRender:shouldRender});return this.menus[menuId]},this.removeMenuItem=function(menuId,menuItemURL){this.validateMenuExistance(menuId);for(var itemIndex in this.menus[menuId].items)this.menus[menuId].items[itemIndex].link===menuItemURL&&this.menus[menuId].items.splice(itemIndex,1);return this.menus[menuId]},this.removeSubMenuItem=function(menuId,submenuItemURL){this.validateMenuExistance(menuId);for(var itemIndex in this.menus[menuId].items)for(var subitemIndex in this.menus[menuId].items[itemIndex].items)this.menus[menuId].items[itemIndex].items[subitemIndex].link===submenuItemURL&&this.menus[menuId].items[itemIndex].items.splice(subitemIndex,1);return this.menus[menuId]},this.addMenu("topbar",!0)}]),angular.module("core").service("Messenger",["$translate",function($translate){Messenger.options={extraClasses:"messenger-fixed messenger-on-bottom messenger-on-right",theme:"future"};var _messenger=new Messenger;this.post=function(msg,type,options){_messenger.post({message:msg||"No message",type:type||"error",showCloseButton:!0})}}]),angular.module("protocols").run(["Menus",function(Menus){Menus.addMenuItem("topbar","PROTOCOLS","protocols","dropdown","/protocols(/create)?"),Menus.addSubMenuItem("topbar","protocols","PROTOCOLS_LIST","protocols"),Menus.addSubMenuItem("topbar","protocols","PROTOCOLS_NEW","protocols/create",!1,!1)}]),angular.module("protocols").config(["$stateProvider",function($stateProvider){$stateProvider.state("listProtocols",{url:"/protocols",templateUrl:"modules/protocols/views/list-protocols.client.view.html"}).state("createProtocol",{url:"/protocols/create",templateUrl:"modules/protocols/views/create-protocol.client.view.html"}).state("viewProtocol",{url:"/protocols/:protocolId",templateUrl:"modules/protocols/views/view-protocol.client.view.html"}).state("editProtocol",{url:"/protocols/:protocolId/edit",templateUrl:"modules/protocols/views/edit-protocol.client.view.html"})}]),angular.module("protocols").controller("ProtocolsController",["$scope","$stateParams","$location","Authentication","Messenger","Protocols","Graph",function($scope,$stateParams,$location,Authentication,Messenger,Protocols,Graph){$scope.authentication=Authentication,$scope.selected={index:0},$scope.create=function(){Graph.destroy(),$scope.graphs=Graph.instances,Graph.empty({type:Graph.TYPE.PROCESSES,title:"Protokol title"})},$scope.view=function(){$scope.protocol=Protocols.get({protocolId:$stateParams.protocolId})},$scope.list=function(){$scope.protocols=Protocols.query()}}]),angular.module("protocols").directive("graph",[function(){return{restrict:"EA",scope:{graphData:"=",edit:"="},templateUrl:"modules/protocols/directives/views/graph.client.directive.view.html",controller:["$scope","$stateParams","$location","Graph","Protocols","Messenger",function($scope,$stateParams,$location,Graph,Protocols,Messenger){$scope.graph=new Graph.instance,$scope.save=function(){var protocol=new Protocols({title:"TESTTT",processes:{},finalstatemachines:[]});Graph.instances.forEach(function(instance){var graph=instance.data();graph.type===Graph.TYPE.PROCESSES?protocol.processes=graph:protocol.finalstatemachines.push(graph)}),protocol.$save(function(response){$location.path("protocols/"+response._id)},function(errorResponse){Messenger.post(errorResponse.data.message,"error")})}}],link:function($scope,elm,attrs){$scope.graphData&&$scope.graphData.$promise?$scope.graphData.$promise.then(function(graphData){graphData&&$scope.graph.init(elm[0].querySelector(".graph-content"),graphData.processes)}):$scope.graph.init(elm[0].querySelector(".graph-content"),$scope.graphData)}}}]),angular.module("protocols").directive("protocol",[function(){return{restrict:"EA",transclude:!0,templateUrl:"modules/protocols/directives/views/protocol.client.directive.view.html"}}]),angular.module("protocols").service("Graph",["$filter","Messenger",function($filter,Messenger){function nodeData(node){return node[0][0].parentNode.__data__}function random(min,max){return Math.floor(Math.random()*(max-min+1)+min)}function label(i){return i}function uid(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=16*Math.random()|0,v="x"===c?r:3&r|8;return v.toString(16)})}function Graph(){this.values={type:null,title:null,force:null,svg:{nodes:[],links:[],selected:{node:null,link:null}},data:{nodes:[],links:[]}},graphsCount>graphs.length?graphs[graphs.length-1]=this:(graphs.push(this),graphsCount++)}function createNewGraph(options){graphsCount+=2,graphs.push(options)}function removeGraph(graphIndex){graphs.splice(graphIndex,1),graphsCount--}function destroy(){graphs.splice(0,graphs.length),graphsCount=0}var graphs=[],graphsCount=0,radius=d3.scale.sqrt().range([0,6]),LINKDISTANCE=250,GRAPH={TYPE:{PROCESSES:"PROCESSES",FINAL_STATE_MACHNE:"FINAL_STATE_MACHNE"}},NODES={TYPE:{PROCESS:"PROCESS",START_STATE:"START_STATE",ACCEPT_STATE:"ACCEPT_STATE"},SIZE:{PROCESS:12,START_STATE:12,ACCEPT_STATE:12},COLOR:{PROCESS:"#FF0000",START_STATE:"#00FF00",ACCEPT_STATE:"#0000FF"}};return Graph.prototype.data=function(){return{title:this.values.title,type:this.values.type,nodes:this.values.data.nodes,links:this.values.data.links}},Graph.prototype.build=function(){var this_=this,nodeClicked=function(node){this_.values.svg.selected.node&&this_.values.svg.selected.node.style("filter",""),this_.values.svg.selected.node=d3.select(this).select("circle").style("filter","url(#selected-element)")},labelClick=function(link){var label="todo";d3.select(this).text(label),link.label=label};this_.values.svg.links=this_.values.svg.links.data(this_.values.force.links(),function(d){return d.source.node_id+"-"+d.target.node_id+"-"+(d.linkNum||1)}),this_.values.svg.links.enter().append("svg:g").attr("class","link").each(function(d){d3.select(this).append("svg:path").attr("class","link").attr("id",function(d){return"link-"+d.source.node_id+"-"+d.target.node_id+"-"+(d.linkNum||1)}).attr("marker-end","url(#end)"),d3.select(this).append("svg:text").attr("class","linklabel").attr("dx",LINKDISTANCE/2).attr("dy","-10").attr("text-anchor","middle").append("svg:textPath").on("click",labelClick).attr("xlink:href",function(d){return"#link-"+d.source.node_id+"-"+d.target.node_id+"-"+(d.linkNum||1)}).text(function(d){return d.label||"no label"})}),this_.values.svg.links.exit().remove(),this_.values.svg.nodes=this_.values.svg.nodes.data(this_.values.force.nodes(),function(d){return d.node_id}),this_.values.svg.nodes.enter().append("svg:g").attr("class","node").each(function(d){d3.select(this).append("svg:circle").attr("class",function(d){return"node "+d.node_id}).attr("r",function(d){return radius(d.size)}),d3.select(this).append("svg:text").attr("dy",".35em").attr("text-anchor","middle").text(function(d,i){return d.label||i}),d3.select(this).on("click",nodeClicked),d3.select(this).call(this_.values.force.drag)}),this_.values.svg.nodes.exit().remove(),this_.values.force.start()},Graph.prototype.nodeLinks=function(nodeId){var links=[];return this.values.data.links.forEach(function(link){(link.source.node_id===nodeId||link.target.node_id===nodeId)&&links.push(link)}),links},Graph.prototype.addLink=function(){var this_=this,addLink=function(source,target){var linkNum=1;this_.values.data.links.forEach(function(link){link.source===source&&link.target===target&&(linkNum+=1)}),source===target&&(linkNum=-1*linkNum),this_.values.data.links.push({source:source,target:target,linkNum:linkNum}),this_.build()};return this_.temp=this_.temp||{},this_.values.svg.selected.node?void(this_.temp.sourceNode?(addLink(nodeData(this_.temp.sourceNode),nodeData(this_.values.svg.selected.node)),this_.temp.sourceNode=null,Messenger.post("Link added.","success")):(this_.temp.sourceNode=this_.values.svg.selected.node,Messenger.post("Select target node and click add link.","info"))):void Messenger.post("Select source node and click add link.","info")},Graph.prototype.addNode=function(type){if(!type)return void Messenger.post("No type selected!","error");var this_=this,node={node_id:uid(),label:label(this_.values.data.nodes.length+1),size:NODES.SIZE[type],type:NODES.TYPE[type]};this_.values.svg.selected.node&&(node.x=nodeData(this_.values.svg.selected.node).x+random(-15,15),node.y=nodeData(this_.values.svg.selected.node).y+random(-15,15),this_.values.data.links.push({source:nodeData(this_.values.svg.selected.node),target:node})),this_.values.data.nodes.push(node),this_.values.type===GRAPH.TYPE.PROCESSES&&createNewGraph({type:GRAPH.TYPE.FINAL_STATE_MACHNE,title:label(graphs.length)}),this_.build()},Graph.prototype.removeNode=function(){var this_=this;if(!this_.values.svg.selected.node)return void Messenger.post("NO_SELECTED_NODE","error");var nodeIndex,nodeId=nodeData(this_.values.svg.selected.node).node_id,nodeLinksIndexes=[];this_.values.data.nodes.forEach(function(node,index){node.node_id===nodeId&&(nodeIndex=index)}),this_.values.data.nodes.splice(nodeIndex,1),this_.values.data.links.forEach(function(link,index){this_.nodeLinks(nodeId).forEach(function(nodeLink){nodeLink===link&&nodeLinksIndexes.push(index)})}),nodeLinksIndexes.sort(function(a,b){return b-a}).forEach(function(linkIndex){this_.values.data.links.splice(linkIndex,1)}),removeGraph(nodeIndex+1),this_.values.svg.selected.node=null,this_.build()},Graph.prototype.init=function(element,options){options=options||{};var filter,feMerge,this_=this,svg=d3.select(element).append("svg").attr("width","100%").attr("height","100%"),defs=svg.append("svg:defs"),tick=function(){this_.values.svg.nodes.attr("transform",function(d){return"translate("+d.x+","+d.y+")"}),this_.values.svg.links.selectAll("path").attr("d",function(d){var sx=d.source.x,sy=d.source.y,tx=d.target.x,ty=d.target.y,dx=tx-sx,dy=ty-sy,dr=Math.sqrt(dx*dx+dy*dy),drx=dr,dry=dr,xRotation=0,largeArc=0,sweep=1;d.linkNum<0&&(xRotation=0,largeArc=1,drx=30+-10*d.linkNum,dry=30+-10*d.linkNum,tx+=1,ty+=1),drx/=d.linkNum||1,dry/=d.linkNum||1;return"M"+sx+","+sy+"A"+drx+","+dry+" "+xRotation+","+largeArc+","+sweep+" "+tx+","+ty})},resize=function(){this_.values.force.size([element.offsetWidth,element.offsetHeight]).resume()};filter=defs.append("svg:filter").attr("id","selected-element"),filter.append("svg:feGaussianBlur").attr("in","SourceAlpha").attr("stdDeviation",3).attr("result","blur"),filter.append("svg:feOffset").attr("in","blur").attr("result","offsetBlur"),feMerge=filter.append("svg:feMerge"),feMerge.append("svg:feMergeNode").attr("in","offsetBlur"),feMerge.append("svg:feMergeNode").attr("in","SourceGraphic"),defs.selectAll("marker").data(["end"]).enter().append("svg:marker").attr("id",String).attr("viewBox","0 -5 10 10").attr("refX",22).attr("refY",0).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto").append("svg:path").attr("d","M0,-5L10,0L0,5"),this_.values.data.nodes=[],this_.values.data.links=[],this_.values.force=d3.layout.force().nodes(this_.values.data.nodes).links(this_.values.data.links).charge(-400).linkDistance(LINKDISTANCE).on("tick",tick),resize(),d3.select(window).on("resize."+options._id||uid(),resize),this_.values.svg.nodes=svg.selectAll("g.node"),this_.values.svg.links=svg.selectAll("g.link"),this_.values.type=options.type,this_.values.title=options.title,options.nodes=options.nodes||[],options.nodes.forEach(function(node){this_.values.data.nodes.push({_id:node._id,node_id:node._id,label:node.label,size:node.size,type:node.type,x:node.x,y:node.y})}),options.links=options.links||[],options.links.forEach(function(link,sourceNode,targetNode){sourceNode=null,targetNode=null,this_.values.data.nodes.forEach(function(node){node.node_id===link.source&&(sourceNode=node),node.node_id===link.target&&(targetNode=node)}),this_.values.data.links.push({label:link.label,source:sourceNode,target:targetNode})}),this_.build()},{instance:Graph,instances:graphs,destroy:destroy,empty:createNewGraph,NODES:NODES,TYPE:GRAPH.TYPE}}]),angular.module("protocols").factory("Protocols",["$resource",function($resource){return $resource("protocols/:protocolId",{protocolId:"@_id"},{update:{method:"PUT"}})}]),angular.module("users").config(["$httpProvider",function($httpProvider){$httpProvider.interceptors.push(["$q","$location","Authentication",function($q,$location,Authentication){return{responseError:function(rejection){switch(rejection.status){case 401:Authentication.user=null,$location.path("signin");break;case 403:}return $q.reject(rejection)}}}])}]),angular.module("users").config(["$stateProvider",function($stateProvider){$stateProvider.state("profile",{url:"/settings/profile",templateUrl:"modules/users/views/settings/edit-profile.client.view.html"}).state("password",{url:"/settings/password",templateUrl:"modules/users/views/settings/change-password.client.view.html"}).state("signin",{url:"/signin",templateUrl:"modules/users/views/authentication/signin.client.view.html"}).state("forgot",{url:"/password/forgot",templateUrl:"modules/users/views/password/forgot-password.client.view.html"}).state("reset-invalid",{url:"/password/reset/invalid",templateUrl:"modules/users/views/password/reset-password-invalid.client.view.html"}).state("reset-success",{url:"/password/reset/success",templateUrl:"modules/users/views/password/reset-password-success.client.view.html"}).state("reset",{url:"/password/reset/:token",templateUrl:"modules/users/views/password/reset-password.client.view.html"}).state("users",{url:"/users",templateUrl:"modules/users/views/users/list-users.client.view.html"}).state("createUser",{url:"/users/create",templateUrl:"modules/users/views/users/create-user.client.view.html"}).state("editUser",{url:"/users/:userId",templateUrl:"modules/users/views/users/edit-user.client.view.html"})}]),angular.module("users").controller("AuthenticationController",["$scope","$http","$location","Authentication",function($scope,$http,$location,Authentication){$scope.authentication=Authentication,$scope.authentication.user&&$location.path("/"),$scope.signin=function(){$http.post("/auth/signin",$scope.credentials).success(function(response){$scope.authentication.user=response,$location.path("/")}).error(function(response){$scope.error=response.message})}}]),angular.module("users").controller("PasswordController",["$scope","$stateParams","$http","$location","Authentication",function($scope,$stateParams,$http,$location,Authentication){$scope.authentication=Authentication,$scope.authentication.user&&$location.path("/"),$scope.askForPasswordReset=function(){$scope.success=$scope.error=null,$http.post("/auth/forgot",$scope.credentials).success(function(response){$scope.credentials=null,$scope.success=response.message}).error(function(response){$scope.credentials=null,$scope.error=response.message})},$scope.resetUserPassword=function(){$scope.success=$scope.error=null,$http.post("/auth/reset/"+$stateParams.token,$scope.passwordDetails).success(function(response){$scope.passwordDetails=null,Authentication.user=response,$location.path("/password/reset/success")}).error(function(response){$scope.error=response.message})}}]),angular.module("users").controller("SettingsController",["$scope","$http","$location","Users","Authentication",function($scope,$http,$location,Users,Authentication){$scope.user=Authentication.user,$scope.user||$location.path("/"),$scope.hasConnectedAdditionalSocialAccounts=function(provider){for(var i in $scope.user.additionalProvidersData)return!0;return!1},$scope.isConnectedSocialAccount=function(provider){return $scope.user.provider===provider||$scope.user.additionalProvidersData&&$scope.user.additionalProvidersData[provider]},$scope.removeUserSocialAccount=function(provider){$scope.success=$scope.error=null,$http["delete"]("/users/accounts",{params:{provider:provider}}).success(function(response){$scope.success=!0,$scope.user=Authentication.user=response}).error(function(response){$scope.error=response.message})},$scope.updateUserProfile=function(isValid){if(isValid){$scope.success=$scope.error=null;var user=new Users($scope.user);user.$update(function(response){$scope.success=!0,Authentication.user=response},function(response){$scope.error=response.data.message})}else $scope.submitted=!0},$scope.changeUserPassword=function(){$scope.success=$scope.error=null,$http.post("/users/password",$scope.passwordDetails).success(function(response){$scope.success=!0,$scope.passwordDetails=null}).error(function(response){$scope.error=response.message})}}]),angular.module("users").controller("UsersController",["$scope","$http","$stateParams","$location","LpaUsers","Authentication","Messenger",function($scope,$http,$stateParams,$location,LpaUsers,Authentication,Messenger){$scope.authentication=Authentication,$scope.userRoles=[{name:"User",key:"user",value:!1},{name:"Administrator",key:"admin",value:!1}],$scope.create=function(){var lpaUser=new LpaUsers({firstName:this.firstName,lastName:this.lastName,email:this.email,username:this.username});lpaUser.$save(function(response){$location.path("users/"+response._id),$scope.firstName="",$scope.lastName="",$scope.username="",$scope.email=""},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.update=function(){var lpaUser=$scope.lpaUser;lpaUser.roles=[],$scope.userRoles.forEach(function(role){role.value&&lpaUser.roles.push(role.key)}),lpaUser.$update(function(lpaUser){$scope.success=!0},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.remove=function(lpaUser){var errorHandler=function(error){Messenger.post(error.data.message,"error")};lpaUser?lpaUser.$remove(function(){for(var i in $scope.lpaUsers)$scope.lpaUsers[i]===lpaUser&&$scope.lpaUsers.splice(i,1)},errorHandler):$scope.lpaUser.$remove(function(){$location.path("users")},errorHandler)},$scope.findOne=function(){$scope.lpaUser=LpaUsers.get({userId:$stateParams.userId},function(lpaUser){lpaUser.roles=lpaUser.roles||[],lpaUser.roles.forEach(function(role){$scope.userRoles.forEach(function(role2){role===role2.key&&(role2.value=!0)})})})},$scope.list=function(){$scope.lpaUsers=LpaUsers.query()},$scope.edit=function(lpaUser){$location.path("users/"+lpaUser._id)}}]),angular.module("users").factory("Authentication",["$window",function($window){var auth={user:$window.user,hasAuthorization:function(roles){var userRoles,this_=this,hasAuthorization=!1;return roles=roles||[],userRoles=this_.user&&this_.user.roles||[],angular.isArray(roles)||(roles=[roles]),roles.forEach(function(role){var hasRole=!1;return userRoles.forEach(function(role2){role===role2&&(hasRole=!0)}),hasRole?void(hasAuthorization=!0):hasAuthorization=!1}),hasAuthorization}};return auth}]),angular.module("users").factory("Users",["$resource",function($resource){return $resource("users",{},{update:{method:"PUT"}})}]).factory("LpaUsers",["$resource",function($resource){return $resource("users/:userId",{userId:"@_id"},{update:{method:"PUT"}})}]);