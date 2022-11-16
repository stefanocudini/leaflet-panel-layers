Leaflet Panel Layers
==============

[![npm version](https://badge.fury.io/js/leaflet-panel-layers.svg)](https://badge.fury.io/js/leaflet-panel-layers)

Leaflet Control Layers extended with support groups and icons

Copyright [Stefano Cudini](https://opengeo.tech/stefano-cudini/)

Tested in Leaflet 0.7.x, 1.4.x

**Demo:**

[opengeo.tech/maps/leaflet-panel-layers](https://opengeo.tech/maps/leaflet-panel-layers/)

**Source code:**  

[Github](https://github.com/stefanocudini/leaflet-panel-layers)  

**Use Cases:**
* [EnviroMap by EnvironSensing](https://dev-server.uca.es/)
* [Leaflet Control Search (Official demos)](https://opengeo.tech/maps/leaflet-search/)
* [Pine Interactive Map](https://pine.blackpinguin.de/)

![Image](https://raw.githubusercontent.com/stefanocudini/leaflet-panel-layers/master/examples/images/screenshot/leaflet-panel-layers-layout.jpg)

# Options
| Option	  | Default  | Description                       |
| --------------- | -------- | ----------------------------------------- |
| compact	  | false    | panel height minor of map height |
| collapsed       | false    | panel collapsed at startup |
| autoZIndex 	  | true     | set zindex layer by order definition |
| collapsibleGroups| false   | groups of layers is collapsible by button |
| buildItem	  | null     | function that return row item html node(or html string) |
| title	          | ''       | title of panel |
| className	  | ''       | additional class name for panel |
| position	  | 'topright' | position of control |

# Events
| Event			 | Data			  | Description                               |
| ---------------------- | ---------------------- | ----------------------------------------- |
| 'panel:selected'       | {layerDef}             | fired after moved and show markerLocation |
| 'panel:unselected'	 | {}	                  | fired after control was expanded          |

# Methods
| Method		 | Arguments		 | Description                                              |
| ---------------------- | --------------------- | -------------------------------------------------------- |
| addBaseLayer()         | layerDef,group,collapsed       	 | add new layer item definition to panel as baselayers     |
| addOverlay()           | 'Text message' 	 | add new layer item definition to panel as overlay        |
| removeLayer()		 | 'Text searched'	 | remove layer item from panel                             |
| configToControlLayers()| 'Text searched'	 | convert config from Control.PanelLayers to Control.Layers|

# Usage

**Panel Item Definition formats**
```javascript
	{
		name: "Bar",
		icon: iconByName('bar'),
		layer: L.geoJson(Bar, {pointToLayer: featureToMarker })
	}
```
definition in JSON format permit to store simply the configuration 
type contains a Leaflet method in this case L.geoJson()
args is the arguments passed to the method: L.geoJson(river)
```javascript
	{
		layer: {
			type: "geoJson",
			args: [ river ]
		},
	}
```
definition of a group

```javascript
	{
		group: "Title Group",
		collapsed: true,
		layers: [
		...other items...
		]
	}
```

**Multiple active layers with icons**
```javascript
var baseLayers = [
	{
		active: true,
		name: "OpenStreetMap",
		layer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
	}
];
var overLayers = [
	{
		name: "Drinking Water",
		icon: '<i class="icon icon-water"></i>',
		layer: L.geoJson(WaterGeoJSON)
	},
	{
		active: true,
		name: "Parking",
		icon: '<i class="icon icon-parking"></i>',
		layer: L.geoJson(ParkingGeoJSON)
	}
];
map.addControl( new L.Control.PanelLayers(baseLayers, overLayers) );
```

**Build panel layers from pure JSON Config**
```javascript
var panelJsonConfig = {
    "baselayers": [
        {
            "active": true,
            "name": "Open Cycle Map",
            "layer": {
                "type": "tileLayer",
                "args": [
                    "https://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
                ]
            }
        },
        {
            "name": "Landscape",
            "layer": {
                "type": "tileLayer",
                "args": [
                    "https://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png"
                ]
            }
        },        
        {
            "name": "Transports",
            "layer": {
                "type": "tileLayer",
                "args": [
                    "https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png"
                ]
            }
        }
    ],
    "overlayers": [
        {
            "name": "Terrain",
            "layer": {
            "type": "tileLayer",
            "args": [
                "https://toolserver.org/~cmarqu/hill/{z}/{x}/{y}.png", {
                "opacity": 0.5
                }
            ]
            }
        }
    ]
};
L.control.panelLayers(panelJsonConfig.baseLayers, panelJsonConfig.overLayers).addTo(map);
```

**Grouping of layers**
```javascript
L.control.panelLayers(
	[
		{
			name: "Open Street Map",
			layer: osmLayer
		},
		{
			group: "Walking layers",
			layers: [
				{
					name: "Open Cycle Map",
					layer: L.tileLayer('https://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png')
				},
				{
					name: "Hiking",
					layer: L.tileLayer("https://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png")
				}
			]
		},
		{
			group: "Road layers",
			layers: [
				{
					name: "Transports",
					layer: L.tileLayer("https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png")
				}
			]
		}
	],
	{collapsibleGroups: true}
).addTo(map);
```

**Collapse some layers' groups**
```javascript
L.control.panelLayers([
	{
		name: "Open Street Map",
		layer: osmLayer
	},
	{
		group: "Walking layers",
		layers: [
			{
				name: "Open Cycle Map",
				layer: L.tileLayer('https://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png')
			},
			{
				name: "Hiking",
				layer: L.tileLayer("https://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png")
			}			
		]
	},
	{
		group: "Road layers",
		collapsed: true,
		layers: [
			{
				name: "Transports",
				layer: L.tileLayer("https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png")
			}
		]
	}
]).addTo(map);
```

**Add layers dynamically at runtime**
```javascript
var panel = L.control.panelLayers();

$.getJSON('some/url/path.geojson', function(data){
	panel.addOverlay({
		name: "Drinking Water",
		icon: '<i class="icon icon-water"></i>',
		layer: L.geoJson(data)
	});
});
```


# Build

This plugin support [Grunt](https://gruntjs.com/) for building process.
Therefore the deployment require [NPM](https://npmjs.org/) installed in your system.
After you've made sure to have npm working, run this in command line:
```bash
npm install
grunt
```
