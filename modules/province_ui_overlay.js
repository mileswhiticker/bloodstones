
define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_province_ui_overlay", null, {
			//put your functions here
			
			SetProvinceOverlayMode : function(overlay_mode)
			{
				//console.log("page::SetProvinceOverlayMode(" + overlay_mode + ")");
				this.current_overlay_mode = overlay_mode;
				
				//todo: move the province ui overlay states here from these other files
				//this file is a mess im just going to get this working for now
			},
			
			UpdateCurrentOverlayMode : function()
			{
				//console.log("page::UpdateCurrentOverlayMode() this.current_overlay_mode:" + this.current_overlay_mode);
				switch(this.current_overlay_mode)
				{
					case this.OVERLAY_SELECT:
					{
						this.ClearCanvas();
						if(this.selected_army != null)
						{
							//old code but ill leave it in and unused just in case
							console.log("WARNING! UpdateCurrentOverlayMode() the mode is OVERLAY_SELECT and this.selected_army != null");
							const start_province_info = this.provinces_by_name[this.selected_army.prov_name];
							this.SetProvinceOverlay(start_province_info, PROV_SELECT);
						}
						else if(this.selected_province_name != null)
						{
							const start_province_info = this.provinces_by_name[this.selected_province_name];
							this.SetProvinceOverlay(start_province_info, PROV_SELECT);
						}
						break;
					}
					case this.OVERLAY_CITADEL:
					{
						this.RefreshCitadelOverlay();
						break;
					}
					case this.OVERLAY_UNDEAD:
					{
						this.RefreshMoveModeUI();
						break;
					}
					case this.OVERLAY_WITHDRAWRETREAT:
					{
						this.RefreshRetreatOverlay();
						break;
					}
					case this.OVERLAY_CAPTURE:
					{
						this.RefreshCaptureUI();
						break;
					}
					case this.OVERLAY_BUILD:
					{
						this.RefreshBuildModeUI();
						break;
					}
					case this.OVERLAY_MOVE:
					{
						this.RefreshMoveModeUI();
						break;
					}
					case this.OVERLAY_BATTLE_PREVIEW:
					{
						this.ClearCanvas();
						if(this.selected_army != null)
						{
							const start_province_info = this.provinces_by_name[this.selected_army.prov_name];
							this.SetProvinceOverlay(start_province_info, PROV_SELECT);
						}
						
						this.RefreshPendingBattleCircles();
						
						break;
					}
					case this.OVERLAY_BATTLE:
					{
						this.ClearCanvas();
						if(this.selected_army != null && this.selected_army.prov_name != this.battling_province_name)
						{
							const start_province_info = this.provinces_by_name[this.selected_army.prov_name];
							this.SetProvinceOverlay(start_province_info, PROV_SELECT);
						}
						
						if(this.battling_province_name != null)
						{
							const start_province_info = this.provinces_by_name[this.battling_province_name];
							this.SetProvinceOverlay(start_province_info, PROV_BATTLE);
						}
						
						break;
					}
					case this.OVERLAY_VILLAGE:
					{
						this.UIRefreshBuildVillages();
						break;
					}
					case this.OVERLAY_NONE:
					{
						this.UIRefreshBuildVillages();
						break;
					}
					default:
					{
						console.log("WARNING! page::UpdateCurrentOverlayMode(" + this.current_overlay_mode + ") unknown overlay mode");
						this.ResetProvinceOverlayMode();
						break;						
					}
				}
			},
			
			ResetProvinceOverlayMode : function()
			{
				this.current_overlay_mode = this.OVERLAY_NONE;
				this.ClearCanvas();
			},
			
		});
			
		return instance;
	}
);
