(function (factory) {
if (typeof define === 'function' && define.amd) {
	//AMD
	define(['leaflet'], factory);
} else if (typeof module !== 'undefined') {
	// Node/CommonJS
	module.exports = factory(require('leaflet'));
} else {
	// Browser globals
	if (typeof window.L === 'undefined')
		throw 'Leaflet must be loaded first';
	factory(window.L);
}
})(function (L) {

L.Control.PanelLayers = L.Control.Layers.extend({

	includes: L.version[0]==='1' ? L.Evented.prototype : L.Mixin.Events,

	options: {
		compact: false,
		compactOffset: 0,
		collapsed: false,
		autoZIndex: true,
		collapsibleGroups: false,
		selectorGroup: false,			//select all layer of a group
		buildItem: null,				//function that return row item html node(or html string)
		title: '',						//title of panel
		className: '',					//additional class name for panel
		position: 'topright'
	},

	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);
		this._layers = [];
		this._groups = {};
		this._items = {};
		this._layersActives = [];
		this._lastZIndex = 0;
		this._handlingClick = false;

		this.className = 'leaflet-panel-layers';

		var i, n, isCollapsed;

		for (i in baseLayers) {
			if (baseLayers[i].group && baseLayers[i].layers) {
				isCollapsed = baseLayers[i].collapsed || false;
				for (n in baseLayers[i].layers)
					this._addLayer(baseLayers[i].layers[n], false, baseLayers[i].group, isCollapsed);
			}
			else
				this._addLayer(baseLayers[i], false);
		}

		for (i in overlays) {
			if (overlays[i].group && overlays[i].layers) {
				isCollapsed = overlays[i].collapsed || false;
				for (n in overlays[i].layers)
					this._addLayer(overlays[i].layers[n], true, overlays[i].group, isCollapsed);
			}
			else
				this._addLayer(overlays[i], true);
		}
	},

	onAdd: function (map) {

		var self = this;

		for (var i in this._layersActives) {
			map.addLayer(this._layersActives[i]);
		}

		L.Control.Layers.prototype.onAdd.call(this, map);

		this._map.on('resize', function(e) {
			self._updateHeight(e.newSize.y);
		});

		// update group checkboxes
		this._onInputClick();

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

	clearLayers: function () {
		for (var i = 0; i < this._layers.length; i++) {
			this.removeLayer(this._layers[i]);
		}
	},

	_layerFromDef: function (layerDef) {
		for (var i = 0; i < this._layers.length; i++) {
			var id = L.stamp(this._layers[i].layer);
			//TODO add more conditions to comparing definitions
			if (this._getLayer(id).name === layerDef.name)
				return this._getLayer(id).layer;
		}
	},

	_update: function () {
		this._groups = {};
		this._items = {};
		L.Control.Layers.prototype._update.call(this);
	},

	_getLayer: function (id) {
		for (var i = 0; i < this._layers.length; i++) {
			if (this._layers[i] && this._layers[i].id == id) {
				return this._layers[i];
			}
		}
	},

	_addLayer: function (layerDef, overlay, group, isCollapsed) {

		if(!layerDef.layer)
			throw new Error('layer not defined in item: '+(layerDef.name||''));

		if (!(layerDef.layer instanceof L.Class) &&
			(layerDef.layer.type && layerDef.layer.args)) {
			layerDef.layer = this._getPath(L, layerDef.layer.type).apply(L, layerDef.layer.args);
		}

		if(!layerDef.hasOwnProperty('id'))
			layerDef.id = L.stamp(layerDef.layer);

		if(layerDef.active)
			this._layersActives.push(layerDef.layer);

		this._layers.push(L.Util.extend(layerDef, {
			collapsed: isCollapsed,
			overlay: overlay,
			group: group
		}));

		if (this.options.autoZIndex && layerDef.layer && layerDef.layer.setZIndex) {
			this._lastZIndex++;
			layerDef.layer.setZIndex(this._lastZIndex);
		}

	},

	_createItem: function (obj) {

		var self = this;

		var item, input, checked;

		item = L.DomUtil.create('div', this.className + '-item' + (obj.active ? ' active' : ''));

		checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			if (typeof obj.exclusiveGroup !== "undefined"){
				input = this._createRadioElement(obj.exclusiveGroup.replace('', '_'), checked, obj);
			}else{
				input = L.DomUtil.create('input', this.className + '-selector');
				input.type = 'checkbox';
				input.defaultChecked = checked;
			}//TODO name
		} else
			input = this._createRadioElement('leaflet-base-layers', checked, obj);

		input.value = obj.id;
		input.layerId = obj.id;
		input.id = obj.id;
		input._layer = obj;

		L.DomEvent.on(input, 'click', function (e) {

			self._onInputClick();

			if (e.target.checked) {
				self.fire('panel:selected', e.target._layer);
			} else {
				self.fire('panel:unselected', e.target._layer);
			}

		}, this);

		var label = L.DomUtil.create('label', this.className + '-title');
		//TODO label.htmlFor = input.id;
		var title = L.DomUtil.create('span');
		title.innerHTML = obj.name || '';

		if (obj.icon) {
			var icon = L.DomUtil.create('i', this.className + '-icon');

			if (typeof obj.icon === 'string')
				icon.innerHTML = obj.icon || '';
			else
				icon.appendChild(obj.icon);

			label.appendChild(icon);
		}

		label.appendChild(input);
		label.appendChild(title);
		item.appendChild(label);

		if (this.options.buildItem) {
			var node = this.options.buildItem.call(this, obj); //custom node node or html string
			if (typeof node === 'string') {
				var tmp = L.DomUtil.create('div');
				tmp.innerHTML = node;
				item.appendChild(tmp.firstChild);
			}
			else
				item.appendChild(node);
		}

		this._items[input.value] = item;

		return item;
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked, obj) {

		var radioHtml = '<input type="radio" class="' + this.className + '-selector" name="' + name + '" id="' + obj.id + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += ' />';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var self = this,
			label, input, icon, checked;

		var list = obj.overlay ? this._overlaysList : this._baseLayersList;

		if (obj.group) {
			if (!obj.group.hasOwnProperty('name'))
				obj.group = {name: obj.group};

			if (!this._groups[obj.group.name]) {
				var collapsed = false;
				if (obj.collapsed === true)
					collapsed = true;
				this._groups[obj.group.name] = this._createGroup(obj.group, collapsed, obj.overlay);
			}

			list.appendChild(this._groups[obj.group.name]);
			list = this._groups[obj.group.name];
		}

		label = this._createItem(obj);

		list.appendChild(label);

		return label;
	},

	_createGroup: function (groupdata, isCollapsed, isOverlay) {

		var self = this,
			groupdiv = L.DomUtil.create('div', this.className + '-group'),
			grouplabel, grouptit, groupexp, groupchb;

		grouplabel = L.DomUtil.create('label', this.className + '-grouplabel', groupdiv);

		// collapsible group
		if (this.options.collapsibleGroups) {
			// classes
			L.DomUtil.addClass(groupdiv, 'collapsible');

			// +/- icon
			groupexp = L.DomUtil.create('i', this.className + '-icon', grouplabel);
			if (isCollapsed === true)
				groupexp.innerHTML = ' + ';
			else
				groupexp.innerHTML = ' - ';

			// click on group
			L.DomEvent.on(grouplabel, 'click', function (e) {
				// do not trigger the checkbox that we might have
				e.stopPropagation();
				e.preventDefault();
				// collapse
				if (L.DomUtil.hasClass(groupdiv, 'expanded')) {
					L.DomUtil.removeClass(groupdiv, 'expanded');
					groupexp.innerHTML = ' + ';
				}
				// expand
				else {
					L.DomUtil.addClass(groupdiv, 'expanded');
					groupexp.innerHTML = ' - ';
				}
				// update the component's total height
				self._updateHeight();
			});

			if (isCollapsed === false)
				L.DomUtil.addClass(groupdiv, 'expanded');
		}

		// group name
		grouptit = L.DomUtil.create('span', this.className + '-title', grouplabel);
		grouptit.innerHTML = groupdata.name;

		// group with checkbox
		if (isOverlay && this.options.selectorGroup) {
			// create checkbox
			groupchb = L.DomUtil.create('input', this.className + '-selector', grouplabel);
			groupchb.type  = 'checkbox';
			groupchb.value = 'group';
			groupchb.name  = groupdata.name;
			groupchb.title = 'select all';
			groupchb.defaultChecked = false;
			// click on checkbox
			L.DomEvent.on(groupchb, 'click', this._onGroupClick, this);
		}

		return groupdiv;
	},

	_onGroupClick: function (e) {
		var i, j, input, obj,
			group     = e.target,
			inputs    = this._form.getElementsByClassName(this.className + '-selector'),
			inputsLen = inputs.length,
			changes   = [];

		// do not trigger the label that could collapse/expand the group
		e.stopPropagation();

		// all layer checkboxes
		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			if (input.value == 'group') { continue; }
			obj = this._getLayer(input.value);
			if (obj.group && obj.group.name === group.name) {
				// change checkbox values
				if (input.checked !== group.checked) {
					changes.push(input);
					input.checked = group.checked;
				}
			}
		}

		// do the updates to the layers
		this._onInputClick();

		// fire the event that the layers were (un)selected to leaflet
		for (j in changes) {
			this.fire((group.checked ? 'panel:selected' : 'panel:unselected'), changes[j]._layer);
		}
	},

	_onInputClick: function () {
		var i, input, obj, key, g,
			inputs = this._form.getElementsByClassName(this.className + '-selector'),
			inputsLen = inputs.length,
			groups = {};

		// initialize groups
		for (key in this._groups) {
			groups[key] = {
				input   : null,
				checked : 0,
				total   : 0,
			};
		}

		this._handlingClick = true;

		// all layer checkboxes
		for (i = 0; i < inputsLen; i++) {

			input = inputs[i];

			if (input.value == 'group') {
				// remember group input
				groups[input.name].input = input;
				continue;
			}

			obj = this._getLayer(input.value);

			// if the obj is part of a group, count up
			if (obj.group) {
				groups[obj.group.name].total++;
				if (input.checked) {
					groups[obj.group.name].checked++;
				}
			}

			// add the layer to the map
			if (input.checked && !this._map.hasLayer(obj.layer)) {
				L.DomUtil.addClass(input.parentNode.parentNode, 'active');
				this._map.addLayer(obj.layer);
			}
			// remove the layer from the map
			else if (!input.checked && this._map.hasLayer(obj.layer)) {
				L.DomUtil.removeClass(input.parentNode.parentNode, 'active');
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;

		// update all groups that have checkboxes
		for (key in groups) {
			g = groups[key];
			if (! g.input) { continue; }

			// all
			if (g.checked === g.total) {
				g.input.indeterminate = false;
				g.input.checked = true;
			}
			// none
			else if (g.checked === 0) {
				g.input.indeterminate = false;
				g.input.checked = false;
			}
			// some
			else {
				g.input.indeterminate = true;
				// determine whether the next click selects or deselects all by the amount
				g.input.checked = (g.checked / g.total) >= 0.5;
			}
		}

		this._refocusOnMap();
	},


	_initLayout: function () {
		var container = this._container = L.DomUtil.create('div', this.className);

		if(this.options.compact)
			L.DomUtil.addClass(container, 'compact');

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		L.DomEvent
			.disableClickPropagation(container)
			.disableScrollPropagation(container);

		if (this.options.className)
			L.DomUtil.addClass(container, this.options.className);

		this._section = this._form = L.DomUtil.create('form', this.className + '-list');

		this._updateHeight();

		if (this.options.collapsed) {

			if (L.Browser.android)
				L.DomEvent
					.on(container, 'click', this._expand, this);
			else {
				L.DomEvent
					.on(container, 'mouseenter', this._expand, this)
					.on(container, 'mouseleave', this._collapse, this);
			}

			this._map.on('click', this._collapse, this);

		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', this.className + '-base', this._form);
		this._separator = L.DomUtil.create('div', this.className + '-separator', this._form);
		this._overlaysList = L.DomUtil.create('div', this.className + '-overlays', this._form);

		/* maybe useless
		if (!this.options.compact)
			L.DomUtil.create('div', this.className + '-margin', this._form);*/

		if (this.options.title) {
			var titlabel = L.DomUtil.create('label', this.className + '-title');
			titlabel.innerHTML = '<span>' + this.options.title + '</span>';
			container.appendChild(titlabel);
		}

		container.appendChild(this._form);
	},

	_updateHeight: function (h) {
		h = h || this._map.getSize().y;

		if (this.options.compact)
			this._form.style.maxHeight = (h - this.options.compactOffset) + 'px';
		else
			this._form.style.height = h + 'px';
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace('expanded', '');
	},

	_getPath: function (obj, prop) {
		var parts = prop.split('.'),
			last = parts.pop(),
			len = parts.length,
			cur = parts[0],
			i = 1;

		if (len > 0)
			while ((obj = obj[cur]) && i < len)
				cur = parts[i++];

		if (obj)
			return obj[last];
	}
});

L.control.panelLayers = function (baseLayers, overlays, options) {
	return new L.Control.PanelLayers(baseLayers, overlays, options);
};

return L.Control.PanelLayers;

});
