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
				
				//the phases before main
				var title_capture = dojo.place("<div id=\"title_capture\" class=\"phase_large blst_button inactive_phase\">1. Capture<br>Villages</div>","phasecontainer");
				var title_undead = dojo.place("<div id=\"title_undead\" class=\"phase_large blst_button inactive_phase\">2. Move<br>Undead</div>","phasecontainer");
				dojo.connect(title_undead, "click", dojo.hitch(this, this.onClickUndeadButton));
				
				//the main phase
				const phasecontainer_small = dojo.place("<div id=\"phasecontainer_small\" class=\"phase_large\"></div>","phasecontainer");
				var title_main = dojo.place("<div id=\"title_main\" class=\"small_phase blst_button inactive_phase\">3. Main</div>","phasecontainer_small");
				const button_build = dojo.place("<div id=\"button_build\" class=\"small_phase blst_button inactive_phase\">Build</div>","phasecontainer_small");
				dojo.connect(button_build, "click", dojo.hitch(this, this.onClickBuildModeButton));
				const button_move = dojo.place("<div id=\"button_move\" class=\"small_phase blst_button inactive_phase\">Move</div>","phasecontainer_small");
				dojo.connect(button_move, "click", dojo.hitch(this, this.onClickMoveModeButton));
				const button_battle = dojo.place("<div id=\"button_battle\" class=\"small_phase blst_button inactive_phase\">Battle</div>","phasecontainer_small");
				dojo.connect(button_battle, "click", dojo.hitch(this, this.onClickBattleModeButton));
				
				//the phases after main
				var title_buildvillages = dojo.place("<div id=\"title_buildvillages\" class=\"phase_large blst_button inactive_phase\">4. Build<br>Villages</div>","phasecontainer");
				dojo.connect(title_buildvillages, "click", dojo.hitch(this, this.onClickBuildVillagesButton));
				
				//end turn button
				const button_end = dojo.place("<div id=\"end_phase_button\" class=\"phase_large blst_button inactive_phase\">End turn</div>","phasecontainer");
				dojo.connect(button_end, "click", dojo.hitch(this, this.ServerEarlyEndTurn));
				
				//define these
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
				console.log("page::EarlyEndTurn()");
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
		});
		
		return instance;
	}
);
