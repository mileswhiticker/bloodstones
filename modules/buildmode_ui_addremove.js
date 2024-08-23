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
		
		var instance = declare("_buildmode_ui_addremove", null, {
			//put your functions here
			
			AddBuildModeUI : function()
			{
				//loop over the provinces and add an overlay for all the ones that are valid for player to build in
				for(var index in this.buildable_provinces)
				//for(var i in this.provinces)
				{
					var buildable_prov_id = this.buildable_provinces[index];
					var buildable_prov_name = this.GetProvinceNameFromId(buildable_prov_id)
					var cur_province = this.provinces_by_name[buildable_prov_name];
					var buildable_flag = this.GetProvinceBuildable(cur_province);
					if(cur_province.name == this.pulsing_province_id)
					{
						var overlayColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_LAND);
						var fillColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_LAND_TRANS);
						switch(buildable_flag)
						{
							//SetProvinceOverlay : function(province_info, overlay_type = PROV_NONE, label_type = LABEL_NONE, label_text = "")
							case PROV_BUILDABLE_LAND:
							{
								overlayColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_LAND);
								fillColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_LAND_TRANS);
								break;
							}
							case PROV_BUILDABLE_SEA:
							{
								overlayColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_SEA);
								fillColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_SEA_TRANS);
								break;
							}
							default:
							{
								break;
							}
						}
						//this.SetProvinceOverlay(cur_province, PROV_BUILDABLE_LAND);
						//fillColor.a = 1 - fillColor.a + fillColor.a * this.pulsing_province_time;
						fillColor.a = (this.pulsing_province_time / this.pulsing_province_time_max);
						//console.log("this.pulsing_province_id:" + this.pulsing_province_id + " fillColor.a:" + fillColor.a);
						this.SetProvinceOverlayColour(cur_province, overlayColor, fillColor);
					}
					else
					{
						//GetProvinceBuildable : function(var province_info, var faction_name)
						switch(buildable_flag)
						{
							//SetProvinceOverlay : function(province_info, overlay_type = PROV_NONE, label_type = LABEL_NONE, label_text = "")
							case PROV_BUILDABLE_LAND:
							{
								this.SetProvinceOverlay(cur_province, PROV_BUILDABLE_LAND);
								break;
							}
							case PROV_BUILDABLE_SEA:
							{
								this.SetProvinceOverlay(cur_province, PROV_BUILDABLE_SEA);
								break;
							}
						}
					}
				}
			},
			
			RemoveBuildModeUI : function()
			{
				this.ClearCanvas();
			},
			
			RefreshBuildModeUI : function()
			{
				//console.log("page::RefreshMoveModeUI()");
				if(this.isCurrentPlayerBuildMode())
				{
					this.RemoveBuildModeUI();
					this.AddBuildModeUI();
				}
				else
				{
					//console.log("WARNING: trying to refresh build mode UI but not currently in build mode");
				}
			},
		});
		
		return instance;
	}
);