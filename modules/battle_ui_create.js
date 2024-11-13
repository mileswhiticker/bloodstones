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
		
		var instance = declare("_battle_ui_create", null, {
			//put your functions here
			
			CreateBattleWindowIfNotExists : function(battlingProvinceName)
			{
				//console.log("page::UIBattleWindowStart(" + battlingProvinceName + ")");
				//this is called by onEnteringState() when entering state "playerBattle", see ui.js
				
				//sanity checks here
				if(this.preview_battle_province_name != battlingProvinceName)
				{
					if(this.preview_battle_province_name != null)
					{
						//this should only happen if the defending player is capable of previewing battles
						console.log("WARNING: player is entering battle at " + battlingProvinceName + " but previewing battle at: " + this.preview_battle_province_name);
						
						this.DestroyBattleWindow();
					}
					else
					{
						//this is intended... it will happen for players who aren't currently battling
						//todo: properly set this up for "observing" players
						//note: also need to consider spectating players
						//console.log("WARNING: player is entering battle at " + battlingProvinceName + " but was not previewing a battle anywhere");
					}
					this.is_previewing_battle = true;
					this.PreviewBattle(battlingProvinceName);
				}
				
				//do we need to update the battle window from the preview -> battle variant?
				if(this.is_previewing_battle)
				{
					//as we are no longer previewing the battle at this point, we need to make some tweaks from the standard battle preview window
					dojo.destroy("battle_title_preview");
					
					dojo.removeClass("battle_display_attacker", "battle_display_preview");
					dojo.removeClass("battle_display_defender", "battle_display_preview");
					
					//when players specifically have the option to do stuff, the buttons can get re-enabled
					if(dojo.byId("battle_proceed"))
					{
						//button to begin or continue with battle
						var proceed_battle_button = dojo.byId("battle_proceed");
						proceed_battle_button.innerHTML = _("Proceed with battle");
						dojo.addClass("battle_proceed", "blst_button_disabled");
					}
					if(dojo.byId("battle_withdraw"))
					{
						dojo.destroy("battle_withdraw");
						/*
						//button to withdraw or cancel
						var withdraw_battle_button = dojo.byId("battle_withdraw");
						dojo.addClass("battle_withdraw", "blst_button_disabled");
						withdraw_battle_button.innerHTML = _("Withdraw from battle");
						*/
					}
					
					//create the tilestacks to display the battle tiles
					this.battle_tilestack_attacker = this.CreateBattleTileStack(true);
					this.battle_tilestack_defender = this.CreateBattleTileStack(false);
					this.reject_tilestack_attacker = this.CreateRejectTileStack(true);
					this.reject_tilestack_defender = this.CreateRejectTileStack(false);
					
					//create the bucket to drop tiles in
					if(this.isParticipant())
					{
						this.payment_mode = gameui.STATE_MAIN_BATTLE;
						this.current_player_paystack = this.CreateTempTileStack(this.isAttacker());
					}
					
					this.is_previewing_battle = false;
				}
			},
			
			PreviewBattle : function(prov_name)
			{
				//console.log("page::PreviewBattle(" + prov_name + ")");
				
				if(this.preview_battle_province_name == null)
				{
					if(this.isProvinceBattlePending(prov_name))
					{
						//console.log("Battle pending here...");
						var pending_battle_info = this.gamedatas.pending_battles[prov_name];

						this.CreateBattleWindow(prov_name, pending_battle_info);
					}
					else
					{
						console.log("page::PreviewBattle(" + prov_name + ") ERROR: province " + prov_name + " is not in battle");
					}
				}
				else
				{
					console.log("page::PreviewBattle(" + prov_name + ") WARNING: player tried entering battle at " + prov_name + " but is already in a battle at " + this.preview_battle_province_name);
				}
			},
			
			CreateBattleWindow : function(prov_name, pending_battle_info)
			{
				//console.log("page::CreateBattleWindow(" + prov_name + ", " + "{pending_battle_info}" + ")");
				//console.log(pending_battle_info);
				
				this.preview_battle_province_name = prov_name;
				if(Number(this.gamedatas.attacking_player_id) > 0)
				{
					this.preview_attacking_player_id = this.gamedatas.attacking_player_id;
					//console.log("setting preview_attacking_player_id to server chosen player " + this.preview_attacking_player_id);
				}
				else
				{
					this.preview_attacking_player_id = this.player_id;
					//console.log("setting preview_attacking_player_id to current player " + this.preview_attacking_player_id);
				}
				//console.log("this.preview_attacking_player_id:" + this.preview_attacking_player_id);
				for(var check_player_id in pending_battle_info)
				{
					if(check_player_id != this.preview_attacking_player_id)
					{
						this.preview_defending_player_id = check_player_id;
						//console.log("setting preview_defending_player_id to auto detected: " + this.preview_defending_player_id);
						break;
					}
				}
				//console.log("this.preview_defending_player_id:" + this.preview_defending_player_id);
				//this.preview_defending_player_id = this.getDefenderPlayerId(prov_name);
				
				//some useful code snippets
				//var battle_province_name = pending_battle_info.province_name;
				//also pending_battle_info.army_infos = ["army_id_string" = {}];
				
				//create the container node
				var battlewindow = dojo.place("<div id=\"battlewindow\"></div>", "centrepanel");
				dojo.style(battlewindow, "z-index", this.GameLayerBattlewindow());
				dojo.addClass(battlewindow, "battlewindow_anim_maximise");
				//dojo.style(battlewindow, 'zIndex', this.GameLayerDialogBase());
				
				//it's possible that this.gamedatas.attacking_player_id and defending_player_id will be undefined if there is no ongoing battle
				
				//minimise button which sits outside normal flow
				const button_battlewindow_minimise = dojo.place("<div id=\"button_battlewindow_minimise\"></div>",battlewindow);
				dojo.addClass(button_battlewindow_minimise, "blst_button");
				dojo.connect(button_battlewindow_minimise, "click", dojo.hitch(this, this.onClickBattlewindowMinimise));
				
				
				//create the titles at the top of the window
				var attacker_faction_name = this.getFactionName(this.getPlayerFactionId(this.preview_attacking_player_id));
				dojo.place("<div class=\"battle_title battle_attacker\">" + "<b>" + attacker_faction_name + "</b><br>" + _("Attacking") + "</div>", battlewindow);
				dojo.place("<div class=\"battle_title_vs\"></div>", battlewindow);
				var defender_faction_name = this.getFactionName(this.getPlayerFactionId(this.preview_defending_player_id));
				dojo.place("<div class=\"battle_title battle_defender\">" + "<b>" + defender_faction_name + "</b><br>" + _("Defending") + "</div>", battlewindow);
				
				//create the army tiles display
				//var battle_display_attacker = dojo.place("<div class=\"battle_display battle_attacker\"></div>", battlewindow);
				//var battle_display_defender = dojo.place("<div class=\"battle_display battle_defender\"></div>", battlewindow);
				
				//display the tiles in two outer columns
				this.army_display_attacker = new modules.TileStack();
				this.army_display_attacker.createAsBattleDisplay(this, "battlewindow", this.preview_attacking_player_id, true);
				this.army_display_defender = new modules.TileStack();
				this.army_display_defender.createAsBattleDisplay(this, "battlewindow", this.preview_defending_player_id, false);
				
				dojo.addClass("battle_display_attacker", "battle_display_preview");
				dojo.addClass("battle_display_defender", "battle_display_preview");
				
				//display the tile bonuses in two inner columns
				//var battle_display_tilebonus_attacker = dojo.place("<div id=\"battle_display_tilebonus_" + this.preview_attacking_player_id + "\" class=\"battle_display_tilebonus_container\"></div>", battle_display_attacker,"last");
				//battle_display_tilebonus_attacker.style.left = "200px";
				//var battle_display_tilebonus_defender = dojo.place("<div id=\"battle_display_tilebonus_" + this.preview_defending_player_id + "\" class=\"battle_display_tilebonus_container\"></div>", battle_display_defender, "first");
				//battle_display_tilebonus_attacker.style.left = "-200px";
				
				//create divs to hold the current battle score
				dojo.place("<div id=\"battle_score_attacker\" class=\"battle_score\"></div>", battlewindow);
				dojo.place("<div id=\"battle_score_defender\" class=\"battle_score\"></div>", battlewindow);
				
				//reset these, because they will be recalculated as we add tiles to the display
				this.battle_score_attacker = 0;
				this.battle_score_defender = 0;
				
				//add units to the defender's display
				var defender_tiles = pending_battle_info[this.preview_defending_player_id];
				for(var i in defender_tiles)
				{
					var tile_info = defender_tiles[i];
					this.army_display_defender.SpawnTileInStack(tile_info);
				}
				
				//add units to the attacker's display
				var attacker_tiles = pending_battle_info[this.preview_attacking_player_id];
				for(var i in attacker_tiles)
				{
					var tile_info = attacker_tiles[i];
					this.army_display_attacker.SpawnTileInStack(tile_info);
				}
				
				/*var armies = pending_battle_info.armies;
				for(var army_id in armies)
				{
					var army_info = armies[army_id];
					var army_id_string = this.GetArmyIdString(army_info.army_id, army_info.player_id);
					var army = this.armies_by_id_string[army_id_string];
					
					if(army.player_id == this.preview_attacking_player_id)
					{
						//console.log("adding attacker army " + army_id_string);
						for(var tile_id_string in army.tiles)
						{
							var tile_info = army.tiles[tile_id_string];
							this.army_display_attacker.SpawnTileInStack(tile_info);
						}
					}
					else if(army.player_id == this.preview_defending_player_id)
					{
						//console.log("adding defender army " + army_id_string);
						for(var tile_id_string in army.tiles)
						{
							var tile_info = army.tiles[tile_id_string];
							this.army_display_defender.SpawnTileInStack(tile_info);
						}
					}
					else
					{
						//todo: this can potentially (rarely) happen... see discussions with team 21/03/24
						console.log("WARNING: Found third army in battle");
						console.log(army);
					}
				}*/
				
				//when the battle starts, the paycontainer will go here
				//for now just put a big block of text saying "Battle Preview"
				dojo.place("<div id=\"battle_title_preview\">" + _("Battle Preview") + "</div>", battlewindow);
				
				//button to stop previewing battle or withdraw
				if(this.isParticipant())
				{
					var withdraw_text = _("Stop previewing battle");
					var withdraw_battle_button = dojo.place("<div id=\"battle_withdraw\" class=\"blst_button\">" + withdraw_text + "</div>", battlewindow);
					dojo.connect(withdraw_battle_button, "click", dojo.hitch(this, this.onClickWithdrawBattle));
					
					//button to start a previewed battle or proceed to next step
					var proceed_text = _("Begin battle!");
					var proceed_battle_button = dojo.place("<div id=\"battle_proceed\" class=\"blst_button\">" + proceed_text + "</div>", battlewindow);
					dojo.connect(proceed_battle_button, "click", dojo.hitch(this, this.onClickProceedBattle));
				}
			},
			
			onClickBattlewindowMinimise : function(event)
			{
				//console.log("page::onClickBattlewindowMinimise()");
				if(dojo.hasClass("battlewindow","battlewindow_anim_minimise"))
				{
					dojo.removeClass("battlewindow","battlewindow_anim_minimise");
					dojo.addClass("battlewindow","battlewindow_anim_maximise");
				}
				else
				{
					dojo.addClass("battlewindow","battlewindow_anim_minimise");
					dojo.removeClass("battlewindow","battlewindow_anim_maximise");
				}
			}
			
		});
		
		return instance;
	}
);
