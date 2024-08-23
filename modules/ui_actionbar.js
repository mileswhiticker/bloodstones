/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
const BATTLE_NONE = 0;
const BATTLE_START = 1;
const BATTLE_TILE = 2;
const BATTLE_WAIT = 3;

define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_ui_actionbar", null, {
			//put your functions here
			
			setupPlayerPhaseUI : function(gamedatas)
			{
				//this function is unused
				
				//setup the bottom panel which contains the turn phase
				const bottompanel = dojo.byId("bottompanel");
				const phasecontainer = dojo.place("<div id=\"phasecontainer\"></div>","bottompanel");
				if(this.isCurrentPlayerActive())
				{
					dojo.style(bottompanel, 'opacity', '1');
				}
				
				//instead of trying to do this programmatically, define each button individually
				
				this.player_phases_all = ["villages","undead","main","build","move","battle","end","reset"];
				//this.player_phases_large = ["villages","undead","main","end"];
				this.player_phases_small = ["build","move","battle"];
				this.phase_buttons = {
					"villages":{"string":"1. Capture Villages","node":null},
					"undead":{"string":"2. Move Undead","node":null},
					"main":{"string":"3. Main Actions","node":null},
					"build":{"string":"Build","node":null},
					"move":{"string":"Move","node":null},
					"battle":{"string":"Battle","node":null},
					"end_phase_button":{"string":"Exit Phase","node":null}
				};
				
				var phase_name = "villages";//this.player_phases_large[0];
				var phase_button;
				
				//capture villages
				phase_button = dojo.place(
					"<div id=\"" + phase_name + "\" class=\"phase_large\">"
					+ this.phase_buttons[phase_name]["string"]
					+ "</div>","phasecontainer"
				);
				this.phase_buttons[phase_name]["node"] = phase_button;
				dojo.addClass(phase_button, "inactive_phase");
				
				//move undead
				phase_name = "undead";//this.player_phases_large[1];
				phase_button = dojo.place(
					"<div id=\"" + phase_name + "\" class=\"phase_large\">"
					+ this.phase_buttons[phase_name]["string"]
					+ "</div>","phasecontainer"
				);
				this.phase_buttons[phase_name]["node"] = phase_button;
				//console.log("checking if current player is necromancer... factionid:" + this.gamedatas.players[this.player_id].factionid);
				if(this.gamedatas.players[this.player_id].factionid == 4)
				{
					//console.log(">is necromancer");
					dojo.addClass(phase_button, "inactive_phase");
					dojo.connect(phase_button, "click", dojo.hitch(this, this.tryEnterUndeadPhase));
				}
				else
				{
					//console.log(">not necromancer");
					dojo.addClass(phase_button, "disabled_phase");
				}
				
				//main
				phase_name = "main";//this.player_phases_large[2];
				phase_button = dojo.place(
					"<div id=\"" + phase_name + "\" style=\"width:55%\" class=\"phase_large\">"
					+ "</div>","phasecontainer"
				);
				//dojo.style("main", "width","45%");
				this.phase_buttons[phase_name]["node"] = phase_button;
				const mainphasebutton = dojo.place(
					"<div>"
					+ this.phase_buttons[phase_name]["string"]
					+ "</div>",phase_name
				);
				dojo.connect(mainphasebutton, "click", dojo.hitch(this, this.tryEnterMainPhase));
				dojo.addClass(phase_button, "inactive_phase");
				
				//small phases
				const phasecontainer_small = dojo.place(
					"<div id=\"phasecontainer_small\"></div>","main"
				);
				for(var i in this.player_phases_small)
				{
					const phase_name = this.player_phases_small[i];
					const actionbutton = dojo.place(
						"<div id=\"" + phase_name + "\" class=\"phase_small\">"
						+ this.phase_buttons[phase_name]["string"]
						+ "</div>","phasecontainer_small"
					);
					
					dojo.addClass(actionbutton, "blst_button");
					dojo.addClass(actionbutton, "blst_button_disabled");
					
					switch(phase_name)
					{
						case 'build':
						{
							dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickBuildModeButton));
							break;
						}
						case 'move':
						{
							dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickMoveModeButton));
							break;
						}
						case 'battle':
						{
							dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickBattleModeButton));
							break;
						}
					}
				}
				
				//finish phase button
				phase_name = "end_phase_button";//this.player_phases_large[3];
				var exit_phase_string = "NA exit phase";
				this.exit_phase_strings = [
					_("Finish capturing"),
					_("Finish move undead"),
					_("End turn"),
					_("Finish building"),
					_("Finish moving"),
					_("Finish battles"),
					_("End turn"),
					_("Please wait...")
				];
				if(gamedatas.player_turn_phase > PHASE_MIN && this.gamedatas.player_turn_phase < PHASE_MAX)
				{
					this.phase_buttons[phase_name]["string"] = this.exit_phase_strings[gamedatas.player_turn_phase];
				}
				phase_button = dojo.place(
					"<div id=\"" + phase_name + "\" class=\"phase_large\">"
					+ this.phase_buttons[phase_name]["string"]
					+ "</div>","phasecontainer"
				);
				
				this.phase_buttons[phase_name]["node"] = phase_button;
				//dojo.addClass(phase_button, "inactive_phase");
				dojo.addClass(phase_button, "blst_button");
				dojo.connect(phase_button, "click", dojo.hitch(this, this.tryNextPhase));
				
				//phase_button = this.addActionButton("action_button_test", _('End turn/phase'), null,"bag",false,"red");
				//dojo.addClass('action_button_test', 'disabled');
				//console.log(phase_button);
				
				//for testing
				//this.addActionButton( 'giveCards_button', _('Give selected cards'), 'onGiveCards' );
			},
			
			tryEnterUndeadPhase : function()
			{
				console.log("page::tryEnterUndeadPhase()");
				this.server_enterPhase(PHASE_UNDEAD);
			},
			
			tryEnterMainPhase : function()
			{
				console.log("page::tryEnterMainPhase()");
				if(!this.isCurrentPlayerMainPhase())
				{
					this.server_enterPhase(PHASE_MAIN);
				}
			},
			
			onClickBuildModeButton : function(event)
			{
				//console.log("page::onClickBuildModeButton()");
				if(this.isCurrentPlayerBuildMode())
				{
					this.ExitBuildMode(false);
				}
				else if(this.isCurrentPlayerMainPhase())
				{
					this.EnterBuildMode();
				}
				else
				{
					//sanity check
					console.log("ERROR: attempted to enter move mode but current player is not the active player in main mode");
				}
			},
			
			onClickMoveModeButton : function(event)
			{
				//console.log("page::onClickMoveModeButton()");
				if(this.isCurrentPlayerMoveMode())
				{
					this.EndMoveMode(false);
				}
				else if(this.isCurrentPlayerMainPhase())
				{
					this.EnterMoveMode();
				}
				else
				{
					//sanity check
					console.log("ERROR: attempted to enter move mode but current player is not the active player in main mode");
				}
			},
			
			onClickBattleModeButton : function(event)
			{
				//console.log("page::onClickBattleModeButton()");
				//this.server_enterPhase(PHASE_BATTLE);
				
				if(this.isCurrentPlayerBattleMode())
				{
					this.ExitBattleMode(false);
				}
				else if(this.isCurrentPlayerMainPhase())
				{
					this.EnterBattleMode();
				}
				else
				{
					//sanity check
					console.log("ERROR: attempted to enter battle mode but current player is not the active player in main mode");
				}
			},
			
			onClickCurrentPhase : function(event)
			{
				console.log("page::onClickCurrentPhase()");
				event.stopPropagation();
				
				this.tryNextPhase();
			},
			
			tryNextPhase : function()
			{
				console.log("page::tryNextPhase()");
				//is this move allowed?
				if(gameui.checkAction('action_tryNextPhase'))
				{
					//ajax call to pass the request back to php
					gameui.ajaxcall( "/bloodstones/bloodstones/action_tryNextPhase.html", {
						player_id: this.player_id,
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
			
			server_enterPhase : function(target_phase_id)
			{
				console.log("page::server_enterPhase()");
				//is this move allowed?
				if(gameui.checkAction('action_server_enterPhase'))
				{
					//ajax call to pass the request back to php
					gameui.ajaxcall( "/bloodstones/bloodstones/action_server_enterPhase.html", {
						phase_id: target_phase_id,
						player_id: this.player_id,
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
			
			enterPhase : function(new_phase_id)
			{
				//if we are not the current player, this entire panel will get disabled
				//console.log("page::enterPhase(" + new_phase_id + ")");
				if(!this.isCurrentPlayerActive())
				{
					console.log("WARNING: attempted to enter phase " + new_phase_id + " but current player is not active.");
					return;
				}
				
				//transfer some of the UI stuff on the action bar
				if(this.active_phase_handle != null)
				{
					dojo.disconnect(this.active_phase_handle);
				}
				
				var old_phase_id = this.current_phase_id;
				if(old_phase_id != null)
				{
					var old_phase_name = this.player_phases_all[old_phase_id];
					const old_phase_node = dojo.byId(old_phase_name);	//todo: there is an error here
					if(old_phase_node != null)
					{
						dojo.removeClass(old_phase_node, "active_phase");
						dojo.addClass(old_phase_node, "inactive_phase");
					}
				}
				
				this.current_phase_id = new_phase_id;
				var new_phase_name = this.player_phases_all[new_phase_id];
				const new_phase_node = dojo.byId(new_phase_name);
				if(new_phase_node != null)
				{
					dojo.removeClass(new_phase_node, "inactive_phase");
					dojo.addClass(new_phase_node, "active_phase");
					//this.active_phase_handle = dojo.connect(new_phase_node, "click", dojo.hitch(this, this.onClickCurrentPhase));
				}
				
				//update the bottom ui panel button
				var end_phase_button = dojo.byId("end_phase_button");
				//end_phase_button.innerHTML = this.exit_phase_strings[new_phase_id];
				
				switch(new_phase_id)
				{
					case PHASE_MAIN:
					{
						var small_phase_button;
						small_phase_button = dojo.byId("button_move");
						dojo.removeClass(small_phase_button, "blst_button_disabled");
						small_phase_button.innerHTML = "Move";
						small_phase_button = dojo.byId("button_build");
						small_phase_button.innerHTML = "Build";
						dojo.removeClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_battle");
						small_phase_button.innerHTML = "Battle";
						dojo.removeClass(small_phase_button, "blst_button_disabled");
						
						dojo.removeClass(end_phase_button, "blst_button_disabled");
						break;
					}
					case PHASE_MOVE:
					{
						small_phase_button = dojo.byId("button_move");
						small_phase_button.innerHTML = this.exit_phase_strings[PHASE_MOVE];
						small_phase_button = dojo.byId("button_build");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_battle");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						
						dojo.addClass(end_phase_button, "blst_button_disabled");
						break;
					}
					case PHASE_BUILD:
					{
						small_phase_button = dojo.byId("button_build");
						small_phase_button.innerHTML = this.exit_phase_strings[PHASE_BUILD];
						small_phase_button = dojo.byId("button_move");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_battle");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						
						dojo.addClass(end_phase_button, "blst_button_disabled");
						break;
					}
					case PHASE_BATTLE:
					{
						small_phase_button = dojo.byId("button_battle");
						small_phase_button.innerHTML = this.exit_phase_strings[PHASE_BATTLE];
						small_phase_button = dojo.byId("button_build");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_move");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						
						dojo.addClass(end_phase_button, "blst_button_disabled");
						break;
					}
					case PHASE_RESET:
					{
						small_phase_button = dojo.byId("button_battle");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_build");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_move");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						
						const paywindow = dojo.byId("paywindow");
						paywindow.style.opacity = 0.5;
						this.LockPaymentBucket();
						break;
					}
				}
			},

			// onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
			//                        action status bar (ie: the HTML links in the status bar).
			//        
			onUpdateActionButtons: function( stateName, args )
			{
				//console.log( 'onUpdateActionButtons: '+stateName );
				//console.log(args);
				
				
				//reset the current player battle stage
				//var new_battle_stage = this.current_player_battle_stage;
				
				//!this.isSpectator
				//if(this.isCurrentPlayerActive())
				switch( stateName )
				{
/*               
				 Example:
 
				 case 'myGameState':
					
					// Add 3 action buttons in the action status bar:
					
					this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
					this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
					this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
					break;
*/
					/*
					case 'battleTile':
					{
						new_battle_stage = BATTLE_TILE;
						break;
					}
					
					case 'battleWait':
					{
						new_battle_stage = BATTLE_WAIT;
						break;
					}
					*/
				}
				
				/*
				//have we changed battle stage?
				if(new_battle_stage != this.current_player_battle_stage)
				{
					switch(new_battle_stage)
					{
						case(BATTLE_NONE):
						{
							break;
						}
						case(BATTLE_START):
						{
							break;
						}
						case(BATTLE_TILE):
						{
							break;
						}
						case(BATTLE_WAIT):
						{
							break;
						}
					}
				}*/
			},

		});
		
		return instance;
	}
);