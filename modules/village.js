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
		
		var instance = declare("_village", null, {
			//put your functions here
			
			BeginVillageState : function()
			{
				this.UIBeginBuildVillages();
			},
			
			EndVillageState : function(approved)
			{
				//this function gets called by UI events
				//console.log("page::EndVillageState(" + approved + ")");
				
				//if the player didn't queue any villages, then force a "skip"
				if(!this.IsAnyVillageBuildQueued())
				{
					//console.log("no temp villages queued so we must be skipping...");
					approved = false;
				}
				else
				{
					//todo: legality checks if the payment is sufficient, and do not proceed if it isnt
				}
				
				//update the ui first
				this.UIFinishBuildVillages(approved);
				
				if(approved)
				{
					this.ServerPayAction(this.ACTION_BUILDVILLAGE);
				}
				else
				{
					//end the turn without doing anything, make sure to properly refund any tiles the player has tried to pay
					this.RefundPaystackTiles();
					this.ServerSkipAction();
				}
			},
			
			IsAnyVillageBuildQueued : function()
			{
				for(var index in this.temp_villages_by_id)
				{
					//console.log("page::IsAnyVillageBuildQueued(): true");
					return true;
				}
				//console.log("page::IsAnyVillageBuildQueued(): false");
				return false;
				//return this.temp_villages_by_id.length == 0;
			},
			
			TryQueueVillageBuild : function(prov_info)
			{
				//console.log("page::QueueVillageBuild()");
				//console.log(prov_info);
				
				//is this valid terrain?
				if(this.getProvinceVillageMaxSlots(prov_info) == 0)
				{
					this.showMessage(this.GetVillageFailString(this.VILLAGE_FAIL_TERRAIN), "error");
					return; 
				}
				
				var slots_available = this.getProvinceVillageSlots(prov_info);
				
				//are there free slots to build?
				if(slots_available <= 0)
				{
					this.showMessage(this.GetVillageFailString(this.VILLAGE_FAIL_SLOTS), "error");
					return; 
					/*
					//todo: this is not working, it's meant to drag a ghost image of the village back to the player hand
					//it's a visual cue to symbolise rejecting the proposed village
					//console.log(new_village);
					var cur_province = this.provinces_by_name[prov_info.name];
					//cur_province.zone.removeFromZone(new_village.id_string, false);
					var duration = 500;
					current_player_villages = dojo.byId("current_player_villages");
					var clone = dojo.place("<div class=\"village0\"></div>","centrepanel");
					//this.placeOnObjectPos(mobile_obj: ElementOrId, target_obj: ElementOrId, target_x: number, target_y: number): void
					clone.style.left = cur_province.centre.x;
					clone.style.top = cur_province.centre.y;
					
					var marginBox = dojo.marginBox(current_player_villages);
					console.log(marginBox);
					
					//new_village.container_div.style.transition = "left 500ms";
					//new_village.container_div.style.left = marginBox.l;
					//new_village.container_div.style.top = marginBox.t;
					clone.style.transition = "all 500ms";
					clone.style.left = marginBox.l;
					clone.style.top = marginBox.t;
					
					//slideToObjectAndDestroy
					//this.slideToObject(new_village.container_div, "current_player_villages", duration);
					//setTimeout(this.DestroyTempVillage(new_village), duration);
					return;
					*/
				}
				
				var active_player_id = this.getActivePlayerId();
				
				if(this.DoesProvContainEnemyArmy(prov_info, active_player_id))
				{
					this.showMessage(this.GetVillageFailString(this.VILLAGE_FAIL_ENEMIES), "error");
					return; 
				}
				
				if(!this.buildable_province_names.includes(prov_info.name))
				{
					this.showMessage(this.GetVillageFailString(this.VILLAGE_FAIL_DISTANCE), "error");
					return; 
				}
				
				//check if we have enough villages available
				var villages_available = this.GetPlayerVillagesAvailable(active_player_id);
				var villages_temp = this.temp_villages.length;
				//console.log("villages_available:" + villages_available + " | villages_temp:" + villages_temp);
				//console.log(this.temp_villages);
				if(villages_available - villages_temp <= 0)
				{
					this.showMessage(this.GetVillageFailString(this.VILLAGE_FAIL_AVAIL), "error");
					return;
				}
				
				//create the stack object for the temporary village
				var village_info = {player_id: active_player_id, prov_name: prov_info.name, tiles: {}, id_num: this.getTempArmyId()};
				var new_village = new modules.TileStack();
				new_village.createAsVillage(this, "centrepanel", village_info);	//node id formerly "gamemap"
				
				//it's transparent indicating it's still being built
				new_village.SetBuilding(true);
				
				//add 1 starting village tile to the stack using the player's faction
				new_village.addVillage(this.getPlayerFactionId(active_player_id))
				
				//update the build cost
				var new_cost = this.getProvVillageCostType(prov_info.type);
				this.AddActionCostAmount(new_cost);
				
				//set it to the desired collision layer
				//dojo.style(new_village.container_div, 'zIndex', this.GameLayerArmy());
				
				//store it
				//todo: are all 3 of these really needed?
				this.temp_villages.push(new_village);
				this.temp_villages_by_id[new_village.id_string] = new_village;
				if(!this.temp_villages_by_province[prov_info.name])
				{
					this.temp_villages_by_province[prov_info.name] = [];
				}
				this.temp_villages_by_province[prov_info.name].push(new_village);
				
				//refresh the UI because new provinces have become unlocked
				this.UIRefreshBuildVillages();
			},
			
			GetJsonTempVillages : function()
			{
				//this special format is so it can be converted to json and sent to the server via ajax
				//console.log("page::GetJsonTempVillages()");
				
				var json = [];
				
				//find if there is a pre-existing struct
				for(var prov_name in this.temp_villages_by_province)
				{
					//console.log(prov_name);
					var prov_villages = this.temp_villages_by_province[prov_name];
					//console.log(prov_villages);
					
					for(var index in prov_villages)
					{
						var village = prov_villages[index];
						//console.log(village);
						
						//make a new entry for the json array
						var village_entry = {province_name: village.prov_name, temp_id: village.id_string};
						json.push(village_entry);
					}
				}
				
				return JSON.stringify(json);
			},
			
			TryCancelVillageBuild : function(temp_village_stack)
			{
				//safety check for player events
				if(!this.isCurrentPlayerVillagesState())
				{
					return;
				}
				
				//is this a village that has already been built?
				if(!temp_village_stack.IsBuilding())
				{
					return;
				}
				
				//is this the player's village?
				if(this.getActivePlayerId() != temp_village_stack.player_id)
				{
					return;
				}
				this.CancelVillageBuild(temp_village_stack.id_string);
			},
			
			CancelVillageBuild : function(temp_village_stack_id)
			{
				//console.log("page::CancelVillageBuild(" + temp_village_stack_id + ")");
				//console.log(this.temp_villages_by_id);
				
				//find the tilestack
				var temp_village = this.temp_villages_by_id[temp_village_stack_id];
				//console.log(temp_village);
				
				//remove it from the map
				var cur_province = this.provinces_by_name[temp_village.prov_name];
				cur_province.zone.removeFromZone(temp_village.id_string, false);
				
				//delete the reference from the object
				delete temp_village;
				delete this.temp_villages_by_id[temp_village.id_string];
				for(var i in this.temp_villages_by_province[temp_village.prov_name])
				{
					//delete this.temp_villages_by_province[temp_village.prov_name];
					var check_village = this.temp_villages_by_province[temp_village.prov_name][i];
					if(check_village.id_string == temp_village.id_string)
					{
						this.temp_villages_by_province[temp_village.prov_name].splice(i, 1);
					}
				}
				if(!this.temp_villages_by_province[temp_village.prov_name].length)
				{
					delete this.temp_villages_by_province[temp_village.prov_name];
				}
				for(var i = 0; i < this.temp_villages.length; i++)
				{
					var check_village = this.temp_villages[i];
					if(check_village.id_string == temp_village_stack_id)
					{
						this.temp_villages.splice(i, 1);
						break;
					}
				}
				
				//destroy the html node
				dojo.destroy(temp_village.container_div);
				
				//update the total village build cost
				var prov_info = window.gameui.provinces_by_name[temp_village.prov_name];
				var new_cost = this.getProvVillageCostType(prov_info.type);
				this.AddActionCostAmount(-new_cost);
				
				this.UIRefreshBuildVillages();
			},
			
			SetupVillages : function(gamedatas)
			{
				//console.log("page::SetupVillages()");
				for(var player_id in gamedatas.players)
				{
					var player_info = gamedatas.players[player_id];
					this.CreateVillages(player_info.villages_built, player_id);
				}
			},
			
			CreateVillages : function(built_villages_info, owner_player_id)
			{
				//console.log("page::CreateVillages()");
				for(var village_id in built_villages_info)
				{
					var village_info = built_villages_info[village_id];
					this.CreateVillage(village_info, owner_player_id);
				}
			},
			
			CreateVillage : function(village_info, owner_player_id)
			{
				var province_name = this.GetProvinceNameFromId(village_info.location_arg);
				//console.log("page::CreateVillage(" + province_name + "," + owner_player_id + ")");
				
				//there should only be 1 stack per province for built villages
				//note: unbuilt villages will all spread out and have their own stack as a clear visual hint to the player
				//after being built they will all collapse together into the one stack
				var villagestack = this.villagestacks_by_province[province_name];
				
				//check if there is an existing villagestack
				if(!this.villagestacks_by_province[province_name])
				{
					//console.log("creating new village stack...");
					
					//create the stack object... the id here is unused (fingers crossed)
					//formerly used this.getTempArmyId() now using the tile id from the Deck object
					var village_info = {player_id: owner_player_id, province_id: province_name, tiles: {}, id_num: village_info.id};
					var villagestack = new modules.TileStack();
					villagestack.createAsVillage(this, "centrepanel", village_info);	//node id formerly "gamemap"
					this.villagestacks_by_province[province_name] = villagestack;
					this.villagestacks_all.push(villagestack);
					this.villagestacks_by_idstring[villagestack.id_string] = villagestack;
				}
				else
				{
					//console.log("adding to existing village stack...");
				}
				
				//add 1 village tile to the stack using the player's faction
				villagestack.addVillage(this.getPlayerFactionId(owner_player_id));
			},
			
			RemoveVillageFromStack : function(village_stack)
			{
				//todo: oh god ive got to finish writing this and fix this issue here
			},
			
			DestroyVillageStackById : function(village_id)
			{
				//console.log("page::DestroyVillageStackById(" + village_id + ")");
				var villageStackIndex = this.villagestacks_all.findIndex((element) => element.id_num == village_id);
				if(villageStackIndex >= 0)
				{
					//console.log("found the villagestack at villageStackIndex:" + villageStackIndex);
					
					//get the stack
					var village_stack = this.villagestacks_all[villageStackIndex];
					
					//untrack it
					this.villagestacks_all.splice(villageStackIndex, 1);
					
					//remove it from province zone
					var cur_province = this.provinces_by_name[village_stack.province_id];
					cur_province.zone.removeFromZone(village_stack.id_string, false);
					
					//todo: any circular references inside the tilestack to clean up?
					dojo.destroy(village_stack.container_div);
					village_stack.destroy();
				}
				else
				{
					console.log("ERROR: page::notif_playerCaptureSuccess() looking for captured_village_id:" + captured_village_id + " but found villageStackIndex: " + villageStackIndex);
					console.log(this.villagestacks_all)
				}
			},
			
			GetPlayerVillagesAvailable(player_id)
			{
				return this.gamedatas.players[player_id].villages_available;
			},
			
			onClickVillageStack : function(event, villagestack)
			{
				//console.log("page::onClickVillageStack()");
				switch(window.gameui.gamedatas.gamestate.name)
				{
					case 'playerCapture':
					{
						this.TryToggleVillageCapture(villagestack);
						break;
					}
					case 'playerMain':
					{
						this.TryToggleVillageCapture(villagestack);
						break;
					}
					case 'playerVillages':
					{
						//is this a temp village?
						this.TryCancelVillageBuild(villagestack);
						break;
					}
					default:
					{
						//unselect army stack if selected
						this.UnselectArmyStack();
						break;
					}
				}
			},
			
			GetVillageNameFromId : function(id_num)
			{
				//name is how i refer to a string used for the DOM node id
				//however in the db i mostly use an integer id
				return "village" + id_num;
			},
			
			GetVillageIdFromName : function(village_name)
			{
				return village_name.slice(6);
			},
			
			GetVillageBuildProvinces : function(player_id)
			{
				//console.log("page::GetVillageBuildProvinces(" + player_id + ")");
				var unchecked_provinces = [];
				var current_player_id = player_id;//this.getCurrentPlayer();
				var player_info = this.gamedatas.players[current_player_id];
				
				//start with the player citadel province, if one exists
				var citadel_prov;
				if(player_info.citadel_prov != -1)
				{
					citadel_prov = this.provinces[player_info.citadel_prov];
					unchecked_provinces.push(citadel_prov.name);
					
					//add all adjacent provinces
					var adj_prov_names = this.GetAdjacentProvinceNames(citadel_prov);
					for(var i in adj_prov_names)
					{
						var adj_prov_name = adj_prov_names[i];
						
						//no need for this check because this is the first set of additions
						//if(!unchecked_provinces.includes(adj_prov_name))
						{
							unchecked_provinces.push(adj_prov_name);
						}
					}
				}
				
				//next get all existing player village provinces
				for(var village_id in player_info.villages_built)
				{
					var village_info = player_info.villages_built[village_id];
					var village_prov_name = village_info.province_id;
					if(!unchecked_provinces.includes(village_prov_name))
					{
						unchecked_provinces.push(village_prov_name);
					}
					
					//add all adjacent provinces
					var village_prov = this.provinces_by_name[village_prov_name];
					var adj_prov_names = this.GetAdjacentProvinceNames(village_prov);
					for(var i in adj_prov_names)
					{
						var adj_prov_name = adj_prov_names[i];
						if(!unchecked_provinces.includes(adj_prov_name))
						{
							unchecked_provinces.push(adj_prov_name);
						}
					}
				}
				
				//get planned village provinces - players can build a connecting chain this way
				for(var temp_prov_name in this.temp_villages_by_province)
				{
					if(!unchecked_provinces.includes(temp_prov_name))
					{
						unchecked_provinces.push(temp_prov_name);
					}
					
					//add all adjacent provinces
					var temp_prov = this.provinces_by_name[temp_prov_name];
					var adj_prov_names = this.GetAdjacentProvinceNames(temp_prov);
					for(var i in adj_prov_names)
					{
						var adj_prov_name = adj_prov_names[i];
						if(!unchecked_provinces.includes(adj_prov_name))
						{
							unchecked_provinces.push(adj_prov_name);
						}
					}
				}
				//this.temp_villages_by_province[prov_info.name].push(new_village);
				
				var buildable_provinces = [];
				var checked_provinces = [];
				while(unchecked_provinces.length > 0)
				{
					//grab the oldest unchecked province
					var unchecked_prov_name = unchecked_provinces[0];
					var unchecked_prov = this.provinces_by_name[unchecked_prov_name];
					
					//transfer it to the checked list
					unchecked_provinces.splice(0,1);
					checked_provinces.push(unchecked_prov_name);
					
					//can we build a village here?
					//todo: finish writing these functions
					if(this.getProvinceVillageSlots(unchecked_prov) > 0 &&
						!this.DoesProvContainEnemyArmy(unchecked_prov, player_id) )
					{
						buildable_provinces.push(unchecked_prov.name);
					}
					
					//is there a unit here which can spread the chain further?
					if(this.DoesProvContainFriendlyArmy(unchecked_prov, current_player_id))
					{
						//add all adjacent provinces if they havent been checked yet
						for(var i in unchecked_prov.movement_link_paths)
						{
							var move_link = unchecked_prov.movement_link_paths[i];
							if(!checked_provinces.includes(move_link.target_prov.name) && !unchecked_provinces.includes(move_link.target_prov.name))
							{
								unchecked_provinces.push(move_link.target_prov.name);
							}
						}
					}
				}
				
				//finally remove the citadel province now that it's no longer needed
				if(citadel_prov)
				{
					for(var i in buildable_provinces)
					{
						if(buildable_provinces[i] == citadel_prov.name)
						{
							buildable_provinces.splice(i,1);
							break;
						}
					}
				}
				
				return buildable_provinces;
			},
		});
		
		return instance;
	}
);
