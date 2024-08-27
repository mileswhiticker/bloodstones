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
				
				//previous states are grey text, current state is white text, future states are buttons
				this.UIActiveTitle("title_capture");
				this.UIActiveButton("title_undead");
				this.UIActiveButton("title_main");
				this.UIInactiveButton_smallPhases();
				this.UIActiveButton("title_buildvillages");
				this.UIActiveButton("end_phase_button");
				
				//special handling for undead phase
				if(this.getPlayerFactionId(this.getCurrentPlayer()) == FACTION_NECROMANCERS)
				{
					this.UIActiveButton("title_undead");
				}
				else
				{
					this.UIInactiveTitle("title_undead");
				}
			},
			
			UIStatePlayerUndead : function(args)
			{
				//state: capture -> undead
				this.UIPlayerGeneric(args);
				
				//previous states are grey text, current state is white text, future states are buttons
				this.UIInactiveTitle("title_capture");
				this.UIActiveTitle("title_undead");
				this.UIActiveButton("title_main");
				this.UIInactiveButton_smallPhases();
				this.UIActiveButton("title_buildvillages");
				this.UIActiveButton("end_phase_button");
			},
			
			UIStatePlayerMain : function(args)
			{
				//state: undead -> main OR capture -> main
				this.UIPlayerGeneric(args);
				
				//previous states are grey text, current state is white text, future states are buttons
				this.UIInactiveTitle("title_capture");
				this.UIInactiveTitle("title_undead");
				this.UIActiveTitle("title_main");
				this.UIActiveButton_smallPhases();
				this.UIActiveButton("title_buildvillages");
				this.UIActiveButton("end_phase_button");
			},
			
			UIStatePlayerVillages : function(args)
			{
				//state: main -> build villages
				this.UIPlayerGeneric(args);
				
				//previous states are grey text, current state is white text, future states are buttons
				this.UIInactiveTitle("title_capture");
				this.UIInactiveTitle("title_undead");
				this.UIInactiveTitle("title_main");
				this.UIInactiveButton_smallPhases();
				this.UIActiveTitle("title_buildvillages");
				this.UIActiveButton("end_phase_button");
			},
			
			UIStateCitadelPlacement : function(args)
			{
				//nothing
			},
			
			UIActiveTitle : function(div_id)
			{
				dojo.removeClass(div_id, "blst_button");
				dojo.removeClass(div_id, "blst_button_disabled");
				dojo.removeClass(div_id, "inactive_phase");
			},
			
			UIInactiveTitle : function(div_id)
			{
				dojo.removeClass(div_id, "blst_button");
				dojo.removeClass(div_id, "blst_button_disabled");
				dojo.addClass(div_id, "inactive_phase");
			},
			
			UIActiveButton_smallPhases : function()
			{
				this.UIActiveButton(this.GetSmallPhaseButtonDivId(PHASE_CAPTURE));
				this.UIActiveButton(this.GetSmallPhaseButtonDivId(PHASE_BUILD));
				this.UIActiveButton(this.GetSmallPhaseButtonDivId(PHASE_MOVE));
				this.UIActiveButton(this.GetSmallPhaseButtonDivId(PHASE_BATTLE));
			},
			
			UIActiveButton : function(div_id)
			{
				dojo.addClass(div_id, "blst_button");
				dojo.removeClass(div_id, "blst_button_disabled");
				dojo.removeClass(div_id, "inactive_phase");
			},
			
			UIInactiveButton_smallPhases : function()
			{
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(PHASE_CAPTURE));
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(PHASE_BUILD));
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(PHASE_MOVE));
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(PHASE_BATTLE));
			},
			
			UIInactiveButton : function(div_id)
			{
				dojo.addClass(div_id, "blst_button");
				dojo.addClass(div_id, "blst_button_disabled");
				dojo.addClass(div_id, "inactive_phase");
			},
		});
		
		return instance;
	}
);
