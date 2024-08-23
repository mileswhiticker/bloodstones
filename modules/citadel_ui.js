/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_citadel_ui", null, {
			//place your functions here
			
			UIBeginPlaceCitadel : function()
			{
				this.UICanvasRenderPlaceCitadelOverlay();
			},
			
			UICanvasRenderPlaceCitadelOverlay : function()
			{
				console.log("page::UICanvasRenderPlaceCitadelOverlay()");
				for(var i in this.possible_citadel_provinces)
				{
					var cur_province_name = this.possible_citadel_provinces[i];
					var cur_province = this.provinces_by_name[cur_province_name];
					
					var overlayColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_LAND);
					var fillColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_LAND_TRANS);
					if(cur_province.name == this.pulsing_province_id)
					{
						fillColor.a = (this.pulsing_province_time / this.pulsing_province_time_max);
						//console.log("this.pulsing_province_id:" + this.pulsing_province_id + " fillColor.a:" + fillColor.a);
					}
					this.SetProvinceOverlayColour(cur_province, overlayColor, fillColor);
				}
			},
			
			UIFinishPlaceCitadel : function()
			{
				this.ClearCanvas();
			},
		});
		
		return instance;
	}
);
