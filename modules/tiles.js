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
		
		var instance = declare("_tiles", null, {
			//put your functions here
			
			constructor: function(){
				//for client side info about tiles
				//todo: move this into game.php
				
				this.tile_build_cost = [
					"0","0","0","1","1","0","2","2","1","1","2","0","0",
					"0","0","0","1","1","0","2","1","1","1","2","2","0",
					"0","0","0","1","1","0","2","2","1","1","2","2","0",
					"0","0","0","1","1","0","2","2","1","1","2","0","0",
					"0","0","0","1","1","0","2","2","1","1","2","2","0",
					"0","0","0","0","1","0","1","2","1","1","2","0","0",
					"0","0","0","0","0","0","0","0","0","0","0","0","0",
					"0","0","0","0","0","0","0","0","0","0","0","0","0"
				];
				this.tile_pips = [
					"0","5","0","4","3","2","3","4","4","3","5","0","0",
					"0","5","2","4","3","2","3","4","4","3","5","5","0",
					"0","5","2","4","3","2","3","4","4","3","5","5","0",
					"0","5","0","4","3","2","0","4","4","3","5","0","0",
					"0","5","3","4","3","2","3","4","4","3","5","5","0",
					"0","5","3","0","0","0","4","0","4","0","5","0","0",
					"0","1","2","3","4","5","0","0","0","0","0","0","0",
					"0","1","2","3","4","5","0","0","0","0","0","0","0"
				];
			},
			
			GetTileBuildCost : function(tile_type_arg)
			{
				return Number(this.tile_build_cost[Number(tile_type_arg)]);
			},
			
			GetTilePips : function(tile_type_arg)
			{
				return Number(this.tile_pips[Number(tile_type_arg)]);
			},
			
			getProvVillageCostType : function(prov_type)
			{
				switch(prov_type)
				{
					case "Forest":
					{
						return 1;
					}
					case "Plains":
					{
						return 1;
					}
					case "Hills":
					{
						return 2;
					}
				}
				console.log("WARNING: getProvVillageCostType(" + prov_type + ") called for invalid province type");
				return 99;
			},
			
			getProvVillageCost : function(prov_info)
			{
				return this.getProvVillageCostType(prov_info.type);
			},
			
			getBaseTileType : function(tile_type)
			{
				var numtypes = 13;
				return tile_type % numtypes;
			},
			
			IsTileTypeShip : function(tile_type)
			{
				return (this.getBaseTileType(tile_type) == 8);
			},
			
			IsTileTypeLizardman : function(tile_type)
			{
				return (tile_type == 28);
			},
			
			IsTileTypeDragon : function(tile_type)
			{
				return (tile_type == 37);
			},
			
			IsTileTypeGoblin : function(tile_type)
			{
				return (tile_type == 54);
			},
			
			IsTileTypeUndead : function(tile_type)
			{
				return (tile_type == 64);
			},
			
			IsTileTypeCastle : function(tile_type)
			{
				return (this.getBaseTileType(tile_type) == 7);
			},
			
			IsTileTypeBuildable : function(tile_type)
			{
				if(this.IsTileTypeUndead(tile_type))
				{
					return false;
				}
				
				var base_type = this.getBaseTileType(tile_type);
				if(base_type > 77)
				{
					//nonstandard tile
					return false;
				}
				
				if(base_type == 0)
				{
					//blank tile
					return false;
				}
				
				if(base_type == 1)
				{
					//resource tile
					return false;
				}
				
				return true;
			},
			
			getTileCombatBonus : function(tile_type, player_id, is_attacking)
			{
				//console.log("page::getTileCombatBonus(" + tile_type + "," + player_id  + "," + is_attacking + ")");
				//calculating the tile bonus is complicated with a number of different rules
				//the arguments passed in are strictly unnecessary (except for tile_type) however i included them to make this easier
				
				//some more helpful info
				var numtypes = 13;
				var base_type = this.getBaseTileType(tile_type);
				var cur_province = this.provinces_by_name[this.preview_battle_province_name];
				
				if(tile_type <= 77)
				{
					//standard combat units
					switch(base_type)
					{
						case 0:
						{
							//blank tile, shouldnt be buildable
							console.log("WARNING: attempted to get tile bonus of blank tile: " + tile_type);
							break;
						}
						case 1:
						{
							//resources tile, shouldnt be buildable
							console.log("WARNING: attempted to get tile bonus of resource tile: " + tile_type);
							break;
						}
						case 2:
						{
							//attacking infantry
							if(is_attacking)
							{
								return 1;
							}
							break;
						}
						case 3:
						{
							//sword infantry
							//always get +1
							return 1;
						}
						case 4:
						{
							//defending infantry
							if(!is_attacking)
							{
								return 1;
							}
							break;
						}
						case 5:
						{
							//skirmisher infantry
							//+1 in forests
							if(cur_province.type == "Forest")
							{
								return 1;
							}
							break;
						}
						case 6:
						{
							//cavalry
							//+1 in plains
							if(cur_province.type == "Plains")
							{
								return 1;
							}
							break;
						}
						case 7:
						{
							//castle
							//+3 when defending
							if(!is_attacking)
							{
								return 3;
							}
							break;
						}
						case 8:
						{
							//ship
							//always get +1
							return 1;
						}
						case 9:
						{
							//siege engine
							//+2 in combat against castle or citadel
							var enemy_army;
							if(is_attacking)
							{
								enemy_army = this.army_display_defender;
							}
							else
							{
								enemy_army = this.army_display_attacker;
							}
							
							//loop over enemy units to find a citadel or castle
							for(var tile_id_string in enemy_army.tiles)
							{
								var check_tile_info = enemy_army.tiles[tile_id_string];
								var enemy_base_type = this.getBaseTileType(Number(check_tile_info.type_arg));
								if(enemy_base_type == 7)
								{
									return 2;
								}
							}
							
							break;
						}
						case 10:
						{
							//leader
							//always get +1
							return 1;
						}
						case 11:
						{
							//special1
							//faction unique unit
							var factionid = this.getPlayerFactionId(player_id);
							switch(factionid)
							{
								case(1):
								{
									//hillfolk
									return 2;
									break;
								}
								case(2):
								{
									//dragonriders
									return 4;
									break;
								}
								case(4):
								{
									//necromancers
									return 1;
									break;
								}
								default:
								{
									console.log("ERROR: attempting to get tilebonus of nonexistent special1 for faction " + factionid);
									break;
								}
							}
							return 0;
						}
						case 12:
						{
							//special2
							//faction unique unit
							var factionid = this.getPlayerFactionId(player_id);
							switch(factionid)
							{
								case(4):
								{
									//necromancers
									return 1;
									break;
								}
								default:
								{
									console.log("ERROR: attempting to get tilebonus of nonexistent special1 for faction " + factionid);
									break;
								}
							}
							return 0;
						}
					}
				}
				else
				{
					//battle "dice" tiles
					if(base_type < 6)
					{
						return base_type;
					}
					else
					{
						console.log("ERROR: getTileCombatBonus : function(" + tile_type + ", " + player_id + ", " + is_attacking + ") unknown battle tile type");
					}
				}
				
				//return 0 by default
				return 0;
			},
			
			CreateFactionTileStrings : function()
			{
				var all_tile_strings_generic = [
					{
						name : "Blank",
						desc : "NA0"
					},
					{
						name : "Resources",
						desc : "NA1"
					},
					{
						name : "Attacking infantry",
						desc : "+1 in combat when attacking."
					},
					{
						name : "Swords",
						desc : "+1 in combat."
					},
					{
						name : "Shield",
						desc : "+1 in combat when defending. Win ties when defending."
					},
					{
						name : "Skirmishers",
						desc : "+1 in combat when in forest."
					},
					{
						name : "Cavalry",
						desc : "+1 in combat when in plains."
					},
					{
						name : "Castle",
						desc : "+3 in combat when defending. Cannot move."
					},
					{
						name : "Ship",
						desc : "+1 in combat. Allows land units to cross sea areas. Can only move in sea areas."
					},
					{
						name : "Siege Engine",
						desc : "+2 in combat when against castle or citadel."
					},
					{
						name : "Leader",
						desc : "+1 in combat. Move one additional unit for no additional cost."
					},
					{
						name : "Special1",
						desc : "Unique desc 1"
					},
					{
						name : "Undead",
						desc : "+1 in combat. Can move up to 2 tiles for free, but can only move during the Undead phase."
					}
				];
				
				//loop over the factions and enter generic info for their tiles
				var numtypes = 13;
				for(var factionid=0; factionid<6; factionid++)
				{
					for(var basetypeid=0; basetypeid<numtypes; basetypeid++)
					{
						//have a unique variant of each base type for each faction
						//for most factions and types these are cosmetic differences
						var tile_type = basetypeid + factionid * numtypes;
						var tile_name = "ERR_TILE_NAME";
						var tile_desc = "ERR_TILE_DESC";
						switch(basetypeid)
						{
							case 11:
							{
								if(factionid == this.FACTION_HILLFOLK)
								{
									tile_name = "Giant";
									tile_desc = "+2 in combat. Always draw four tiles if present in battle."
								}
								else if(factionid == this.FACTION_DRAGONRIDERS)
								{
									tile_name = "Dragon";
									tile_desc = "+4 in combat. Discard after a successful attack. A force with dragons can always withdraw. No opposing force can withdraw from dragons. May fight in ship combat. Only costs 1 pip of movement regardless of terrain type. May remain in mountain, desert and sea areas."
								}
								else if(factionid == this.FACTION_NECROMANCERS)
								{
									tile_name = "Necromancer";
									tile_desc = "+1 in combat. If part of a winning battle, replace each eliminated unit with one Undead unit."
								}
								else
								{
									tile_name = all_tile_strings_generic[basetypeid].name;
									tile_desc = all_tile_strings_generic[basetypeid].desc + " faction" + factionid;
								}
								break;
							}
							case 12:
							{
								if(factionid == this.FACTION_NECROMANCERS)
								{
									tile_name = "Undead";
									tile_desc = "+1 in combat. Can only move during the Move Undead phase. Ignore terrain costs. Can enter mountains and remain in deserts."
								}
								else
								{
									tile_name = all_tile_strings_generic[basetypeid].name;
									tile_desc = all_tile_strings_generic[basetypeid].desc + " faction" + factionid;
								}
								break;
							}
							default:
							{
								tile_name = all_tile_strings_generic[basetypeid].name;
								tile_desc = all_tile_strings_generic[basetypeid].desc;
								break;
							}
						}
						var tile_strings = {
							name : tile_name,
							desc : tile_desc,
							type : tile_type
						};
						
						this.all_tile_strings.push(tile_strings);
					}
				}
			},
			
		});
		
		return instance;
	}
);
