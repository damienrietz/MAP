/**
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @author Tobia Di Pisa
 */

/** api: (define)
 *  module = gxp
 *  class = OverviewMap
 *  base_link = `Ext.Panel <http://dev.sencha.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class::OverviewMap(config)
 *   
 *      create a panel to display a OverviewMap on the map
 */
gxp.plugins.OverviewMap = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = gxp_mouseposition */
    ptype: "gxp_overviewmap",
	
	/** api: config[map]
     *  ``OpenLayers.Map`` or :class:`GeoExt.MapPanel`
     *  The map where to show the watermark.
     */
    map: null,
	
	layers: null,
    
    /** api: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
		gxp.plugins.OverviewMap.superclass.init.apply(this, arguments);
		this.target = target;
		
		this.target.on('ready', function(){
			this.addOverviewMap();
		}, this);
    },
	
    /** private: method[addOverviewMap]
     *  
     */
    addOverviewMap: function() {
		this.map = this.target.mapPanel.map;
		
		var baseLayer = new OpenLayers.Layer.Google(
            "Google Hybrid",
            {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
        )
		
		var mapOptions = {
			maxExtent: this.map.getMaxExtent(), 
			projection: this.map.getProjection()
		};
		
		var overviewLayers = [];
		
		
		
		var aLayer = new OpenLayers.Layer.WMS(
                        "Cartografia:Confine_comunale", 
                        "http://sit.comune.bolzano.it/geoserver/Cartografia/wms",                        
                        {
                            LAYERS: "Cartografia:Confine_comunale"
                        },
                        {
                            isBaseLayer: true
                        } 
                    );
		var bLayer = new OpenLayers.Layer.WMS(
                        "Ambiente:quartieri", 
                        "http://sit.comune.bolzano.it/geoserver/Ambiente/wms",                        
                        {
                            LAYERS: "Ambiente:quartieri",
							transparent: true
                        },
                        {
                            isBaseLayer: false
                        } 
                    );	
					
		var dLayer = new OpenLayers.Layer.WMS(
                        "Cartografia:ferrovia", 
                        "http://sit.comune.bolzano.it/geoserver/Cartografia/wms",                        
                        {
                            LAYERS: "Cartografia:ferrovia",
							transparent: true
                        },
                        {
                            isBaseLayer: false
                        } 
                    );			
			
		var cLayer = new OpenLayers.Layer.WMS(
                        "Cartografia:autostrada", 
                        "http://sit.comune.bolzano.it/geoserver/Cartografia/wms",                        
                        {
                            LAYERS: "Cartografia:autostrada",
							transparent: true
                        },
                        {
                            isBaseLayer: false
                        } 
                    );
					
		if(this.layers){
			for (var i=0; i < this.layers.length; i++) {
				
				if (i == 0) {
					overviewLayers.push(new OpenLayers.Layer.WMS(
							this.layers[i].name, 
							this.layers[i].wmsserver,                        
							{
								LAYERS: this.layers[i].name
							},
							{
								isBaseLayer: true
							} 
						));
				} else {
					overviewLayers.push(new OpenLayers.Layer.WMS(
							this.layers[i].name, 
							this.layers[i].wmsserver,                        
							{
								LAYERS: this.layers[i].name,
								transparent: true
							},
							{
								isBaseLayer: false
							} 
						));
				}
			}
		} else {
			overviewLayers.push(baseLayer);
		} 			
		
		var overview = new OpenLayers.Control.OverviewMap({
			maximized: true,
			mapOptions: OpenLayers.Util.extend(mapOptions, {
				maxExtent: this.map.getMaxExtent()
			}),
			layers: overviewLayers
		});
		
		
		
		// if (this.layers){
			// var addLayer = apptarget.tools["addlayer"];
			
		// }
	   
		this.map.addControl(overview);
    }
});

Ext.preg(gxp.plugins.OverviewMap.prototype.ptype, gxp.plugins.OverviewMap);