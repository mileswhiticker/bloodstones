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
			//args are entirely unused here but im leaving them in just in case i need them in future
			
			UIState : function(ui_state_id)
			{
				switch(ui_state_id)
				{
					case gameui.STATE_CAPTURE:
					{
						this.UIStatePlayerCapture();
						break;
					}
					case gameui.STATE_UNDEAD:
					{
						this.UIStatePlayerUndead();
						break;
					}
					case gameui.STATE_MAIN_DEFAULT:
					{
						this.UIStatePlayerMain();
						break;
					}
					case gameui.STATE_MAIN_BUILD:
					{
						break;
					}
					case gameui.STATE_MAIN_MOVE:
					{
						break;
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						break;
					}
					case gameui.STATE_MAIN_RESET:
					{
						break;
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						break;
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						this.UIStatePlayerVillages();
						break;
					}
				}
			},
			
			IsStateIdMain : function(ui_state_id)
			{
				return (ui_state_id >= gameui.STATE_MAIN_MIN && ui_state_id <= this.gameui.STATE_MAIN_MAX)
			},
			
			UIStatePlayerCapture : function()
			{
				//console.log("page::UIInterfacePlayerCapture()");
				
				//state transition: next player -> capture
				this.ShowBottomPanel();
				
				//previous states are grey text, current state is white text, future states are buttons
				this.UIActiveTitle("title_capture");
				this.UIActiveButton("title_undead");
				this.UIActiveButton("title_main");
				this.UIInactiveButton_smallPhases();
				this.UIActiveButton("title_buildvillages");
				this.UIActiveButton("end_phase_button");
				
				//special handling for undead phase
				if(this.getPlayerFactionId(this.getCurrentPlayer()) == this.FACTION_NECROMANCERS)
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
				this.ShowBottomPanel();
				
				//previous states are grey text, current state is white text, future states are buttons
				this.UIInactiveTitle("title_capture");
				this.UIActiveTitle("title_undead");
				this.UIActiveButton("title_main");
				this.UIInactiveButton_smallPhases();
				this.UIActiveButton("title_buildvillages");
				this.UIActiveButton("end_phase_button");
			},
			
			UIStatePlayerMain : function(ui_state_id = gameui.STATE_MAIN_DEFAULT)
			{
				//console.log("page::UIStatePlayerMain(" + ui_state_id + ")");
				
				//state: undead -> main OR capture -> main
				this.ShowBottomPanel();
				
				//previous states are grey text, current state is white text, future states are buttons
				this.UIInactiveTitle("title_capture");
				this.UIInactiveTitle("title_undead");
				this.UIActiveTitle("title_main");
				//this.UIActiveButton_smallPhases();
				this.UIActiveButton("title_buildvillages");
				this.UIActiveButton("end_phase_button");
				
				switch(ui_state_id)
				{
					case gameui.STATE_MAIN_DEFAULT:
					{
						if(this.gamedatas.village_captures_available > 0)
						{
							this.UIActiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_CAPTURE));
						}
						else
						{
							this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_CAPTURE));
						}
						this.UIActiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BUILD));
						this.UIActiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_MOVE));
						this.UIActiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BATTLE));
						break;
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						this.UIActiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_CAPTURE));
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BUILD));
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_MOVE));
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BATTLE));
						break;
					}
					case gameui.STATE_MAIN_BUILD:
					{
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_CAPTURE));
						this.UIActiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BUILD));
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_MOVE));
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BATTLE));
						break;
					}
					case gameui.STATE_MAIN_MOVE:
					{
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_CAPTURE));
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BUILD));
						this.UIActiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_MOVE));
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BATTLE));
						break;
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_CAPTURE));
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BUILD));
						this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_MOVE));
						this.UIActiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BATTLE));
						break;
					}
				}
			},
			
			/*UIActiveButton_smallPhases : function()
			{
				
			},*/
			
			UIStatePlayerVillages : function(args)
			{
				//state: main -> build villages
				this.ShowBottomPanel();
				
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
			
			UIActiveButton : function(div_id)
			{
				dojo.addClass(div_id, "blst_button");
				dojo.removeClass(div_id, "blst_button_disabled");
				dojo.removeClass(div_id, "inactive_phase");
			},
			
			UIInactiveButton_smallPhases : function()
			{
				//console.log("page::UIInactiveButton_smallPhases()");
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_CAPTURE));
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BUILD));
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_MOVE));
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BATTLE));
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
