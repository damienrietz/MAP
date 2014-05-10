/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires plugins/Playback.js
 * @requires plugins/DownloadList.js
 * @requires plugins/WFSGrid.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = CustomBinder
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: CustomBinder(config)
 *
 *    Provides an action bind playback, downlad list and wfs grid plugins.
 */
gxp.plugins.CustomBinder = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_custombinder */
    ptype: "gxp_custombinder",
    filterByExtent: false,
    
    /** api: config[playbackId]
    *  ``String`` playback component id to bind
    */
    playbackId: "playback",
    
    /** api: config[downloadGridId]
    *  ``String`` feature grid component id to bind
    */
    downloadGridId: "downloadgrid",
    
    /** api: config[wfsGridId]
    *  ``String`` feature grid component id to bind
    */
    wfsGridId: "wfsGridPanel",
    
    /** api: config[autoExpandPanel]
    *  ``String`` panel that contains download grid panel
    */
    autoExpandPanel: null,

    addActions: function(actions){
        var self = this;
        this.target.on('ready',function() {
            self.bindWFSGrid();
        }, this);
    },
    bindWFSGrid: function(){
        var me = this;
        var playback = this.target.tools[this.playbackId]; 
        var downloadGrid = this.target.tools[this.downloadGridId];
        var wfsGrid = this.target.tools[this.wfsGridId];

        if(wfsGrid && downloadGrid){
            wfsGrid.on({
                'itemAdded': function(record){
                    var n = record.id.split(".");
                    var index = parseInt(n[n.length-1]);
                    if(!(downloadGrid.grid.store.getById(index) === undefined)){
                        Ext.Msg.alert('Status', 'this AOI has been already added to the download list.');
                        return;
                    }
                    var el = {
                        filename: record.data.location
                    }
                    var newRecord = new downloadGrid.grid.store.recordType(el, index);
                    downloadGrid.grid.store.add(newRecord);
                    if(me.autoExpandPanel){
                        var autoExpandPanel = Ext.getCmp(me.autoExpandPanel);
                        if(autoExpandPanel && autoExpandPanel.collapsed)
                            autoExpandPanel.expand(true);
                    }
                }
            });
        }  

        if(wfsGrid && playback){

            var wfsOutput = wfsGrid.output[0];
            var map = me.target.mapPanel.map;
            
            var timeFilter;
            var extentFilter;

            // support functions
            var buildTimeIntervalFilter = function (slider){
                var minTimestamp = slider.getValues()[1];
                var maxTimestamp = slider.getValues()[0];
                var dateMin = new Date();
                var dateMax = new Date();
                dateMin.setTime(minTimestamp);
                dateMax.setTime(maxTimestamp);
                return "time DURING " + dateMin.toISOString() +"/"+ dateMax.toISOString();
              };
    
              var setAOITime = function (playback,record){
                var slider = playback.playbackToolbar.slider;
                var minTimestamp = slider.getValues()[1];
                var maxTimestamp = slider.getValues()[0];
                var newTime = new Date(record.data.time).getTime();
                if(newTime > maxTimestamp){
                    //grey thumb
                    slider.setValue(0, newTime+500000, true);
                    // red thumbs
                    slider.setValue(1, newTime-500000, true);
                }
                else{
                    slider.setValue(1, newTime-500000, true);
                    slider.setValue(0, newTime+500000, true);
                }
              };

            var handleTimeChange = function(slider, e){
                timeFilter = buildTimeIntervalFilter(playback.playbackToolbar.slider);
                wfsOutput.store.reload();
                wfsOutput.getView().refresh();
                
                //remove the selected layers
                var targetLayer = map.getLayersByName("selectedFeature")[0];
                if(targetLayer){
                    map.removeLayer(targetLayer);
                }
                wfsOutput.getSelectionModel().clearSelections();


                if(downloadGrid){
                    downloadGrid.grid.getStore().removeAll();
                    if(me.autoExpandPanel){
                        var autoExpandPanel = Ext.getCmp(me.autoExpandPanel);
                        if(autoExpandPanel && !autoExpandPanel.collapsed)
                            autoExpandPanel.collapse(true);
                    }
                }
            };


    
            var setLatest24Hours = function (playback){
                var slider = playback.playbackToolbar.slider;
                //getting current timestamp
                //var now = new Date().getTime();
                var max = slider.maxValue;
                //grey thumb
                slider.setValue(0,max, true);
                // red thumbs
                slider.setValue(1,max-86400000, true);
            };


      
            var getMinTime =  function (playback){
                var minTimestamp = playback.playbackToolbar.slider.getValues()[1];
                var dateMin = new Date();
                dateMin.setTime(minTimestamp);
                return dateMin.toISOString();
              };
              
            var getMaxTime = function (playback){
                var maxTimestamp = playback.playbackToolbar.slider.getValues()[0];
                var dateMax = new Date();
                dateMax.setTime(maxTimestamp);
                return dateMax.toISOString();
              };

            if(this.filterByExtent){
                map.events.register('moveend', map, function(){
                    var extent = map.getExtent();
                    extentFilter = extent.toBBOX();
                    var bbox = extentFilter.split(",");
                    var leftBottom = new OpenLayers.Geometry.Point(bbox[0],bbox[1]);
                    leftBottom = leftBottom.transform(
                        new OpenLayers.Projection(map.projection), new OpenLayers.Projection("EPSG:4326")
                    );
                    var rightTop = new OpenLayers.Geometry.Point(bbox[2],bbox[3]);
                    rightTop = rightTop.transform(
                        new OpenLayers.Projection(map.projection), new OpenLayers.Projection("EPSG:4326")
                    );

                    // extentFilter = leftBottom.x + "," + leftBottom.y + "," + rightTop.x + "," + rightTop.y;
                    extentFilter = leftBottom.y + "," + leftBottom.x + "," + rightTop.y + "," + rightTop.x;

                    wfsOutput.store.reload();
                    wfsOutput.getView().refresh();
                });
            }

            wfsGrid.on({
                'zoomToTime': function(record){
                    setAOITime(playback,record);
                    handleTimeChange(playback.playbackToolbar.slider);
                }
            });



            wfsOutput.store.on(
                'beforeload', function(store,options){

                    var cqlFilter;

                    if(timeFilter){
                        cqlFilter = timeFilter;
                    }
                    if(extentFilter && !cqlFilter){
                        options.params['BBOX'] = extentFilter;
                    }else if(extentFilter){
                        cqlFilter += " AND BBOX(the_geom," + extentFilter + ")";
                    }
                    
                    if(cqlFilter){
                        options.params['CQL_FILTER'] = cqlFilter;
                    }
            });

            playback.on({
                'rangemodified': function(e){
                    
                    // if no other events are fired means that we are at startup, so setup the initial interval
                    setLatest24Hours(playback);
                    handleTimeChange(playback.playbackToolbar.slider);
                }
            });

            if(playback.playbackToolbar){    
                playback.playbackToolbar.slider.on({
                    'dragend': function(slider, e){
                        handleTimeChange(slider, e);
                    }
                });
                
                playback.playbackToolbar.on({
                    'next': function(slider){
                        handleTimeChange(slider);
                    },
                    
                    'back': function(slider){
                        handleTimeChange(slider);
                    },
                    
                    'play': function(slider){
                        handleTimeChange(slider);
                    },
                    
                    'fullRange': function(slider){
                        playback.timeManager.clearTimer();
                        setLatest24Hours(playback);
                        handleTimeChange(playback.playbackToolbar.slider);
                        /*var minTimestamp = slider.getValues()[1];
                        var maxTimestamp = slider.getValues()[0];
                        if(slider.maxValue ==  maxTimestamp && slider.minValue == minTimestamp){
                            handleTimeChange(slider);
                        }*/
                    }
                    
                });
            }
        }




        // WPS
                    
        var wpsClient = this.target.tools["wpsSPM"];

        var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, loading..."});

                    
                    downloadGrid.on(
                        'startDownload', function(fileNames){
                            appMask.show();
                            var workspace = new OpenLayers.WPSProcess.LiteralData({value:"mariss"});
                            var mosaicStoreName = new OpenLayers.WPSProcess.LiteralData({value:"sar-data"});
                            var shipLayerName = new OpenLayers.WPSProcess.LiteralData({value:"tem_sd__1p"});
                            
                            var fileList = '';
                            function buildString(element, index, array) {
                                fileList += element + ";";
                            };
                            fileNames.forEach(
                                buildString
                            );
                            
                            var granules = new OpenLayers.WPSProcess.LiteralData({value:fileList});
                            var minTime = getMinTime(playback);
                            var maxTime = getMaxTime(playback);
                            var minTimeDTO = new OpenLayers.WPSProcess.LiteralData({value:minTime});
                            var maxTimeDTO = new OpenLayers.WPSProcess.LiteralData({value:maxTime});
                            // TODO Use complex Data to use a List
                            //"world2_2012_0001.000.tif;world2_2013_0001.000.tif;world2_2014_0001.000.tif"
                            //var granule1 = new OpenLayers.WPSProcess.LiteralData({value:"world2_2012_0001.000.tif"});
                            //var granule2 = new OpenLayers.WPSProcess.LiteralData({value:"world2_2013_0001.000.tif"});
                            //var granule3 = new OpenLayers.WPSProcess.LiteralData({value:"world2_2014_0001.000.tif"});
                            //var granules = [granule1, granule2, granule3];
                            //var complexGranules = new OpenLayers.WPSProcess.ComplexData(granules);

                            var entity;
                            var instanceID = wpsClient.execute('gs:Download',{
                                "storeExecuteResponse": true,
                                "lineage": true,
                                "status": true,
                                type: "data",
                                "inputs": {
                                    "MinTime": minTimeDTO,
                                    "MaxTime": maxTimeDTO,
                                    "Workspace": workspace,
                                    "ImageMosaic Store Name": mosaicStoreName,
                                    "Ship Detection Layer": shipLayerName,
                                    "Granule Names": granules
                                },
                                "outputs": [{
                                    "identifier": "result",
                                    "mimeType" : "application/zip",
                                    "asReference": true
                                }]
                            },function(){});
                            
                            var linkReceived = false;
                            var updateFun = function() {
                                wpsClient.getExecuteInstances('gs:Download',true,function(instance, statusInfo){
                                    if(!linkReceived) {
                                        if(statusInfo && statusInfo.status === 'Process Succeeded' && instance.name === instanceID) {
                                            linkReceived = true;
                                            clearInterval(interval);
                                            Ext.Ajax.request({
                                                url: statusInfo.statusLocation,
                                                method: 'GET',
                                                success: function(response){
                                                    var format = new OpenLayers.Format.XML(); 
                                                    var link;
                                                    try{
                                                        if(Ext.isIE){
                                                            var elements = format.getElementsByTagNameNS(response.responseXML,'http://www.opengis.net/wps/1.0.0','*');
                                                            var findReference = function(element, index, array){
                                                                if(element.baseName == "Reference"){
                                                                    link = element.getAttribute("href");
                                                                }
                                                            };
                                                            elements.forEach(
                                                                findReference
                                                            );
                                                        }
                                                        else{
                                                            link = format.getElementsByTagNameNS(response.responseXML,'http://www.opengis.net/wps/1.0.0','Reference')[0].getAttribute("href");
                                                        }
                                                    }
                                                    catch(err){
                                                    }
                                                    if(!link){
                                                        wpsClient.deleteExecuteInstance(instance.id, function() {});
                                                        appMask.hide();
                                                        Ext.Msg.alert('Error','An error occurs when try to parse the result document. Please try again.');                                          
                                                    }
                                                    else{
                                                        wpsClient.deleteExecuteInstance(instance.id, function(){});
                                                        appMask.hide();
                                                        window.open(link,'_self');
                                                        Ext.Msg.show({
                                                           title:'Download',
                                                           msg: 'Click <a href=\"' + link + '\">HERE</a> if the download doesn\'t start automatically',
                                                           buttons: Ext.Msg.OK,
                                                           fn: function(btn, text) {
                                                                
                                                           },
                                                           icon: Ext.MessageBox.INFO
                                                        });
                                                    }
                                                },
                                                failure: function(response){
                                                    wpsClient.deleteExecuteInstance(instance.id, function() {});
                                                    appMask.hide();
                                                    Ext.Msg.alert('Error','An error occur when try to get the URL of the requested resource. Please try again.');
                                                }
                                            });
                                        }else if (statusInfo && statusInfo.status === 'Process Failed'){

                                            clearInterval(interval);
                                            appMask.hide();
                                            Ext.Msg.show({
                                               title:'Error on WPS execution',
                                               msg: 'More information <a href=\"' + statusInfo.statusLocation + '\">HERE</a>',
                                               icon: Ext.MessageBox.ERROR
                                            });
                                        }
                                    }
                                });
                            };
                            
                            var interval = setInterval(updateFun,3000);
                        }
                    );



    }
});

Ext.preg(gxp.plugins.CustomBinder.prototype.ptype, gxp.plugins.CustomBinder);
