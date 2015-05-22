(function() {

L.Control.PanelLayers = L.Control.Layers.extend({
	options: {
		collapsed: false,
		position: 'topright',
		autoZIndex: true
	},
		//TODO add support for json layers defintions
		//fields:
		//	layerType: "tileLayer",
		//	layerUrl: "http://..."
		//	layerAdd: true

	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);
		this._layers = {};
		this._groups = {};
		this._layersActives = [];
		this._lastZIndex = 0;
		this._handlingClick = false;

		var i, n;

		for (i in baseLayers)
			if(baseLayers[i].group && baseLayers[i].layers) 
				for(n in baseLayers[i].layers)
					this._addLayer(baseLayers[i].layers[n], false, baseLayers[i].group);
			else
				this._addLayer(baseLayers[i], false);

		for (i in overlays)
			if(overlays[i].group && overlays[i].layers) 
				for(n in overlays[i].layers)
					this._addLayer(overlays[i].layers[n], true, overlays[i].group);
			else			
				this._addLayer(overlays[i], true);
	},
	
	onAdd: function (map) {
		
		for(var i in this._layersActives)
			map.addLayer(this._layersActives[i]);

		L.Control.Layers.prototype.onAdd.call(this, map);

		return this._container;
	},
	
	addBaseLayer: function (layer, name, group) {
		layer.name = name || layer.name || '';
		this._addLayer(layer, false, group);
		this._update();
		return this;
	},

	addOverlay: function (layer, name, group) {
		layer.name = name || layer.name || '';
		this._addLayer(layer, true, group);
		this._update();
		return this;
	},

	_instanceLayer: function(layerDef) {
		if(layerDef instanceof L.Class)
			return layerDef;
		else if(layerDef.type && layerDef.args)
			return this._getPath(L, layerDef.type).apply(window, layerDef.args);
	},

	_addLayer: function (layer, overlay, group) {

		var layerLayer = this._instanceLayer(layer.layer),
			id = L.stamp(layerLayer);

		if(layer.active)
			this._layersActives.push(layerLayer);

		this._layers[id] = {
			layer: layerLayer,
			name: layer.name,
			icon: layer.icon,
			overlay: overlay,
			group: group
		};

		if (this.options.autoZIndex && layerLayer.setZIndex) {
			this._lastZIndex++;
			layerLayer.setZIndex(this._lastZIndex);
		}
	},

	_createItem: function(obj) {
		var className = 'leaflet-panel-layers',
			label, input, checked;
		
		label = L.DomUtil.create('label', className + '-item');
		checked = this._map.hasLayer(obj.layer);
		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);
		label.appendChild(input);

		if(obj.icon) {
			var icon = L.DomUtil.create('i', className+'-icon');
			icon.innerHTML = obj.icon || '';
			label.appendChild(icon);
		}
		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;
		label.appendChild(name);

		return label;
	},

	_addItem: function (obj) {
		var className = 'leaflet-panel-layers',
			label, input, icon, checked;

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;

		if(obj.group) {
			if(!this._groups[obj.group])
			{
				this._groups[obj.group] = L.DomUtil.create('fieldset', className + '-group', container);
				label = L.DomUtil.create('legend', className + '-grouplabel');
				var name = document.createElement('span');
				name.innerHTML = ' ' + obj.group;
				label.appendChild(name);
				this._groups[obj.group].appendChild(label);
			}
			container = this._groups[obj.group];
		}
		
		label = this._createItem(obj);

		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},


	_initLayout: function () {
		var className = 'leaflet-panel-layers',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		container.style.height = this._map.getSize().y+'px';

		this._map.on('resize', function(e) {
			container.style.height = e.newSize.y+'px';
		});

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-panel-layers-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-panel-layers-expanded', '');
	},

	_getPath: function(obj, prop) {
		var parts = prop.split('.'),
			last = parts.pop(),
			len = parts.length,
			cur = parts[0],
			i = 1;

		if(len > 0)
			while((obj = obj[cur]) && i < len)
				cur = parts[i++];

		if(obj)
			return obj[last];
	}
});

L.control.panelLayers = function (baseLayers, overlays, options) {
	return new L.Control.PanelLayers(baseLayers, overlays, options);
};

}).call(this);
