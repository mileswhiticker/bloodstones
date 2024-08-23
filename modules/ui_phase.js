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
		
		var instance = declare("_ui_phase", null, {
			//put your functions here
			//this file is poorly named, these functions are entirely for updating the bottompanel
			
			UIPlayerGeneric : function(args)
			{
				this.ShowBottomPanel();
			},
			
			UIInterfacePlayerCapture : function(args)
			{
				//console.log("page::UIInterfacePlayerCapture()");
				
				//state transition: next player -> capture
				this.UIPlayerGeneric(args);
				
				//the current phase and previous phases can no longer be selected
				this.UIActivePhase("title_capture");
				this.UIFuturePhase("end_phase_button");
				
				//special handling for undead phase
				if(this.getPlayerFactionId(this.getCurrentPlayer()) == FACTION_NECROMANCERS)
				{
					this.UIFuturePhase("title_undead");
				}
				else
				{
					this.UIFinishedPhase("title_undead");
				}
			},
			
			UIStatePlayerUndead : function(args)
			{
				//state: capture -> undead
				this.UIPlayerGeneric(args);
				
				//the current phase and previous phases can no longer be selected
				this.UIFinishedPhase("title_capture");
				this.UIActivePhase("title_undead");
				this.UIFuturePhase("end_phase_button");
				this.UIDisabledButton("button_build");
				this.UIDisabledButton("button_move");
				this.UIDisabledButton("button_battle");
			},
			
			UIStatePlayerMain : function(args)
			{
				//state: undead -> main OR capture -> main
				this.UIPlayerGeneric(args);
				
				//the current phase and previous phases can no longer be selected
				this.UIFinishedPhase("title_capture");
				this.UIFinishedPhase("title_undead");
				
				//enable the next few phases
				this.UIActivePhase("title_main");
				this.UIActiveButton("button_build");
				this.UIActiveButton("button_move");
				this.UIActiveButton("button_battle");
				this.UIActiveButton("end_phase_button");
			},
			
			UIStatePlayerVillages : function(args)
			{
				//state: main -> build villages
				this.UIPlayerGeneric(args);
				
				//the current phase and previous phases can no longer be selected
				this.UIFinishedPhase("title_capture");
				this.UIFinishedPhase("title_undead");
				this.UIFinishedPhase("title_main");
				this.UIFinishedPhase("button_build");
				this.UIFinishedPhase("button_move");
				this.UIFinishedPhase("button_battle");
				this.UIActivePhase("title_buildvillages");
				this.UIActiveButton("end_phase_button");
			},
			
			UIStateCitadelPlacement : function(args)
			{
				//nothing
			},
			
			UIFinishedPhase : function(phase_name)
			{
				dojo.removeClass(phase_name, "blst_button_disabled");
				dojo.removeClass(phase_name, "blst_button");
				dojo.addClass(phase_name, "inactive_phase");
			},
			
			UIActiveButton : function(phase_name)
			{
				dojo.removeClass(phase_name, "inactive_phase");
				dojo.removeClass(phase_name, "blst_button_disabled");
				dojo.addClass(phase_name, "blst_button");
			},
			
			UIDisabledButton : function(phase_name)
			{
				dojo.removeClass(phase_name, "inactive_phase");
				dojo.addClass(phase_name, "blst_button_disabled");
				dojo.addClass(phase_name, "blst_button");
			},
			
			UIActivePhase : function(phase_name)
			{
				dojo.removeClass(phase_name, "blst_button");
				dojo.removeClass(phase_name, "inactive_phase");
			},
			
			UIFuturePhase : function(phase_name)
			{
				dojo.removeClass(phase_name, "blst_button");
				dojo.removeClass(phase_name, "inactive_phase");
			},
			
			UIFutureButton : function(phase_name)
			{
				dojo.removeClass(phase_name, "inactive_phase");
			},
		});
		
		return instance;
	}
);
