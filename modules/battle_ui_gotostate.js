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
		
		var instance = declare("_battle_ui_gotostate", null, {
			//put your functions here
			
			UIBattleGeneric : function(args)
			{
				//console.log("page::UIStateBattle()");
				
				//the basic info
				this.battling_province_name = args.args.battling_province_name;
				this.attacking_player_id = args.args.attacking_player_id;
				this.defending_player_id = args.args.defending_player_id;
				
				//create the UI window if it doesnt already exist
				this.CreateBattleWindowIfNotExists(this.battling_province_name);
				
				//these will only be sent when dice tiles have been drawn
				if(args.args.num_attacker_tiles)
				{
					this.num_attacker_tiles = args.args.num_attacker_tiles;
					this.num_defender_tiles = args.args.num_defender_tiles;
					this.num_attacker_tiles_swapped = args.args.num_attacker_tiles_swapped;
					this.num_defender_tiles_swapped = args.args.num_defender_tiles_swapped;
					this.num_attacker_tiles_rejected = args.args.num_attacker_tiles_rejected;
					this.num_defender_tiles_rejected = args.args.num_defender_tiles_rejected;
				}
				
				//any remaining tiles in the paystack that havent been refunded will have been accepted for a swap
				//this.tiles[tile_info.id.toString()] = tile_info;
				if(this.current_player_paystack)
				{
					if(this.current_player_paystack.tiles.length > 1)
					{
						console.log("ERROR page::UIBattleGeneric() found " + this.current_player_paystack.tiles.length + " tiles in paystack after state change, expected 0 or 1");
					}
					for(var tile_info_id in this.current_player_paystack.tiles)
					{
						//there should be at most one here
						this.current_player_paystack.RemoveTileFromStack(tile_info_id);
					}
				}
				
				//update the battle tiles eg dice tiles
				this.UpdateBattleTiles(args);
			},
			
			UIStateChooseWithdraw : function(args)
			{
				//console.log("page::UIStateChooseWithdraw()");
				//console.log(args);
				//see also UIStateBattleRetreat()
				
				//generic battle UI updates
				this.UIBattleGeneric(args);
				
				if(this.isCurrentPlayerActive())
				{
					this.CreateRetreatOverlayIfNotExists(args);
					
					//enable the battle proceed button
					dojo.removeClass("battle_proceed", "blst_button_disabled");
				}
			},
			
			UIStateBattleTile : function(args)
			{
				//console.log("page::UIStateBattleTile()");
				
				//generic battle UI updates
				this.UIBattleGeneric(args);
				
				//handle any state specific UI updates eg buttons, titles etc
				if(this.isCurrentPlayerActive())
				{
					//remove the title telling the player to wait for their opponent
					dojo.destroy("battle_title_wait");
					
					//create a "bucket" to drop tiles in for swapping
					var extraClass = "battle_defender";
					if(this.isAttacker())
					{
						extraClass = "battle_attacker";
						//console.log("current player is attacker: " + this.player_id);
					}
					else if(this.isDefender())
					{
						//console.log("current player is defender: " + this.player_id);
					}
					var tileswap_bucket = dojo.place("<div id=\"paybucket_battle\" class=\"" + extraClass + "\">" + "" + "</div>", "battlewindow");
					var payment_string = this.GetTileDropPayString(PHASE_BATTLE);
					this.CreatePaymentBucket("paybucket_battle", payment_string);
					
					//enable the battle proceed button
					dojo.removeClass("battle_proceed", "blst_button_disabled");
				}
				else if(this.isParticipant())
				{
					//add an instruction for the player to wait for their opponent
					dojo.place("<div id=\"battle_title_wait\">" + _("Waiting for other player to play a tile...") + "</div>", "battlewindow");
					
					//destroy the bucket to drop tiles in
					dojo.destroy("action_payment_bucket");
					
					//disable the battle proceed button
					dojo.addClass("battle_proceed", "blst_button_disabled");
				}
				else
				{
					//just an observer... could be another player, live spectator or spectator watching replay
				}
			},
			
			UIStateBattleEnd : function(args)
			{
				//console.log("page::UIStateBattleEnd()");
				
				//generic battle UI updates
				this.UIBattleGeneric(args);
				
				//the winner's victory score has now changed
				this.SetPlayerUIScore(args.args.winning_player_id, args.args.winning_player_score);
				
				//handle any state specific UI updates eg buttons, titles etc
				if(this.isCurrentPlayerActive())
				{
					//announce the result - this player is the loser
					dojo.place("<h1 id=\"battle_title_result\">" + _("You lost!") + "</h1>", "battlewindow");
					
					//remove the title telling the player to wait for their opponent
					dojo.destroy("battle_title_wait");
					
					//add an instruction for the player
					dojo.place("<div id=\"battle_title_wait\">" + _("You must sacrifice a tile") + "</div>", "battlewindow");
					
					//destroy the bucket to drop tiles in
					dojo.destroy("action_payment_bucket");
					
					//update the action button
					var proceed_battle_button = dojo.byId("battle_proceed");
					proceed_battle_button.innerHTML = _("Sacrifice tile");
					
					//enable the battle proceed button
					dojo.removeClass("battle_proceed", "blst_button_disabled");
					
					//next add a pulsing animation to the losers tiles, hinting them to choose one
					var sacrifice_tilestack = null;
					if(this.isAttacker())
					{
						sacrifice_tilestack = this.army_display_attacker;
					}
					else if(this.isDefender())
					{
						sacrifice_tilestack = this.army_display_defender;
					}
					else
					{
						//sanity check
						console.log("ERROR: active player has to sacrifice a tile, but I don't know if they are attacker or defender!");
					}
					
					if(sacrifice_tilestack != null)
					{
						sacrifice_tilestack.addItemDivClass("sacrifice1");
						sacrifice_tilestack.can_sacrifice = true;
					}
					
				}
				else if(this.isParticipant())
				{
					//announce the result - this player is the winner
					dojo.place("<h1 id=\"battle_title_result\">" + _("You won!") + "</h1>", "battlewindow");
					
					//remove the title telling the player to wait for their opponent
					dojo.destroy("battle_title_wait");
					
					//add an instruction for the player
					var losing_player_id = -1;
					var message;
					if(this.isAttacker())
					{
						losing_player_id = this.defending_player_id;
						message = _("Attacker must sacrifice a tile...");
					}
					else if(this.isDefender())
					{
						losing_player_id = this.attacking_player_id;
						message = _("Defender must sacrifice a tile...");
					}
					else
					{
						//sanity check
						console.log("ERROR page::UIStateBattleEnd() active player is a participant, but neither attacker or defender");
					}
					var faction_name = this.getPlayerFactionName(losing_player_id);
					dojo.place("<div id=\"battle_title_wait\">" + message + "</div>", "battlewindow");
					
					//destroy the bucket to drop tiles in
					dojo.destroy("action_payment_bucket");
					
					//disable the battle proceed button
					dojo.addClass("battle_proceed", "blst_button_disabled");

					if(this.isCurrentPlayerBattleMode())
					{
						this.ExitBattleMode();
					}
				}
				else
				{
					//just an observer... could be another player, live spectator or spectator watching replay
				}
			},
			
			UIStateBattleRetreat : function(args)
			{
				console.log("page::UIStateBattleRetreat()");
				console.log(args);
				
				//the basic info
				this.battling_province_name = args.args.battling_province_name;
				this.attacking_player_id = args.args.attacking_player_id;
				this.defending_player_id = args.args.defending_player_id;
				
				var retreating_army = this.GetArmyById(args.args.retreating_army_id);
				console.log(retreating_army);
				this.RefreshSelectArmyStack(retreating_army);
				
				if(this.isCurrentPlayerActive())
				{
					this.CreateRetreatOverlayIfNotExists(args);
				}
			},
			
			UIStateBattleCleanup : function(args)
			{
				this.DestroyBattleWindow();
				this.DestroyRetreatOverlay();
			}
		});
		
		return instance;
	}
);
