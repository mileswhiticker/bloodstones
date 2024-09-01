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
		
		var instance = declare("_paymode", null, {
			//put your functions here
			
			ServerPayAction : function(action_type_arg)
			{
				//console.log("page::ServerPayAction(" + action_type_arg + ")");
				//is this move allowed?
				if(window.gameui.checkAction('action_tryPayAction'))
				{
					//put in JSON format for the server depending on the kind of action
					var action_info_JSON = "";
					switch(action_type_arg)
					{
						case this.ACTION_CAPTURE:
						{
							action_info_JSON = JSON.stringify(this.queued_capture_village_ids);
							break;
						}
						case this.ACTION_MOVE:
						{
							action_info_JSON = JSON.stringify(this.queued_action_steps);
							break;
						}
						case this.ACTION_BUILD:
						{
							action_info_JSON = JSON.stringify(this.queued_builds);
							break;
						}
						case this.ACTION_BUILDVILLAGE:
						{
							//NOTE: the ajax call here is only for the generic "action_tryPayAction" 
							//however states.inc.php also lists "action_playerBuildVillages" which i use as a safety check on the server (see)
							//this isn't standard bga practice but it should remove some code redundancy. i think it's safe
							action_info_JSON = this.GetJsonTempVillages();
							break;
						}
					}
					
					//work out how many tiles the player wants to pay
					//it's dumb doing this twice but im only partially rewriting this old system
					var paid_tiles = [];
					var paid_tile_ids = [];
					for(var i in this.current_player_paystack.tiles)
					{
						var cur_tile = this.current_player_paystack.tiles[i];
						paid_tiles.push({id: cur_tile.id});
						paid_tile_ids.push(cur_tile.id)
					}
					var paid_tiles_JSON = JSON.stringify(paid_tiles);
					var paid_tile_ids_JSON = JSON.stringify(paid_tile_ids);
					//console.log(paid_tiles_JSON);
					
					//send this to the server
					//see line 268 of action.php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_tryPayAction.html", {
						action_type: action_type_arg,
						action_info: action_info_JSON,
						paid_tile_infos: paid_tiles_JSON,
						paid_tile_ids: paid_tile_ids_JSON,
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
							
							// here we will reset the provisional move in the player's UI and refund the tiles spent
						}
					);
				}
			},
			
			ServerSkipAction : function()
			{
				console.log("page::ServerSkipAction()");
				if(window.gameui.checkAction('action_skip'))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_skip.html", {
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