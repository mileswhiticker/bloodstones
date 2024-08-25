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
		
		var instance = declare("_freebuild", null, {
			//put your functions here
			
			AddFreeBuildUI : function()
			{
				//console.log("page::AddFreeBuildUI()");
				//reuse most of the code from build mode
				//see buildmode.js
				
				//reset these
				this.pulsing_province_time = 0;
				this.prev_frame_timestamp = 0;
				this.pulsing_province_dir = 1;
				
				//this.prev_frame_timestamp = this.date.getTime();
				this.build_mode_cancel_anim = window.requestAnimationFrame(this.buildmodeAnimFrame);
				this.AddBuildModeUI();
				this.EnablePaymentBucket(PHASE_BUILD);
			},
			
			UnlimitChaosHordeBuildableProvinces : function()
			{
				//console.log("page::UnlimitChaosHordeBuildableProvinces()");
				
				//this gets called when a chaos horde player wants to change their starting freebuild province
				//undo and reset the changes in LimitChaosHordeBuildableProvinces()
				this.chaos_horde_start_prov_name = null;
				var current_player_id = this.getCurrentPlayer();
				this.buildable_provinces = this.buildable_provinces_backup;
				
				this.RefreshBuildModeUI();
			},
			
			LimitChaosHordeBuildableProvinces : function(start_province_name)
			{
				//console.log("page::LimitChaosHordeBuildableProvinces(" + start_province_name + ")");
				this.chaos_horde_start_prov_name = start_province_name;
				//chaos_horde_start_prov_name
				var start_province_id = this.GetProvinceIdFromName(start_province_name);
				
				//now remove all other provinces
				this.buildable_provinces = [start_province_id];
				
				//add back in adjacent sea provinces
				var start_prov_info = this.provinces_by_name[start_province_name];
				var adj_prov_ids = this.GetAdjacentProvinceIds(start_prov_info);
				for(var i in adj_prov_ids)
				{
					var check_prov_id = adj_prov_ids[i];
					var check_prov_info = this.GetProvinceById(check_prov_id);
					if(check_prov_info.type == "Sea")
					{
						this.buildable_provinces.push(check_prov_id);
					}
				}
			},
		});
		
		return instance;
	}
);
