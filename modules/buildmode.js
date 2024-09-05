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
		
		var instance = declare("_buildmode", null, {
			//put your functions here
			
			/*
			PayTile : function(tile_id)
			{
				//TileStack::SpawnTileInStack : function(tile_info, source_div_id = undefined, selected = 1)
				
				//console.log(this.current_player_hand);
				var tile_info = this.current_player_hand.GetTileInfo(tile_id);
				this.current_player_hand.RemoveTileFromStack(tile_id);
				//console.log(this.current_player_hand.tiles);
				//console.log(tile_info);
				this.current_player_paystack.SpawnTileInStack(tile_info);
				//console.log(this.current_player_paystack);
				
				switch(this.payment_mode)
				{
					case gameui.STATE_MAIN_MOVE:
					{
						this.AddActionPaidAmount(this.GetTilePips(tile_info.type_arg));
						break;
					}
					case gameui.STATE_MAIN_BUILD:
					{
						this.AddActionPaidAmount(1);
						break;
					}
				}
			},
			*/
			
			QueueArmyBuild : function(target_prov_name, tile_id)
			{
				//console.log("page::QueueArmyBuild(" + target_prov_name + "," + tile_id + ")");
				//console.log(tile_id);
				const target_province_info = this.provinces_by_name[target_prov_name];
				
				//todo: legality checks here if the build is allowed
				
				//is this tile already queued? apparently this is a bug which is occurring occasionally
				var build_action_prov = this.queued_builds[target_prov_name];
				if(build_action_prov && build_action_prov != undefined)
				{
					//console.log(build_action_prov);
					if(build_action_prov.tiles.includes(tile_id))
					{
						console.log("WARNING: page::QueueArmyBuild(" + target_prov_name + "," + tile_id + ") trying to queue tile again but it is already queued");
						return;
					}
				}
				
				//get or create an army here to hold the planned build tile
				var new_army = this.GetTargetBuildArmy(target_prov_name);
				
				//which tile is getting built?
				var tile_info = this.current_player_hand.GetTileInfo(tile_id);
				//console.log(tile_info);
				
				//remove it from the player hand
				this.current_player_hand.RemoveTileFromStack(tile_id);
				
				//spawn it in the target build army
				new_army.SpawnTileInStack(tile_info);
				
				//toggle selection 
				if(window.gameui.selected_army == new_army)
				{
					this.RefreshSelectArmyStack();
				}
				
				//update the total cost
				var new_cost = this.GetTileBuildCost(tile_info.type_arg);
				this.AddActionCostAmount(new_cost);
				
				//store some info for the server
				if(build_action_prov == null || build_action_prov == undefined)
				{
					build_action_prov = {prov_name: target_prov_name, tiles: [], temp_army_id: new_army.id_num};
					this.queued_builds[target_prov_name] = build_action_prov;
				}
				build_action_prov.tiles.push(tile_id);
				
				//chaos horde arent limited to a starting citadel, but all their starting units must go together
				if(this.gamedatas.gamestate.name == "freeBuild_chaosHorde" && !this.chaos_horde_start_prov_name)
				{
					this.LimitChaosHordeBuildableProvinces(target_prov_name);
				}
				
				//console.log(this.queued_builds);
				//console.log(JSON.stringify(this.queued_builds));
			},
			
			TryCancelTileBuild : function(army_build_stack, tile_id)
			{
				//console.log("page::TryCancelTileBuild(army_build_stack, " + tile_id + ")");
				
				//find this specific tile
				var tile_info = army_build_stack.tiles[tile_id];
				
				//what is its build cost?
				var new_cost = this.GetTileBuildCost(tile_info.type_arg);
				this.AddActionCostAmount(-new_cost);
				
				//remove it from the build army stack and readd it to the player hand
				//console.log(tile_info);
				army_build_stack.RemoveTileFromStack(tile_id, this.GetPlayercardDivId(this.getCurrentPlayer()));
				this.current_player_hand.SpawnTileInStack(tile_info);
				
				//if there are no tiles left here, clean up the build army stack
				//the stack length should be 0, but there is a 1ms delay before the removal is processed so we instead check for 1
				//console.log(army_build_stack.items);
				if(army_build_stack.items.length < 1)
				{
					//console.log("destroying temp army");
					//do we need to unselect this army?
					if(this.selected_army == army_build_stack)
					{
						this.UnselectArmyStack();
					}
					
					//untrack this province queued build
					delete this.queued_builds[army_build_stack.prov_name];
					delete this.queued_build_armies_by_province[army_build_stack.prov_name];
					
					//clean up the army
					this.DestroyArmy(army_build_stack.id_num);
					
					//if we are in chaos horde mode, they can now choose a new province to deploy their starting horde in
					if(this.gamedatas.gamestate.name == "freeBuild_chaosHorde")
					{
						this.UnlimitChaosHordeBuildableProvinces();
						window.gameui.showMessage(window.gameui.GetChaosHordeRechooseStartingProvString(),"info");
					}
				}
				else
				{
					//console.log("there are still build tiles queued in this army");
				}
			},
			
			GetTargetBuildArmy : function(target_prov_name)
			{
				//console.log("page::GetTargetBuildArmy(" +  target_prov_name + ")");
				var target_army = this.queued_build_armies_by_province[target_prov_name];
				if(target_army == null || target_army == undefined)
				{
					//console.log("creating new build army");
					var army_info = {player_id: this.getActivePlayerId(), prov_name: target_prov_name, tiles: {}, army_id: this.getTempArmyId()};
					target_army = this.CreateArmy(army_info);
					target_army.SetBuilding(true);
					this.queued_build_armies_by_province[target_prov_name] = target_army;
				}
				return target_army;
			},
		});
		
		return instance;
	}
);