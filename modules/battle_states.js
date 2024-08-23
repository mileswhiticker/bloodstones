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
		
		var instance = declare("_battle_states", null, {
			//put your functions here
			
			//im pretty sure this is unused but im leaving it in just in case
			//see ui_payment.js line 191
			/*
			trySwapBattleTile : function(tile_info)
			{
				console.log("page::trySwapBattleTile()");
				console.log(tile_info);
				
				//is there a tile already queued for swapping?
				//this.tile_pips
				if(this.current_player_paystack.items.length > 1)
				{
					console.log(this.current_player_paystack);
					
					//remove all but the latest addition
					var last_tile_info = null;
					var remove_me = [];
					for(var i in this.current_player_paystack.items)
					{
						if(last_tile_info != null)
						{
							remove_me.push(last_tile_info);
						}
						var cur_item = this.current_player_paystack.items[i];
						last_tile_info = this.current_player_paystack.tiles[cur_item.id];
					}
					
					//remove those tiles
					this.current_player_paystack.RemoveTilesFromStack(remove_me);
					this.current_player_hand.SpawnTilesInStack(remove_me, "paybucket_battle");
				}
			},
			*/
			
			TryProceedCurrentBattle : function()
			{
				//console.log("page::TryProceedCurrentBattle()");
				
				switch(this.gamedatas.gamestate.name)
				{
					case "playerTurn":
					{
						//todo: this game state is getting phased out
						//just fall through for now
					}
					case "playerMain":
					{
						//first, clear out the battle circles
						this.DestroyPendingBattleCircles();
						
						this.ServerStartBattle();
						break;
					}
					case "chooseWithdraw":
					{
						this.ServerRejectWithdraw();
						break;
					}
					case "battleTile":
					{
						this.ServerSwapTile();
						break;
					}
					case "battleEnd":
					{
						this.showMessage("You have been defeated. You must choose a tile to sacrifice.","info");
						break;
					}
					default:
					{
						console.log("WARNING: unknown game state: " + this.gamedatas.gamestate.name);
						break;
					}
				}
			},
			
			TryWithdrawCurrentBattle : function()
			{
				//console.log("page::TryWithdrawCurrentBattle()");
				switch(this.gamedatas.gamestate.name)
				{
					case "playerTurn":
					{
						//todo: this game state is getting phased out
						//just fall through for now
					}
					case "playerMain":
					{
						//battle hasnt started yet so we can just clean up the preview window
						this.DestroyBattleWindow();
						break;
					}
					case "chooseWithdraw":
					{
						this.ServerChooseWithdraw();
						break;
					}
					case "battleTile":
					{
						//this is normally inaccessible but I'll put a player warning here just in case
						this.showMessage(_('You cannot withdraw mid-battle'), 'error');
						break;
					}
					default:
					{
						console.log("WARNING: unknown game state: " + this.gamedatas.gamestate.name);
						break;
					}
				}
			},
			
			TrySacrificeArmyTile : function(tile_info)
			{
				//called from Tilestack.js
				//console.log("page::TrySacrificeArmyTile()");
				//console.log(tile_info);
				this.ServerSacrificeTile(tile_info);
			},
			
		});
		
		return instance;
	}
);
