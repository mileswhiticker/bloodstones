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
		
		var instance = declare("_ui_bottompanel", null, {
			
			//put your functions here
			//see ui_phase.js for ui functions which update this bottompanel
			CreateBottomPanelIfNotExists : function()
			{
				//console.log("page::CreateBottomPanelIfNotExists()");
				//does the bottom panel exist?
				var bottompanel = dojo.byId("bottompanel");
				if(bottompanel)
				{
					//if it's already created then we don't need to worry about this func
					return;
				}
				else
				{
					//if not then create it
					bottompanel = dojo.place("<div id=\"bottompanel\"></div>","centrepanel");
				}
				
				//
				const phasecontainer = dojo.place("<div id=\"phasecontainer\"></div>","bottompanel");
				
				//playerCapture state
				var title_capture = dojo.place("<div id=\"title_capture\" class=\"phase_large blst_button\">1. Capture<br>Villages</div>","phasecontainer");
				
				//playerUndead state
				var title_undead = dojo.place("<div id=\"title_undead\" class=\"phase_large blst_button\">2. Move<br>Undead</div>","phasecontainer");
				dojo.connect(title_undead, "click", dojo.hitch(this, this.onClickUndeadButton));
				
				//playerMain state
				const phasecontainer_small = dojo.place("<div id=\"phasecontainer_small\" class=\"phase_large\"></div>","phasecontainer");
				var title_main = dojo.place("<div id=\"title_main\" class=\"small_phase blst_button\">3. Main</div>","phasecontainer_small");
				
				//the small phases during playerMain state
				for(var i=0; i<this.player_phases_small.length; i++)
				{
					const cur_small_phase = this.player_phases_small[i];
					//console.log("placing cur_small_phase:" + cur_small_phase);
					
					//create the button
					const actionbutton = dojo.place(
						"<div id=\""
						+ this.GetSmallPhaseButtonDivId(cur_small_phase)
						+ "\">"
						+ this.GetSmallPhaseEntryString(cur_small_phase)
						+ "</div>","phasecontainer_small"
					);
					
					dojo.addClass(actionbutton, "phase_small");
					dojo.addClass(actionbutton, "blst_button");
					dojo.addClass(actionbutton, "blst_button_disabled");
					
					if(cur_small_phase == STATE_MAIN_CAPTURE && !this.isCurrentPlayerChaosHorde())
					{
						dojo.addClass(actionbutton, "display_none");
					}
					
					dojo.connect(actionbutton, "click", dojo.hitch(this, this.GetSmallPhaseButtonCallback(cur_small_phase)));
				}
				/*
				const button_capture = dojo.place("<div id=\"small_phase_button0\" class=\"small_phase blst_button inactive_phase\">Capture</div>","phasecontainer_small");
				dojo.connect(button_build, "click", dojo.hitch(this, this.onClickCapturePhaseButton));
				const button_build = dojo.place("<div id=\"small_phase_button3\" class=\"small_phase blst_button inactive_phase\">Build</div>","phasecontainer_small");
				dojo.connect(button_build, "click", dojo.hitch(this, this.onClickBuildModeButton));
				const button_move = dojo.place("<div id=\"small_phase_button4\" class=\"small_phase blst_button inactive_phase\">Move</div>","phasecontainer_small");
				dojo.connect(button_move, "click", dojo.hitch(this, this.onClickMoveModeButton));
				const button_battle = dojo.place("<div id=\"small_phase_button5\" class=\"small_phase blst_button inactive_phase\">Battle</div>","phasecontainer_small");
				dojo.connect(button_battle, "click", dojo.hitch(this, this.onClickBattleModeButton));
				*/
				
				//playerVillages state
				var title_buildvillages = dojo.place("<div id=\"title_buildvillages\" class=\"phase_large blst_button inactive_phase\">4. Build<br>Villages</div>","phasecontainer");
				dojo.connect(title_buildvillages, "click", dojo.hitch(this, this.onClickBuildVillagesButton));
				
				//end turn button
				const button_end = dojo.place("<div id=\"end_phase_button\" class=\"phase_large blst_button inactive_phase\">End turn</div>","phasecontainer");
				dojo.connect(button_end, "click", dojo.hitch(this, this.ServerEarlyEndTurn));
				
				//define these
				/*this.exit_phase_strings = [
					_("Finish capturing"),
					_("Finish move undead"),
					_("End turn"),
					_("Finish building"),
					_("Finish moving"),
					_("Finish battles"),
					_("End turn"),
					_("Please wait...")
				];*/
			},
			
			DestroyBottomPanel : function()
			{
				dojo.destroy("bottompanel");
			},
			
			HideBottomPanel : function()
			{
				if(dojo.style("bottompanel", 'opacity') != 0)
				{
					dojo.style("bottompanel", 'animation-name', 'fadeout');
					dojo.style("bottompanel", 'opacity', '0');
				}
			},
			
			ShowBottomPanel : function()
			{
				var bottompanel = dojo.byId("bottompanel");
				if(!bottompanel)
				{
					this.CreateBottomPanelIfNotExists();
				}
			},
			
			ServerEarlyEndTurn : function()
			{
				//console.log("page::EarlyEndTurn()");
				if(gameui.checkAction('action_earlyEndTurn'))
				{
					gameui.ajaxcall( "/bloodstones/bloodstones/action_earlyEndTurn.html", {
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
					this.DestroyBottomPanel();
				}
			},
			
			GetSmallPhaseButtonDivId : function(small_phase_id)
			{
				return "small_phase_button" + small_phase_id;
			},

			GetSmallPhaseButtonCallback : function(small_phase_id)
			{
				switch(small_phase_id)
				{
					case STATE_MAIN_CAPTURE:
					{
						return this.onClickCapturePhaseButton;
						//dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickCapturePhaseButton));
						break;
					}
					case STATE_MAIN_BUILD:
					{
						return this.onClickBuildModeButton;
						//dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickBuildModeButton));
						break;
					}
					case STATE_MAIN_MOVE:
					{
						return this.onClickMoveModeButton;
						//dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickMoveModeButton));
						break;
					}
					case STATE_MAIN_BATTLE:
					{
						return this.onClickBattleModeButton;
						//dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickBattleModeButton));
						break;
					}
					default:
					{
						console.log("ERROR: page::GetSmallPhaseButtonCallback(" + small_phase_id + ") unknown small_phase_id");
						break;
					}
				}
			},
		});
		
		return instance;
	}
);
