(function() {

L.Control.PanelLayers = L.Control.Layers.extend({
	options: {
		button: false,		
		collapsed: false,
		autoZIndex: true,
		position: 'topright',		
		collapsibleGroups: false
	},
	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);
		this._layers = {};
		this._groups = {};
		this._items = {};		
		this._layersActives = [];
		this._lastZIndex = 0;
		this._handlingClick = false;

		var i, n;

		for (i in baseLayers) {
			if(baseLayers[i].group && baseLayers[i].layers) 
				for(n in baseLayers[i].layers)
					this._addLayer(baseLayers[i].layers[n], false, baseLayers[i].group);
			else
				this._addLayer(baseLayers[i], false);
		}

		for (i in overlays) {
			if(overlays[i].group && overlays[i].layers) 
				for(n in overlays[i].layers)
					this._addLayer(overlays[i].layers[n], true, overlays[i].group);
			else
				this._addLayer(overlays[i], true);
		}
	},
	
	onAdd: function (map) {
		
		for(var i in this._layersActives) {
			map.addLayer(this._layersActives[i]);
		}

		L.Control.Layers.prototype.onAdd.call(this, map);

		return this._container;
	},

	//TODO addBaseLayerGroup
	//TODO addOverlayGroup
	
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

	removeLayer: function (layerDef) {
		var layer = layerDef.hasOwnProperty('layer') ? this._layerFromDef(layerDef) : layerDef;
		
		this._map.removeLayer(layer);

		L.Control.Layers.prototype.removeLayer.call(this, layer);
		return this;
	},

	clearLayers: function() {
		for (var id in this._layers) {
			this.removeLayer( this._layers[id] );
		}
	},

	_layerFromDef: function(layerDef) {
		for (var id in this._layers) {
			
			//TODO add more conditions to comaparing definitions
			if(this._layers[id].name === layerDef.name)
				return this._layers[id].layer;
		}
	},

    _update: function() {
        this._groups = {}; 
        this._items = {};
        L.Control.Layers.prototype._update.call(this);
    },

	_instantiateLayer: function(layerDef) {
		if(layerDef instanceof L.Class)
			return layerDef;
		else if(layerDef.type && layerDef.args)
			return this._getPath(L, layerDef.type).apply(L, layerDef.args);
	},

	_addLayer: function (layerDef, overlay, group) {

		var layer = layerDef.hasOwnProperty('layer') ? this._instantiateLayer(layerDef.layer) : layerDef;

		var id = L.stamp(layer);

		if(layerDef.active)
			this._layersActives.push(layer);

		this._layers[ id ] = {
			layer: layer,
			name: layerDef.name,
			icon: layerDef.icon,
			overlay: overlay,
			group: group
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
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

		input.value = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		label.appendChild(input);

		if(obj.icon) {
			var icon = L.DomUtil.create('i', className+'-icon');
			icon.innerHTML = obj.icon || '';
			label.appendChild(icon);
		}
		var name = document.createElement('span');
		name.innerHTML = obj.name || '';
		label.appendChild(name);
		
		this._items[ input.value ] = label;

		return label;
	},

	_addItem: function (obj) {
		var self = this,
			className = 'leaflet-panel-layers',
			label, input, icon, checked;

		var list = obj.overlay ? this._overlaysList : this._baseLayersList;

		if(obj.group) {
            if(!obj.group.hasOwnProperty('name'))
                obj.group = { name: obj.group };

            if(!this._groups[ obj.group.name ])
                this._groups[ obj.group.name ] = this._createGroup( obj.group );
            
            list.appendChild(this._groups[obj.group.name]);
            list = this._groups[obj.group.name];
		}
		
		label = this._createItem(obj);

		list.appendChild(label);
		
		if(obj.group) {
			setTimeout(function() {
				self._container.style.width = (self._container.clientWidth-8)+'px';
			},100);
		}

		return label;
	},
    
    _createGroup: function ( groupdata ) {
        var className = 'leaflet-panel-layers',
            groupdiv = L.DomUtil.create('div', className + '-group'),
            grouplabel, groupexp;

        if(this.options.collapsibleGroups) {

			L.DomUtil.addClass(groupdiv, 'collapsible');

	        groupexp = L.DomUtil.create('i', className + '-icon', groupdiv);
	        groupexp.innerHTML = ' - ';


	        L.DomEvent.on(groupexp, 'click', function() {	        	
	            if ( L.DomUtil.hasClass(groupdiv, 'expanded') ) {
	                L.DomUtil.removeClass(groupdiv, 'expanded');
	                groupexp.innerHTML = ' + ';
	            } else {
	                L.DomUtil.addClass(groupdiv, 'expanded');
	                groupexp.innerHTML = ' - ';
	            }	            
	        });
	        L.DomUtil.addClass(groupdiv, 'expanded');        
	    }

       	grouplabel = L.DomUtil.create('label', className + '-grouplabel', groupdiv);
        grouplabel.innerHTML = '<span>'+groupdata.name+'</span>';
        
        return groupdiv;
    },

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			
			input = inputs[i];

			obj = this._layers[ input.value ];

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
			layerControlClassName = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);

		var form = this._form = L.DomUtil.create('form', className + '-list');
        
        this._map.on('resize', function(e) {
            form.style.height = e.newSize.y+'px';
        });

		form.style.height = this._map.getSize().y+'px';

		if (this.options.button) {
			this.options.collapsed = true;
			L.DomUtil.addClass(container, className+'-button-collapse');
		}

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', layerControlClassName+'-toggle', container);
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
        L.DomUtil.create('div', className + '-margin', form); // No need to store it

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
