'use strict';

angular.module('protocols').factory('Analysis', ['d3', 'Graph', 'Messenger',
  function(d3, Graph, Messenger) {

    var 

    graph = {
      svg: null,
      tree: null,
      protocol: null,
      root: null,
      diagonal: null,
      nodesCount: 0,
      error: false
    },

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
      var 
      g = d3node.selectAll('g')
        .data([value])
        .enter()
        .append('svg:g')
        .attr('class', 'text-tree-node')
        .each(function (d) {

          d3.select(this)
            .append('svg:circle')
            .attr('r', 22)
            .attr('cx', '2px')
            .attr('cy', '22px');

          d3.select(this)
            .append('svg:text')
            .attr('dx', '-8px')
            .attr('dy', '26px')
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
        } else {
          node_.value = node_.processes[i % node.procNum].queue.values.join(', ');
        }

        node_.grid.data.push({ 
          time: i, 
          value: node_.value,
          width: node_.grid.item.size,
          height: node_.grid.item.size,
          x: node_.grid.item.posX,
          y: node_.grid.item.posY,
          count: i + 1
        });

        node_.grid.item.posX += node_.grid.item.step;
        if((i + 1) % node.procNum === 0) {
          node_.grid.item.posX = node_.grid.item.startX;
          node_.grid.item.posY += node_.grid.item.step;
        }
      }

      d3node.selectAll('g')
        .data(node_.grid.data)
        .enter()
        .append('svg:g')
        .each(function (d) {
          
          d3.select(this)
            .append('svg:rect')
            .attr('class', 'cell')
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; })
            .attr('width', function(d) { return d.width; })
            .attr('height', function(d) { return d.height; });

          d3.select(this)
            .append('svg:text')           
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; })
            .attr('dy', '20px')
            .attr('dx', '12px')
            .text(function(d) { return d.value || ''; });
        });
    }

    function update(source) {

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
              creatTextNode(d3.select(this), d.repeatingNodeId);
              break;
            default:
              createNode(d3.select(this), d);

              d3.select(this)
                .append('svg:text')
                .attr('x', function () { return (node.procNum * node.size) / -2; })
                .attr('dy', '-5px')
                .text(function(d) { return d.id; });

              d3.select(this)
                .on('click', click);
          }
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

    function addToQueue(parentTreeNode, processId, msg) {
      var 
      isAdded = false,
      parent = getParentTreeProcess(parentTreeNode, processId),
      queue = parent.queue.values.slice();
  
      queue.push(msg);

      if (parent.queue.values.length < queue.length) {
        graph.protocol.processes.nodes.forEach(function(processNode) {
          if (processNode.nodeId === processId) {
            processNode.queue.values = queue;
            isAdded = true;
          } else {
            processNode.queue.values = getParentTreeProcess(parentTreeNode, processNode.nodeId).queue.values.slice();
          }
        });
      }
      return isAdded;
    }

    function removeFromQueue(parentTreeNode, processId, msg) {
      var 
      isRemoved = false,
      parent = getParentTreeProcess(parentTreeNode, processId),
      index = parent.queue.values.indexOf(msg),
      queue = parent.queue.values.slice();

      queue.splice(index, 1);

      if (index >= 0) {
        graph.protocol.processes.nodes.forEach(function(processNode) {
          if (processNode.nodeId === processId) {
            processNode.queue.values = queue;
            isRemoved = true;
          } else {
            processNode.queue.values = getParentTreeProcess(parentTreeNode, processNode.nodeId).queue.values.slice();
          }
        });
      }
      return isRemoved;
    }

    function transformFsmNode(node_) {
      return {
        nodeId: node_.nodeId,
        label: node_.label
      };
    }
    
    function transformProcessNode(process) {
      return {
        nodeId: process.nodeId,
        currrentFsmNode: transformFsmNode(process.currrentFsmNode),
        queue: {
          values: process.queue.values.slice(),
          length: process.queue.length
        }
      };
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

    function isTreeNodeExists(currrentTreeNode, treeNode) {
      var index = -1;
      if (compareTreeNodes(currrentTreeNode, treeNode)) {
        index = graph.root.id;
      } else if (currrentTreeNode.children && currrentTreeNode.children.length > 0) {
        for (var i = 0; i < currrentTreeNode.children.length; i++) {
          if((index = isTreeNodeExists(currrentTreeNode.children[i], treeNode)) > 0) {
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
        typeId: options.typeId || NODE_TYPE.NORMAL
      };

      graph.protocol.processes.nodes.forEach(function(process) {
        treeNode.processes.push(transformProcessNode(process));
      });

      if (graph.root && (treeNode.repeatingNodeId = isTreeNodeExists(graph.root, treeNode)) >= 0) {
        treeNode.typeId = NODE_TYPE.REPEATING;
      }

      return treeNode;
    }

    function addChildNode(parentTreeNode, options) {
      parentTreeNode.children = parentTreeNode.children || [];

      parentTreeNode.children.push(createTreeNode(options));
    }

    function researchLevel(parentTreeNode, index) {

      graph.protocol.processes.nodes.forEach(function (process) {

        getProcessFsmLinks(process).forEach(function(link) {
  
          process.currrentFsmNode = getParentTreeProcess(parentTreeNode, process.nodeId).currrentFsmNode;
 
          if (process.currrentFsmNode.nodeId === link.source.nodeId) {
        
            switch(link.typeId) {
              case 'SEND':
                if (addToQueue(parentTreeNode, process.nodeId, link.name)) {
                  process.currrentFsmNode = link.target;
                  addChildNode(parentTreeNode);
                } else {
                  addChildNode(parentTreeNode, {
                    typeId: NODE_TYPE.QUEUE_FULL
                  });
                }
                break;
              case 'RECEIVE':
                if (removeFromQueue(parentTreeNode, link.processId, link.name)) {
                  process.currrentFsmNode = link.target;
                  addChildNode(parentTreeNode);
                } else if (getParentTreeProcess(parentTreeNode, link.processId).queue.values.length > 0) {
                  addChildNode(parentTreeNode, {
                    typeId: NODE_TYPE.UNDEFINED_RECEIVE
                  });
                }
                break;
              case 'LOCAL':
                process.currrentFsmNode = link.target;
                addChildNode(parentTreeNode);
                break;
            }
          }
        });
      });
      
      if(parentTreeNode.children && index === parentTreeNode.children.length - 1) {
        parentTreeNode.children.forEach(function (treeChildNode, childIndex) {
          if (treeChildNode.typeId === NODE_TYPE.NORMAL) {
            researchLevel(treeChildNode, childIndex);
          }
        });
      }
    }

    function drawGraph(protocol) {      
      
      graph.protocol = protocol;
      graph.error = false;
      graph.nodesCount = 0;
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
          Messenger.post('MISSING_START_STATE', 'error');
          graph.error = true;
        }
        process.queue = {
          length: process.queueLength,
          values: []
        };
      });

      if(graph.error) {
        return;
      }

      graph.root = createTreeNode();      
      graph.root.x0 = (1500-60) / 2;
      graph.root.y0 = 0;
      
      researchLevel(graph.root, 0);

      update(graph.root);
    }

    function init(element) {
      var 
      margin = {
        top: 60,
        right: 0,
        bottom: 0,
        left: 0
      },
      width =  1024 - margin.right - margin.left,
      height = 1500 - margin.top - margin.bottom;

      graph.tree = d3.layout.tree()
        .size([width, height])
        .separation(function (a, b) {
          return a.parent === b.parent ? 1 : 2;
        });

      graph.diagonal = d3.svg.diagonal()
        .source(function(d) { return { x: d.source.x, y: ( d.source.y + node.procNum * node.size )}; })            
        .target(function(d) { return { x: d.target.x, y: d.target.y }; })
        .projection(function(d) { return [d.x, d.y]; });

      graph.svg = d3.select(element).append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('id', 'svg')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    }

    return {
      init: init,
      drawTree: drawGraph
    };
  }
]);
