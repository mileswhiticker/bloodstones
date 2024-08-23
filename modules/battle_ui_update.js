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
		
		var instance = declare("_battle_ui_update", null, {
			//put your functions here
			
			UpdateBattleTiles : function(args)
			{
				//console.log("page::UpdateBattleTiles()");
				
				//now, update the dice tiles including any hidden or swapped ones
				var visible_tile_info = null;
				if(args.args.battle_tile_info != null)
				{
					visible_tile_info = args.args.battle_tile_info;
				}
				else if(args.args._private != null)
				{
					visible_tile_info = args.args._private;
				}
				
				//which tiles are we revealing, and which are we hiding?
				//this depends on the tile info that has been sent to us by the server
				if(visible_tile_info != null)
				{
					if(visible_tile_info.attacker_tiles)
					{
						//do we need to remove some old extraneous hidden tiles?
						this.UpdateHiddenAttackerTiles(0, 0, 0);
						
						//now show the attacker's tiles
						//this could be for that player, the corsair player or everyone when the battle resolves
						this.UpdateRevealedBattleTilesAttacker(visible_tile_info);
					}
					else
					{
						//show dummy tiles to the player to let them see the quantity but not the type
						this.UpdateHiddenAttackerTiles(this.num_attacker_tiles, this.num_attacker_tiles_swapped, this.num_attacker_tiles_rejected);
					}
					
					if(visible_tile_info.defender_tiles)
					{
						//do we need to remove some old extraneous hidden tiles?
						this.UpdateHiddenDefenderTiles(0, 0, 0);
						
						//now show the defender's tiles
						//this could be for that player, the corsair player or everyone when the battle resolves
						this.UpdateRevealedBattleTilesDefender(visible_tile_info);
					}
					else
					{
						this.UpdateHiddenDefenderTiles(this.num_defender_tiles, this.num_defender_tiles_swapped, this.num_defender_tiles_rejected);
					}
				}
				else
				{
					//dont worry about this for now, it should only be for spectators etc who have no tiles revealed
					//todo
					//console.log("No tile info recieved, player assumed to be spectating");
				}
			},
			
			UpdateRevealedBattleTilesAttacker : function(private_info)
			{
				//console.log("page::UpdateRevealedBattleTilesAttacker()");
				
				//the merger of these two produces the top 3 tiles for the player to use
				//console.log(private_info.attacker_tiles);
				//console.log(private_info.attacker_tiles_swapped);
				var top_battle_tiles = {...private_info.attacker_tiles, ...private_info.attacker_tiles_swapped};
				
				//update the battle tilestacks
				this.UpdateBattleTilesRevealed2(this.battle_tilestack_attacker, top_battle_tiles, this.attacking_player_id);
				this.UpdateBattleTilesRevealed2(this.reject_tilestack_attacker, private_info.attacker_tiles_rejected);
			},
			
			UpdateRevealedBattleTilesDefender : function(private_info)
			{
				//console.log("page::UpdateRevealedBattleTilesDefender()");
				
				//the merger of these two produces the top 3 tiles for the player to use
				var top_battle_tiles = {...private_info.defender_tiles, ...private_info.defender_tiles_swapped};
				
				//update the battle tilestacks
				this.UpdateBattleTilesRevealed2(this.battle_tilestack_defender, top_battle_tiles, this.defending_player_id);
				this.UpdateBattleTilesRevealed2(this.reject_tilestack_defender, private_info.defender_tiles_rejected);
			},
			
			UpdateBattleTilesRevealed2 : function(tilestack, tileinfos, player_id_battlescore = 0)
			{
				//console.log("page::UpdateBattleTilesRevealed2(tilestack,tileinfos," + player_id_battlescore + ")");
				//console.log(tilestack);
				//console.log(tileinfos);
				
				//remove any tiles which shouldn't be here
				var remove_tile_infos = [];
				//for(var i=0; i<tilestack.tiles.length; i++)
				for(var tile_id in tilestack.tiles)
				{
					//tilestack.tiles[tile_info.id.toString()] = tile_info;
					//var cur_tile_info = tilestack.tiles[i];
					var cur_tile_info = tilestack.tiles[tile_id];
					var found = false;
					for(var j in tileinfos)
					{
						var check_tile_info = tileinfos[j];
						if(check_tile_info.id == cur_tile_info.id)
						{
							found = true;
							break;
						}
					}
					
					if(!found)
					{
						remove_tile_infos[cur_tile_info.id.toString()] = cur_tile_info;
						if(player_id_battlescore)
						{
							var tile_pips = this.GetTilePips(cur_tile_info.type_arg);
							//console.log("removing battlescore: " + tile_pips);
							this.addBattlescore(-tile_pips, player_id_battlescore);
						}
					}
				}
				
				//now remove the tiles we didnt find
				var cur_tile_info = tilestack.RemoveTilesFromStack(remove_tile_infos);
				
				//add new tiles to the battle stack
				for(var tile_id in tileinfos)
				{
					if(!tilestack.HasTile(tile_id))
					{
						//console.log("adding \"dice\" tile " + tile_id + " to battle stack");
						var cur_tile_info = tileinfos[tile_id];
						tilestack.SpawnTileInStack(cur_tile_info);
						
						var tile_pips = this.GetTilePips(cur_tile_info.type_arg);
						
						if(player_id_battlescore)
						{
							//in theory, tiles are only getting added once. this should avoid adding duplicate values to the battlescore
							//console.log("adding battlescore: " + tile_pips);
							this.addBattlescore(tile_pips, player_id_battlescore);
						}
					}
				}
			},
			
			UpdateHiddenAttackerTiles : function(num_dice = 0, num_swapped = 0, num_rejected = 0)
			{
				//console.log("page::UpdateHiddenAttackerTiles(" + num_dice + "," + num_swapped + "," + num_rejected + ")");
				
				//UpdateBattleTilesHidden2 : function(battle_tilestack, num_tiles, tile_type)
				if(num_dice >= 0)
				{
					this.UpdateBattleTilesHidden2(this.battle_tilestack_attacker, num_dice, this.ATTACKER_TILE_TYPE);
				}
				if(num_swapped >= 0)
				{
					var player_dice_type = this.getPlayerFactionId(this.attacking_player_id) * 13;
					this.UpdateBattleTilesHidden2(this.battle_tilestack_attacker, num_swapped, player_dice_type);
				}
				if(num_rejected >= 0)
				{
					this.UpdateBattleTilesHidden2(this.reject_tilestack_attacker, num_rejected, this.ATTACKER_TILE_TYPE);
				}
			},
			
			UpdateHiddenDefenderTiles : function(num_dice = 0, num_swapped = 0, num_rejected = 0)
			{
				//console.log("page::UpdateHiddenDefenderTiles(" + num_dice + "," + num_swapped + "," + num_rejected + ")");
				
				//UpdateBattleTilesHidden2 : function(battle_tilestack, num_tiles, tile_type)
				if(num_dice >= 0)
				{
					this.UpdateBattleTilesHidden2(this.battle_tilestack_defender, num_dice, this.DEFENDER_TILE_TYPE);
				}
				if(num_swapped >= 0)
				{
					var player_dice_type = this.getPlayerFactionId(this.defending_player_id) * 13;
					this.UpdateBattleTilesHidden2(this.battle_tilestack_defender, num_swapped, player_dice_type);
				}
				if(num_rejected >= 0)
				{
					this.UpdateBattleTilesHidden2(this.reject_tilestack_defender, num_rejected, this.DEFENDER_TILE_TYPE);
				}
			},
			
			UpdateBattleTilesHidden2 : function(battle_tilestack, num_tiles, tile_type)
			{
				//console.log("page::UpdateBattleTilesHidden2([array]," + num_tiles + "," + tile_type + ")");
				//console.log(battle_tilestack);
				
				var num_tiles_found = 0;
				var tiles_to_remove = [];
				for(var i in battle_tilestack.items)
				{
					//is this the kind we are looking for?
					var item = battle_tilestack.items[i];
					if(item.type == tile_type)
					{
						num_tiles_found += 1;
					}
					
					//we have one too many
					if(num_tiles_found > num_tiles)
					{
						//remember this one for later
						tiles_to_remove.push(item);
						
						//remove this one from the count
						num_tiles_found -= 1;
					}
				}
				//console.log("tiles_to_remove:");
				//console.log(tiles_to_remove);
				
				for(var i in tiles_to_remove)
				{
					//remove this one from the stack
					var item = tiles_to_remove[i];
					//console.log(i);
					//console.log(item);
					battle_tilestack.RemoveTileFromStack(item.id);
				}
				
				//do we need to create new tiles?
				var num_tiles_new = num_tiles - num_tiles_found;
				for(var i=0; i < num_tiles_new; i++)
				{
					//create an arbitrary id which hopefully wont conflict with anything
					var new_id = tile_type + 10 + i;
					
					//create a template for this tile
					var template_tile_info = {
						id: new_id,
						location: "hand",
						location_arg: "0",
						selected: false,
						type: "battle_tile",
						type_arg: tile_type};
						
					//create the tile
					battle_tilestack.SpawnTileInStack(template_tile_info);
				}
			},
			
			HaveSpawnedInitialBattleTiles : function()
			{
				return this.battle_tilestack_attacker.items.length > 0;
			},
			
		});
		
		return instance;
	}
);
