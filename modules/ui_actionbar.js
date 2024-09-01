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
				
				for(var i=0; i<this.player_phases_small.length; i++)
				{
					const cur_small_phase = this.player_phases_small[i];
					console.log("placing cur_small_phase:" + cur_small_phase);
					const actionbutton = dojo.place(
						"<div id=\""
						+ this.GetSmallPhaseButtonDivId(cur_small_phase)
						+ "\" class=\"phase_small\">"
						+ this.GetSmallPhaseEntryString(cur_small_phase)
						+ "</div>","phasecontainer_small"
					);
					
					dojo.addClass(actionbutton, "blst_button");
					dojo.addClass(actionbutton, "blst_button_disabled");
					
					switch(cur_small_phase)
					{
						case gameui.STATE_MAIN_CAPTURE:
						{
							dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickCapturePhaseButton));
							break;
						}
						case gameui.STATE_MAIN_BUILD:
						{
							dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickBuildModeButton));
							break;
						}
						case gameui.STATE_MAIN_MOVE:
						{
							dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickMoveModeButton));
							break;
						}
						case gameui.STATE_MAIN_BATTLE:
						{
							dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickBattleModeButton));
							break;
						}
					}
				}
				
				//finish phase button
				var phase_name = "end_phase_button";//this.player_phases_large[3];
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
				if(gamedatas.player_turn_phase > gameui.STATE_MIN && this.gamedatas.player_turn_phase < gameui.STATE_MAX)
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
			
			onClickCapturePhaseButton : function(event)
			{
				if(this.isCurrentPlayerCaptureMode())
				{
					this.ExitCaptureMode(false);
				}
				else if(this.isCurrentPlayerMainState())
				{
					this.EnterCaptureMode();
				}
			},
			
			onClickBuildModeButton : function(event)
			{
				//console.log("page::onClickBuildModeButton()");
				if(this.isCurrentPlayerBuildMode())
				{
					this.ExitBuildMode(false);
				}
				else if(this.isCurrentPlayerMainState())
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
				else if(this.isCurrentPlayerMainState())
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
				
				if(this.isCurrentPlayerBattleMode())
				{
					this.ExitBattleMode(false);
				}
				else if(this.isCurrentPlayerMainState())
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
				if(window.gameui.checkAction('action_tryNextPhase'))
				{
					//ajax call to pass the request back to php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_tryNextPhase.html", {
						player_id: this.player_id,
						lock: true
						},
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			enterSmallPhase : function(new_phase_id)
			{
				//if we are not the current player, this entire panel will get disabled
				console.log("page::enterSmallPhase(" + new_phase_id + ")");
				if(!this.isCurrentPlayerActive())
				{
					console.log("WARNING: attempted to enter phase " + new_phase_id + " but current player is not active.");
					return;
				}
				
				this.current_phase_id = new_phase_id;
				var new_phase_name = this.player_phases_all[new_phase_id];
				const new_phase_node = dojo.byId(new_phase_name);
				if(new_phase_node != null)
				{
					dojo.removeClass(new_phase_node, "inactive_phase");
					dojo.addClass(new_phase_node, "active_phase");
				}
				
				//update the bottom ui panel button
				//note: small phases represent the available actions for the player during the main turn state
				var end_phase_button = dojo.byId("end_phase_button");
				//var small_phases = [gameui.STATE_MAIN_CAPTURE, gameui.STATE_MAIN_BUILD, gameui.STATE_MAIN_MOVE, gameui.STATE_MAIN_BATTLE];
				
				if(new_phase_id == gameui.STATE_MAIN_RESET)
				{
					//disable small phase transitions
					this.UIInactiveButton_smallPhases();
					
					//prevent end of turn while waiting for server to process (note: server doesnt allow this anyway)
					dojo.addClass(end_phase_button, "blst_button_disabled");
					
					//lock payment window
					//in theory we might not have a payment bucket every time we enter gameui.STATE_MAIN_RESET
					//this.LockPaymentBucket();
				}
				else if(new_phase_id == gameui.STATE_MAIN_DEFAULT)
				{
					//loop over the small phases for the player
					for(var i=0; i<this.player_phases_small.length; i++)
					{
						var cur_small_phase = this.player_phases_small[i];
						var small_phase_button = dojo.byId(this.GetSmallPhaseButtonDivId(cur_small_phase));
						
						//enable the entry for this action phase
						small_phase_button.innerHTML = this.GetSmallPhaseEntryString(cur_small_phase);
						//dojo.removeClass(small_phase_button, "blst_button_disabled");
						
						if(cur_small_phase == gameui.STATE_MAIN_CAPTURE && this.gamedatas.village_captures_available < 1)
						{
							this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_CAPTURE));
						}
						else
						{
							this.UIActiveButton(small_phase_button);
						}
					}
					
					//player can end their turn
					dojo.removeClass(end_phase_button, "blst_button_disabled");
				}
				else
				{
					//loop over the small phases for the player
					for(var i=0; i<this.player_phases_small.length; i++)
					{
						var cur_small_phase = this.player_phases_small[i];
						var small_phase_button = dojo.byId("small_phase_button" + cur_small_phase);
						
						if(cur_small_phase == new_phase_id)
						{
							//we have just entered this action phase
							small_phase_button.innerHTML = this.GetSmallPhaseExitString(cur_small_phase);
						}
						else
						{
							//disable the entry for this action phase
							dojo.addClass(small_phase_button, "blst_button_disabled");
						}
					}
					
					//player has to exit the action phase before they can end their turn
					dojo.addClass(end_phase_button, "blst_button_disabled");
				}
				
				/*
				switch(new_phase_id)
				{
					case gameui.STATE_MAIN_DEFAULT:
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
					case gameui.STATE_CAPTURE:
					{
						small_phase_button = dojo.byId("button_capture");
						small_phase_button.innerHTML = this.exit_phase_strings[gameui.STATE_CAPTURE];
						small_phase_button = dojo.byId("button_move");
						small_phase_button.innerHTML = "Move";
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_build");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_battle");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						
						dojo.addClass(end_phase_button, "blst_button_disabled");
						break;
					}
					case gameui.STATE_MAIN_MOVE:
					{
						small_phase_button = dojo.byId("button_move");
						small_phase_button.innerHTML = this.exit_phase_strings[gameui.STATE_MAIN_MOVE];
						small_phase_button = dojo.byId("button_build");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_battle");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						
						dojo.addClass(end_phase_button, "blst_button_disabled");
						break;
					}
					case gameui.STATE_MAIN_BUILD:
					{
						small_phase_button = dojo.byId("button_build");
						small_phase_button.innerHTML = this.exit_phase_strings[gameui.STATE_MAIN_BUILD];
						small_phase_button = dojo.byId("button_move");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_battle");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						
						dojo.addClass(end_phase_button, "blst_button_disabled");
						break;
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						small_phase_button = dojo.byId("button_battle");
						small_phase_button.innerHTML = this.exit_phase_strings[gameui.STATE_MAIN_BATTLE];
						small_phase_button = dojo.byId("button_build");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						small_phase_button = dojo.byId("button_move");
						dojo.addClass(small_phase_button, "blst_button_disabled");
						
						dojo.addClass(end_phase_button, "blst_button_disabled");
						break;
					}
					case gameui.STATE_MAIN_RESET:
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
				*/
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