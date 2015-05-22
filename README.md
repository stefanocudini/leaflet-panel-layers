Leaflet Panel Layers
==============

Leaflet Control Layers extended with support groups and icons

Copyright [Stefano Cudini](http://labs.easyblog.it/stefano-cudini/)

Tested in Leaflet 0.7.3

**demo:**
[labs.easyblog.it/maps/leaflet-panel-layers](http://labs.easyblog.it/maps/leaflet-panel-layers/)

**Source code:**  
[Github](https://github.com/stefanocudini/leaflet-panel-layers)   
[Bitbucket](https://bitbucket.org/zakis_/leaflet-panel-layers)
[NPM](https://npmjs.org/package/leaflet-panel-layers)

![Image](https://raw.githubusercontent.com/stefanocudini/leaflet-panel-layers/master/images/leaflet-panel-layers-layout.jpg)

#Usage

**Multiple active layers with icons**
```javascript
var baseLayers = [
	{
		active: true,
		name: "OpenStreetMap",
		layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
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
                    "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
                ]
            }
        },
        {
            "name": "Landscape",
            "layer": {
                "type": "tileLayer",
                "args": [
                    "http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png"
                ]
            }
        },        
        {
            "name": "Transports",
            "layer": {
                "type": "tileLayer",
                "args": [
                    "http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png"
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
                "http://toolserver.org/~cmarqu/hill/{z}/{x}/{y}.png", {
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
				layer: L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png')
			},
			{
				name: "Hiking",
				layer: L.tileLayer("http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png")
			}			
		]
	},
	{
		group: "Road layers",
		layers: [
			{
				name: "Transports",
				layer: L.tileLayer("http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png")
			}
		]
	}	
]).addTo(map);
```


#Build

This plugin support [Grunt](http://gruntjs.com/) for building process.
Therefore the deployment require [NPM](https://npmjs.org/) installed in your system.
After you've made sure to have npm working, run this in command line:
```bash
npm install
grunt
```
