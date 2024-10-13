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
					dojo.style(bottompanel, "z-index", this.GameLayerBottomPanel());
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
					
					if(cur_small_phase == gameui.STATE_MAIN_CAPTURE && !this.isCurrentPlayerChaosHorde())
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
				if(window.gameui.checkAction('action_earlyEndTurn'))
				{
					//just in case they have an action payment dialog open
					this.CancelAction();
					
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_earlyEndTurn.html", {
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
					case gameui.STATE_MAIN_CAPTURE:
					{
						return this.onClickCapturePhaseButton;
						//dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickCapturePhaseButton));
						break;
					}
					case gameui.STATE_MAIN_BUILD:
					{
						return this.onClickBuildModeButton;
						//dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickBuildModeButton));
						break;
					}
					case gameui.STATE_MAIN_MOVE:
					{
						return this.onClickMoveModeButton;
						//dojo.connect(actionbutton, "click", dojo.hitch(this, this.onClickMoveModeButton));
						break;
					}
					case gameui.STATE_MAIN_BATTLE:
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
			
			enterSmallPhase : function(new_phase_id)
			{
				//if we are not the current player, this entire panel will get disabled
				//console.log("page::enterSmallPhase(" + new_phase_id + ")");
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

		});
		
		return instance;
	}
);
