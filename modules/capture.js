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
				//console.log("page::TryToggleVillageCapture(" + villagestack.id_string + ")");
				
				var current_player_id = this.getCurrentPlayerId();
				var owner_player_id = villagestack.player_id;
				//var active_player_faction = this.getActivePlayerFactionId();
				
				if(!this.isCurrentPlayerCaptureMode() && !this.isCurrentPlayerCaptureState())
				{
					//console.log("WARNING: TryToggleVillageCapture() but current player is not capture mode or capture state");
					return;
				}
				
				//is this a valid capture target?
				if(this.IsVillageCapturable(villagestack, true))
				{
					//have we already queued this village for capture?
					if(this.queued_capture_village_ids.includes(villagestack.id_num))
					{
						this.CancelPlannedVillageCapture(villagestack);
					}
					else
					{
						this.TryCaptureVillage(villagestack);
					}
					//console.log(this.queued_capture_village_ids);
				}
				else
				{
					//todo: sanity check here? this should never be reached
				}
			},
			
			IsVillageCapturable : function(villagestack, send_warnings = false)
			{
				var current_player_id = this.getCurrentPlayerId();
				var owner_player_id = villagestack.player_id;
				
				//cannot capture your own villages
				if(current_player_id != owner_player_id)
				{
					var success = false;
					for(var i in this.possible_capture_infos)
					{
						var possible_capture_info = this.possible_capture_infos[i];
						var possible_capture_name = this.GetProvinceNameFromId(possible_capture_info.province_id);
						//console.log("checking " + possible_capture_name);
						if(possible_capture_name == villagestack.province_id)
						{
							//found it
							//console.log("found it");
							return true;
						}
					}
					
					this.showMessage(_("You must have an army in that province to capture that village"), "info");
				}
				else if(send_warnings)
				{
					this.showMessage(_("You cannot capture your own villages"), "info");
				}
				
				//by default, return false
				return false;
			},
			
			TryCaptureVillage : function(villagestack)
			{
				//todo: safety checks here
				//however, i dont need to do defensive coding if i just get good!
				
				//add a ui effect
				dojo.addClass(villagestack.id_string, "capturing_village");
				
				//the capture cost depends on the province type
				var village_province_name = villagestack.province_id;
				var village_province_info = this.provinces_by_name[village_province_name];
				var capture_cost = this.getProvVillageCostType(village_province_info.type);
				this.AddActionCostAmount(capture_cost);
				
				//track it so we can cancel or send to server
				this.queued_capture_village_ids.push(villagestack.id_num);
			},
			
			CancelPlannedVillageCapture : function(villagestack, do_untrack = true)
			{
				//console.log("page::CancelPlannedVillageCapture(" + villagestack.id_string + ")");
				//warning: this function is unsafe. do your safety checks before calling it
				
				//remove a ui effect
				dojo.removeClass(villagestack.id_string, "capturing_village");
				
				//the capture cost depends on the province type
				var village_province_name = villagestack.province_id;
				var village_province_info = this.provinces_by_name[village_province_name];
				var capture_cost = this.getProvVillageCostType(village_province_info.type);
				this.AddActionCostAmount(-capture_cost);
				
				//remove from list
				if(do_untrack)
				{
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
			},
			
			CancelAllPlannedVillageCaptures : function()
			{
				console.log("page::CancelAllPlannedVillageCaptures()");
				while(this.queued_capture_village_ids.length > 0)
				{
					var next_queued_village_id = this.queued_capture_village_ids.pop();
					var village_id_string = this.GetVillageNameFromId(next_queued_village_id);
					var villagestack = this.villagestacks_by_idstring[village_id_string];
					this.CancelPlannedVillageCapture(villagestack, false);
				}
			},
			
		});
		
		return instance;
	}
);