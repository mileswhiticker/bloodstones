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

			GetTileDropPayString : function(action_mode)
			{
				switch(action_mode)
				{
					case PHASE_CAPTURE:
					{
						return _("Drag tiles here from your hand to pay for village capturing");
					}
					case PHASE_MOVE:
					{
						return _("Drag tiles here from your hand to pay for movement");
					}
					case PHASE_BUILD:
					{
						return _("Drag tiles here from your hand to pay for building");
					}
					case PHASE_BATTLE:
					{
						return _("Drag a tile here from your hand to improve your battle score");
					}
					case PHASE_BUILDVILLAGE:
					{
						return _("You can drag one tile here from your hand to pay for village building");
					}
					case PHASE_UNDEAD:
					{
						return _("You cannot pay for more undead movement");
					}
					default:
					{
						return "TileDropPayString " + action_mode;
					}
				}
			},
			
			GetActionCostDescString : function(action_mode)
			{
				switch(action_mode)
				{
					case PHASE_CAPTURE:
					{
						return _("Capture cost");
					}
					case PHASE_MOVE:
					{
						return _("Movement cost");
					}
					case PHASE_BUILD:
					{
						return _("Build cost");
					}
					case PHASE_BUILDVILLAGE:
					{
						return _("Build cost");
					}
					case PHASE_UNDEAD:
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
					case PHASE_UNDEAD:
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
					case PHASE_CAPTURE:
					{
						return _("Skip capturing and end turn");
					}
					case PHASE_MOVE:
					{
						return _("Cancel Movement");
					}
					case PHASE_BUILD:
					{
						return _("Cancel Building");
					}
					case PHASE_BATTLE:
					{
						return _("Withdraw from battle");
					}
					case PHASE_BUILDVILLAGE:
					{
						return _("Skip building and end turn");
					}
					case PHASE_UNDEAD:
					{
						return _("Reset queued undead movement");
					}
					default:
					{
						return "GetActionCancelString " + action_mode;
					}
				}
			},
			
			GetActionApproveString : function(action_mode)
			{
				switch(action_mode)
				{
					case PHASE_CAPTURE:
					{
						return _("Approve Capturing");
					}
					case PHASE_MOVE:
					{
						return _("Approve Movement");
					}
					case PHASE_BUILD:
					{
						return _("Approve Building");
					}
					case PHASE_BATTLE:
					{
						return _("Fight battle!");
					}
					case PHASE_BUILDVILLAGE:
					{
						return _("Build villages");
					}
					case PHASE_UNDEAD:
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
					case PHASE_CAPTURE:
					{
						return _("You must pay more pips to capture those villages");
					}
					case PHASE_MOVE:
					{
						return _("You must pay more pips for that movement");
					}
					case PHASE_BUILD:
					{
						return _("You must pay more pips to build those tiles");
					}
					case PHASE_BUILDVILLAGE:
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
					case PHASE_UNDEAD:
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
					case PHASE_UNDEAD:
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
					case PHASE_CAPTURE:
					{
						return "action_currency_icon_pip";
					}
					case PHASE_MOVE:
					{
						return "action_currency_icon_pip";
					}
					case PHASE_BUILD:
					{
						return "action_currency_icon_tile";
					}
					case PHASE_BUILDVILLAGE:
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
					case PHASE_CAPTURE:
					{
						return _("Villages cost 1 pip to capture in Plains and Forest. Hills cost 2 pip.");
					}
					case PHASE_BUILDVILLAGE:
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
					case VILLAGE_FAIL_AVAIL:
					{
						return _("Insufficient villages available to place one there");
					}
					case VILLAGE_FAIL_SLOTS:
					{
						return _("That province is already full of villages");
					}
					case VILLAGE_FAIL_TERRAIN:
					{
						return _("You cannot build villages there");
					}
					case VILLAGE_FAIL_ENEMIES:
					{
						return _("You cannot build a village with that enemy army there.");
					}
					case VILLAGE_FAIL_DISTANCE:
					{
						return _("You can only build in provinces connected to your existing villages or citadels.");
					}
					default:
					{
						return _("UNKNOWN_VILLAGE_FAIL_REASON");
					}
				}
				
			},
			
			GetProvinceBuildFailString : function()
			{
				return _("You can't build that unit type there");
			},
			
			GetProvinceEntryFailString : function()
			{
				return _('That army cannot enter there');
			},
		});
		
		return instance;
	}
);