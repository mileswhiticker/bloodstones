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
					this.queued_province_moves = [];
					this.queued_province_moves_by_army = [];
					this.queued_action_steps = {};
					this.enterSmallPhase(gameui.STATE_MAIN_MOVE);
					this.AddMoveModeUI();
					this.EnablePaymentBucket(gameui.STATE_MAIN_MOVE);
					this.SetProvinceOverlayMode(this.OVERLAY_MOVE);
					//this.ResetActionInfo(this.ACTION_MOVE);	//todo: im not sure what this function was meant to be or do, movemode needs a bunch of work to clean it up
				}
			},
			
			EndMoveMode : function(approved)
			{
				//console.log("page::EndMoveMode(" + approved + ")");
				
				//reset the transparency
				for(var i in this.ghosted_armies)
				{
					var ghosted_army = this.ghosted_armies[i];
					ghosted_army.SetMoving(false);
				}
				this.ghosted_armies = [];
				
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
					//reset the planned move
					this.RefundPaystackTiles();
					this.DestroyPayWindow();
					
					/*
					var army_split_step = {tile_id: cur_tile_id, source_army_id_num: source_army.id_num, temp_army_id_num: temp_army.id_num};
					this.queued_splitting_armies.push(army_split_step);
					*/
					//console.log(this.queued_splitting_armies);
					for(var i in this.queued_splitting_armies)
					{
						var cur_split_action = this.queued_splitting_armies[i];
						//console.log("Reversing army split:");
						//console.log(cur_split_action);
						this.TransferArmyTiles(cur_split_action.temp_army_id_num, cur_split_action.source_army_id_num, [cur_split_action.tile_id], this.SELECT_ARMY_TARGET);
					}
					this.queued_splitting_armies = [];
					
					for(var army_id_string in this.queued_action_steps)
					{
						var army_id_num = this.GetArmyIdNumFromString(army_id_string);
						
						//temp armies will be nulled as they are merged back into the parent
						//we will have to skip this one here
						if(this.isTempArmyId(army_id_num))
						{
							continue;
						}
						
						//console.log("cancelling action steps for: " + army_id_string);
						var army_action_steps = this.queued_action_steps[army_id_string];
						//console.log(army_action_steps);
						/*for(var index in army_action_steps)
						{
							var action_step = army_action_steps[index];
						}*/
						var moving_army = this.armies_by_id_string[army_id_string];
						
						//console.log("moving_army.starting_province_location: " + moving_army.starting_province_location);
						//this move is clientside ui only
						this.MoveArmy(moving_army, moving_army.starting_province_location);
						moving_army.EndQueuedMove();
					}
				}
				
				//back to the main phase
				this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
				if(this.isCurrentPlayerMoveMode())
				{
					//remove the move mode UI overlays
					//this.unlockArmyTileSelection();
					this.RemoveMoveModeUI();
					
					//clean up these as they arent needed any more
					this.queued_moving_armies = [];
					this.queued_province_moves = [];
					this.queued_province_moves_by_army = [];
					
					this.queued_action_steps = {};
					this.UnselectArmyStack();
					
					if(approved)
					{
						this.enterSmallPhase(gameui.STATE_MAIN_RESET);
					}
					else
					{
						this.enterSmallPhase(gameui.STATE_MAIN_DEFAULT);
					}
				}
				else
				{
					console.log("WARNING: page::EndMoveMode() but not in move phase");
				}
			},
			
		});
		
		return instance;
	}
);