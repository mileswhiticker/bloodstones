/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * bloodstones.js
 *
 * bloodstones user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

//these constants are a mess, i've gone through a few iterations of how this code works
//at some point ill clean up and standardise them but roughly my concept is:
//each constant represents a game state, except for STATE_MAIN which has client only states linked to player actions
//STATE_ refers to game states (which sometimes have a single action associated with them)
/*
const STATE_INVALID = -1;
const STATE_MIN = -1;
const STATE_CAPTURE = 0;
const STATE_UNDEAD = 1;

const STATE_MAIN_MIN = 2;
const STATE_MAIN_DEFAULT = 2;
const STATE_MAIN_CAPTURE = 3;
const STATE_MAIN_BUILD = 4;
const STATE_MAIN_MOVE = 5;
const STATE_MAIN_BATTLE = 6;
const STATE_MAIN_RESET = 7;
const STATE_MAIN_MAX = 7;

const STATE_BUILDVILLAGE = 8;
const STATE_MAX = 8;
*/
/*
const ACTION_UNKNOWN = 0;
const ACTION_MOVE = 1;
const ACTION_SPLIT = 2;
const ACTION_BUILD = 3;
const ACTION_SWAP = 4;
const ACTION_BUILDVILLAGE = 5;
const ACTION_CAPTURE = 6;
const ACTION_UNDEAD = 7;
*/
/*
const SELECT_ARMY_NONE = 0;
const SELECT_ARMY_SOURCE = 1;
const SELECT_ARMY_TARGET = 2;
*/
/*
const FACTION_HORSELORDS = 0;
const FACTION_HILLFOLK = 1;
const FACTION_DRAGONRIDERS = 2;
const FACTION_CORSAIRS = 3;
const FACTION_NECROMANCERS = 4;
const FACTION_CHAOSHORDE = 5;
*/

//todo: change these village outcome flags into action outcome flags
/*
const VILLAGE_SUCCESS = 0;
const VILLAGE_SKIP = 1;
const VILLAGE_FAIL_UNKNOWN = 2;
const VILLAGE_FAIL_PIPS = 3;		//not enough tiles paid
const VILLAGE_FAIL_PROV = 4;		//wrong province type
const VILLAGE_FAIL_AVAIL = 5;		//no free villages avail
const VILLAGE_FAIL_HAND = 6;		//trying to pay with tile not in hand
const VILLAGE_FAIL_SLOTS = 7;		//too many villages already there
const VILLAGE_FAIL_ENEMIES = 8;		//enemy units present
const VILLAGE_FAIL_FRIENDLIES = 9;	//no friendlies present or in adjacent province
const VILLAGE_FAIL_CITADEL = 10;	//friendly/any citadel present 
const VILLAGE_FAIL_TERRAIN = 11;	//mountain/sea/desert province
const VILLAGE_FAIL_DISTANCE = 12;
const ACTION_FAIL_CAPTUREMAX = 13;	//only one capture per turn
*/

