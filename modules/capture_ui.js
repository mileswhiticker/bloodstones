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
		
		var instance = declare("_capture_ui", null, {
			
			//note: this is unused. im leaving it here just in case
			UICanvasRenderCaptureOverlay : function()
			{
				//console.log("page::UICanvasRenderCaptureOverlay()");
				
				//console.log(this.possible_capture_infos);
				for(var i in this.possible_capture_infos)
				{
					var capture_info = this.possible_capture_infos[i];
					//console.log(capture_info);
					var cur_province_name = this.GetProvinceNameFromId(capture_info.province_id);
					var cur_province_info = this.provinces_by_name[cur_province_name];
					
					var overlayType = PROV_INVALID; 
					var build_cost = this.getProvVillageCostType(cur_province_info.type);
					switch(build_cost)
					{
						case 1: 
						{
							//basic cost
							overlayType = PROV_BUILDABLE_LAND;
							break;
						}
						case 2: 
						{
							overlayType = PROV_BUILDABLE_LAND_EXP;
							break;
						}
						default:
						{
							//this should never be reached
							console.log("page::UICanvasRenderCaptureOverlay() unknown village capture cost: " + build_cost);
							break;
						}
					}
					var overlayColor = this.GetProvinceOverlayColour(overlayType);
					var fillColor = this.GetProvinceOverlayColour(overlayType + 1);
					if(cur_province_info.is_pulsing)
					{
						fillColor.a = (this.pulsing_province_time / this.pulsing_province_time_max);
						//console.log("this.pulsing_province_id:" + this.pulsing_province_id + " fillColor.a:" + fillColor.a);
					}
					this.SetProvinceOverlayColour(cur_province_info, overlayColor, fillColor);
				}
			},
		});
		
		return instance;
	}
);