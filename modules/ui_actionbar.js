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
			//the contents of this file are out of date and now unused, i'll delete the file at some point
			
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
			
		});
		
		return instance;
	}
);