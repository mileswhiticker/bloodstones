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
		
		var instance = declare("_village_ui", null, {
			//put your functions here
			
			//CreateBuildVillagesUI
			UIBeginBuildVillages : function()
			{
				this.EnablePaymentBucket(gameui.STATE_BUILDVILLAGE);
				
				//run once before the anim frame kicks in
				this.UICanvasRenderBuildVillagesOverlay();
			},
			
			UICanvasRenderBuildVillagesOverlay : function()
			{
				//console.log("page::UICanvasRenderBuildVillagesOverlay()");
				this.StartAnimatedCanvas(this.UICanvasRenderBuildVillagesOverlay);
				//loop over the provinces and add an overlay for all the ones that are valid for player to build in
				//console.log(this.buildable_province_names);
				
				//list of buildable provinces are sent by server now
				//this.buildable_province_names = this.GetVillageBuildProvinces(this.getCurrentPlayer());
				for(var i in this.buildable_province_names)
				{
					//var cur_province = this.provinces[i];
					var cur_province_name = this.buildable_province_names[i];
					var cur_province = this.provinces_by_name[cur_province_name];
					var buildable_flag = this.GetProvinceBuildVillageFlag(cur_province);
					if(buildable_flag == PROV_BUILDABLE_NONE)
					{
						continue;
					}
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
							case PROV_BUILDABLE_LAND_EXP:
							{
								overlayColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_LAND_EXP);
								fillColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_LAND_EXP_TRANS);
								break;
							}
							default:
							{
								//this should never happen
								overlayColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_SEA);
								fillColor = this.GetProvinceOverlayColour(PROV_BUILDABLE_SEA_TRANS);
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
							case PROV_BUILDABLE_LAND_EXP:
							{
								this.SetProvinceOverlay(cur_province, PROV_BUILDABLE_LAND_EXP);
								break;
							}
							default:
							{
								//this should never happen
								this.SetProvinceOverlay(cur_province, PROV_BUILDABLE_SEA);
								break;
							}
						}
					}
				}
			},
			
			UIRefreshBuildVillages : function()
			{
				if(this.isCurrentPlayerVillagesState())
				{
					this.UIClearBuildVillages();
					this.UICanvasRenderBuildVillagesOverlay();
				}
			},
			
			UIClearBuildVillages : function()
			{
				this.StopAnimatedCanvas();
				this.ClearCanvas();
			},
			
			UIFinishBuildVillages : function(success)
			{
				//console.log("page::UIFinishBuildVillages()");
				this.UIClearBuildVillages();
				if(success)
				{
					//the pay window will get destroyed later when we get confirmation from the server that the player action was processed
					this.LockPaymentBucket();
				}
				else
				{
					this.DestroyPayWindow();
				}
			},
			
		});
			
		return instance;
	}
);
