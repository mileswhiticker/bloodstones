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
					if(!tile_info.selected)
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
						console.log("ERROR: unknown move cost (" + highest_move_cost + ") when calculating move overlay");
						console.log(move_info);
						console.log(moving_army);
						console.log(province_info);
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
				if(this.IsTileTypeCastle(tile_type))
				{
					return false;
				}
				
				//console.log("page::TileCanMove(" + tile_type + "," + province_type + ")");
				switch(province_type)
				{
					case 'Mountains':
					{
						//is the tile a dragon?
						if(this.IsTileTypeDragon(tile_type))
						{
							//unit can move here
							return true;
						}
						
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
						
						//is the tile a dragon?
						if(this.IsTileTypeDragon(tile_type))
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
			
			GetTileMoveCost : function(tile_id, province_type)
			{
				//console.log("page::GetTileMoveCost(" + tile_id + "," + province_type + ")");
				//todo: custom unit movement cost rules
				switch(province_type)
				{
					case 'Hills':
					{
						//hill folk have cheaper movement
						var active_player = this.gamedatas.players[this.getActivePlayerId()];
						var factionid = active_player.factionid;
						if(factionid == 1)
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
						return 1;
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
						console.log("WARNING: Can't get move cost for unknown province type \"" + province_type + "\" and tile_id:" + tile_id);
						break;
					}
				}
				return 1;
			},
			
			CanProvinceBuildTile : function(province_id, tile_info)
			{
				var prov_name = this.GetProvinceNameFromId(province_id);
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
				console.log("WARNING: page::CanProvinceBuildTile(" + province_id + "," + tile_info.type_arg + ") reached unexpected end state");
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
				//console.log(province_start_info.movement_link_paths);
				for(var linked_prov_name in province_start_info.movement_link_paths)
				{
					if(linked_prov_name == province_end_info.name)
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
					if(army_stack.province_id == province_name)
					{
						found_armies.push(army_stack);
					}
				}
				return found_armies;
			},
			
			GetFriendlyArmiesInProvince : function(province_name, player_id, check_first = false)
			{
				//todo: there is a more optimised way to do this but this works for now
				var found_armies = [];
				for(var i in this.all_armies)
				{
					var army_stack = this.all_armies[i];
					if(army_stack.province_id == province_name)
					{
						if(army_stack.player_id == player_id)
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
			
			GetEnemyArmiesInProvince : function(province_name, player_id, check_first = false)
			{
				//console.log("page::GetEnemyArmiesInProvince(" + province_name + "," + player_id + "," + check_first + ")");
				//todo: there is a more optimised way to do this but this works for now
				var found_armies = [];
				for(var i in this.all_armies)
				{
					var army_stack = this.all_armies[i];
					//console.log(army_stack);
					if(army_stack.province_id == province_name)
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
						if(army_stack.province_id == prov_info.name)
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
		});
			
		return instance;
	}
);
