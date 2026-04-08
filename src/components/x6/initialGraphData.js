export const INITIAL_GRAPH_DATA = {
  "nodes": [
    {
      "id": "start-node-1774946269438",
      "type": "start",
      "to": "rect-node-1774948010316",
      "attrs": {
        "label": "开始",
        "size": 14
      },
      "ports": [
        "下"
      ],
      "position": {
        "x": 416,
        "y": -88
      },
      "dimensions": {
        "width": 80,
        "height": 80
      }
    },
    {
      "id": "end-node-1774947341676",
      "type": "end",
      "to": null,
      "attrs": {
        "label": "结束",
        "size": 16
      },
      "ports": [
        "上"
      ],
      "position": {
        "x": 416,
        "y": 816
      },
      "dimensions": {
        "width": 80,
        "height": 80
      }
    },
    {
      "id": "rect-node-1774948010316",
      "type": "node",
      "to": [
        "condition-node-1774948029525",
        "condition-node-1774948025388",
        "condition-node-1774948034220"
      ],
      "attrs": {
        "label": "节点",
        "size": 16
      },
      "ports": [
        "上",
        "下",
        "左",
        "右"
      ],
      "position": {
        "x": 384,
        "y": 128
      },
      "dimensions": {
        "width": 144,
        "height": 80
      }
    },
    {
      "id": "condition-node-1774948025388",
      "type": "condition",
      "to": "rect-node-1774948051883",
      "attrs": {
        "label": "条件 1",
        "size": 14
      },
      "ports": [
        "上",
        "下",
        "左",
        "右"
      ],
      "position": {
        "x": 136,
        "y": 288
      },
      "dimensions": {
        "width": 80,
        "height": 80
      }
    },
    {
      "id": "condition-node-1774948029525",
      "type": "condition",
      "to": "rect-node-1774948056771",
      "attrs": {
        "label": "条件 2",
        "size": 16
      },
      "ports": [
        "上",
        "下",
        "左",
        "右"
      ],
      "position": {
        "x": 416,
        "y": 288
      },
      "dimensions": {
        "width": 80,
        "height": 80
      }
    },
    {
      "id": "condition-node-1774948034220",
      "type": "condition",
      "to": "rect-node-1774948062914",
      "attrs": {
        "label": "条件 3",
        "size": 16
      },
      "ports": [
        "上",
        "下",
        "左",
        "右"
      ],
      "position": {
        "x": 672,
        "y": 288
      },
      "dimensions": {
        "width": 80,
        "height": 80
      }
    },
    {
      "id": "rect-node-1774948051883",
      "type": "node",
      "to": "rect-node-1774948070748",
      "attrs": {
        "label": "节点",
        "size": 16
      },
      "ports": [
        "上",
        "下",
        "左",
        "右"
      ],
      "position": {
        "x": 136,
        "y": 440
      },
      "dimensions": {
        "width": 80,
        "height": 80
      }
    },
    {
      "id": "rect-node-1774948056771",
      "type": "node",
      "to": "rect-node-1774948070748",
      "attrs": {
        "label": "节点",
        "size": 16
      },
      "ports": [
        "上",
        "下",
        "左",
        "右"
      ],
      "position": {
        "x": 416,
        "y": 464
      },
      "dimensions": {
        "width": 80,
        "height": 80
      }
    },
    {
      "id": "rect-node-1774948062914",
      "type": "node",
      "to": "rect-node-1774948070748",
      "attrs": {
        "label": "节点",
        "size": 16
      },
      "ports": [
        "上",
        "下",
        "左",
        "右"
      ],
      "position": {
        "x": 672,
        "y": 440
      },
      "dimensions": {
        "width": 80,
        "height": 80
      }
    },
    {
      "id": "rect-node-1774948070748",
      "type": "node",
      "to": "end-node-1774947341676",
      "attrs": {
        "label": "节点",
        "size": 16
      },
      "ports": [
        "上",
        "下",
        "左",
        "右"
      ],
      "position": {
        "x": 344,
        "y": 656
      },
      "dimensions": {
        "width": 224,
        "height": 80
      }
    }
  ],
  "edges": [
    {
      "id": "e7542fb2-357d-43c5-9c46-9feb9842c5a9",
      "source": "start-node-1774946269438",
      "target": "rect-node-1774948010316",
      "sourcePort": "start-output",
      "targetPort": "node-top-rect-node-1774948010316",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": []
    },
    {
      "id": "503b59ed-0b09-4925-b7dd-401095471798",
      "source": "rect-node-1774948010316",
      "target": "condition-node-1774948029525",
      "sourcePort": "node-bottom-rect-node-1774948010316",
      "targetPort": "condition-top-condition-node-1774948029525",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": []
    },
    {
      "id": "b49165e1-dae7-44fc-aaa8-9beb840e7ae1",
      "source": "rect-node-1774948010316",
      "target": "condition-node-1774948025388",
      "sourcePort": "node-left-rect-node-1774948010316",
      "targetPort": "condition-top-condition-node-1774948025388",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": []
    },
    {
      "id": "e4a286d8-941f-4ae2-adb9-4e956a02e0e9",
      "source": "rect-node-1774948010316",
      "target": "condition-node-1774948034220",
      "sourcePort": "node-right-rect-node-1774948010316",
      "targetPort": "condition-top-condition-node-1774948034220",
      "attrs": {
        "label": "测试连接文案098",
        "labelPosition": {
          "distance": 0.23003781746782587,
          "angle": 0,
          "offset": 0
        },
        "lineStyle": "dashed"
      },
      "vertices": [
        {
          "x": 664,
          "y": 168
        }
      ]
    },
    {
      "id": "f2533939-f288-4ddb-b51e-95a9067fc8cf",
      "source": "condition-node-1774948025388",
      "target": "rect-node-1774948051883",
      "sourcePort": "condition-bottom-condition-node-1774948025388",
      "targetPort": "node-top-rect-node-1774948051883",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": []
    },
    {
      "id": "e1c941fc-8068-48c4-9a1f-e6fd553ac7bb",
      "source": "condition-node-1774948029525",
      "target": "rect-node-1774948056771",
      "sourcePort": "condition-bottom-condition-node-1774948029525",
      "targetPort": "node-top-rect-node-1774948056771",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": []
    },
    {
      "id": "db8b41e7-f1a7-4d86-adc6-5f5d17e907ff",
      "source": "condition-node-1774948034220",
      "target": "rect-node-1774948062914",
      "sourcePort": "condition-bottom-condition-node-1774948034220",
      "targetPort": "node-top-rect-node-1774948062914",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": []
    },
    {
      "id": "961637e5-b995-4243-8a10-e3a7417c1a7e",
      "source": "rect-node-1774948051883",
      "target": "rect-node-1774948070748",
      "sourcePort": "node-bottom-rect-node-1774948051883",
      "targetPort": "node-top-rect-node-1774948070748",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": [
        {
          "x": 296,
          "y": 608
        },
        {
          "x": 448,
          "y": 608
        }
      ]
    },
    {
      "id": "bc6c823a-adc7-4ef7-b25d-9cb0814a658a",
      "source": "rect-node-1774948056771",
      "target": "rect-node-1774948070748",
      "sourcePort": "node-bottom-rect-node-1774948056771",
      "targetPort": "node-top-rect-node-1774948070748",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": []
    },
    {
      "id": "023a3d7e-1b80-4b18-acca-0a0f94d2a3a6",
      "source": "rect-node-1774948062914",
      "target": "rect-node-1774948070748",
      "sourcePort": "node-bottom-rect-node-1774948062914",
      "targetPort": "node-top-rect-node-1774948070748",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": [
        {
          "x": 616,
          "y": 608
        },
        {
          "x": 464,
          "y": 608
        }
      ]
    },
    {
      "id": "85064782-fece-40b9-8047-c5c2a6164b47",
      "source": "rect-node-1774948070748",
      "target": "end-node-1774947341676",
      "sourcePort": "node-bottom-rect-node-1774948070748",
      "targetPort": "end-input",
      "attrs": {
        "label": "",
        "labelPosition": {
          "distance": 0.5
        },
        "lineStyle": "solid"
      },
      "vertices": []
    }
  ]
}
