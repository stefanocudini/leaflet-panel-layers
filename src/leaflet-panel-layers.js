(function() {

L.Control.PanelLayers = L.Control.Layers.extend({
	options: {
		collapsed: false,
		position: 'topright',
		autoZIndex: true
	},
	
	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);
		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers)
			this._addLayer(baseLayers[i]);

		for (i in overlays)
			this._addLayer(overlays[i], true);
	},
	_addLayer: function (obj, overlay) {
		//var id = obj.layer ? L.stamp(obj.layer);
		var id = L.stamp(obj);

		this._layers[id] = obj;
		this._layers[id].overlay = overlay;

		if (obj.layer && this.options.autoZIndex && obj.layer.setZIndex) {
			this._lastZIndex++;
			obj.layer.setZIndex(this._lastZIndex);
		}
	},
	_addItem: function (obj) {
		var className = 'leaflet-panel-layers',
			label, input, icon, checked;

		if(obj.sep)
		{
			label = L.DomUtil.create('div', className + '-sub-separator');
		}
		else
		{
			label = document.createElement('label');
			checked = this._map.hasLayer(obj.layer);
			if (obj.overlay) {
				input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'leaflet-control-layers-selector';
				input.defaultChecked = checked;
				
				icon = L.DomUtil.create('i',className+'-icon', label);
				icon.innerHTML = obj.icon || '';
				label.appendChild(icon);

			} else {
				input = this._createRadioElement('leaflet-base-layers', checked);
			}
			// if(obj.className)
			// 	L.DomUtil.addClass(label, obj.className);

			input.layerId = L.stamp(obj);

			L.DomEvent.on(input, 'click', this._onInputClick, this);
			label.appendChild(input);


		}

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;
		label.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
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
	}	
});


}).call(this);
