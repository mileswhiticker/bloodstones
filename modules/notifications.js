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
		
		var instance = declare("_notifications", null, {
			
			///////////////////////////////////////////////////
			//// Reaction to cometD notifications

			/*
				setupNotifications:
				
				In this method, you associate each of your game notifications with your local method to handle it.
				
				Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
					  your bloodstones.game.php file.
			
			*/
			setupNotifications: function()
			{
				//console.log( 'notifications subscriptions setup' );
				
				// TODO: here, associate your game notifications with local methods
				
				// Example 1: standard notification handling
				// dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
				
				// Example 2: standard notification handling + tell the user interface to wait
				//            during 3 seconds after calling the method in order to let the players
				//            see what is happening in the game.
				// dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
				// this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
				//
				
				dojo.subscribe('debug', this, "notif_debug");
				dojo.subscribe('showMessage', this, "notif_showMessage");
				dojo.subscribe('logPlayerMessage', this, "notif_logPlayerMessage");
				dojo.subscribe('cycleHand', this, "notif_cycleHand");
				dojo.subscribe('regroup', this, "notif_regroup");
				dojo.subscribe('endTurn', this, "notif_endTurn");
				dojo.subscribe('startTurn', this, "notif_startTurn");
				dojo.subscribe('playerCreateArmy', this, "notif_playerCreateArmy");
				dojo.subscribe('playerArmyMove', this, "notif_playerArmyMove");
				dojo.subscribe('playerMoveFail', this, "notif_playerMoveFail");
				dojo.subscribe('playerArmyTransfer', this, "notif_playerArmyTransfer");
				dojo.subscribe('playerBuildFail', this, "notif_playerBuildFail");
				dojo.subscribe('playerBuildSuccess', this, "notif_playerBuildSuccess");
				dojo.subscribe('changePhase', this, "notif_changePhase");
				dojo.subscribe('tileDiscard', this, "notif_tileDiscard");
				dojo.subscribe('tileRefund', this, "notif_tileRefund");
				dojo.subscribe('tileSacrifice', this, "notif_tileSacrifice");
				dojo.subscribe('playerArmyRetreat', this, "notif_playerArmyRetreat");
				dojo.subscribe('playerHandChanged', this, "notif_playerHandChanged");
				dojo.subscribe('playerHandDraw', this, "notif_playerHandDraw");
				dojo.subscribe('newVillages', this, "notif_newVillages");
				dojo.subscribe('newVillagesFail', this, "notif_newVillagesFail");
				dojo.subscribe('newCitadel', this, "notif_newCitadel");
				dojo.subscribe('playerChooseFaction', this, "notif_playerChooseFaction");
				dojo.subscribe('playerChooseFactionFail', this, "notif_playerChooseFactionFail");
				dojo.subscribe('playerCaptureSuccess', this, "notif_playerCaptureSuccess");
				dojo.subscribe('playerCaptureFail', this, "notif_playerCaptureFail");
				dojo.subscribe('desert_tiles', this, "notif_desert_tiles");
				dojo.subscribe('battleResolve', this, "notif_battleResolve");
				dojo.subscribe('battleResolve_dragons', this, "notif_battleResolve_dragons");
				dojo.subscribe('battleResolve_undead', this, "notif_battleResolve_undead");
				dojo.subscribe('playerUndeadMove', this, "notif_playerUndeadMove");
				dojo.subscribe('playerScoreChanged', this, "notif_scoreChanged");
				dojo.subscribe('captureInfoUpdated', this, "notif_captureInfoUpdated");
				
				//dont display player notifications for our own moves
				//this.setIgnoreNotificationCheck("playerArmyMove", (notif) => (notif.args.moving_player_id == this.player_id));
			},
			
			// TODO: from this point and below, you can write your game notifications handling methods
			
			/*
			Example:
			
			notif_cardPlayed: function( notif )
			{
				//console.log( 'notif_cardPlayed' );
				//console.log( notif );
				
				// Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
				
				// TODO: play the card in the user interface.
			},    
			
			*/
			
			notif_captureInfoUpdated : function(notif)
			{
				//console.log("page::notif_captureInfoUpdated()");
				//console.log(notif);
				
				if(this.isCurrentPlayerChaosHorde())
				{
					if(this.isCurrentPlayerCaptureMode())
					{
						//sanity check: this shouldnt happen
						console.log("WARNING: page::notif_captureInfoUpdated() while current player is in capture phase");
						console.log(notif);
					}
					else
					{
						this.possible_capture_infos = notif.args.possible_capture_infos;
					}
				}
			},
			
			notif_scoreChanged : function(notif)
			{
				var player_score_div = dojo.byId(this.GetPlayerScoreDivId(notif.args.player_id));
				player_score_div.innerHTML = notif.args.new_score;
			},
			
			notif_debug : function(notif) {
				console.log(notif.args.debugmessage);
			},
			
			notif_showMessage : function(notif) {
				//console.log("page::notif_showMessage()");
				//console.log(notif);
				if(notif.args.message && notif.args.message != undefined)
				{
					var message_type = 'info';
					if(notif.args.type)
					{
						message_type = notif.args.type;
					}
					this.showMessage(notif.args.message, message_type);
				}
			},
			
			notif_logPlayerMessage : function(notif) {
				//console.log("page::notif_logPlayerMessage()");
				//console.log(notif);
				//this.showMessage(notif.args.message, notif.args.type);
			},
			
			notif_playerChooseFaction : function(notif)
			{
				//console.log("page::notif_playerChooseFaction() player_id:" + notif.args.player_id + ", faction_id:" + notif.args.faction_id + ", old_faction_id:" + notif.args.old_faction_id);
				this.SetPlayerFactionChoice(notif.args.player_id, notif.args.faction_id, notif.args.old_faction_id);
			},
			
			notif_playerCaptureSuccess : function(notif)
			{
				//console.log("page::notif_playerCaptureSuccess()");
				//console.log(notif);
				var capture_player_id = notif.args.capture_player_id;
				//console.log("capture_player_id: " + capture_player_id);
				
				/*
				'capture_player_id' => $active_player_id,
				'captured_village_ids' => $village_tile_ids
				*/
				var new_captured_villages = 0;
				for(var index in notif.args.captured_village_ids)
				{
					var captured_village_id = notif.args.captured_village_ids[index];
					this.DestroyVillageStackById(captured_village_id);
					new_captured_villages++;
				}
				this.AddVillagesCaptured(capture_player_id, new_captured_villages);
				
				//chaos horde capture during their main phase, so they need ui updates here
				if(this.isCurrentPlayerResetMode())
				{
					this.enterSmallPhase(STATE_MAIN_DEFAULT);
				}
			},
			
			notif_playerCaptureFail : function(notif)
			{
				switch(notif.args.failure_reason)
				{
					case ACTION_FAIL_CAPTUREMAX:
					{
						this.showMessage(this.GetFailCaptureMaxString(), "info");
						break;
					}
					default:
					{
						this.showMessage("ERROR: failed to capture villages with code: " + notif.args.failure_reason, "error");
						break;
					}
				}
			},
			
			notif_playerChooseFactionFail : function(notif)
			{
				//this is unused, it goes through notif_playerChooseFaction() above
				//im going to leave it here just in case
				console.log("page::notif_playerChooseFactionFail()");
				//this.SetPlayerFactionChoice(notif.args.player_id, notif.args.faction_id, notif.args.old_faction_id);
			},
			
			notif_cycleHand : function(notif)
			{
				//console.log("page::notif_cycleHand()");
				if(parseInt(notif.args.target_player_id) == this.getCurrentPlayer())
				{
					gameui.DiscardPlayerHandTiles();
					gameui.gamedatas.hand = notif.args.new_hand;
					gameui.CreatePlayerHandTiles();
				}
			},
			
			notif_regroup : function(notif)
			{
				let regroups_left = dojo.byId("regroups_" + notif.args.player_id);
				regroups_left.innerHTML = notif.args.regroups;
			},
			
			notif_endTurn : function(notif)
			{
				//console.log("page::notif_endTurn()");
				//todo: cancel any move, build or battle in progress
				//todo: how to handle battle in progress? could a player cheat by forcing an end of turn? 
			},
			
			notif_startTurn : function(notif)
			{
				//console.log("page::notif_startTurn()");
				
				/*const end_turn_popup = dojo.place("<div id=\"end_turn_popup\"><p>it is now " + notif.args.active_player_name + "'s turn!</p></div>","centrepanel");
				this.fadeOutAndDestroy(end_turn_popup, 1000, 2000);*/
			},
			
			notif_playerUndeadMove : function(notif)
			{
				//console.log("page::notif_playerUndeadMove()");
				//console.log(notif);
				var moving_army = this.GetArmyById(notif.args.army_id_num);
				this.MoveArmy(moving_army, notif.args.dest_province_name);
				
				//close this window if it's still open
				this.DestroyPayWindow();
			},
			
			notif_playerArmyMove : function(notif)
			{
				//console.log("page::notif_playerArmyMove()");
				//console.log(notif);
				/*
				//variables passed in:
				array(
					'moving_player_name' => $player_name_current,
					'army_id_num' => $target_army_id,
					'dest_province_id' => $dest_province_id
					);
				
				//access them like this:
					notif.args.moving_player_name
				*/
				
				//find the army
				var moving_army = this.GetArmyById(notif.args.army_id_num);
				//console.log(moving_army);
				
				//do the move
				/*
				var dropX = -moving_army.item_width/2;
				var dropY = -moving_army.item_height/2;
				var dojo_anim = gameui.slideToObjectPos(moving_army.container_div.id, notif.args.dest_province_id, dropX, dropY);
				dojo_anim.play();
				*/
				this.MoveArmy(moving_army, notif.args.dest_province_id);
				
				//update any possible pending battles
				this.gamedatas.pending_battles = notif.args.pending_battles_update;
				
				//update the ui
				if(this.isCurrentPlayerResetMode())
				{
					this.enterSmallPhase(STATE_MAIN_DEFAULT);
				}
			},
			
			notif_playerMoveFail : function(notif)
			{
				console.log("page::notif_playerMoveFail()");
				if(gameui.isCurrentPlayerResetMode())
				{
					gameui.enterSmallPhase(STATE_MAIN_DEFAULT);
				}
				//todo: reset the move
			},
			
			notif_playerBuildSuccess : function(notif)
			{
				//console.log("page::notif_playerBuildSuccess()");
				
				for(var army_id in notif.args.built_armies)
				{
					var new_army_info = notif.args.built_armies[army_id];
					var army_stack = gameui.CreateArmy(new_army_info);
				}
				
				//update any new pending battles
				this.gamedatas.pending_battles = notif.args.pending_battles_update;
				
				if(notif.args.player_id == this.getCurrentPlayerId())
				{
					gameui.CleanupBuildMode(true);
				}
			},
			
			notif_playerBuildFail : function(notif)
			{
				//console.log("page::notif_playerBuildFail()");
				
				//clean up the planned builds
				if(notif.args.player_id == this.getCurrentPlayerId())
				{
					gameui.CleanupBuildMode(false);
				}
				
				/*
				'fail_player_id' => $active_player_id,
				'fail_player_name' => $player_name_current
				*/
			},
			
			notif_playerCreateArmy : function(notif)
			{
				//notif.args.army_id_num, notif.args.province_id, notif.args.player_id
				var army_info = {army_id: notif.args.army_id, player_id: notif.args.player_id, province_id: notif.args.province_id, tiles: notif.args.tiles};
				var army_stack = gameui.CreateArmy(army_info, notif.args.from_div_id);
				
				this.gamedatas.pending_battles = notif.args.pending_battles_update;
			},
			
			notif_playerArmyTransfer : function(notif) {
				//console.log("page::notif_playerArmyTransfer()");
				//console.log(notif);
				
				var source_army = gameui.GetArmyById(notif.args.temp_army_id);
				if(source_army == undefined)
				{
					source_army = gameui.GetArmyById(notif.args.source_army_id);
					//console.log("check1");
				}
				
				var target_army = gameui.GetArmyById(notif.args.target_army_id);
				
				//do we need to create this army?
				if(target_army == undefined)
				{
					//console.log("check2");
					var spawn_province = source_army.province_id;
					if(notif.args.target_province_override != null)
					{
						spawn_province = notif.args.target_province_override;
						//console.log("check3");
					}
					var target_army_info = {army_id: notif.args.target_army_id, player_id: source_army.player_id, province_id: spawn_province, tiles: []};
					target_army = gameui.CreateArmy(target_army_info, null);
				}
				
				//create a visual hint animation for the player
				//gameui.SelectedArmySplitAnimation(notif.args.tile_ids[0], source_army.id_num);
				
				//now transfer the tiles across
				//gameui.TransferArmyTiles(notif.args.source_army_id, notif.args.target_army_id, notif.args.tile_ids, notif.args.selection_flag);
				gameui.TransferArmyTiles(source_army.id_num, target_army.id_num, notif.args.tile_ids, notif.args.selection_flag);
			},
			
			notif_changePhase : function(notif) {
				gameui.enterSmallPhase(notif.args.new_phase);
			},
			
			notif_tileDiscard : function(notif)
			{
				//console.log("page::notif_tileDiscard()");
				switch(notif.args.location_from)
				{
					case "paystack":
					{
						if(notif.args.discarded_tiles)
						{
							this.current_player_paystack.RemoveTilesFromStack(notif.args.discarded_tiles, "bag");
						}
						if(notif.args.discarded_tiles_ids)
						{
							this.current_player_paystack.RemoveTilesFromStackIds(notif.args.discarded_tiles_ids, "bag");
						}
						
						break;
					}
				}
				
				//close this window if it's still open
				this.DestroyPayWindow();
			},
			
			notif_tileRefund : function(notif)
			{
				//console.log("page::notif_tileRefund()");
				//console.log(notif.args)
				switch(notif.args.location_from)
				{
					case "paystack":
					{
						this.RefundPaystackTiles();
						break;
					}
				}
				
				//close this window if it's still open
				this.DestroyPayWindow();
			},
			
			notif_tileSacrifice : function(notif)
			{
				this.DestroyBattleWindow();
				
				//self::notifyAllPlayers("tileSacrifice", "", array('sacrifice_tile_id' => $sacrifice_tile_id, 'army_id' => $tile_info['location_arg']));
				var army = this.GetArmyById(notif.args.army_id);
				//RemoveTileFromStack : function(tile_info_id, target_div_id = undefined)
				//todo: some kind of ui feedback
				army.RemoveTileFromStack(notif.args.sacrifice_tile_id);
				
				//hack alert: there is a few ms delay in RemoveTileFromStack() due to the animation, so in order to lazily check if there is no tiles left then we just queue it for being safely destroyed
				if(army.tiles.length == 1)
				{
					//destroy the army because it has no tiles left
					this.DestroyArmy(army.id_num);
				}
			},
			
			notif_playerArmyRetreat : function(notif)
			{
				//console.log("page::notif_playerArmyRetreat()");
				//console.log(notif);
				
				this.DestroyRetreatOverlay();
				
				/*
				self::notifyAllPlayers('playerArmyRetreat', '', 
					array(
						'retreating_army_id' => $retreating_army_id,
						'retreat_prov_name' => $retreat_prov_name,
						'killed_tiles' => $killed_tiles
					));
				*/
				//notif.args.retreating_army_id
				
				//find the army
				var retreating_army = this.GetArmyById(notif.args.retreating_army_id);
				
				//start this army moving
				this.MoveArmy(retreating_army, notif.args.retreat_prov_name);
				
				//remove any tiles killed during the retreat_prov_name
				//NOTE: this is in addition to the 1 tile killed during battle
				retreating_army.RemoveTilesFromStack(notif.args.killed_tiles);
				
				//if there are no tiles remaining, kill the army
				if(retreating_army.items.length == 0)
				{
					console.log("no tiles left, destroying army");
					this.DestroyArmy(notif.args.retreating_army_id);
				}
				else
				{
					console.log("army has " + retreating_army.items.length + " tiles left");
					this.RefreshSelectArmyStack(retreating_army);
				}
				
				//todo: does this timing allow the movement animation to fully play out?
			},
			
			notif_playerHandChanged : function(notif)
			{
				//console.log("page::notif_playerHandChanged()");
				//console.log(notif);
				if(notif.args.player_id != this.getCurrentPlayer())
				{
					//console.log("updating hidden hand tiles for other player " + notif.args.player_id);
					this.SetHiddenHandTiles(notif.args.player_id, notif.args.num_hand_tiles);
					this.UpdateHiddenHandTiles(notif.args.player_id);
				}
			},
			
			notif_playerHandDraw : function(notif)
			{
				//console.log("page::notif_playerHandDraw()");
				//console.log(notif);
				gameui.DrawNewHandTiles(notif.args.tiles_drawn);
			},
			
			notif_newVillages : function(notif)
			{
				//console.log("page::notif_newVillages()");
				//console.log(notif.args);
				
				//update the ui
				if(notif.args.player_id == this.getCurrentPlayerId())
				{
					//make the updates to the player who built these villages
					
					//todo: update current player playercard
					//
					
					//remove temp built villages
					var max_iter = 10;
					var cur_iter = 0;
					//console.log(this.temp_villages_by_id);
					for(var temp_village_id in this.temp_villages_by_id)
					{
						//console.log("removing temp village: " + temp_village_id);
						this.CancelVillageBuild(temp_village_id);
						if(cur_iter >= max_iter)
						{
							//console.log("Max iterations reached");
							break;
						}
					}
					
					//this.temp_villages_by_id[temp_village_stack_id];
					//TryCancelVillageBuild : function(temp_village_stack_id)
					
					//discard their paid tiles
					this.current_player_paystack.RemoveAllTilesFromStack();
					this.DestroyPayWindow();
				}
				else
				{
					//todo: update the other player playercard
					//
				}
				
				//place the villages on the map
				var owner_player_id = parseInt(notif.args.player_id);
				this.CreateVillages(notif.args.villages_built, owner_player_id);
				
				//update gamedatas
				this.gamedatas.players[owner_player_id].villages_built = notif.args.villages_built;
			},
			
			notif_newVillagesFail : function(notif)
			{
				//something went wrong and we need to cancel/refund the player action
				console.log("page::notif_newVillagesFail()");
				console.log(notif.args);
				
				switch(notif.args.failure_reason)
				{
					//these messages should never be reached... safety checks should have stopped them before now
					//it probably indicates a player is cheating

					case VILLAGE_FAIL_PIPS:
					{
						this.showMessage(_("Insufficient tile pips paid to build those villages"), "error");
						break;
					}
					case VILLAGE_FAIL_PROV:
					{
						this.showMessage(_("Unable to build villages there"), "error");
						break;
					}
					default://const VILLAGE_FAIL_UNKNOWN = 0
					{
						this.showMessage("ERROR: Build villages failed with code: " + notif.args.failure_reason, "error");
						break;
					}
				}
				
				//refund any tiles to be paid
				this.RefundPaystackTiles();
				
				//close this window if it's still open
				this.DestroyPayWindow();
				
				//restart the phase
				this.BeginVillageState();
			},
			
			notif_newCitadel : function(notif)
			{
				//console.log("page::notif_newCitadel()");
				//console.log(notif);
				
				//var player_id = this.getFactionPlayerId(notif.args.faction_id);
				this.CreateCitadel(notif.args.province_name, notif.args.player_id);
			},
			
			notif_desert_tiles : function(notif)
			{
				//console.log("page::notif_desert_tiles()");
				//console.log(notif);
				for(var army_id in notif.args.dead_tiles)
				{
					//console.log(army_id);
					//console.log(notif.args.dead_tiles[army_id]);
					
					var army = this.GetArmyById(army_id);
					//console.log(army);
					var dead_tile_ids = notif.args.dead_tiles[army_id];
					//console.log(dead_tile_ids);
					for(var index in dead_tile_ids)
					{
						var tile_id = dead_tile_ids[index];
						//console.log(tile_id);
						army.RemoveTileFromStack(tile_id);
					}
					//todo: some kind of ui feedback
				}
			},
			
			notif_battleResolve : function(notif)
			{
				//console.log("page::notif_battleResolve()");
				console.log(notif);
			},
			
			notif_battleResolve_dragons : function(notif)
			{
				//console.log("page::notif_battleResolve_dragons()");
				//console.log(notif);
				for(var army_id in notif.args.dragon_tiles)
				{
					//console.log(army_id);
					//console.log(notif.args.dead_tiles[army_id]);
					
					var army = this.GetArmyById(army_id);
					//console.log(army);
					var dead_tile_ids = notif.args.dragon_tiles[army_id];
					//console.log(dead_tile_ids);
					for(var index in dead_tile_ids)
					{
						var tile_id = dead_tile_ids[index];
						//console.log(tile_id);
						army.RemoveTileFromStack(tile_id);
					}
					//todo: some kind of ui feedback
				}
				this.RefreshSelectArmyStack();
			},
			
			notif_battleResolve_undead : function(notif)
			{
				var new_army_info = notif.args.undead_army;
				var army_stack = gameui.CreateArmy(new_army_info);
			},
			
			last_function: function(){
				//just a placeholder in case i forget any syntax
				//this.inherited(arguments);
			}
		});
		
		return instance;
	}
);