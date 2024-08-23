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
		
		var instance = declare("_capture", null, {
			
			IsAnyVillageCaptureQueued : function()
			{
				return this.queued_capture_village_ids.length > 0;
			},
			
			TryToggleVillageCapture : function(villagestack)
			{
				console.log("page::TryToggleVillageCapture(" + villagestack.id_string + ")");
				
				var active_player_id = this.getActivePlayerId();
				var owner_player_id = villagestack.player_id;
				//var active_player_faction = this.getActivePlayerFactionId();
				
				//cannot capture your own villages
				if(active_player_id != owner_player_id)
				{
					//is this in the pending capture list?
					console.log("checking this.possible_capture_infos to find " + villagestack.province_id);
					var village_province_name = villagestack.province_id;
					var village_province_info = this.provinces_by_name[village_province_name];
					var capture_cost = this.getProvVillageCostType(village_province_info.type);
					var success = false;
					for(var i in this.possible_capture_infos)
					{
						var possible_capture_info = this.possible_capture_infos[i];
						var possible_capture_name = this.GetProvinceNameFromId(possible_capture_info.province_id);
						console.log("checking " + possible_capture_name);
						if(possible_capture_name == villagestack.province_id)
						{
							//found it
							console.log("found it");
							success = true;
							break;
						}
					}
					if(success)
					{
						if(dojo.hasClass(villagestack.id_string, "capturing_village"))
						{
							dojo.removeClass(villagestack.id_string, "capturing_village");
							this.AddActionCostAmount(-capture_cost);
							
							//remove from list
							var index = this.queued_capture_village_ids.findIndex((element) => element == villagestack.id_num);
							if(index > -1)
							{
								this.queued_capture_village_ids.splice(index, 1);
							}
							else
							{
								console.log("WARNING! page::TryToggleVillageCapture() tried to unqueue village capture for " + villagestack.id_string + " but could not find in list");
							}
						}
						else
						{
							dojo.addClass(villagestack.id_string, "capturing_village");
							this.AddActionCostAmount(capture_cost);
							
							//add to list
							this.queued_capture_village_ids.push(villagestack.id_num);
						}
						//console.log(this.queued_capture_village_ids);
					}
					else
					{
						//todo: sanity check here? this should never be reached
					}
				}
				else
				{
					//console.log("clicked on your own village");
				}
				
			},
			
		});
		
		return instance;
	}
);