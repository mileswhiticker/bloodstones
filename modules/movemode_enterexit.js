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
						//only reselect the province if we have movable units there
						var main_player_army = this.GetMainPlayerArmyInProvinceOrNull(old_selected_province_name, this.player_id);
						
						//here i assume that if main_player_army exists that means it must have movable units in it
						//i think this is a safe assumption
						if(main_player_army)
						{
							this.SelectProvince(old_selected_province_name);
						}
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
				}
				
				//back to the main phase
				if(this.isCurrentPlayerMoveMode())
				{
					//this.UnselectArmyStack();
					
					//remove the move mode UI overlays
					//this.unlockArmyTileSelection();
					this.SetDefaultMapInteraction();
					this.RemoveMoveModeUI();
					
					this.MergeReserveArmyBackIntoMain();
					//this.MergeReserveDisplayBackIntoMain();
					
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
					
					//clean up these as they arent needed any more
					this.queued_tile_moves_by_tile = {};
					this.queued_tile_moves_all = [];
					/*this.queued_moving_armies = [];
					this.queued_province_moves = [];
					this.queued_province_moves_by_army = [];
					
					this.queued_action_steps = {};
					this.queued_tile_moves = [];*/
					
				}
				else
				{
					console.log("WARNING: page::EndMoveMode() but not in move phase");
				}
				
				//do we currently have a province selected? how should we handle it?
				var old_selected_province_name = this.GetSelectedProvinceName();
				if(old_selected_province_name)
				{
					//only reselect the province if we have movable units there
					var main_player_army = this.GetMainPlayerArmyInProvinceOrNull(old_selected_province_name, this.player_id);
					
					//here i assume that if main_player_army exists that means it must have movable units in it
					//i think this is a safe assumption
					if(main_player_army)
					{
						this.RefreshProvinceSelection();
					}
					else
					{
						this.UnselectProvince();
					}
				}
			},
			
		});
		
		return instance;
	}
);