define([
	//dojo modules
    "dojo",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/fx",
	"dojo/on",
	"dojo/dom-attr",
	
	//bga helper UI classes
    "ebg/core/gamegui",
    "ebg/counter",
	"ebg/stock",
	"ebg/zone",
	
	//core and misc
	g_gamethemeurl + '/modules/setup.js',
	g_gamethemeurl + '/modules/notifications.js',
	g_gamethemeurl + '/modules/strings.js',
	g_gamethemeurl + '/modules/player.js',
	
	g_gamethemeurl + '/modules/faction_select.js',
	g_gamethemeurl + '/modules/freebuild.js',
	
	g_gamethemeurl + '/modules/paymode.js',
	
	//undead move mode
	g_gamethemeurl + '/modules/undead.js',
	g_gamethemeurl + '/modules/undead_ui.js',
	
	//buildmode
	g_gamethemeurl + '/modules/buildmode.js',
	g_gamethemeurl + '/modules/buildmode_ui_addremove.js',
	g_gamethemeurl + '/modules/buildmode_enterexit.js',
	g_gamethemeurl + '/modules/buildmode_anim.js',
	
	//movemode
	g_gamethemeurl + '/modules/movemode.js',
	g_gamethemeurl + '/modules/movemode_enterexit.js',
	g_gamethemeurl + '/modules/movemode_ui.js',
	g_gamethemeurl + '/modules/movemode_ui_addremove.js',
	
	
	//battle mode
	g_gamethemeurl + '/modules/battle.js',
	g_gamethemeurl + '/modules/battle_enterexit.js',
	g_gamethemeurl + '/modules/battle_server.js',
	g_gamethemeurl + '/modules/battle_states.js',
	g_gamethemeurl + '/modules/battle_ui.js',
	g_gamethemeurl + '/modules/battle_ui_circles.js',
	g_gamethemeurl + '/modules/battle_ui_create.js',
	g_gamethemeurl + '/modules/battle_ui_destroy.js',
	g_gamethemeurl + '/modules/battle_ui_gotostate.js',
	g_gamethemeurl + '/modules/battle_ui_update.js',
	g_gamethemeurl + '/modules/battle_ui_retreat.js',
	
	//classes
	g_gamethemeurl + '/modules/TileStack.js',
	g_gamethemeurl + '/modules/ArmyZone.js',
	
	//ui
	g_gamethemeurl + '/modules/ui.js',
	g_gamethemeurl + '/modules/ui_main.js',
	g_gamethemeurl + '/modules/ui_phase.js',
	g_gamethemeurl + '/modules/ui_bottompanel.js',
	g_gamethemeurl + '/modules/ui_payment.js',
	g_gamethemeurl + '/modules/ui_army.js',
	g_gamethemeurl + '/modules/ui_leftpanel.js',
	g_gamethemeurl + '/modules/ui_toppanel.js',
	g_gamethemeurl + '/modules/ui_playercards.js',
	g_gamethemeurl + '/modules/ui_scroll.js',
	g_gamethemeurl + '/modules/ui_actionbar.js',
	g_gamethemeurl + '/modules/ui_anim.js',
	
	g_gamethemeurl + '/modules/province.js',
	g_gamethemeurl + '/modules/province_defs.js',
	g_gamethemeurl + '/modules/province_ui.js',
	g_gamethemeurl + '/modules/province_ui_setup.js',
	g_gamethemeurl + '/modules/province_ui_events.js',
	
	g_gamethemeurl + '/modules/village.js',
	g_gamethemeurl + '/modules/village_ui.js',
	
	g_gamethemeurl + '/modules/citadel.js',
	g_gamethemeurl + '/modules/citadel_ui.js',
	
	g_gamethemeurl + '/modules/capture.js',
	g_gamethemeurl + '/modules/capture_enterexit.js',
	g_gamethemeurl + '/modules/capture_ui.js',
	g_gamethemeurl + '/modules/capture_approvecancel.js',
	
	g_gamethemeurl + '/modules/tiles.js',
	g_gamethemeurl + '/modules/world.js',
	g_gamethemeurl + '/modules/TileDrag.js',
],
function (dojo, declare, lang, fx, on, domAttr) {
    var instance = declare("bgagame.bloodstones", [
		ebg.core.gamegui,
		_setup,
		_notifications,
		_strings,
		_player,
		
		_faction_select,
		_freebuild,
		
		_paymode,
		
		_undead,
		_undead_ui,
		
		_buildmode,
		_buildmode_ui_addremove,
		_buildmode_enterexit,
		_buildmode_anim,
		
		_battle,
		_battle_enterexit,
		_battle_server,
		_battle_states,
		_battle_ui,
		_battle_ui_circles,
		_battle_ui_create,
		_battle_ui_destroy,
		_battle_ui_gotostate,
		_battle_ui_update,
		_battle_ui_retreat,
		
		_movemode,
		_movemode_enterexit,
		_movemode_ui,
		_movemode_ui_addremove,
		
		_tiledrag,
		
		_ui,
		_ui_main,
		_ui_phase,
		_ui_bottompanel,
		_ui_payment,
		_ui_army,
		_ui_leftpanel,
		_ui_toppanel,
		_ui_playercards,
		_ui_scroll,
		_ui_actionbar,
		_ui_anim,
		
		_province,
		_province_defs,
		_province_ui,
		_province_ui_setup,
		_province_ui_events,
		
		_village,
		_village_ui,
		
		_citadel,
		_citadel_ui,
		
		_capture,
		_capture_enterexit,
		_capture_ui,
		_capture_approvecancel,
		
		_tiles,
		_world,
		], {
        constructor: function(){
            //console.log('bloodstones constructor');
			//console.log("g_gamethemeurl:" + g_gamethemeurl);
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;

			//this.cards_width = 341;
			//this.cards_height = 341;
			
			
			/* Named constants - these usually correspond to named constants in PHP */
			
			this.FACTION_HORSELORDS = 0;
			this.FACTION_HILLFOLK = 1;
			this.FACTION_DRAGONRIDERS = 2;
			this.FACTION_CORSAIRS = 3;
			this.FACTION_NECROMANCERS = 4;
			this.FACTION_CHAOSHORDE = 5;
			
			this.ACTION_UNKNOWN = 0;
			this.ACTION_MOVE = 1;
			this.ACTION_SPLIT = 2;
			this.ACTION_BUILD = 3;
			this.ACTION_SWAP = 4;
			this.ACTION_BUILDVILLAGE = 5;
			this.ACTION_CAPTURE = 6;
			this.ACTION_UNDEAD = 7;
			
			this.VILLAGE_SUCCESS = 0;
			this.VILLAGE_SKIP = 1;
			this.VILLAGE_FAIL_UNKNOWN = 2;
			this.VILLAGE_FAIL_PIPS = 3;			//not enough tiles paid
			this.VILLAGE_FAIL_PROV = 4;			//wrong province type
			this.VILLAGE_FAIL_AVAIL = 5;		//no free villages avail
			this.VILLAGE_FAIL_HAND = 6;			//trying to pay with tile not in hand
			this.VILLAGE_FAIL_SLOTS = 7;		//too many villages already there
			this.VILLAGE_FAIL_ENEMIES = 8;		//enemy units present
			this.VILLAGE_FAIL_FRIENDLIES = 9;	//no friendlies present or in adjacent province
			this.VILLAGE_FAIL_CITADEL = 10;		//friendly/any citadel present 
			this.VILLAGE_FAIL_TERRAIN = 11;		//mountain/sea/desert province
			this.VILLAGE_FAIL_DISTANCE = 12;
			this.ACTION_FAIL_CAPTUREMAX = 13;	//only one capture per turn
			
			this.STATE_INVALID = -1;
			this.STATE_MIN = -1;
			this.STATE_CAPTURE = 0;
			this.STATE_UNDEAD = 1;

			this.STATE_MAIN_MIN = 2;
			this.STATE_MAIN_DEFAULT = 2;
			this.STATE_MAIN_CAPTURE = 3;
			this.STATE_MAIN_BUILD = 4;
			this.STATE_MAIN_MOVE = 5;
			this.STATE_MAIN_BATTLE = 6;
			this.STATE_MAIN_RESET = 7;
			this.STATE_MAIN_MAX = 7;

			this.STATE_BUILDVILLAGE = 8;
			this.STATE_FREEBUILD = 9;
			this.STATE_MAX = 8;
			
			//length of a row on the sprite sheet as measured in number of tiles
			this.SPRITESHEET_ROW_TILES = 14;
			this.SPRITESHEET_ROWS = 8;
			
			this.TILE_UNIT_MIN = 0;
			
			//base unit types (eg a single row of the sprite sheet)
			this.UNIT_BLANK = 0;
			this.UNIT_RESOURCES = 1;
			this.UNIT_ATTACKER = 2;
			this.UNIT_SWORD = 3;
			this.UNIT_SHIELD = 4;
			this.UNIT_ARCHER = 5;
			this.UNIT_CAVALRY = 6;
			this.UNIT_CASTLE = 7;
			this.UNIT_SHIP = 8;
			this.UNIT_SIEGE = 9;
			this.UNIT_LEADER = 10;
			this.UNIT_SPECIALONE = 11;
			this.UNIT_SPECIALTWO = 12;
			this.UNIT_CITADEL = 13;
			
			//unique tile defines, most of these are specialone or specialtwo (but not all)
			this.TILE_GIANT = 25;
			this.TILE_KOBOLD = 30;
			this.TILE_DRAGON = 39;
			this.TILE_GOBLIN = 58;
			this.TILE_NECROMANCER = 67;
			this.TILE_UNDEAD = 68;
			
			this.TILE_UNIT_MAX = 83;
			
			//used for battles
			this.TILE_DICE_MIN = 86;
			this.TILE_DICE_NUM_TYPES = 4;
			this.TILE_DICE_MAX = 103;
			
			/* General UI */
			
			this.current_phase_id = null;
			this.payment_mode = this.STATE_INVALID;
			this.player_phases_all = ["villages","undead","main","build","move","battle","end","reset"];
			this.player_phases_small = [this.STATE_MAIN_CAPTURE, this.STATE_MAIN_BUILD, this.STATE_MAIN_MOVE, this.STATE_MAIN_BATTLE];
			//this.exit_phase_strings = [];
			this.colour_cycle = Colour(5,10,15,255);
			this.next_debug_colour = Colour(30,20,10,255);
			this.canvas_render_function = null;
			this.previous_canvas_render_function = null;
			this.canvas_anim_cancel_frame = null;
			
			
			/* Player */
			
			this.current_player_hand = null;
			this.current_player_paystack = null;
			this.callback_HandTileDragStart = null;
			this.callback_HandTileDragEnd = null;
			this.callback_HandTileDrop = null;
			this.action_info = null;
			
			
			/* Armies */
			
			this.all_armies = [];
			this.armies_by_id_string = [];
			this.selected_army = null;
			
			this.ghost_moving_army = null;
			this.current_move_cost = 0;
			this.queued_province_moves = [];
			this.queued_province_moves_by_army = [];
			this.queued_action_steps = {};
			this.queued_splitting_armies = [];
			this.queued_moving_armies = [];
			this.ghosted_armies = [];
			this.next_temp_army_id = -1;
			this.ui_busy = false;
			this.army_selection_border_width = 12;
			this.movemode_iteration = 0;
			
			
			/* Camera, World and View */
			
			this.map_province_radius = 50;
			this.svg_scale_factor = 0.32;
			this.display_as_buildable = 3;
			this.army_tile_scale = 1;
			this.army_tile_scale_min = 0.2;
			this.army_tile_scale_max = 2;
			
			//camera coords here are in world space
			//note: anchor for world coords here is bottom right, so +x goes left and +y goes right
			
			//pixels
			this.camera_coords_world = {x:0,y:0};
			this.camera_scroll_increment = 100;
			this.world_minx = 0;
			this.world_miny = 0;
			this.world_maxx = 2048;
			this.world_maxy = 2334;
			this.viewmax_x = 2048;
			this.viewmax_y = 2334;
			
			//these are currently set to the dimensions of bloodstones_test_map.jpg "tyrant's lament" 22/09/24 
			//these are likely to change at some point, and we will need probably standardised dimensions for all map image files
			this.map_width = 2500;
			this.map_height = 2849;
			
			//this is a percent value, it can go [0,inf)
			this.map_view_scale = 1.0;
			this.map_view_scale_min = 1;//0.9;
			this.map_view_scale_max = 10;
			this.map_view_scale_increment = 0.1;
			
			this.province_border_width = 3;
			this.province_link_width = 3;
			
			
			/* Build mode */
			
			this.build_mode_cancel_anim = null;
			this.dragging_data_id = null;
			this.pulsing_province_id = null;
			this.pulsing_province_time = 0;
			this.pulsing_province_time_max = 0.5;
			this.pulsing_province_default = 0.4;
			this.prev_frame_timestamp = 0;
			this.pulsing_province_dir = 1;
			//this.queued_build_armies = [];
			this.queued_build_armies_by_province = [];
			this.queued_builds = {};
			this.buildable_provinces = [];
			this.chaos_horde_start_prov_name = null;
			
			//note: ive got two pulsing systems here, ill need to merge them at some point
			//the "pulsing_province_id" and the prov_info.is_pulsing
			this.all_pulsing_provinces = [];
			
			
			/* Battle mode */
			
			this.preview_battle_province_name = null;
			this.preview_defending_player_id = 0;
			this.preview_attacking_player_id = 0;
			this.is_previewing_battle = false;
			this.retreat_prov_options = null;
			
			this.pending_battle_circles = [];
			this.pending_battle_buttons = [];
			
			this.army_display_attacker = null;
			this.army_display_defender = null;
			this.battle_score_attacker = 0;
			this.battle_score_defender = 0;
			
			this.battle_tilestack_attacker = null;
			this.battle_tilestack_defender = null;
			this.reject_tilestack_attacker = null;
			this.reject_tilestack_defender = null;
			
			this.battling_province_name = "NA";
			this.attacking_player_id = 0;
			this.defending_player_id = 0;
			this.num_attacker_tiles = 0;
			this.num_defender_tiles = 0;
			this.num_attacker_tiles_swapped = 0;
			this.num_defender_tiles_swapped = 0;
			this.num_attacker_tiles_rejected = 0;
			this.num_defender_tiles_rejected = 0;
			this.max_battle_tiles = 3;
			this.retreat_prov_options = [];
			
			this.ATTACKER_TILE_TYPE = 84;
			this.DEFENDER_TILE_TYPE = 98;
			
			
			/* Build villages state */
			this.buildable_province_names = [];
			
			/*
			this.queued_build_villages = [];
			this.all_villages = [];
			this.villages_by_province = [];
			*/
			
			//these are used by the client interface here
			this.temp_villages = [];
			this.temp_villages_by_province = [];
			this.temp_villages_by_id = [];
			this.temp_villages_for_server = [];
			
			//this one is to be sent to the server
			this.queued_villages = [];
			
			//finished villages
			this.villagestacks_all = [];
			this.villagestacks_by_province = [];
			this.villagestacks_by_idstring = [];
			
			/* Place citadel state */
			this.possible_citadel_provinces = [];
			this.citadel_stacks = [];
			
			/* Move undead state */
			this.queued_undead_moves = [];	//each value is an undead tile ID which indexes for a list with up to 2 province names
			this.moving_undead_armies = [];
			this.move_info_provinces = [];
			
			/* Capture village state */
			this.possible_capture_infos = [];
			this.queued_capture_village_ids = [];
			
			/*
			this.battle_states = [
				"setupWithdraw",
				"chooseWithdraw",
				"setupBattle",
				"battle",
				"battleInitial",
				"battleTile",
				"battleWaitTile",
				"battleResolve",
				"battleLose",
				"retreat"];
				*/
			/*this.battle_states = [
				"battleTile",
				"chooseWithdraw"];*/
			
			/*
			var mycolor = new Colour(10,20,30,40);
			console.log(mycolor);
			console.log(mycolor.rgba());
			console.log(mycolor.hex());
			*/
        },
        
		/*
		
		//some useful helper functions from BGA
		//see https://en.doc.boardgamearena.com/Game_interface_logic:_yourgamename.js
		
		//returns boolean
		this.isCurrentPlayerActive();
		
		//returns number
		this.getActivePlayerId();
		
		//returns number[]
		this.getActivePlayers();
		*/
		
		getActivePlayer : function()
		{
			/*
			ack: "ack",avatar: "000000",beginner: true,cards_visible: "6",color: "0000ff",color_back: null,eliminated: 0,factionid: "2",id: "2371112",is_ai: "0",name: "milesw0",regroups: "0",score: "0",villages_available: "20",villages_captured: "0",zombie: 0,
			*/
			//this relies on BGA framework so it should be safe
			return this.gamedatas.players[this.getActivePlayerId()];
		},
		
		getCurrentPlayer : function()
		{
			//in case i forget this again
			return this.player_id;
		},
		
		getCurrentPlayerId : function()
		{
			//in case i forget this again
			return this.player_id;
		},
		
		getActivePlayerFactionId : function()
		{
			//this relies on BGA framework so it should be safe
			return this.getActivePlayer().factionid;
		},
		
		getCurrentPlayerFactionId : function()
		{
			return this.getPlayerFactionId(this.getCurrentPlayerId());
		},
		
		getPlayerFactionId : function(check_player_id)
		{
			//null or undefined are both truthy false, so do a safety check here
			if(this.gamedatas.players[check_player_id])
			{
				return Number(this.gamedatas.players[check_player_id].factionid);
			}
			
			//-1 is my standard "undefined" integer value 
			return -1;
		},
		
		getFactionPlayerId : function(check_faction_id)
		{
			for(var check_player_id in this.gamedatas.players)
			{
				var player = this.gamedatas.players[check_player_id]
				if(player.factionid == check_faction_id)
				{
					return check_player_id;
				}
			}
			
			//couldn't find a player associated. this might happen during faction selection
			return 0;
		},
		
		getFactionName : function(faction_id)
		{
			//console.log("page::getFactionName(" + faction_id + ")");
			if(faction_id < this.faction_strings.length && faction_id >= 0)
			{
				return this.faction_strings[faction_id].title;
			}
			var retval = "ERR_UNKNOWN_FACTION_" + faction_id;
			console.log("ERROR page::getFactionName(" + faction_id + ") is returning " + retval);
			console.log(this.faction_strings);
			return retval;
		},
		
		getPlayerFactionName : function(player_id)
		{
			//no safety checks here because they are contained in the nested functions
			return this.getFactionName(this.getPlayerFactionId(player_id));
		},
		
		getFactionPlayerName : function(faction_id)
		{
			var player_id = this.getFactionPlayerId(faction_id);
			console.log("page::getFactionPlayerName(" + faction_id + ") player_id:" + player_id);
			if(player_id != 0)
			{
				return this.getPlayerName(player_id);
			}
			return "ERR_NO_PLAYER";
		},
		
		getPlayerName : function(player_id)
		{
			var player_info = this.gamedatas.players[player_id];
			return player_info.name;
		},
		
		getTempArmyId : function()
		{
			return this.next_temp_army_id--;
		},
		
		isTempArmyId : function(army_id_num)
		{
			return army_id_num < 0;
		},
		
		isValidFactionId : function(faction_id)
		{
			//console.log("page::isValidFactionId(" + faction_id + ")");
			faction_id = Number(faction_id);
			return (0 <= faction_id && faction_id <= 5 && typeof(faction_id) == "number");
		},
		
		checkActionState : function(action_name)
		{
			//a custom function to replace window.gameui.checkAction() 
			//which will normally check whether a) the action is in the allowed action list for the state b) the current player is active
			//instead this function just checks if the action is in the allowed action list
			
			//note: i decided move its functionality onto the server (so i dont need to use it here...) 
			//i'll leave the frame of the function here anyway for reference 
		},
		
		isCurrentPlayerChaosHorde : function()
		{
			return (this.getCurrentPlayerFactionId() == this.FACTION_CHAOSHORDE);
		},
		
        /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            //console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/bloodstones/bloodstones/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */
		
   });
   
   return instance;
});
