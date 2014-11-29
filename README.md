Leaflet Panel Layers
==============

Leaflet Control Layers extended for group of layers and icon legends

Author [Stefano Cudini](http://labs.easyblog.it/stefano-cudini/)

Tested in Leaflet 0.7.3

**demo:**

[labs.easyblog.it/maps/leaflet-panel-layers](http://labs.easyblog.it/maps/leaflet-panel-layers/)

**Source code:**  
[Github](https://github.com/stefanocudini/leaflet-panel-layers)   
[Bitbucket](https://bitbucket.org/zakis_/leaflet-panel-layers)
[NPM](https://npmjs.org/package/leaflet-panel-layers)

![Image](https://raw.githubusercontent.com/stefanocudini/leaflet-panel-layers/master/images/leaflet-panel-layers-layout.jpg)

#Usage

```javascript
var baseLayers = [
	{
		name: "OpenStreetMap",
		layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
	},
	{
		name: 'Outdoor Layers',	//separator with label
		sep: true		
	}
];

var overLayers = [
	{
		name: "Drinking Water",
		icon: '<i class="icon icon-water"></i>',
		layer: L.geoJson(WaterGeoJSON)
	},
	{
		name: "Parking",
		icon: '<i class="icon icon-parking"></i>',
		layer: L.geoJson(ParkingGeoJSON)
	}	
];

map.addControl( new L.Control.PanelLayers(baseLayers, overLayers) );
```


#Build

This plugin support [Grunt](http://gruntjs.com/) for building process.
Therefore the deployment require [NPM](https://npmjs.org/) installed in your system.
After you've made sure to have npm working, run this in command line:
```bash
npm install
grunt
```
