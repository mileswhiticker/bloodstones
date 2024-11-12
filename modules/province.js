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
		"dojo/_base/declare",
		"dojo/request/xhr"
	],
	function (dojo, declare, xhr){
		
		var instance = declare("_province", null, {
			//put your functions here
			
			//these are helper functions related to provinces

			GetProvinceMoveInfo : function(moving_army, province_info)
			{
				//console.log("page::GetProvinceMoveInfo(" + moving_army.id_string + "," + province_info.name + ")");
				//console.log(moving_army);
				//loop over all units in the army and get the total cost for this province
				//dont worry about dangerous provinces or impassable provinces for now
				//note: no custom movement cost calculations yet
				
				var move_info = {total_move_cost: 0, army_endangered: false, army_impassable: false, sea_transit: false, overlay_type: PROV_NONE};
				
				//sea provinces have some special movement rules
				if(province_info.type == 'Sea')
				{
					//console.log("page::GetProvinceMoveInfo() sea province");
					//console.log("moving_army:");
					//console.log(moving_army);
					//console.log("province_info:");
					//console.log(province_info);
					var ship_move = moving_army.CanArmyUseShipMovement();
					var prov_contains_ship = this.DoesProvContainFriendlyShip(province_info);
					var can_sea_move = moving_army.CanArmySeaMove();
					//console.log(ship_move + " | " + prov_contains_ship + " | " + can_sea_move);
					if(!can_sea_move)
					{
						if(ship_move && prov_contains_ship)
						{
							//dragons can use both sea, ship and land movement
							move_info.sea_transit = true;
							move_info.overlay_type = PROV_SEA;
							move_info.army_impassable = true;
							return move_info;
						}
						else
						{
							move_info.army_impassable = true;
							move_info.overlay_type = PROV_IMPASSABLE;
							return move_info;
						}
					}
				}
				
				//undead move in their own state, instead of main state
				if(moving_army.DoesArmyContainUndead())
				{
					//is it the undead state?
					if(this.isCurrentPlayerUndeadState())
					{
						//only undead can move in undead state
						if(moving_army.DoesArmyContainNonUndead())
						{
							//only undead can move right now
							move_info.army_impassable = true;
							move_info.overlay_type = PROV_IMPASSABLE;
							return move_info;
						}
						else
						{
							//terrain move cost of 1 regardless of terrain type
							//undead can also move into normally impassable terrain like mountains
							//undead also dont have any dangerous terrain
							//however, undead cannot enter sea provinces (handled above)
							move_info.overlay_type = PROV_MOVE1;
							return move_info;
						}
					}
					else 
					{
						//undead cant move right now
						move_info.army_impassable = true;
						move_info.overlay_type = PROV_IMPASSABLE;
						return move_info;
					}
				}
				
				//now check over other tiles in the army for standard movement rules
				//console.log("doing standard checks");
				var highest_move_cost = 0;
				
				//calculate how many tiles can get a free leader move
				var leader_bonus_left = moving_army.GetNumLeaders();
				
				for(var k in moving_army.tiles)
				{
					var tile_info = moving_army.tiles[k];
					//console.log(tile_info);
					
					//are we calculating moves for all items or just some of them?
					if(!moving_army.isSelected(tile_info.id))
					{
						//console.log("not selected!");
						continue;
					}
					//console.log(tile_info);
					
					//is this province impassable for any units?
					if(!this.TileCanMove(tile_info.type_arg, province_info.type))
					{
						//the whole army is blocked from moving here
						move_info.army_impassable = true;
						move_info.overlay_type = PROV_IMPASSABLE;
						//console.log("army_impassable");
						return move_info;
					}
					
					//is this province dangerous for any units?
					if(this.IsTileDangerousProvince(tile_info.type_arg, province_info.type))
					{
						move_info.army_endangered = true;
						//console.log("army_endangered");
					}
					
					//at least one tile must pay for movement
					//note: this assumes all tiles pay the same move cost... dragons are currently the only case where this doesnt apply
					if(leader_bonus_left > 0 && move_info.total_move_cost > 0)
					{
						leader_bonus_left--;
					}
					else
					{
						var tile_move_cost = this.GetTileMoveCost(tile_info.type_arg, province_info.type);
						//console.log("tile_move_cost:" + tile_move_cost);
						move_info.total_move_cost += tile_move_cost;
						if(tile_move_cost > highest_move_cost)
						{
							highest_move_cost = tile_move_cost;
						}
					}
				}
				
				switch(highest_move_cost)
				{
					case(1):
					{
						//white
						move_info.overlay_type = PROV_MOVE1;
						break;
					}
					case(2):
					{
						//yellow
						move_info.overlay_type = PROV_MOVE2;
						break;
					}
					case(3):
					{
						//orange
						move_info.overlay_type = PROV_MOVE3;
						break;
					}
					default:
					{
						console.log("ERROR: unknown move cost (" + highest_move_cost + ") when calculating move overlay for (" + moving_army.id_string + "->" + province_info.name + ")");
						//console.log(move_info);
						//console.log(moving_army);
						//console.log(province_info);
						break;
					}
				}
				
				return move_info;
			},
			
			GetProvinceBuildable : function(province_info)
			{
				//this.getActivePlayerId()
				//todo: actual buildable checks
				
				switch(province_info.type)
				{
					case "Plains":
					{
						return PROV_BUILDABLE_LAND;
						break;
					}
					case "Forest":
					{
						return PROV_BUILDABLE_LAND;
						break;
					}
					case "Hills":
					{
						return PROV_BUILDABLE_LAND;
						break;
					}
					case "Mountains":
					{
						return PROV_BUILDABLE_NONE;
						break;
					}
					case "Sea":
					{
						return PROV_BUILDABLE_SEA;
						break;
					}
					case "Desert":
					{
						return PROV_BUILDABLE_NONE;
						break;
					}
					default:
					{
						console.log("WARNING! GetProvinceBuildable() unknown province type: " + province_info.type);
						console.log(province_info);
						break;
					}
				}
				
				return PROV_BUILDABLE_NONE;
			},
			
			GetProvinceBuildableHover : function(province_info)
			{
				return this.GetProvinceBuildable(province_info) + BUILDABLE_HOVER_OFFSET;
			},
			
			GetProvinceBuildVillageFlag : function(province_info)
			{
				switch(province_info.type)
				{
					case "Plains":
					{
						return PROV_BUILDABLE_LAND;
						break;
					}
					case "Forest":
					{
						return PROV_BUILDABLE_LAND;
						break;
					}
					case "Hills":
					{
						return PROV_BUILDABLE_LAND_EXP;
						break;
					}
				}
				
				return PROV_BUILDABLE_NONE;
			},
			
			GetProvinceBuildVillageFlagHover : function(province_info)
			{
				return this.GetProvinceBuildVillageFlag(province_info) + BUILDABLE_HOVER_OFFSET;
			},
			
			CanProvincePlaceCitadel : function(province_info)
			{
				return true;
			},
			
			ArmyCanMove : function(moving_army, province_type)
			{
				for(var k in moving_army.tiles)
				{
					var tile_info = moving_army.tiles[k];
					
					//dont check for selection here, just the entire army stack
					/*if(!tile_info.selected)
					{
						continue;
					}*/
					//console.log(tile_info)
					
					//is this province impassable for any units?
					if(!this.TileCanMove(tile_info.type_arg, province_type))
					{
						return false;
					}
				}
				return true;
			},
			
			TileCanMove : function(tile_type, province_type)
			{
				//console.log("page::TileCanMove(" + tile_type + "," + province_type + ")");
				//castles simply cant move
				if(this.IsTileTypeCastle(tile_type) || this.IsTileTypeCitadel(tile_type))
				{
					return false;
				}
				
				//dragons can move everywhere
				if(this.IsTileTypeDragon(tile_type))
				{
					//unit can move here
					return true;
				}
				
				//console.log("page::TileCanMove(" + tile_type + "," + province_type + ")");
				switch(province_type)
				{
					case 'Mountains':
					{
						//is the player a hill folk faction?
						if(this.getActivePlayerFactionId() == this.FACTION_HILLFOLK)
						{
							//unit can move here
							return true;
						}
						
						//block all other unit movement
						return false;
					}
					case 'Sea':
					{
						//is the tile a ship?
						if(this.IsTileTypeShip(tile_type))
						{
							//unit can move here
							return true;
						}
						
						//block all other unit movement
						return false;
					}
					default:
					{
						//ships are blocked from moving in all other provinces, which i will assume are all land
						if(this.IsTileTypeShip(tile_type))
						{
							//unit cant move here
							return false;
						}
					}
				}
				
				//allow all other unit movement
				return true;
			},
			
			IsTileDangerousProvince : function(tile_type, province_type)
			{
				switch(province_type)
				{
					case 'Desert':
					{
						//is the tile a lizardman?
						if(this.IsTileTypeLizardman(tile_type))
						{
							//safe for this unit
							return false;
						}
						
						//is the tile a dragon?
						if(this.IsTileTypeDragon(tile_type))
						{
							//safe for this unit
							return false;
						}
						
						//is the tile a undead?
						if(this.IsTileTypeUndead(tile_type))
						{
							//safe for this unit
							return false;
						}
						
						//is the tile a goblin?
						if(this.IsTileTypeGoblin(tile_type))
						{
							//safe for this unit
							return false;
						}
						
						//all other units find this province dangerous
						return true;
					}
				}
				
				//all other provinces are safe
				return false;
			},
			
			GetTileMoveCost : function(type_arg, province_type)
			{
				//console.log("page::GetTileMoveCost(" + tile_id + "," + province_type + ")");
				//dragons can move into any province at a cost of 1
				if(this.IsTileTypeDragon(type_arg))
				{
					return 1;
				}
				
				switch(province_type)
				{
					case 'Hills':
					{
						//hill folk have cheaper movement
						var active_player = this.gamedatas.players[this.getActivePlayerId()];
						var factionid = active_player.factionid;
						if(factionid == this.FACTION_HILLFOLK)
						{
							return 2;
						}
						return 3;
					}
					case 'Forest':
					{
						return 2;
					}
					case 'Plains':
					{
						return 1;
					}
					case 'Mountains':
					{
						return 3;
					}
					case 'Desert':
					{
						return 1;
					}
					case 'Sea':
					{
						return 1;
					}
					default:
					{
						console.log("WARNING (1): Can't get move cost for unknown province type \"" + province_type + "\" and type_arg:" + type_arg);
						break;
					}
				}
				console.log("WARNING (2): Can't get default move cost for province type \"" + province_type + "\" and type_arg:" + type_arg);
				return 1;
			},
			
			CanProvinceBuildTile : function(province_name, tile_info)
			{
				var prov_name = this.GetProvinceNameFromId(province_name);
				var prov_info = this.provinces_by_name[prov_name];
				
				if(!this.IsTileTypeBuildable(tile_info.type_arg))
				{
					return false;
				}
				
				//only ships can be built in sea provinces, and sea provinces can only build ships
				if(prov_info.type == "Sea")
				{
					if(window.gameui.IsTileTypeShip(tile_info.type_arg))
					{
						return true;
					}
					return false;
				}
				else
				{
					if(window.gameui.IsTileTypeShip(tile_info.type_arg))
					{
						return false;
					}
					return true;
				}
				//var base_tile_type = this.getBaseTileType();
				
				//this shouldn't be reached
				console.log("WARNING: page::CanProvinceBuildTile(" + province_name + "," + tile_info.type_arg + ") reached unexpected end state");
				return true;
			},
			
			getProvinceVillageMaxSlots : function(prov_info)
			{
				switch(prov_info.type)
				{
					case 'Hills':
					{
						return 1;
					}
					case 'Forest':
					{
						return 1;
					}
					case 'Plains':
					{
						return 2;
					}
				}
				return 0;
			},
			
			getProvinceVillageSlots : function(prov_info)
			{
				//console.log("page::getProvinceVillageSlots(" + prov_info.name + ")");
				var max_slots = this.getProvinceVillageMaxSlots(prov_info);
				//console.log("max_slots: " + max_slots);
				
				//how many temp villages are there here?
				var temp_villages = 0;
				if(this.temp_villages_by_province[prov_info.name])
				{
					for(var i in this.temp_villages_by_province[prov_info.name])
					{
						var temp_village = this.temp_villages_by_province[prov_info.name][i];
						temp_villages++;
					}
				}
				//console.log("temp_villages: " + temp_villages);
				
				return max_slots - temp_villages;
			},
			
			AreProvincesLinked : function(province_start_info, province_end_info)
			{
				//console.log("page::AreProvincesLinked(" + province_start_info.name + "," + province_end_info.name + ")");
				if(province_start_info == undefined && province_end_info == undefined)
				{
					console.log("ERROR! page::AreProvincesLinked(" + province_start_info + "," + province_end_info + ")");
					return false;
				}
				else if(province_start_info == undefined)
				{
					console.log("ERROR! page::AreProvincesLinked(" + province_start_info + "," + province_end_info.name + ")");
					return false;
				}
				else if(province_end_info == undefined)
				{
					console.log("ERROR! page::AreProvincesLinked(" + province_start_info.name + "," + province_end_info + ")");
					return false;
				}
				
				//console.log(province_start_info);
				//console.log(province_end_info);
				for(var index in province_start_info.linked_prov_ids)
				{
					var linked_prov_id = province_start_info.linked_prov_ids[index];
					//console.log("checking: " + linked_prov_id);
					if(linked_prov_id == province_end_info.id)
					{
						//console.log("page::AreProvincesLinked(" + province_start_info.name + "," + province_end_info.name + ") success");
						return true;
					}
				}
				//console.log("page::AreProvincesLinked(" + province_start_info.name + "," + province_end_info.name + ") failure");
				return false;
			},
			
			GetAdjacentProvinceNames : function(prov_info)
			{
				var adj = [];
				for(var i in prov_info.movement_link_paths)
				{
					var move_link = prov_info.movement_link_paths[i];
					adj.push(move_link.target_prov.name);
				}
				return adj;
			},
			
			GetAdjacentProvinceIds : function(prov_info)
			{
				var adj = [];
				for(var i in prov_info.movement_link_paths)
				{
					var move_link = prov_info.movement_link_paths[i];
					var prov_name = move_link.target_prov.name;
					var prov_id = this.GetProvinceIdFromName(prov_name);
					adj.push(prov_id);
				}
				return adj;
			},
			
			GetAllArmiesInProvince : function(province_name)
			{
				var found_armies = [];
				for(var i in this.all_armies)
				{
					var army_stack = this.all_armies[i];
					if(army_stack.prov_name == province_name)
					{
						found_armies.push(army_stack);
					}
				}
				return found_armies;
			},
			
			GetFirstEnemyArmyInProvinceOrNull : function(province_name, player_id)
			{
				var all_armies = this.GetEnemyArmiesInProvince(province_name, player_id);
				for(var i in all_armies)
				{
					var army_stack = all_armies[i];
					var found_citadel = false;
					for(var i in army_stack.tiles)
					{
						var tile_info = army_stack.tiles[i];
						//console.log("tile_info:");
						//console.log(tile_info);
						if(this.IsTileTypeCitadel(tile_info.type_arg))
						{
							//console.log("skipping citadel");
							found_citadel = true;
							break;
						}
					}
					
					if(!found_citadel)
					{
						return army_stack;
					}
				}
				
				return null;
			},
			
			GetMainPlayerArmyInProvinceOrCreate : function(province_name, player_id)
			{
				var main_army = this.GetMainPlayerArmyInProvinceOrNull(province_name, player_id);
				if(!main_army)
				{
					//console.log("page::GetMainPlayerArmyInProvinceOrCreate(" + province_name + "," + player_id + ") creating new");
				
					//the main player army in a province will have the same numberic id as the province (there is now only 1 main army per province)
					//var new_army_id = this.getTempArmyId();
					var new_army_id = this.GetProvinceIdFromName(province_name);
					var temp_army_info = {army_id: new_army_id, player_id: player_id, prov_name: province_name, tiles: []};
					main_army = this.CreateArmy(temp_army_info);
				}
				else
				{
					//console.log("page::GetMainPlayerArmyInProvinceOrCreate(" + province_name + "," + player_id + ") returning old");
				}
				return main_army;
			},
			
			GetMainPlayerArmyInProvinceOrNull : function(province_name, player_id)
			{
				//console.log("page::GetMainPlayerArmyInProvinceOrNull(" + province_name + ", " + player_id + ")" );
				//console.log(this.all_armies);
				//console.log(this.armies_by_id_string);
				
				//new method
				var prov_id = this.GetProvinceIdFromName(province_name);
				var army_id_string = this.GetArmyIdString(prov_id, player_id);
				if(this.armies_by_id_string[army_id_string] != undefined)
				{
					//console.log("returning " + army_id_string);
					return this.armies_by_id_string[army_id_string];
				}
				//console.log("returning null");
				return null;
				
				//old method
				/*
				//console.log("page::GetMainPlayerArmyInProvinceOrNull(" + province_name + "," + player_id + ")");
				var found_armies = this.GetFriendlyArmiesInProvince(province_name, player_id);
				
				//return the first army we find that isnt temp and doesnt have a citadel
				//console.log("found_armies:");
				//console.log(found_armies);
				for(var i in found_armies)
				{
					var army_stack = found_armies[i];
					//console.log("checking army_stack:");
					//console.log(army_stack);
					
					//we dont want temp stacks
					//im phasing out armies so temp stacks might start randomly popping up now
					if(army_stack.IsTempStack())
					{
						//console.log("check1")
						//continue;
					}
					
					//check for citadel type stack
					if(army_stack.stack_type != STACK_ARMY)
					{
						continue;
					}
					
					//check for the first non-citadel tile
					//console.log("tiles:");
					//console.log(army_stack.tiles);
					var found_citadel = false;
					for(var i in army_stack.tiles)
					{
						var tile_info = army_stack.tiles[i];
						//console.log("tile_info:");
						//console.log(tile_info);
						if(this.IsTileTypeCitadel(tile_info.type_arg))
						{
							//console.log("skipping citadel");
							found_citadel = true;
							break;
						}
					}
					
					if(!found_citadel)
					{
						return army_stack;
					}
					
					//check if there is any citadel in the army
					//if(army_stack.IsCitadelPresent())
					{
						//console.log("citadel present");
						//continue;
					}
					
					//console.log("check3")
					//return army_stack;
				}
				
				//console.log("check4")
				return null;
				*/
			},
			
			GetOtherUnitStacksInProvince : function(province_name, main_player_id)
			{
				//console.log("page::GetOtherUnitStacksInProvince(" + province_name + ", " + main_player_id + ")");
				var other_armies = [];
				
				//do not include: main player army in this province belonging to main_player_id
				//note: main_player_id will usually be the current player, however it could be null (eg spectators)
				//note: ??
				
				//include:
				//all citadels and castles
				//any "unselected" tiles from the main player
				//all enemy units
				
				//all citadels go in the "other" section 
				var citadel_stack = this.GetCitadelStackInProvinceOrNull(province_name);
				if(citadel_stack)
				{
					other_armies.push(citadel_stack);
				}
				
				//get any villages present
				for(var i=0; i<this.villagestacks_all.length; i++)
				{
					var cur_village_stack = this.villagestacks_all[i];
					//console.log("checking " + cur_village_stack.prov_name);
					//console.log(cur_village_stack);
					if(cur_village_stack.prov_name == province_name)
					{
						other_armies.push(cur_village_stack);
						//console.log("adding village stack:");
						//console.log(cur_village_stack);
					}
				}
				
				//now loop over all armies
				for(var i in this.all_armies)
				{
					var army_stack = this.all_armies[i];
					if(army_stack.prov_name == province_name)
					{
						if(army_stack.IsArmyCastle())
						{
							//all castles go in the "other" section
							other_armies.push(army_stack);
						}
						else if(army_stack.player_id != main_player_id)
						{
							//all enemy units go in the "other" section
							other_armies.push(army_stack);
						}
					}
				}
				
				//note: at some point i will also have to calculate the defensive combat bonuses for enemy armies here. citadels will mess that up
				//console.log(other_armies);
				return other_armies;
			},
			
			GetPlayerCastleStackInProvinceOrNull : function(prov_name, player_id)
			{
				//grab it from the list
				var castle_index_string = this.GetCastleIndexString(prov_name, player_id);
				var castle_army_stack = this.castle_stacks_by_provinceplayer[castle_index_string];
				
				//this is to make sure we dont return undefined
				if(castle_army_stack)
				{
					return castle_army_stack;
				}
				return null;
			},
			
			GetReservePlayerArmyOrCreate : function()
			{
				if(!this.GetSelectedProvinceName())
				{
					console.log("ERROR! page::GetReservePlayerArmyOrCreate() but GetSelectedProvinceName() is null");
					//force an error to get a call stack
					var dummyerror = null;
					dummyerror.trigger = true;
					return;
				}
				
				if(!this.selected_province_reserve_army)
				{
					//console.log("page::GetReservePlayerArmyOrCreate() creating new reserve army");
					var temp_army_info = {army_id: this.getTempArmyId(), player_id: this.player_id, prov_name: this.GetSelectedProvinceName(), tiles: []};
					this.selected_province_reserve_army = this.CreateArmy(temp_army_info, null);
				}
				else
				{
					//console.log("page::GetReservePlayerArmyOrCreate() returning old reserve army");
				}
				//console.log("page::GetReservePlayerArmyOrCreate() this.selected_province_reserve_army is in " + this.selected_province_reserve_army.prov_name);
				return this.selected_province_reserve_army;
			},
			
			GetTempSplitArmyInProvinceOrNull : function(army_id_string, province_name, player_id)
			{
				var army_action_steps = this.queued_action_steps[source_army.id_string];
				if(!army_action_steps || army_action_steps == null)
				{
					return null;
				}
				for(var i in army_action_steps)
				{
					var split_step = army_action_steps[i];
				}
			},
			
			GetFriendlyArmiesInProvince : function(province_name, player_id, check_first = false)
			{
				console.log("page::GetFriendlyArmiesInProvince(" + province_name + "," + player_id + "," + check_first + ")");
				console.log(this.all_armies);
				
				//todo: there is a more optimised way to do this but this works for now
				var found_armies = [];
				for(var i in this.all_armies)
				{
					var army_stack = this.all_armies[i];
					//console.log(army_stack);
					if(army_stack.prov_name == province_name)
					{
						//console.log("right province name");
						if(army_stack.player_id == player_id)
						{
							//console.log("right player id, adding");
							found_armies.push(army_stack);
							if(check_first)
							{
								return found_armies;
							}
						}
						else
						{
							//console.log("wrong player id: " + army_stack.player_id + "|" + player_id);
						}
					}
					else
					{
						//console.log("wrong province name: " + army_stack.prov_name + "|" + province_name);
					}
				}
				//console.log(found_armies);
				return found_armies;
			},
			
			GetOrCreateCastleStackInProvince : function(province_name)
			{
				var found_armies = [];
				for(var i in this.all_armies)
				{
					if(army_stack.prov_name == province_name)
					{
					}
				}
			},
			
			GetEnemyArmiesInProvince : function(province_name, player_id, check_first = false)
			{
				//console.log("page::GetEnemyArmiesInProvince(" + province_name + "," + player_id + "," + check_first + ")");
				//todo: there is a more optimised way to do this but this works for now
				var found_armies = [];
				for(var i in this.all_armies)
				{
					var army_stack = this.all_armies[i];
					//console.log(army_stack);
					if(army_stack.prov_name == province_name)
					{
						if(army_stack.player_id != player_id)
						{
							found_armies.push(army_stack);
							if(check_first)
							{
								return found_armies;
							}
						}
					}
				}
				return found_armies;
			},
			
			DoesProvContainEnemyArmy : function(prov_info, player_id)
			{
				//console.log("page::GetEnemyArmiesInProvince(" + prov_info.name + "," + player_id + ")");
				var found = this.GetEnemyArmiesInProvince(prov_info.name, player_id, true);
				return found.length > 0;
			},
			
			DoesProvContainFriendlyArmy : function(prov_info, player_id)
			{
				var found = this.GetFriendlyArmiesInProvince(prov_info.name, player_id, true);
				return found.length > 0;
			},
			
			DoesProvContainFriendlyShip : function(prov_info)
			{
				//only sea provinces can have ships
				if(prov_info.type != 'Sea')
				{
					return false;
				}
				
				//check if the player has any ships here
				for(var i in this.all_armies)
				{
					var army_stack = this.all_armies[i];
					if(this.DoesActivePlayerOwnArmy(army_stack))
					{
						//console.log(army_stack.id_string + " is owned by active player");
						if(army_stack.prov_name == prov_info.name)
						{
							//console.log(army_stack.id_string + " is present in adj Sea province " + prov_info.name);
							
							//check to ensure it has a ship tile
							if(army_stack.DoesArmyContainShip())
							{
								//console.log(army_stack.id_string + " contains a ship tile");
								return true;
							}
						}
					}
				}
				
				return false;
			},
			
			GetProvinceIdFromName : function(province_name)
			{
				return Number(province_name.substring(4));
			},
			
			GetProvinceNameFromId : function(province_id)
			{
				return "prov" + province_id;
			},
			
			GetProvinceByName : function(prov_name)
			{
				return this.provinces_by_name[prov_name];
				//var prov_id = this.GetProvinceIdFromName(prov_name);
				//return this.GetProvinceById(prov_id);
			},
			
			GetProvinceById : function(prov_id)
			{
				return this.provinces[prov_id];
			},
			
			GetProvinceType : function(prov_id)
			{
				var prov_info = this.GetProvinceById(prov_id);
				return prov_info.type;
			},
			
			GetProvinceNameUIString : function(prov_id)
			{
				return "Area " + prov_id + " (" + this.GetProvinceType(prov_id) + ")";
			},
			
			GetProvIdStringFromAreaIdString : function(area_id_string)
			{
				var string_elements = area_id_string.split("_");
				return string_elements[1];
			},
		});
			
		return instance;
	}
);
