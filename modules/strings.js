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
		
		var instance = declare("_strings", null, {

			constructor: function(){
				//for client side info about provinces
				//todo: move this into game.php
				
				//for testing, this is to be replaced by svg loaded from file
				this.provinces_old = [
					{
					name:"Province One",
					type:"Plains",
					movement_links: ["Province Two","Province Three","Province Four","Province Five"],
					vertices:[{x:283,y:494},{x:512,y:335},{x:615,y:469},{x:315,y:562}],
					colour:"#CD7F32",
					collision_radius: 200,
					centre: {x:100,y:100},
					drag_area_poly: "",
					zone:null
					},
					{
					name:"Province Two",
					type:"Forest",
					movement_links: ["Province One","Province Three"],
					vertices:[{x:531,y:323},{x:567,y:230},{x:802,y:232},{x:648,y:484}],
					colour:"#008000",
					collision_radius: 200,
					centre: {x:200,y:100},
					drag_area_poly: "",
					zone:null
					},
					{
					name:"Province Three",
					type:"Hills",
					movement_links: ["Province One","Province Two","Province Four"],
					vertices:[{x:722,y:466},{x:573,y:570},{x:650,y:710},{x:800,y:559}],
					colour:"#800000",
					collision_radius: 200,
					centre: {x:100,y:200},
					drag_area_poly: "",
					zone:null
					},
					{
					name:"Province Four",
					type:"Plains",
					movement_links: ["Province One","Province Three","Province Five"],
					vertices:[{x:560,y:564},{x:450,y:585},{x:466,y:788},{x:650,y:720}],
					colour:"#0000FF",
					collision_radius: 200,
					centre: {x:100,y:200},
					drag_area_poly: "",
					zone:null
					},
					{
					name:"Province Five",
					type:"Mountains",
					movement_links: ["Province One","Province Four"],
					vertices:[{x:431,y:590},{x:317,y:590},{x:290,y:828},{x:452,y:783}],
					colour:"#FFFF00",
					collision_radius: 200,
					centre: {x:100,y:200},
					drag_area_poly: "",
					zone:null
					}
				];
				
				this.provinces_by_name = [];
				
				this.all_province_types = ["Plains","Forest","Hills","Mountains","Sea","Desert"];
				
				//for client side info about factions
				this.faction_strings = [
					{
						title : "Horse Lords",
						fontColour : "#004588"
					},
					{
						title : "Hill Folk",
						fontColour : "#54B064"
					},
					{
						title : "Dragon Riders",
						fontColour : "#FFFF00"
					},
					{
						title : "Corsairs",
						fontColour : "#F0EDD7"
					},
					{
						title : "Necromancers",
						fontColour : "#D2BEDC"
					},
					{
						title : "Chaos Horde",
						fontColour : "#C3A643"
					},
					{
						title : "ERROR_TITLE",
						fontColour : "#000000"
					}
				];
				
				//for client side info about tiles
				this.all_tile_strings = [
				];
				
			},
			
			GetProvinceSelectionPlayerTitleString : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_MAIN_MOVE:
					{
						return _("Moving Units");
					}
					default:
					{
						return _("Your units");
					}
				}
				
			},
			
			GetProvinceSelectionEnemyTitleString : function(action_mode)
			{
				return _("Enemy units");
			},
			
			GetProvinceSelectionEmptyTitleString : function(action_mode)
			{
				return _("No units");
			},
			
			GetProvinceSelectionReserveTitleString : function(action_mode)
			{
				return _("Other Units");
			},
			
			GetUnselectedArmyHintString : function()
			{
				return _("For more details, select one or more tiles in your hand, or any army on the board.");
			},
			
			GetTileDropPayString : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_FREEBUILD:
					{
						return _("You cannot pay extra tiles to increase the size of your starting army.");
					}
					case gameui.STATE_CAPTURE:
					{
						return _("Drag tiles here from your hand to pay for village capturing (maximum of one tile)");
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						return _("Drag tiles here from your hand to pay for village capturing (maximum of one tile)");
					}
					case gameui.STATE_MAIN_MOVE:
					{
						return _("Drag tiles here from your hand to pay for movement");
					}
					case gameui.STATE_MAIN_BUILD:
					{
						return _("Drag tiles here from your hand to pay for building");
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						return _("Drag a tile here from your hand to improve your battle score (maximum of one tile)");
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						return _("You can drag one tile here from your hand to pay for village building (maximum of one tile)");
					}
					case gameui.STATE_UNDEAD:
					{
						return _("You cannot pay for more undead movement");
					}
					default:
					{
						return "TileDropPayString(" + action_mode + ")";
					}
				}
			},
			
			GetActionCostDescString : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_FREEBUILD:
					{
						return _("Build cost");
					}
					case gameui.STATE_CAPTURE:
					{
						return _("Capture cost");
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						return _("Capture cost");
					}
					case gameui.STATE_MAIN_MOVE:
					{
						return _("Movement cost");
					}
					case gameui.STATE_MAIN_BUILD:
					{
						return _("Build cost");
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						return _("Build cost");
					}
					case gameui.STATE_UNDEAD:
					{
						return _("Moves remaining:");
					}
					default:
					{
						return "ActionCostDescString " + action_mode;
					}
				}
			},
			
			GetActionPaidDescString : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_FREEBUILD:
					{
						return _("Free build points");
					}
					case gameui.STATE_UNDEAD:
					{
						return "";
					}
					default:
					{
						//todo: this string wont play nicely with translation
						return _("You have paid");
					}
				}
			},
			
			GetActionCancelString : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_FREEBUILD:
					{
						return _("Start with no army");
					}
					case gameui.STATE_CAPTURE:
					{
						return _("Skip capturing and end turn");
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						return _("Cancel capturing");
					}
					case gameui.STATE_MAIN_MOVE:
					{
						return _("Cancel Movement");
					}
					case gameui.STATE_MAIN_BUILD:
					{
						return _("Cancel Building");
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						return _("Withdraw from battle");
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						return _("Skip building and end turn");
					}
					case gameui.STATE_UNDEAD:
					{
						return _("Reset queued undead movement");
					}
					default:
					{
						return "GetActionCancelString(" + action_mode + ")";
					}
				}
			},
			
			GetActionApproveString : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_FREEBUILD:
					{
						return _("Finalise starting army");
					}
					case gameui.STATE_CAPTURE:
					{
						return _("Approve Capturing");
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						return _("Approve capturing");
					}
					case gameui.STATE_MAIN_MOVE:
					{
						return _("Approve Movement");
					}
					case gameui.STATE_MAIN_BUILD:
					{
						return _("Approve Building");
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						return _("Fight battle!");
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						return _("Build villages");
					}
					case gameui.STATE_UNDEAD:
					{
						return _("Finish all undead movement");
					}
					default:
					{
						return "GetActionApproveString(" + action_mode + ")";
					}
				}
			},
			
			GetInsufficientPayString : function(fail_reason)
			{
				switch(fail_reason)
				{
					case gameui.STATE_FREEBUILD:
					{
						return _("You cannot have more than 5 starting free build points");
					}
					case gameui.STATE_CAPTURE:
					{
						return _("You must pay more pips to capture those villages");
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						return _("You must pay more pips to capture those villages");
					}
					case gameui.STATE_MAIN_MOVE:
					{
						return _("You must pay more pips for that movement");
					}
					case gameui.STATE_MAIN_BUILD:
					{
						return _("You must pay more pips to build those tiles");
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						return _("You must pay more pips to build those villages");
					}
					default:
					{
						return "GetInsufficientPayString(" + fail_reason + ")";
					}
				}
			},
			
			GetUndeadUnselectedString : function()
			{
				return _("Select an undead army to move");
			},
			
			GetCurrencyCostIconCSS : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_UNDEAD:
					{
						return "";
					}
					default:
					{
						return this.GetCurrencyIconCSS(action_mode);
					}
				}
			},
			
			GetCurrencyPaidIconCSS : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_UNDEAD:
					{
						return "";
					}
					default:
					{
						return this.GetCurrencyIconCSS(action_mode);
					}
				}
			},
			
			GetCurrencyIconCSS : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_FREEBUILD:
					{
						return "action_currency_icon_pip";
					}
					case gameui.STATE_CAPTURE:
					{
						return "action_currency_icon_pip";
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						return "action_currency_icon_pip";
					}
					case gameui.STATE_MAIN_MOVE:
					{
						return "action_currency_icon_pip";
					}
					case gameui.STATE_MAIN_BUILD:
					{
						return "action_currency_icon_tile";
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						return "action_currency_icon_pip";
					}
					default:
					{
						return "action_currency_icon_army";
					}
				}
			},
			
			GetPayInfoString : function(action_mode)
			{
				switch(action_mode)
				{
					case gameui.STATE_CAPTURE:
					{
						return _("Villages cost 1 pip to capture in Plains and Forest. Hills cost 2 pip.");
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						return _("Villages cost 1 pip to capture in Plains and Forest. Hills cost 2 pip.");
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						return _("Villages cost 1 pip to build in Plains and Forest. Hills cost 2 pip.");
					}
					default:
					{
						return "";
					}
				}
			},
			
			GetSplitFailMoveString : function()
			{
				return _('You cannot split these armies after starting a move.');
			},
			
			GetMoveFailDistString : function()
			{
				return _('Select a closer province to move to first.');
			},
			
			GetVillageFailString : function(fail_reason)
			{
				switch(fail_reason)
				{
					case this.VILLAGE_FAIL_AVAIL:
					{
						return _("Insufficient villages available to place one there.");
					}
					case this.VILLAGE_FAIL_SLOTS:
					{
						return _("That province is already full of villages.");
					}
					case this.VILLAGE_FAIL_TERRAIN:
					{
						return _("You cannot build villages there.");
					}
					case this.VILLAGE_FAIL_ENEMIES:
					{
						return _("You cannot build a village with that enemy army there.");
					}
					case this.VILLAGE_FAIL_DISTANCE:
					{
						return _("You can only build in provinces connected to your existing villages or citadels.");
					}
					default:
					{
						return "UNKNOWN_VILLAGE_FAIL_REASON";
					}
				}
				
			},
			
			GetSmallPhaseEntryString : function(phase_id)
			{
				switch(phase_id)
				{
					case gameui.STATE_MAIN_CAPTURE:
					{
						return _("Capture villages");
					}
					case gameui.STATE_MAIN_BUILD:
					{
						return _("Build tiles");
					}
					case gameui.STATE_MAIN_MOVE:
					{
						return _("Move/split armies");
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						return _("Battle enemies");
					}
					default:
					{
						return _("ERROR: page::GetSmallPhaseEntryString(" + phase_id + ") unknown phase_id");
					}
				}
			},
			
			GetSmallPhaseExitString : function(phase_id)
			{
				switch(phase_id)
				{
					case gameui.STATE_MAIN_CAPTURE:
					{
						return _("Finish capturing");
					}
					case gameui.STATE_MAIN_BUILD:
					{
						return _("Finish building");
					}
					case gameui.STATE_MAIN_MOVE:
					{
						return _("Finish moving");
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						return _("Finish battles");
					}
					default:
					{
						return _("ERROR: page::GetSmallPhaseExitString(" + phase_id + ") unknown phase_id");
					}
				}
			},
			
			GetFailCaptureMaxString : function()
			{
				return _("You can only take one village capture action per turn");
			},
			
			GetProvinceBuildFailString : function()
			{
				return _("You can't build that unit type there");
			},
			
			GetChaosHordeRechooseStartingProvString : function()
			{
				return _("You can now choose a different province for your starting horde.");
			},
			
			GetProvinceBuildUnfoundString : function(prov_type)
			{
				//console.log("page::GetProvinceBuildUnfoundString(" + prov_type + ")");
				switch(this.gamedatas.gamestate.name)
				{
					case ("playerMain"):
					{
						switch(this.getCurrentPlayerFactionId())
						{
							case this.FACTION_CHAOSHORDE:
							{
								return _("You can only build where you have units.");
							}
							default:
							{
								return _("You can only build at villages or your citadel.");
							}
						}
					}
					case ("freeBuild"):
					{
						return _("Your starting army must be at your citadel.");
					}
					case ("freeBuild_chaosHorde"):
					{
						if(this.chaos_horde_start_prov_name)
						{
							return _("Your starting horde must be together.");
						}
						else
						{
							if(prov_type == "Sea")
							{
								return _("Pick a land province for your starting horde.");
							}
							else if(prov_type == "Mountains")
							{
								return _("Your starting horde cannot be in Mountains.");
							}
							else if(prov_type == "Desert")
							{
								return _("Your starting horde cannot be in Desert.");
							}
							else
							{
								return _("Your starting horde cannot be so close to another faction's citadel.");
							}
						}
					}
					default:
					{
						return this.GetProvinceBuildFailString();
					}
						
				}
			},
			
			GetProvinceEntryFailString : function()
			{
				return _('That army cannot enter there');
			},
			
			GetProvinceDistFailString : function()
			{
				return _('Move the army through closer areas first');
			},
		});
		
		return instance;
	}
);