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
		
		var instance = declare("_undead", null, {
			//put your functions here
			
			BeginUndeadState : function()
			{
				this.queued_undead_moves = [];
				this.EnablePaymentBucket(PHASE_UNDEAD);
				this.SetActionPaid(-1);
				this.SetPaymodeUndeadUnselect();
			},
			
			ResetUndeadState : function(undo_moves = false)
			{
				//console.log("page::ResetUndeadState()");
				
				for(var army_name in this.queued_undead_moves)
				{
					//console.log(army_name);
					var moving_army = this.armies_by_id_string[army_name];
					//console.log(moving_army);
					if(undo_moves)
					{
						//move this army back to their starting position
						//var queued_moves = this.queued_undead_moves[army_name];
						//var start_prov_info = queued_moves[0];
						this.MoveArmy(moving_army, moving_army.starting_province_location);
						moving_army.EndQueuedMove();
					}
					moving_army.SetMoving(false);
				}
				this.queued_undead_moves = [];
				this.moving_undead_armies = [];
				
				//reset move info
				for(var i in this.move_info_provinces)
				{
					var prov_info = this.move_info_provinces[i];
					prov_info.move_info = null;
				}
				this.move_info_provinces = [];
				
				//do we have an army selected currently?
				if(this.selected_army)
				{
					//nicely carry uot an unselection
					//this feels a little hacky but w/e
					this.HandleUndeadStateArmyClicked(this.selected_army);
				}
				
				//redraw the UI
				if(undo_moves)
				{
					this.RefreshUndeadStateUI();
				}
			},
			
			EndUndeadState : function(approved)
			{
				//console.log("page::EndUndeadState(" + approved + ")");
				//console.log(this.queued_undead_moves);
				
				//if the player didn't queue any actions, then force a "skip"
				if(this.moving_undead_armies.length == 0)
				{
					approved = false;
				}
				
				//server actions
				if(approved)
				{
					this.ServerUndeadAction();
				}
				else
				{
					this.ServerSkipAction();
				}
				
				//reset the vfx for armies to show they have a queued move
				for(var army_name in this.queued_undead_moves)
				{
					var ghosted_army = this.armies_by_id_string[army_name];
					ghosted_army.SetMoving(false);
				}
				
				//finally clear out this temp info
				this.ResetUndeadState(false);
				
				//handle UI changes
				this.FinishUndeadStateUI(approved);
			},
			
			TryQueueProvinceMoveUndead : function(target_province_name)
			{
				//console.log("page::TryQueueProvinceMoveUndead(" + target_province_name + ")");
				if(this.selected_army == null)
				{
					return null;
				}
				if(!this.DoesActivePlayerOwnArmy(this.selected_army))
				{
					return;
				}
				var moving_army = this.selected_army;
				
				//console.log("page::TryQueueProvinceMoveUndead(" + target_province_name + ", " + moving_army.id_string + ")");
				const target_province_info = this.provinces_by_name[target_province_name];
				
				//did we click on the current province?
				if(target_province_info.name == moving_army.province_id)
				{
					//console.log("SANITY CHECK: QueueArmyMove() being called for the same province the army is in");
					return;
				}
				
				if(moving_army.UndeadMovesRemaining() <= 0)
				{
					//console.log("no moves remaining for that army");
					return;
				}
				
				if(target_province_info.move_info && target_province_info.move_info != undefined && !target_province_info.move_info.impassable)
				{
					//console.log("success");
					//console.log(target_province_info.move_info);
					if(!moving_army.starting_province_location)
					{
						moving_army.StartQueuedMove();
						moving_army.SetMoving(true);
					}
					var army_queued_undead_moves;
					//if(!this.queued_undead_moves.includes(moving_army.id_string))
					if(!this.queued_undead_moves[moving_army.id_string])
					{
						var start_prov_info = this.provinces_by_name[moving_army.province_id];
						this.queued_undead_moves[moving_army.id_string] = [start_prov_info.name];
						this.moving_undead_armies.push(moving_army.id_string);
					}
					army_queued_undead_moves = this.queued_undead_moves[moving_army.id_string];
					army_queued_undead_moves.push(target_province_info.name);
					//console.log(army_queued_undead_moves);
					
					this.MoveArmy(moving_army, target_province_name, false);
					//this.queued_undead_moves
					this.RefreshUndeadStateUI();
				}
				else
				{
					//console.log("cant move there");
					this.showMessage(this.GetMoveFailDistString(), 'error');
				}
			},
			
			GetJsonUndeadMoves : function()
			{
				//console.log("page::GetJsonUndeadMoves()");
				var undead_moves = [];
				for(var army_name_temp in this.queued_undead_moves)
				{
					var province_names_temp = this.queued_undead_moves[army_name_temp];
					var army_move_steps = {army_name: army_name_temp, province_names: province_names_temp};
					undead_moves.push(army_move_steps);
				}
				var undead_moves_JSON = JSON.stringify(undead_moves);
				//console.log(undead_moves_JSON);
				return undead_moves_JSON;
			},
			
			ServerUndeadAction : function()
			{
				//console.log("page::ServerUndeadAction()");
				if(gameui.checkAction('action_moveUndead'))
				{
					gameui.ajaxcall( "/bloodstones/bloodstones/action_moveUndead.html", {
						undead_moves: this.GetJsonUndeadMoves(),
						lock: true
						}, 
						 gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
		});
		
		return instance;
	}
);