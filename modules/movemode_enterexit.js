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
		
		var instance = declare("_movemode_enterexit", null, {
			
			EnterMoveMode : function()
			{
				//console.log("page::EnterMoveMode()");
				//if(window.gameui.selected_army != null)
				if(this.isCurrentPlayerMainState())
				{
					var old_selected_province_name = this.GetSelectedProvinceName();
					if(old_selected_province_name)
					{
						this.UnselectProvince();
					}
					
					this.queued_province_moves = [];
					this.queued_province_moves_by_army = [];
					this.queued_action_steps = {};
					this.enterSmallPhase(gameui.STATE_MAIN_MOVE);
					this.SetMovemodeMapInteraction();
					//this.RefreshMoveModeUI();
					this.EnablePaymentBucket(gameui.STATE_MAIN_MOVE);
					//this.ResetActionInfo(this.ACTION_MOVE);	//todo: im not sure what this function was meant to be or do, movemode needs a bunch of work to clean it up
					
					//have we already selected a movable army?
					/*if(this.selected_army != null && this.selected_army.player_id == this.player_id)
					{
						this.selected_army_display_stack.selectAll();
					}*/
					//this.RefreshProvinceSelection();
					if(old_selected_province_name)
					{
						this.SelectProvince(old_selected_province_name);
					}
				}
			},
			
			EndMoveMode : function(approved)
			{
				//console.log("page::EndMoveMode(" + approved + ")");
				
				//reset the transparency
				/*for(var i in this.ghosted_armies)
				{
					var ghosted_army = this.ghosted_armies[i];
					ghosted_army.SetMoving(false);
				}
				this.ghosted_armies = [];*/
				
				//if the player queued no actions, then this hack should nicely handle cleanup for us
				if(this.GetActionCostAmount() == 0)
				{
					approved = false;
				}

				//was the movement successful or cancelled?
				if(approved)
				{
					//console.log("move approved");
					//lock in the army stack movement by sending it to the server 
					//note: this includes army splits as well as moves
					this.ServerPayAction(this.ACTION_MOVE);
				}
				else
				{
					//console.log("move cancelled");
					this.RefundPaystackTiles();
					this.DestroyPayWindow();
					
					/*
					var army_split_step = {tile_id: cur_tile_id, source_army_id_num: source_army.id_num, temp_army_id_num: temp_army.id_num};
					this.queued_splitting_armies.push(army_split_step);
					*/
					//console.log(this.queued_splitting_armies);
					/*
					//previous system 18/10/24
					for(var i in this.queued_splitting_armies)
					{
						var cur_split_action = this.queued_splitting_armies[i];
						//console.log("Reversing army split:");
						//console.log(cur_split_action);
						this.TransferArmyTiles(cur_split_action.temp_army_id_num, cur_split_action.source_army_id_num, [cur_split_action.tile_id], this.SELECT_ARMY_TARGET);
					}
					this.queued_splitting_armies = [];
					*/
					
					//todo: this is messy as hell. it should probably just loop through all the actions and undo them one by one
					/*
					for(var army_id_string in this.queued_action_steps)
					{
						//disable this for now
						break;
						
						console.log("cancelling queued action steps for: " + army_id_string);
						
						var moving_army = this.armies_by_id_string[army_id_string];
						
						var army_action_steps = this.queued_action_steps[army_id_string];
						//console.log(army_action_steps);
						for(var index in army_action_steps)
						{
							var action_step = army_action_steps[index];
							if(action_step.step_type == this.ACTION_SPLIT)
							{
								//merge these split tiles back in
								console.log("undoing split step in province " + action_step.prov_name);
								this.TransferArmyTiles(action_step.temp_army_id_num, moving_army.id_num, action_step.tile_ids, this.SELECT_ARMY_NONE);
								
								//now destroy the queued split army for this province
								//var army_id_num = this.GetArmyIdNumFromString(army_id_string);
								//var army = this.GetArmyById(army_id_num);
								//delete this.queued_split_armies_by_province[army.prov_name];
								//console.log(this.queued_split_armies_by_province);
							}
						}
						//console.log("moving_army.starting_province_location: " + moving_army.starting_province_location);
						//this move is clientside ui only
						this.MoveArmy(moving_army, moving_army.starting_province_location);
						moving_army.EndQueuedMove();
					}
					*/
				}
				
				//back to the main phase
				if(this.isCurrentPlayerMoveMode())
				{
					//this.UnselectArmyStack();
					
					//remove the move mode UI overlays
					//this.unlockArmyTileSelection();
					this.SetDefaultMapInteraction();
					this.RemoveMoveModeUI();
					
					//clean up these as they arent needed any more
					this.queued_tile_moves_by_tile = {};
					this.queued_tile_moves_all = [];
					/*this.queued_moving_armies = [];
					this.queued_province_moves = [];
					this.queued_province_moves_by_army = [];
					
					this.queued_action_steps = {};
					this.queued_tile_moves = [];*/
					
					this.MergeReserveArmyBackIntoMain();
					this.MergeReserveDisplayBackIntoMain();
					
					if(approved)
					{
						this.enterSmallPhase(gameui.STATE_MAIN_RESET);
					}
					else
					{
						this.enterSmallPhase(gameui.STATE_MAIN_DEFAULT);
						
						//reset the planned move
						this.UndoAllTileMoves();
					}
				}
				else
				{
					console.log("WARNING: page::EndMoveMode() but not in move phase");
				}
				
				this.UnselectProvince();
			},
			
		});
		
		return instance;
	}
);