Leaflet Panel Layers
==============

Leaflet Control Layers extended for group of layers and icon legends

Copyright 2014 [Stefano Cudini](http://labs.easyblog.it/stefano-cudini/)

Tested in Leaflet 0.7

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
	},	
	{	
		name: "OpenCycleMap",
		layer: L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png')
	},
	{
		name: "Outdoors",
		layer: L.tileLayer('http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png')
	}
];

var overLayers = [
	{
		name: 'Bike POI',	//separator with label
		sep: true		
	},
	{
		name: "Drinking Water",
		icon: '<i class="icon icon-water"></i>',
		layer: L.geoJson(WaterGeoJSON)
	},
	{
		name: 'Car POI',	//separator with label
		sep: true		
	},
	{
		name: "Parking",
		icon: '<i class="icon icon-parking"></i>',
		layer: L.geoJson(ParkingGeoJSON)
	}	
];

map.addControl( new L.Control.PanelLayers(baseLayers, overLayers, {collapsed: false}) );
```


#Build

This plugin support [Grunt](http://gruntjs.com/) for building process.
Therefore the deployment require [NPM](https://npmjs.org/) installed in your system.
After you've made sure to have npm working, run this in command line:
```bash
npm install
grunt
```
