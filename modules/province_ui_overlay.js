
define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_province_ui_overlay", null, {
			//put your functions here
			
			/*
			this.OVERLAY_NONE = 0;
			this.OVERLAY_SELECT = 1;
			this.OVERLAY_CAPTURE = 2;
			this.OVERLAY_BUILD = 3;
			this.OVERLAY_MOVE = 4;
			this.OVERLAY_BATTLE = 5;
			this.OVERLAY_VILLAGE = 6;
			*/
			SetProvinceOverlayMode : function(overlay_mode)
			{
				this.current_overlay_mode = overlay_mode;
				
				//todo: move the province ui overlay states here from these other files
				switch(overlay_mode)
				{
					case this.OVERLAY_SELECT:
					{
						if(this.selected_army != null)
						{
							//this.selected_army
						}
						break;
					}
					case this.OVERLAY_CAPTURE:
					{
						break;
					}
					case this.OVERLAY_BUILD:
					{
						break;
					}
					case this.OVERLAY_MOVE:
					{
						break;
					}
					case this.OVERLAY_BATTLE:
					{
						break;
					}
					case this.OVERLAY_VILLAGE:
					{
						break;
					}
					default:
					{
						console.log("WARNING! page::SetProvinceOverlayMode(" + overlay_mode + ") unknown overlay mode");
						this.ClearProvinceOverlayMode();
						break;						
					}
				}
			},
			
			ClearProvinceOverlayMode : function()
			{
				this.current_overlay_mode = this.OVERLAY_NONE;
				this.ClearCanvas();
			},
			
		});
			
		return instance;
	}
);
