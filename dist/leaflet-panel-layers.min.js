/* 
 * Leaflet Panel Layers v0.0.1 - 2014-06-10 
 * 
 * Copyright 2014 Stefano Cudini 
 * stefano.cudini@gmail.com 
 * http://labs.easyblog.it/ 
 * 
 * Licensed under the MIT license. 
 * 
 * Demos: 
 * http://labs.easyblog.it/maps/leaflet-panel-layers/ 
 * 
 * Source: 
 * git@github.com:stefanocudini/leaflet-panel-layers.git 
 * 
 */
(function(){L.Control.PanelLayers=L.Control.Layers.extend({options:{collapsed:!1,position:"topright",autoZIndex:!0},initialize:function(a,b,c){L.setOptions(this,c),this._layers={},this._lastZIndex=0,this._handlingClick=!1;for(var d in a)this._addLayer(a[d]);for(d in b)this._addLayer(b[d],!0)},_addLayer:function(a,b){var c=L.stamp(a);this._layers[c]=a,this._layers[c].overlay=b,a.layer&&this.options.autoZIndex&&a.layer.setZIndex&&(this._lastZIndex++,a.layer.setZIndex(this._lastZIndex))},_addItem:function(a){var b,c,d,e,f="leaflet-panel-layers";a.sep?b=L.DomUtil.create("div",f+"-sub-separator"):(b=document.createElement("label"),e=this._map.hasLayer(a.layer),a.overlay?(c=document.createElement("input"),c.type="checkbox",c.className="leaflet-control-layers-selector",c.defaultChecked=e,d=L.DomUtil.create("i",f+"-icon",b),d.innerHTML=a.icon||"",b.appendChild(d)):c=this._createRadioElement("leaflet-base-layers",e),c.layerId=L.stamp(a),L.DomEvent.on(c,"click",this._onInputClick,this),b.appendChild(c));var g=document.createElement("span");g.innerHTML=" "+a.name,b.appendChild(g);var h=a.overlay?this._overlaysList:this._baseLayersList;return h.appendChild(b),b},_onInputClick:function(){var a,b,c,d=this._form.getElementsByTagName("input"),e=d.length;for(this._handlingClick=!0,a=0;e>a;a++)b=d[a],c=this._layers[b.layerId],b.checked&&!this._map.hasLayer(c.layer)?this._map.addLayer(c.layer):!b.checked&&this._map.hasLayer(c.layer)&&this._map.removeLayer(c.layer);this._handlingClick=!1},_initLayout:function(){var a="leaflet-panel-layers",b=this._container=L.DomUtil.create("div",a);b.setAttribute("aria-haspopup",!0),b.style.height=this._map.getSize().y+"px",this._map.on("resize",function(a){b.style.height=a.newSize.y+"px"}),L.Browser.touch?L.DomEvent.on(b,"click",L.DomEvent.stopPropagation):L.DomEvent.disableClickPropagation(b).disableScrollPropagation(b);var c=this._form=L.DomUtil.create("form",a+"-list");if(this.options.collapsed){L.Browser.android||L.DomEvent.on(b,"mouseover",this._expand,this).on(b,"mouseout",this._collapse,this);var d=this._layersLink=L.DomUtil.create("a",a+"-toggle",b);d.href="#",d.title="Layers",L.Browser.touch?L.DomEvent.on(d,"click",L.DomEvent.stop).on(d,"click",this._expand,this):L.DomEvent.on(d,"focus",this._expand,this),this._map.on("click",this._collapse,this)}else this._expand();this._baseLayersList=L.DomUtil.create("div",a+"-base",c),this._separator=L.DomUtil.create("div",a+"-separator",c),this._overlaysList=L.DomUtil.create("div",a+"-overlays",c),b.appendChild(c)},_expand:function(){L.DomUtil.addClass(this._container,"leaflet-panel-layers-expanded")},_collapse:function(){this._container.className=this._container.className.replace(" leaflet-panel-layers-expanded","")}})}).call(this);