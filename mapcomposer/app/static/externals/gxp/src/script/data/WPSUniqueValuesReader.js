/**
* Copyright (c) 2014 Geosolutions
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/** api: (define)
 *  module = gxp.data
 *  class = WPSUniqueValuesReader
 *  base_link = `Ext.data.JsonReader <http://extjs.com/deploy/dev/docs/?class=Ext.data.JsonReader>`_
 */
Ext.namespace("gxp.data");

/** api: constructor
 *  .. class:: WPSUniqueValuesReader(conn)
 *   
 *      A reader for responses generated by Geoserver WPS PagedUnique process.
 *      See Ext.data.JsonReader for configuration parameters.
 */
gxp.data.WPSUniqueValuesReader = Ext.extend(Ext.data.JsonReader, {
    constructor: function(config) {
      	/*Ext.applyIf(config, {
            root: 'values',
            totalProperty: 'size',
            idProperty: 'value',
            fields: [{name:'value', mapping: '', convert: function (a,b) {
                    return b;
                }}]
        });*/
        //temporary fix for null value    
      	Ext.applyIf(config, {
            root: 'values',
            totalProperty: 'size',
            idProperty: 'value',
            fields: [{
                name:'value',
                mapping: function( o ) {
                    var mapping = o ? o : null;
                    return mapping; 
                },
                convert: function (a,b) {
                    var value = b ? b : "no data";
                    return value;
                }
            }]
        });
        this.createAccessor = function(){
            var re = /[\[\.]/;
            return function(expr) {
                if(Ext.isEmpty(expr)){
                    return Ext.emptyFn;
                }
                if(Ext.isFunction(expr)){
                    return expr;
                }
                var i = String(expr).search(re);
                if(i >= 0){
                    return new Function('obj', 'return obj' + (i > 0 ? '.' : '') + expr);
                }
                return function(obj){
                    var obj = obj ? obj : "no data";
                    return obj[expr];
                };

            };
        }();
        gxp.data.WPSUniqueValuesReader.superclass.constructor.call(this, config);
    },
	//parser: new OpenLayers.Format.GML(),
    /**
     * This method is only used by a DataProxy which has retrieved data from a remote server.
     * @param {Object} response The XHR object which contains the JSON data in its responseText.
     * @return {Object} data A data block which is used by an Ext.data.Store object as
     * a cache of Ext.data.Records.
     
    read : function(response){
		//var gmlData = response.executeResponse.processOutputs[0].complexData.value;
        var jsonArray = this.parser.read({documentElement: gmlData});
        return this.readRecords({data:jsonArray});
    },*/
    /**
     * Decode a JSON response from server.
     * @param {String} action [Ext.data.Api.actions.create|read|update|destroy]
     * @param {Object} response The XHR object returned through an Ajax server request.
     * @return {Response} A {@link Ext.data.Response Response} object containing the data response, and also status information.
     */
    readResponse : function(action, response) {
        this.read(response);
	}

});
Ext.reg('gxp_wpsuniquereader', gxp.data.WPSUniqueValuesReader);